// ─── Edge Middleware: OG preview para bots ────────────────────────────────────
// Cuando un bot (WhatsApp, Discord, Twitter, etc.) accede a /emulator/:id,
// lo redirigimos a /share/:id que tiene los meta tags Open Graph correctos.
// Los usuarios reales pasan directo a la SPA sin ningún cambio.

export const config = {
  matcher: ["/emulator/:path+"],
};

const BOT_UA =
  /facebookexternalhit|facebot|twitterbot|whatsapp|discordbot|telegrambot|slackbot|linkedinbot|googlebot|bingbot|applebot|embedly|quora|pinterest|rogerbot|vkshare|w3c_validator/i;

export default function middleware(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";

  if (BOT_UA.test(ua)) {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1]; // 'super-smash-bros'

    return Response.redirect(new URL(`/share/${id}`, url), 302);
  }
}
