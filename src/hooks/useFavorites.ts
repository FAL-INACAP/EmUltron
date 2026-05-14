// ─── useFavorites Hook — CRUD con localStorage ────────────────────────────────
import { useState, useCallback } from 'react'
import type { FavoriteGame } from '../types'

const STORAGE_KEY = 'emultron_favorites_v1'

function loadFromStorage(): FavoriteGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FavoriteGame[]) : []
  } catch {
    return []
  }
}

function saveToStorage(favs: FavoriteGame[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
  } catch {
    console.error('useFavorites: error al guardar en localStorage')
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteGame[]>(loadFromStorage)

  // CREATE — agrega un juego a favoritos con nota y calificación inicial
  const addFavorite = useCallback(
    (gameId: string, gameTitle: string, coverImage?: string) => {
      setFavorites((prev) => {
        if (prev.some((f) => f.gameId === gameId)) return prev
        const newFav: FavoriteGame = {
          gameId,
          gameTitle,
          coverImage,
          addedAt: new Date().toISOString(),
          personalNote: '',
          personalRating: 5,
        }
        const updated = [newFav, ...prev]
        saveToStorage(updated)
        return updated
      })
    },
    [],
  )

  // UPDATE — edita nota y/o calificación de un favorito existente
  const updateFavorite = useCallback(
    (gameId: string, changes: Partial<Pick<FavoriteGame, 'personalNote' | 'personalRating'>>) => {
      setFavorites((prev) => {
        const updated = prev.map((f) =>
          f.gameId === gameId ? { ...f, ...changes } : f,
        )
        saveToStorage(updated)
        return updated
      })
    },
    [],
  )

  // DELETE — elimina un juego de favoritos
  const removeFavorite = useCallback((gameId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.gameId !== gameId)
      saveToStorage(updated)
      return updated
    })
  }, [])

  // READ helper — comprueba si un juego está en favoritos
  const isFavorite = useCallback(
    (gameId: string) => favorites.some((f) => f.gameId === gameId),
    [favorites],
  )

  // READ helper — obtiene un favorito por id
  const getFavorite = useCallback(
    (gameId: string) => favorites.find((f) => f.gameId === gameId),
    [favorites],
  )

  return { favorites, addFavorite, updateFavorite, removeFavorite, isFavorite, getFavorite }
}
