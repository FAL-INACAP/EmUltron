import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// ⚠️  COOP/COEP headers eliminados — eran para EJS_threads de emulatorjs.ORG.
// emulatorjs.COM gestiona threading internamente y NO requiere esos headers.
// De hecho COEP (require-corp) ROMPE el emulador porque el CDN de emulatorjs.com
// no devuelve Cross-Origin-Resource-Policy, causando errores NOT-SET en DevTools.

export default defineConfig({
  plugins: [react()],

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

    // ─── Proxies para IGDB ──────────────────────────────────────────────────
    // La API de IGDB (Twitch) no tiene CORS abierto para peticiones de browser.
    // Vite redirige estas rutas desde el cliente hacia los servidores reales,
    // actuando como middleman sin exponer secrets en el bundle de producción.
    //
    // ⚠️  Esto solo funciona con `vite dev`. Para producción necesitarías un
    // backend real (Cloudflare Worker, Express, etc.) que haga las mismas
    // redirecciones.
    proxy: {
      // POST /api/twitch-token  →  https://id.twitch.tv/oauth2/token
      "/api/twitch-token": {
        target: "https://id.twitch.tv",
        changeOrigin: true,
        rewrite: () => "/oauth2/token",
      },

      // POST /api/igdb/games  →  https://api.igdb.com/v4/games
      "/api/igdb": {
        target: "https://api.igdb.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/igdb/, "/v4"),
      },
    },
  },
});
