import type { GameData } from '../types'

interface GameCardProps {
  game: GameData
  onClick: () => void
  isFavorite?: boolean
  onToggleFavorite?: (e: React.MouseEvent) => void
  style?: React.CSSProperties
}

export function GameCard({ game, onClick, isFavorite = false, onToggleFavorite, style }: GameCardProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-cyan rounded-none animate-slide-up"
      aria-label={`Ver detalles de ${game.title}`}
    >
      {/* Card shell — sharp corners, hard borders */}
      <div className="relative bg-vault-card border border-vault-border overflow-hidden transition-all duration-200 group-hover:border-vault-cyan group-hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] clip-corner-br">

        {/* Cover image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-vault-bg">
          {game.isLoading ? (
            <CoverSkeleton />
          ) : game.thumbnailUrl ? (
            <>
              <img
                src={game.thumbnailUrl}
                alt={`${game.title} cover`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vault-card/90 via-transparent to-transparent" />
            </>
          ) : (
            <FallbackCover title={game.title} />
          )}

          {/* Genre badge — angular */}
          {!game.isLoading && game.genre && (
            <div className="absolute top-2 left-0">
              <span className="font-body text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-vault-cyan text-vault-bg">
                {game.genre}
              </span>
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={[
                'absolute top-2 right-2 w-7 h-7 flex items-center justify-center border transition-all duration-200 z-10',
                isFavorite
                  ? 'border-vault-red bg-vault-red/20 text-vault-red'
                  : 'border-vault-border/80 bg-vault-bg/70 text-vault-muted hover:border-vault-red hover:text-vault-red',
              ].join(' ')}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              <HeartIcon className="w-3.5 h-3.5" filled={isFavorite} />
            </button>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 border border-vault-cyan bg-vault-bg/80 flex items-center justify-center">
                <InfoIcon className="w-4 h-4 text-vault-cyan" />
              </div>
              <span className="font-body text-[10px] font-bold tracking-[0.3em] text-vault-cyan uppercase">
                Detalles
              </span>
            </div>
          </div>
        </div>

        {/* Title bar */}
        <div className="px-3 py-2.5 border-t border-vault-border/60">
          {game.isLoading ? (
            <div className="h-3.5 bg-vault-border rounded animate-pulse w-2/3" />
          ) : (
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-xs font-bold text-white leading-snug group-hover:text-vault-cyan transition-colors duration-150 truncate">
                {game.title}
              </h3>
              {game.releaseYear && (
                <span className="font-body text-[10px] text-vault-muted shrink-0 mt-px">
                  {game.releaseYear}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-vault-cyan/0 group-hover:bg-vault-cyan/60 transition-all duration-300" />
      </div>
    </button>
  )
}

function CoverSkeleton() {
  return (
    <div className="w-full h-full bg-vault-card animate-pulse flex items-center justify-center">
      <ControllerIcon className="w-8 h-8 text-vault-border" />
    </div>
  )
}

function FallbackCover({ title }: { title: string }) {
  const hue = (title.charCodeAt(0) * 37) % 360
  return (
    <div
      className="w-full h-full flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, #050508 0%, hsl(${hue},55%,12%) 100%)` }}
    >
      <span className="font-display text-center text-xs font-bold leading-tight" style={{ color: `hsl(${hue},75%,60%)` }}>
        {title}
      </span>
    </div>
  )
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  )
}

function ControllerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 12h4M8 10v4" strokeLinecap="round" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M4 7h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    </svg>
  )
}
