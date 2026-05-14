// ─── Type declarations for emulatorjs.com globals ───
// Source: https://www.emulatorjs.com/core/n64.html

declare global {
  var EJS_player: string;
  var EJS_gameUrl: string;
  var EJS_core: string;
  var EJS_gameName: string;
  var EJS_startOnLoaded: boolean;
  var EJS_color: string;
  var EJS_volume: number;
  var EJS_language: string;
  var EJS_Buttons: Partial<EJSButtons>;
  /** Dejar vacío ("") para deshabilitar anuncios y reducir latencia de inicio */
  var EJS_AdUrl: string;
  var EJS_emulator: EJSEmulatorInstance | undefined;
}

export interface EJSButtons {
  playPause: boolean;
  restart: boolean;
  mute: boolean;
  settings: boolean;
  fullscreen: boolean;
  saveState: boolean;
  loadState: boolean;
  screenRecord: boolean;
  gamepad: boolean;
  cheat: boolean;
  volume: boolean;
  saveSavFiles: boolean;
}

export interface EJSEmulatorInstance {
  pause(): void;
  resume(): void;
  restart(): void;
}

/** N64 cores disponibles en emulatorjs.com */
export type N64Core =
  | "n64"
  | "mupen64plus"
  | "mupen64plus2"
  | "mupen64plus-nx" // Mupen64Plus Next — máximo rendimiento, GLideN64
  | "parallel-n64";

export {};
