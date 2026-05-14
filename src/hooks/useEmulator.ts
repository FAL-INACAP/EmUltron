// ─── useEmulator Hook ───
// Integración con emulatorjs.com (v0.5.x) — el mismo motor que usa Minijuegos.
//
// API documentada en: https://www.emulatorjs.com/core/n64.html
//
// Diferencias clave vs emulatorjs.org:
//  • Loader:  https://www.emulatorjs.com/loader.js  (no CDN propio)
//  • No requiere EJS_pathtodata — assets servidos por su CDN
//  • No requiere EJS_threads ni EJS_defaultOptions — gestionado internamente
//  • Core recomendado para N64: "mupen64plus-nx" (Mupen64Plus Next + GLideN64)

import { useEffect, useRef } from "react";
import type { N64Core } from "@/types/emulatorjs-com";

// ── Constantes ────────────────────────────────────────────────────────
const LOADER_URL = "https://www.emulatorjs.com/loader.js";
const LOADER_ID = "ejs-com-loader";

/**
 * Core N64 con mejor rendimiento en emulatorjs.com.
 * mupen64plus-nx = Mupen64Plus Next con renderer GLideN64 y dynamic recompiler.
 * Alcanza 60 fps estables en la gran mayoría de títulos N64.
 */
const BEST_N64_CORE: N64Core = "mupen64plus-nx";

// ── Tipos ─────────────────────────────────────────────────────────────
interface UseEmulatorOptions {
  /** URL o path a la ROM (.z64 / .n64 / .v64) */
  romUrl: string;
  /** Nombre del juego — usado para el nombrado de saves */
  gameName: string;
  /** Montar o desmontar el emulador */
  enabled: boolean;
  /** ID del div contenedor */
  containerId?: string;
  /** Color de acento de la UI (hex) */
  accentColor?: string;
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useEmulator({
  romUrl,
  gameName,
  enabled,
  containerId = "ejs-container",
  accentColor,
}: UseEmulatorOptions): void {
  const loaderRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!enabled || !romUrl) return;

    // ── 1. Variables globales ANTES de cargar loader.js ──────────────

    window.EJS_player = `#${containerId}`;
    window.EJS_gameUrl = romUrl;
    window.EJS_core = BEST_N64_CORE;
    window.EJS_gameName = gameName;
    window.EJS_startOnLoaded = true;

    // Volumen inicial (0.0–1.0). El usuario puede ajustarlo desde la UI.
    window.EJS_volume = 0.8;

    // CRÍTICO para rendimiento: string vacío deshabilita la carga de anuncios.
    // Sin esto, emulatorjs.com hace fetch a su servidor de ads antes de
    // inicializar el emulador, añadiendo 200–800 ms de latencia al inicio.
    window.EJS_AdUrl = "";

    // Color de acento opcional para la UI del emulador
    if (accentColor) {
      window.EJS_color = accentColor;
    }

    // Deshabilitar funciones que consumen CPU / ancho de banda innecesariamente.
    // screenRecord: codifica vídeo en tiempo real (WebCodecs) — caro en CPU.
    // cheat: carga la DB de cheats desde la red aunque no se use.
    window.EJS_Buttons = {
      screenRecord: false,
      cheat: false,
    };

    // ── 2. Limpiar loader anterior si existe (re-montaje en StrictMode) ──
    document.getElementById(LOADER_ID)?.remove();

    // ── 3. Inyectar loader.js de emulatorjs.com ──────────────────────
    const script = document.createElement("script");
    script.id = LOADER_ID;
    script.src = LOADER_URL;
    script.async = true;
    document.body.appendChild(script);
    loaderRef.current = script;

    // ── 4. Cleanup al desmontar ───────────────────────────────────────
    return () => {
      // Pausar la instancia antes de destruirla para evitar audio residual
      try {
        window.EJS_emulator?.pause();
      } catch {
        /* noop */
      }
      window.EJS_emulator = undefined;

      // Liberar contextos WebGL para evitar el aviso "Too many active WebGL contexts"
      // CRÍTICO: hacerlo ANTES de vaciar el contenedor
      document.querySelectorAll(`#${containerId} canvas`).forEach((canvas) => {
        const c = canvas as HTMLCanvasElement;
        const gl = c.getContext("webgl2") ?? c.getContext("webgl");
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      });

      // Vaciar el contenedor para que el próximo juego arranque en limpio.
      // Sin esto, el DOM que emulatorjs.com inyectó (canvas, iframes, workers)
      // queda vivo y el nuevo loader.js no puede inicializar → pantalla negra.
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";

      // Eliminar el loader que inyectamos nosotros
      loaderRef.current?.remove();
      loaderRef.current = null;

      // Eliminar TODOS los scripts / iframes que emulatorjs.com haya inyectado
      // en el documento. Sin esto el nuevo loader puede colisionar con el core
      // anterior que sigue cargado en memoria.
      document
        .querySelectorAll('script[src*="emulatorjs.com"]')
        .forEach((s) => s.remove());
      document
        .querySelectorAll('iframe[src*="emulatorjs.com"]')
        .forEach((f) => f.remove());

      // Limpiar todas las variables EJS_* del scope global
      (Object.keys(window) as Array<keyof typeof window>)
        .filter((k) => String(k).startsWith("EJS_"))
        .forEach((k) => {
          delete (window as unknown as Record<string, unknown>)[k as string];
        });
    };
  }, [enabled, romUrl, gameName, containerId, accentColor]);
}
