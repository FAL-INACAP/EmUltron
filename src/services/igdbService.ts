// ─── IGDB Service ─────────────────────────────────────────────────────────────
//
// Flujo:
//  1. Si el slug está en igdbCache → retorna inmediato (sin red).
//  2. Si no → obtiene token de Twitch, consulta IGDB y traduce el summary
//     al español en el browser usando la API gratuita de Google Translate.
//
// Requiere en .env.local:
//   VITE_TWITCH_CLIENT_ID=xxx
//   VITE_TWITCH_CLIENT_SECRET=xxx
//
// El proxy de vite.config.ts reenvía las rutas /api/* a Twitch e IGDB.

import type { IGDBGame } from "../types";
import { igdbCache } from "../data/igdbCache";

// ─── Token cache en memoria (los tokens duran ~60 días) ───────────────────────
let tokenCache: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires_at)
    return tokenCache.access_token;

  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID as string;
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET as string;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan VITE_TWITCH_CLIENT_ID o VITE_TWITCH_CLIENT_SECRET en .env.local",
    );
  }

  const res = await fetch("/api/twitch-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) throw new Error(`Twitch OAuth falló: HTTP ${res.status}`);

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenCache.access_token;
}

// ─── Traducción inline — Google Translate (gratis, sin API key) ──────────────
async function translateToSpanish(text: string): Promise<string> {
  if (!text) return text;
  try {
    const url =
      "https://translate.googleapis.com/translate_a/single?" +
      new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: "es",
        dt: "t",
        q: text,
      });

    const res = await fetch(url);
    const data = (await res.json()) as string[][][];
    const translated = data
      .flat()
      .map((c) => c?.[0] ?? "")
      .join("");
    return translated || text;
  } catch {
    return text; // si falla la traducción, devuelve el original
  }
}

// ─── URL de portada IGDB ──────────────────────────────────────────────────────
export function igdbCoverUrl(imageId: string, size = "t_cover_big"): string {
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

// ─── Fetch individual (cache primero, luego live) ─────────────────────────────
export async function fetchIGDBGame(slug: string): Promise<IGDBGame> {
  // 1. Retornar desde caché si existe (sin llamadas de red)
  if (igdbCache[slug]) {
    return igdbCache[slug];
  }

  // 2. Fetch live desde IGDB vía proxy
  const token = await getAccessToken();
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID as string;

  const res = await fetch("/api/igdb/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: `fields name, summary, cover.image_id, rating, url; where slug = "${slug}"; limit 1;`,
  });

  if (!res.ok) throw new Error(`IGDB falló: HTTP ${res.status}`);

  const games = (await res.json()) as IGDBGame[];
  if (!games.length) throw new Error(`IGDB: no se encontró "${slug}"`);

  const game = games[0];

  // 3. Traducción inline al español — sin scripts, sin builds manuales
  if (game.summary) {
    game.summary = await translateToSpanish(game.summary);
  }

  return game;
}

// ─── Fetch masivo — un fallo individual no rompe el catálogo ─────────────────
export async function fetchAllIGDBGames(
  slugs: string[],
): Promise<PromiseSettledResult<IGDBGame>[]> {
  return Promise.allSettled(slugs.map(fetchIGDBGame));
}
