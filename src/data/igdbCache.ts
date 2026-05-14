// ─── IGDB Cache (fallback) ────────────────────────────────────────────────────
// Datos precargados para los juegos del catálogo.
// Si el juego no está aquí, igdbService hace un fetch live con traducción inline.

import type { IGDBGame } from '../types'

export const igdbCache: Record<string, IGDBGame> = {
  "super-smash-bros": {
    "id": 1626,
    "cover": { "id": 131928, "image_id": "co2tso" },
    "name": "Super Smash Bros.",
    "rating": 81.16072850197293,
    "summary": "Super Smash Bros. es un videojuego de lucha cruzado entre varias franquicias de Nintendo y la primera entrega de la serie. Los jugadores deben derrotar a sus oponentes en una lucha frenética con objetos y potenciadores. A diferencia de los juegos de pelea tradicionales, en lugar de agotar la barra de vida del rival, los jugadores buscan lanzarlos fuera del escenario. El daño total se representa como porcentaje que aumenta al recibir golpes.",
    "url": "https://www.igdb.com/games/super-smash-bros"
  },
  "super-mario-64": {
    "id": 1074,
    "cover": { "id": 329251, "image_id": "co721v" },
    "name": "Super Mario 64",
    "rating": 88.75177169034907,
    "summary": "¡Mario es súper en una forma completamente nueva! Con gráficos 3D y una banda sonora explosiva, Super Mario 64 establece un nuevo estándar para los videojuegos. Está lleno de batallas contundentes, circuitos de obstáculos y aventuras submarinas. Recupera las Power Stars de sus ubicaciones ocultas y enfréntate a Bowser, rey de los Koopas. Explora libremente praderas, mazmorras, montañas y océanos en un mundo completamente tridimensional.",
    "url": "https://www.igdb.com/games/super-mario-64"
  },
  "donkey-kong-64": {
    "id": 1096,
    "cover": { "id": 104022, "image_id": "co289i" },
    "name": "Donkey Kong 64",
    "rating": 72.95567421469255,
    "summary": "¡K. Rool ha secuestrado a los Kong! ¿Podrá Donkey Kong rescatar a sus amigos, recuperar los plátanos dorados y salvar su tierra natal? Derriba Kremlings con el lanzador de piñas de Chunky o el trombón de Lanky. Flota por el aire con el giro de Tiny. ¡Dispara al cielo con el Jetbarrel de Diddy en esta aventura de plataformas cooperativa para cinco personajes jugables!",
    "url": "https://www.igdb.com/games/donkey-kong-64"
  },
  "star-wars-episode-i-racer": {
    "id": 154,
    "cover": { "id": 182131, "image_id": "co3wj7" },
    "name": "Star Wars: Episode I - Racer",
    "rating": 74.7591322211911,
    "summary": "Star Wars Episodio I — Racer te pone al mando en las legendarias carreras de vainas de la película. Elige a Anakin Skywalker o a más de 20 corredores y alcanza velocidades simuladas de 600 km/h rasando el suelo. Esquiva peligros como lagos de metano, lluvias de meteoritos y los temidos Tusken Raiders. Compite solo o con un amigo en pantalla dividida en más de 21 circuitos repartidos en 8 mundos distintos.",
    "url": "https://www.igdb.com/games/star-wars-episode-i-racer"
  }
}
