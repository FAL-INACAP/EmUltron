import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GameData } from "../types";
import { useFavorites } from "../hooks/useFavorites";

interface GameModalProps {
  game: GameData;
  onClose: () => void;
}

type MediaTab = "image" | "trailer";

// Altura fija del panel de media — misma en todos los estados
const MEDIA_H = "h-[280px]";

export function GameModal({ game, onClose }: GameModalProps) {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mediaTab, setMediaTab] = useState<MediaTab>("image");
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");

  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    updateFavorite,
    getFavorite,
  } = useFavorites();
  const favData = getFavorite(game.id);
  const inFavs = isFavorite(game.id);

  useEffect(() => {
    setNoteInput(favData?.personalNote ?? "");
    setEditingNote(false);
  }, [game.id, favData?.personalNote]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    setMediaTab("image");
  }, [game.id]);

  const handlePlay = () => {
    onClose();
    navigate(`/emulator/${game.id}`);
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleToggleFavorite = () => {
    if (inFavs) {
      removeFavorite(game.id);
    } else {
      addFavorite(game.id, game.title, game.coverImage);
    }
  };

  const handleSaveNote = () => {
    updateFavorite(game.id, { personalNote: noteInput });
    setEditingNote(false);
  };

  const handleRating = (rating: number) => {
    updateFavorite(game.id, { personalRating: rating });
  };

  const badges = [
    game.genre,
    game.releaseYear?.toString(),
    game.developer,
    game.maxPlayers ? `${game.maxPlayers}P` : undefined,
  ].filter(Boolean) as string[];

  const hasTrailer = Boolean(game.trailerYoutubeId);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-8 animate-fade-in"
      style={{
        background: "rgba(5, 5, 8, 0.92)",
        backdropFilter: "blur(10px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
    >
      {/* Panel */}
      <div className="relative w-full max-w-4xl bg-vault-card border border-vault-border overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)] animate-slide-up flex flex-col md:flex-row">
        <div
          className={`w-full md:w-96 shrink-0 flex flex-col bg-vault-bg justify-center items-center`}
        >
          {hasTrailer && (
            <div className="flex gap-1 p-1.5 bg-vault-bg border-b border-vault-border">
              <TabBtn
                active={mediaTab === "image"}
                onClick={() => setMediaTab("image")}
                label="Imagen"
              />
              <TabBtn
                active={mediaTab === "trailer"}
                onClick={() => setMediaTab("trailer")}
                label="Trailer"
              />
            </div>
          )}

          <div
            className={`relative w-full ${MEDIA_H} overflow-hidden bg-vault-bg`}
          >
            {mediaTab === "image" || !hasTrailer ? (
              <>
                {game.thumbnailUrl ? (
                  <img
                    src={game.thumbnailUrl}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <FallbackCover title={game.title} />
                )}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-vault-bg/60 to-transparent pointer-events-none" />
              </>
            ) : (
              <iframe
                key={game.trailerYoutubeId}
                src={`https://www.youtube.com/embed/${game.trailerYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${game.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            )}
          </div>
          {game.rating != null && (
            <div className="px-3 py-2 border-t border-vault-border/50 flex items-center justify-between">
              <span className="font-body text-[10px] text-vault-muted uppercase tracking-widest">
                IGDB Score
              </span>
              <span
                className="font-display text-xs font-bold"
                style={{ color: ratingColor(game.rating) }}
              >
                ★ {game.rating}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto max-h-[80vh] md:max-h-[76vh]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 bg-vault-card border-b border-vault-border/50">
            <div className="flex-1 min-w-0">
              <span className="font-body text-[9px] tracking-[0.35em] text-vault-cyan uppercase block mb-0.5">
                Nintendo 64
              </span>
              <h2 className="font-display text-lg font-black text-white leading-tight">
                {game.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 shrink-0 border border-vault-border flex items-center justify-center text-vault-muted hover:text-white hover:border-vault-border/80 transition-colors duration-150 mt-0.5"
              aria-label="Cerrar"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-4">
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="font-body text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 border border-vault-border bg-vault-bg text-vault-muted"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            <div className="h-px bg-vault-border" />
            <div>
              <h3 className="font-body text-[9px] font-bold tracking-[0.3em] uppercase text-vault-muted mb-2">
                Acerca del juego
              </h3>
              {game.isLoading ? (
                <DescSkeleton />
              ) : (
                <p className="font-body text-sm text-gray-400 leading-relaxed">
                  {game.description || "Descripción no disponible."}
                </p>
              )}
              {game.igdbUrl && (
                <a
                  href={game.igdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs text-vault-muted hover:text-vault-cyan transition-colors underline underline-offset-2 mt-2 block"
                >
                  Ver en IGDB →
                </a>
              )}
            </div>

            <div className="h-px bg-vault-border" />

            {/* ── Favoritos ── */}
            <div>
              <h3 className="font-body text-[9px] font-bold tracking-[0.3em] uppercase text-vault-muted mb-3">
                Mis Favoritos
              </h3>

              <button
                onClick={handleToggleFavorite}
                className={[
                  "flex items-center gap-2 px-3.5 py-2 font-body text-xs font-bold tracking-wider uppercase border transition-colors duration-200",
                  inFavs
                    ? "border-vault-red/60 text-vault-red bg-vault-red/8 hover:bg-vault-red/12"
                    : "border-vault-border text-vault-muted hover:border-vault-border/80 hover:text-white",
                ].join(" ")}
              >
                <HeartIcon className="w-3.5 h-3.5" filled={inFavs} />
                {inFavs ? "En mis favoritos" : "Agregar a favoritos"}
              </button>

              {inFavs && (
                <div className="mt-3 space-y-3">
                  {/* Rating personal */}
                  <div>
                    <p className="font-body text-[10px] text-vault-muted tracking-wider uppercase mb-1.5">
                      Mi calificación
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`text-lg transition-colors ${
                            star <= (favData?.personalRating ?? 0)
                              ? "text-vault-gold"
                              : "text-vault-border hover:text-vault-gold/50"
                          }`}
                          aria-label={`${star} estrellas`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nota personal */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-body text-[10px] text-vault-muted tracking-wider uppercase">
                        Nota personal
                      </p>
                      {!editingNote && (
                        <button
                          onClick={() => {
                            setNoteInput(favData?.personalNote ?? "");
                            setEditingNote(true);
                          }}
                          className="font-body text-[10px] text-vault-muted hover:text-vault-cyan transition-colors"
                        >
                          {favData?.personalNote ? "Editar" : "Agregar nota"}
                        </button>
                      )}
                    </div>
                    {editingNote ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Escribe tu opinión..."
                          className="w-full bg-vault-bg border border-vault-border focus:border-vault-cyan/50 text-white text-sm font-body p-2 resize-none focus:outline-none transition-colors"
                          rows={3}
                          maxLength={300}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveNote}
                            className="px-3 py-1 bg-vault-cyan text-vault-bg font-body text-[10px] font-bold tracking-wider uppercase"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingNote(false)}
                            className="px-3 py-1 border border-vault-border text-vault-muted font-body text-[10px] font-bold tracking-wider uppercase hover:text-white transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-body text-sm text-gray-400 italic">
                        {favData?.personalNote || (
                          <span className="text-vault-border not-italic">
                            Sin nota todavía.
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón jugar */}
            <div className="pt-1">
              <button
                onClick={handlePlay}
                className="group relative w-full py-3 font-display text-xs font-black tracking-[0.2em] uppercase text-vault-bg bg-vault-cyan hover:bg-vault-cyan/90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <PlayIcon className="w-3.5 h-3.5" />
                Jugar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function ratingColor(r: number) {
  if (r >= 75) return "var(--color-vault-cyan, #00e5ff)";
  if (r >= 60) return "#ffd700";
  return "#ff1a3e";
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function TabBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 py-1 px-2 font-body text-[10px] font-bold tracking-wider uppercase border transition-colors duration-150",
        active
          ? "border-vault-cyan/50 text-vault-cyan bg-vault-cyan/8"
          : "border-vault-border text-vault-muted hover:text-white",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function FallbackCover({ title }: { title: string }) {
  const hue = (title.charCodeAt(0) * 37) % 360;
  return (
    <div
      className="w-full h-full flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, #050508 0%, hsl(${hue},55%,12%) 100%)`,
      }}
    >
      <span
        className="font-display text-center text-base font-bold"
        style={{ color: `hsl(${hue},75%,60%)` }}
      >
        {title}
      </span>
    </div>
  );
}

function DescSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[100, 90, 95, 75, 85].map((w, i) => (
        <div
          key={i}
          className="h-3 bg-vault-border rounded"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function HeartIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
