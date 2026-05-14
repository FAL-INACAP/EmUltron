import { useState, useEffect } from "react";
import type { GameConfig, GameData } from "../types";
import { fetchAllIGDBGames, igdbCoverUrl } from "../services/igdbService";

/**
 * Carga los metadatos de IGDB para todos los juegos del catálogo en paralelo.
 * Cada card empieza en estado de carga y se resuelve individualmente.
 */
export function useGamesData(games: GameConfig[]): GameData[] {
  const [gamesData, setGamesData] = useState<GameData[]>(() =>
    games.map((g) => ({ ...g, description: "", isLoading: true })),
  );

  useEffect(() => {
    let cancelled = false;

    const slugs = games.map((g) => g.igdbSlug);

    fetchAllIGDBGames(slugs).then((results) => {
      if (cancelled) return;

      setGamesData(
        games.map((game, i) => {
          const result = results[i];

          if (result.status === "fulfilled") {
            const igdb = result.value;
            return {
              ...game,
              description: igdb.summary ?? "Descripción no disponible.",
              // Portada local tiene prioridad; si no hay, usa la de IGDB
              thumbnailUrl:
                game.coverImage ??
                (igdb.cover ? igdbCoverUrl(igdb.cover.image_id) : undefined),
              igdbUrl: igdb.url,
              rating: igdb.rating != null ? Math.round(igdb.rating) : undefined,
              isLoading: false,
            };
          }

          // El juego falla → igual se renderiza la card, sin descripción
          return {
            ...game,
            description: "Descripción no disponible.",
            isLoading: false,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason),
          };
        }),
      );
    });

    return () => {
      cancelled = true;
    };
    // Solo se re-ejecuta si cambia el set de juegos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games.map((g) => g.id).join(",")]);

  return gamesData;
}

/**
 * Encuentra un juego del catálogo por su id.
 */
export function useGameById(
  games: GameConfig[],
  id: string,
): GameConfig | undefined {
  return games.find((g) => g.id === id);
}
