import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { gamesConfig } from "./src/data/gamesConfig";

interface IGDBGame {
  slug: string;
  name: string;
  summary?: string;
  cover?: { image_id: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function getTwitchToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Twitch token error: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function fetchIGDBGames(
  slugs: string[],
  clientId: string,
  token: string,
): Promise<IGDBGame[]> {
  const slugList = slugs.map((s) => `"${s}"`).join(", ");
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: `fields slug, name, summary, cover.image_id; where slug = (${slugList}); limit 50;`,
  });
  if (!res.ok) throw new Error(`IGDB error: HTTP ${res.status}`);
  return res.json() as Promise<IGDBGame[]>;
}

// ─── Reemplaza un meta tag específico en el HTML ──────────────────────────────
//
// IMPORTANTE: NO usar [\s\S]*? en estos regex — ese patrón cruza límites de
// tags y puede consumir desde el primer <meta> del documento hasta el tag que
// buscamos, destruyendo charset, viewport y todos los tags intermedios.
//
// [^>]* es seguro: no puede cruzar el cierre > de ningún tag.
// El único ">" dentro de un meta tag es el de />, que está explícito al final.

function replaceMeta(
  html: string,
  attr: string, // p.ej. 'property="og:title"'
  newTag: string, // el <meta ... /> completo que reemplaza
  deleteTag = false,
): string {
  // Escapar comillas para usar en regex
  const safeAttr = attr.replace(/"/g, '\\"');
  // [^>]* no cruza tag boundaries — seguro para meta tags multilínea
  const pattern = new RegExp(`<meta[^>]*${safeAttr}[^>]*\\/>\\n?`);
  return deleteTag ? html.replace(pattern, "") : html.replace(pattern, newTag);
}

// ─── Plugin principal ─────────────────────────────────────────────────────────

/**
 * Genera un index.html con OG tags propios para cada juego en:
 *   dist/emulator/<gameId>/index.html
 *
 * Llama directo a Twitch + IGDB en tiempo real durante el build.
 *
 * Usuarios normales cargan el mismo HTML → React arranca →
 * React Router lee la URL y renderiza el juego correcto. ✅
 *
 * Crawlers (WhatsApp, Twitter, Telegram…) ven el HTML estático con las
 * OG tags del juego gracias al vercel.json que sirve filesystem primero. ✅
 */
function generateOgPages(env: Record<string, string>) {
  return {
    name: "generate-og-pages",
    apply: "build" as const,
    async closeBundle() {
      const BASE_URL = "https://emultron.vercel.app";
      const clientId = env.VITE_TWITCH_CLIENT_ID;
      const clientSecret = env.VITE_TWITCH_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.warn(
          "⚠️  Faltan VITE_TWITCH_CLIENT_ID / VITE_TWITCH_CLIENT_SECRET — OG pages omitidas",
        );
        return;
      }

      // 1. Token de Twitch
      console.log("\n🎮 EmUltron OG pages: obteniendo token de Twitch…");
      const token = await getTwitchToken(clientId, clientSecret);

      // 2. Fetch de todos los juegos desde IGDB de una sola vez
      const slugs = gamesConfig.map((g) => g.igdbSlug);
      console.log(`   Consultando IGDB para: ${slugs.join(", ")}…`);
      const igdbGames = await fetchIGDBGames(slugs, clientId, token);

      // Mapa slug → datos para acceso rápido
      const igdbMap = new Map(igdbGames.map((g) => [g.slug, g]));

      // 3. Leer el dist/index.html generado por Vite (scripts y hashes correctos)
      const indexHtml = readFileSync("dist/index.html", "utf-8");

      // 4. Generar un index.html por juego
      for (const game of gamesConfig) {
        const igdb = igdbMap.get(game.igdbSlug);

        const title = `${game.title} — EmUltron`;

        const description = igdb?.summary
          ? igdb.summary.slice(0, 250).trimEnd() +
            (igdb.summary.length > 250 ? "…" : "")
          : "Juega clásicos de Nintendo 64 directamente en tu navegador.";

        // Portada de IGDB primero; si no, la imagen local; si no, la genérica
        const imageUrl = igdb?.cover
          ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${igdb.cover.image_id}.jpg`
          : game.coverImage
            ? `${BASE_URL}${game.coverImage.startsWith("/") ? "" : "/"}${game.coverImage}`
            : `${BASE_URL}/og-image.jpg`;

        const pageUrl = `${BASE_URL}/emulator/${game.id}`;

        // ── Reemplazos seguros con [^>]* en vez de [\s\S]*? ────────────────
        let html = indexHtml;

        // <title>
        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${escapeHtml(title)}</title>`,
        );

        // name="description"
        html = replaceMeta(
          html,
          `name="description"`,
          `<meta name="description" content="${escapeHtml(description)}" />\n`,
        );

        // canonical
        html = html.replace(
          /<link rel="canonical"[^>]*>/,
          `<link rel="canonical" href="${pageUrl}" />`,
        );

        // og:title
        html = replaceMeta(
          html,
          `property="og:title"`,
          `<meta property="og:title" content="${escapeHtml(title)}" />\n`,
        );

        // og:description
        html = replaceMeta(
          html,
          `property="og:description"`,
          `<meta property="og:description" content="${escapeHtml(description)}" />\n`,
        );

        // og:image (reemplazar URL, borrar width/height ya que IGDB varía)
        html = replaceMeta(
          html,
          `property="og:image"`,
          `<meta property="og:image" content="${escapeHtml(imageUrl)}" />\n`,
        );
        html = replaceMeta(html, `property="og:image:width"`, "", true);
        html = replaceMeta(html, `property="og:image:height"`, "", true);

        // og:image:alt
        html = replaceMeta(
          html,
          `property="og:image:alt"`,
          `<meta property="og:image:alt" content="${escapeHtml(title)}" />\n`,
        );

        // og:url
        html = replaceMeta(
          html,
          `property="og:url"`,
          `<meta property="og:url" content="${pageUrl}" />\n`,
        );

        // twitter:title
        html = replaceMeta(
          html,
          `name="twitter:title"`,
          `<meta name="twitter:title" content="${escapeHtml(title)}" />\n`,
        );

        // twitter:description
        html = replaceMeta(
          html,
          `name="twitter:description"`,
          `<meta name="twitter:description" content="${escapeHtml(description)}" />\n`,
        );

        // twitter:image — usar (?!:alt) para no pisar twitter:image:alt
        html = html.replace(
          /<meta[^>]*name="twitter:image"(?!:alt)[^>]*\/>\n?/,
          `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />\n`,
        );

        // twitter:image:alt
        html = replaceMeta(
          html,
          `name="twitter:image:alt"`,
          `<meta name="twitter:image:alt" content="${escapeHtml(title)}" />\n`,
        );

        const dir = join("dist/emulator", game.id);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), html, "utf-8");

        const src = igdb
          ? "IGDB ✅"
          : "cover local ⚠️  (slug no encontrado en IGDB)";
        console.log(`   → /emulator/${game.id}  [${src}]`);
      }

      console.log(
        `\n   ✅ ${gamesConfig.length} OG pages listas en dist/emulator/\n`,
      );
    },
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => {
  // loadEnv lee .env y .env.local según el modo (development / production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), generateOgPages(env)],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      target: "esnext",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },

    server: {
      hmr: {
        timeout: 5000,
      },

      // ─── Proxies para IGDB ────────────────────────────────────────────────
      // Solo activos en `vite dev`. En producción las Vercel API routes
      // (api/igdb/games.ts y api/twitch-token.ts) hacen el mismo trabajo.
      proxy: {
        "/api/twitch-token": {
          target: "https://id.twitch.tv",
          changeOrigin: true,
          rewrite: () => "/oauth2/token",
        },
        "/api/igdb": {
          target: "https://api.igdb.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/igdb/, "/v4"),
        },
      },
    },
  };
});
