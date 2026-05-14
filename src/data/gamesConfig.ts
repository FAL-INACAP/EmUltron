import type { GameConfig } from "../types";

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  EmUltron — CATÁLOGO DE JUEGOS                                          │
 * │                                                                         │
 * │  Para añadir un juego:                                                  │
 * │  1. Copia una entrada existente.                                        │
 * │  2. Pon un `id` único (lowercase, hyphens, URL-safe).                  │
 * │  3. Ajusta `romPath` al nombre del archivo en /public/roms/.           │
 * │  4. Ajusta `igdbSlug` — cópialo de la URL en igdb.com/games/<slug>.   │
 * │  5. Guarda. Listo.                                                      │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export const gamesConfig: GameConfig[] = [
  {
    id: "super-smash-bros",
    title: "Super Smash Bros.",
    romPath: "/roms/smash64.z64",
    coverImage: "/covers/Super_Smash_Bros_64.webp",
    color: "#FF6B00",
    core: "mupen64plus-nx",
    igdbSlug: "super-smash-bros",
    trailerYoutubeId: "NgfJrsH0J-A",
    genre: "Pelea",
    releaseYear: 1999,
    developer: "HAL Laboratory",
    maxPlayers: 4,
  },
  {
    id: "super-mario-64",
    title: "Super Mario 64",
    romPath: "/roms/SuperMario64.z64",
    coverImage: "covers/Super_Mario_64.png",
    color: "#E52521",
    core: "mupen64plus-nx",
    igdbSlug: "super-mario-64",
    trailerYoutubeId: "spDfvv-uj6I",
    genre: "Plataformas",
    releaseYear: 1996,
    developer: "Nintendo EAD",
    maxPlayers: 1,
  },
  {
    id: "donkey-kong-64",
    title: "Donkey Kong 64",
    romPath: "/roms/Donkey-Kong-64.z64",
    coverImage: "/covers/Donkey_Kong_64.jpg",
    color: "#CC8800",
    core: "mupen64plus-nx",
    igdbSlug: "donkey-kong-64",
    trailerYoutubeId: "FkxS5uDYSlA",
    genre: "Plataformas",
    releaseYear: 1999,
    developer: "Rare",
    maxPlayers: 4,
  },
  {
    id: "star-wars-episode-1-racer-64",
    title: "Star Wars Racer 64",
    romPath: "/roms/Star-Wars-Episode-I-Racer.z64",
    coverImage: "/covers/Star_Wars_Racer.jpg",
    color: "#FFE300",
    core: "mupen64plus-nx",
    igdbSlug: "star-wars-episode-i-racer",
    trailerYoutubeId: "qBFNz4Me6l0",
    genre: "Carreras",
    releaseYear: 1999,
    developer: "LucasArts",
    maxPlayers: 2,
  },
  {
    id: "diddy-kong-racing",
    title: "Diddy Kong Racing",
    romPath: "/roms/Diddy-Kong-Racing.n64",
    coverImage: "/covers/Diddy-Kong-Racing.jpg",
    color: "#FF6B00",
    core: "mupen64plus-nx",
    igdbSlug: "diddy-kong-racing",
    trailerYoutubeId: "iaePT-jZHhU",
    genre: "Carreras",
    releaseYear: 1997,
    developer: "Rare",
    maxPlayers: 4,
  },
];
