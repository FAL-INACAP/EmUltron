// ─── Game Config ─────────────────────────────────────────────────────────────
// Forma de cada entrada en gamesConfig.ts.
// Para agregar un juego nuevo, completa estos campos.

export type N64Core =
  | "n64"
  | "mupen64plus"
  | "mupen64plus2"
  | "mupen64plus-nx"
  | "parallel-n64";

export interface GameConfig {
  /** Slug único URL-safe, ej: 'super-mario-64' */
  id: string;
  /** Título mostrado en la UI */
  title: string;
  /** Ruta al archivo ROM dentro de /public/roms/, ej: '/roms/mario.z64' */
  romPath: string;
  /** Color de acento para la UI del emulador (hex). Opcional. */
  color?: string;
  /**
   * Core de EmulatorJS a usar.
   * 'mupen64plus-nx' → mejor rendimiento (recomendado).
   * 'parallel-n64'   → mejor compatibilidad en algunos títulos.
   */
  core?: N64Core;
  /**
   * Portada local opcional. Si se omite, usa la portada de IGDB.
   * Coloca el archivo en /public/covers/ y pon, p.ej., '/covers/mario.jpg'.
   */
  coverImage?: string;
  /**
   * Slug del juego en IGDB — coincide con la parte final de la URL:
   *   https://www.igdb.com/games/<igdbSlug>
   * Ejemplo: "super-mario-64"
   */
  igdbSlug: string;
  /** ID de video de YouTube para el tráiler del modal. */
  trailerYoutubeId?: string;
  genre?: string;
  releaseYear?: number;
  developer?: string;
  maxPlayers?: number;
}

// ─── IGDB API ─────────────────────────────────────────────────────────────────

export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  cover?: {
    id: number;
    image_id: string;
  };
  /** Puntuación ponderada 0–100 calculada por IGDB */
  rating?: number;
  /** URL de la página del juego en igdb.com */
  url?: string;
  screenshots?: {
    image_id: string;
  }[];
}

// ─── Enriched Game Data ───────────────────────────────────────────────────────

export interface GameData extends GameConfig {
  description: string;
  thumbnailUrl?: string;
  /** URL de la página del juego en igdb.com */
  igdbUrl?: string;
  /** Puntuación IGDB 0–100 (rating ponderado por votos) */
  rating?: number;
  isLoading: boolean;
  error?: string;
}

// ─── Favorites CRUD ──────────────────────────────────────────────────────────

export interface FavoriteGame {
  /** Referencia al id del GameConfig */
  gameId: string;
  gameTitle: string;
  coverImage?: string;
  /** Fecha de agregado — ISO string */
  addedAt: string;
  /** Nota personal del usuario */
  personalNote: string;
  /** Calificación personal 1–5 */
  personalRating: number;
}
