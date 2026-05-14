import { useState } from 'react'
import { GameCard } from './GameCard'
import { GameModal } from './GameModal'
import type { GameData } from '../types'
import { useFavorites } from '../hooks/useFavorites'

interface GameGridProps {
  games: GameData[]
}

export function GameGrid({ games }: GameGridProps) {
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null)
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  const handleToggleFavorite = (e: React.MouseEvent, game: GameData) => {
    e.stopPropagation()
    if (isFavorite(game.id)) {
      removeFavorite(game.id)
    } else {
      addFavorite(game.id, game.title, game.coverImage)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => setSelectedGame(game)}
            isFavorite={isFavorite(game.id)}
            onToggleFavorite={(e) => handleToggleFavorite(e, game)}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          />
        ))}
      </div>

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </>
  )
}
