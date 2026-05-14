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

// ─── Plugin principal ─────────────────────────────────────────────────────────

/**
 * Genera un index.html con OG tags propios para cada juego en:
 *   dist/emulator/<gameId>/index.html
 *
 * Llama directo a Twitch + IGDB en tiempo real durante el build.
 * Sin caché local. En inglés está bien.
 *
 * Usuarios normales cargan el mismo HTML → React arranca →
 * React Router lee la URL y renderiza el juego correcto. ✅
 */
function generateOgPages(env: Record<string, string>) {
  return {
    name: "generate-og-pages",
    apply: "build" as const,
    async closeBundle() {
      const BASE_URL = "https://em-ultron.vercel.app";
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
          : "Play classic Nintendo 64 games directly in your browser.";

        // Portada de IGDB primero; si no, la imagen local; si no, la genérica
        const imageUrl = igdb?.cover
          ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${igdb.cover.image_id}.jpg`
          : game.coverImage
            ? `${BASE_URL}${game.coverImage.startsWith("/") ? "" : "/"}${game.coverImage}`
            : `${BASE_URL}/og-image.jpg`;

        const pageUrl = `${BASE_URL}/emulator/${game.id}`;

        const html = indexHtml
          .replace(
            /<title>[^<]*<\/title>/,
            `<title>${escapeHtml(title)}</title>`,
          )
          .replace(
            /<meta[\s\S]*?property="og:title"[\s\S]*?\/>/,
            `<meta property="og:title" content="${escapeHtml(title)}" />`,
          )
          .replace(
            /<meta[\s\S]*?property="og:description"[\s\S]*?\/>/,
            `<meta property="og:description" content="${escapeHtml(description)}" />`,
          )
          .replace(
            /<meta[\s\S]*?property="og:image"[\s\S]*?\/>/,
            `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
          )
          .replace(/<meta[\s\S]*?property="og:image:width"[\s\S]*?\/>\n?/, "")
          .replace(/<meta[\s\S]*?property="og:image:height"[\s\S]*?\/>\n?/, "")
          .replace(
            /<meta[\s\S]*?property="og:image:alt"[\s\S]*?\/>/,
            `<meta property="og:image:alt" content="${escapeHtml(title)}" />`,
          )
          .replace(
            /<meta[\s\S]*?property="og:url"[\s\S]*?\/>/,
            `<meta property="og:url" content="${pageUrl}" />`,
          )
          .replace(
            /<meta[\s\S]*?name="twitter:title"[\s\S]*?\/>/,
            `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
          )
          .replace(
            /<meta[\s\S]*?name="twitter:description"[\s\S]*?\/>/,
            `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
          )
          .replace(
            /<meta[\s\S]*?name="twitter:image"[\s\S]*?\/>/,
            `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
          )
          .replace(
            /<meta[\s\S]*?name="twitter:image:alt"[\s\S]*?\/>/,
            `<meta name="twitter:image:alt" content="${escapeHtml(title)}" />`,
          )
          .replace(
            /<link rel="canonical"[^>]*>/,
            `<link rel="canonical" href="${pageUrl}" />`,
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

// ⚠️  COOP/COEP headers eliminados — eran para EJS_threads de emulatorjs.ORG.
// emulatorjs.COM gestiona threading internamente y NO requiere esos headers.

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
