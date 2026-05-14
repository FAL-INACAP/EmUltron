// api/share.ts
// ─── Open Graph preview para compartir juegos ─────────────────────────────────
// Ruta: /share/:id  (reescrita por vercel.json → /api/share?id=:id)
//
// - Bots (WhatsApp, Discord, Twitter…) leen los meta tags og: y muestran preview.
// - Usuarios reales son redirigidos automáticamente al juego en /emulator/:id.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { gamesConfig } from "../src/data/gamesConfig";
import { igdbCache } from "../src/data/igdbCache";

function coverUrl(imageId: string): string {
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

function truncate(text: string, max = 200): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + "…";
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  const game = gamesConfig.find((g) => g.id === id);

  if (!game) {
    res.writeHead(302, { Location: "/" });
    return res.end();
  }

  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers.host;
  const base = `${protocol}://${host}`;
  const gameUrl = `${base}/emulator/${game.id}`;

  const cached = igdbCache[game.igdbSlug];
  const title = escape(`${game.title} — EmUltron`);
  const description = escape(
    cached?.summary
      ? truncate(cached.summary)
      : "Juega clásicos de Nintendo 64 directamente en tu navegador.",
  );
  const image = cached?.cover
    ? coverUrl(cached.cover.image_id)
    : game.coverImage
      ? `${base}${game.coverImage.startsWith("/") ? "" : "/"}${game.coverImage}`
      : `${base}/favicon.svg`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>

  <!-- Open Graph -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="${escape(gameUrl)}" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${escape(image)}" />
  <meta property="og:site_name"   content="EmUltron" />

  <!-- Twitter / X -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${escape(image)}" />

  <!-- Redirigir a usuarios reales -->
  <meta http-equiv="refresh" content="0;url=${escape(gameUrl)}" />
</head>
<body>
  <p>Redirigiendo a ${escape(game.title)}…</p>
  <script>window.location.replace(${JSON.stringify(gameUrl)})</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
