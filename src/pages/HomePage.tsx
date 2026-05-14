import { useState } from "react";
import { gamesConfig } from "../data/gamesConfig";
import { useGamesData } from "../hooks/useGamesData";
import { GameGrid } from "../components/GameGrid";
import { GameModal } from "../components/GameModal";
import { Navbar } from "../components/Navbar";
import { useFavorites } from "../hooks/useFavorites";
import type { GameData } from "../types";

type Tab = "catalog" | "favorites";

export function HomePage() {
  const games = useGamesData(gamesConfig);
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const { favorites, removeFavorite, updateFavorite } = useFavorites();
  const [selectedFav, setSelectedFav] = useState<GameData | null>(null);

  const openFavGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game) setSelectedFav(game);
  };

  return (
    <div className="min-h-screen bg-vault-bg">
      <Navbar
        onShowFavorites={() =>
          setActiveTab(activeTab === "favorites" ? "catalog" : "favorites")
        }
        favoritesCount={favorites.length}
        activePage={activeTab}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-10 px-4 md:px-8 overflow-hidden">
        {/* Línea sutil en la parte superior */}
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-border to-transparent" />

        <div className="relative max-w-7xl mx-auto flex items-end justify-between gap-8">
          {/* Texto */}
          <div>
            {/* Etiqueta de sistema */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-body text-[10px] tracking-[0.5em] uppercase text-vault-muted font-semibold">
                Nintendo 64 Emulator
              </span>
              <div className="h-px flex-1 max-w-12 bg-vault-border" />
            </div>

            {/* Heading principal */}
            <h1 className="font-display font-black leading-none tracking-tight mb-4">
              <span className="block text-5xl md:text-7xl text-white">Em</span>
              <span className="block text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-vault-cyan to-vault-purple">
                Ultron
              </span>
            </h1>

            <p className="font-body text-sm text-vault-muted max-w-xs leading-relaxed mb-7">
              Clásicos de Nintendo 64 directamente en tu navegador. Sin
              instalaciones.
            </p>

            {/* Stats bar */}
            <div className="flex items-center gap-5">
              <Stat label="Juegos" value={gamesConfig.length.toString()} />
              <div className="h-8 w-px bg-vault-border" />
              <Stat label="Plataforma" value="N64" />
              <div className="h-8 w-px bg-vault-border" />
              <Stat label="Core" value="Mupen64+" />
              <div className="h-8 w-px bg-vault-border" />
              <Stat
                label="Favoritos"
                value={favorites.length.toString()}
                accent
              />
            </div>
          </div>

          <div className="hidden md:flex items-end justify-cente w-80 h-80 ">
            <img
              src="/nintendoLogo.png"
              alt="EmUltron"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end gap-0 border-b border-vault-border mb-6">
            <TabButton
              label="Catálogo"
              count={gamesConfig.length}
              active={activeTab === "catalog"}
              onClick={() => setActiveTab("catalog")}
            />
            <TabButton
              label="Mis Favoritos"
              count={favorites.length}
              active={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
              accent
            />
          </div>
        </div>
      </section>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {activeTab === "catalog" && <GameGrid games={games} />}
          {activeTab === "favorites" && (
            <FavoritesPanel
              favorites={favorites.map((f) => ({
                ...f,
                game: games.find((g) => g.id === f.gameId),
              }))}
              onPlay={openFavGame}
              onRemove={removeFavorite}
              onUpdateNote={(id, note) =>
                updateFavorite(id, { personalNote: note })
              }
              onUpdateRating={(id, rating) =>
                updateFavorite(id, { personalRating: rating })
              }
            />
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-4 pb-6 text-center">
        <p className="font-body text-[11px] text-vault-border">
          Solo para uso personal &mdash; Nintendo por favor no me demandes 🥀
        </p>
      </footer>

      {/* Modal favorito */}
      {selectedFav && (
        <GameModal game={selectedFav} onClose={() => setSelectedFav(null)} />
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={`font-display text-lg font-black ${accent ? "text-vault-red" : "text-white"}`}
      >
        {value}
      </span>
      <span className="font-body text-[9px] tracking-widest uppercase text-vault-muted">
        {label}
      </span>
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2.5 font-body text-xs font-bold tracking-wider uppercase border-b-2 transition-colors duration-150 flex items-center gap-2",
        active
          ? accent
            ? "border-vault-red text-vault-red"
            : "border-vault-cyan text-vault-cyan"
          : "border-transparent text-vault-muted hover:text-white",
      ].join(" ")}
    >
      {label}
      {count > 0 && (
        <span
          className={`text-[9px] px-1.5 py-px font-bold ${
            active
              ? accent
                ? "bg-vault-red/20 text-vault-red"
                : "bg-vault-cyan/20 text-vault-cyan"
              : "bg-vault-border text-vault-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface FavItemData {
  gameId: string;
  gameTitle: string;
  coverImage?: string;
  addedAt: string;
  personalNote: string;
  personalRating: number;
  game?: GameData;
}

function FavoritesPanel({
  favorites,
  onPlay,
  onRemove,
  onUpdateNote,
  onUpdateRating,
}: {
  favorites: FavItemData[];
  onPlay: (gameId: string) => void;
  onRemove: (gameId: string) => void;
  onUpdateNote: (gameId: string, note: string) => void;
  onUpdateRating: (gameId: string, rating: number) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 border border-vault-border flex items-center justify-center mb-4 text-vault-border">
          <HeartIcon className="w-7 h-7" />
        </div>
        <p className="font-display text-sm font-bold text-vault-muted tracking-widest uppercase mb-2">
          Sin favoritos aún
        </p>
        <p className="font-body text-sm text-vault-border">
          Abre cualquier juego y presiona ♡ para guardarlo aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {favorites.map((fav) => {
        const isEditing = editingId === fav.gameId;
        const addedDate = new Date(fav.addedAt).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return (
          <div
            key={fav.gameId}
            className="bg-vault-card border border-vault-border p-4 flex gap-4 items-start hover:border-vault-border/80 transition-colors duration-150"
          >
            {/* Cover thumb */}
            <div className="w-14 h-18 shrink-0 overflow-hidden bg-vault-bg border border-vault-border/60">
              {fav.game?.thumbnailUrl ? (
                <img
                  src={fav.game.thumbnailUrl}
                  alt={fav.gameTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-vault-bg flex items-center justify-center p-1">
                  <span className="font-display text-[8px] text-vault-muted text-center">
                    {fav.gameTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-display text-sm font-bold text-white truncate">
                  {fav.gameTitle}
                </h3>
                <span className="font-body text-[10px] text-vault-muted shrink-0">
                  {addedDate}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => onUpdateRating(fav.gameId, s)}
                    className={`text-sm transition-colors ${s <= fav.personalRating ? "text-vault-gold" : "text-vault-border hover:text-vault-gold/50"}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Note */}
              {isEditing ? (
                <div className="space-y-1.5">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Escribe tu opinión..."
                    className="w-full bg-vault-bg border border-vault-border focus:border-vault-cyan/50 text-white text-xs font-body p-2 resize-none focus:outline-none transition-colors"
                    rows={2}
                    maxLength={300}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onUpdateNote(fav.gameId, noteInput);
                        setEditingId(null);
                      }}
                      className="px-2.5 py-1 bg-vault-cyan text-vault-bg font-body text-[10px] font-bold tracking-wider uppercase"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 border border-vault-border text-vault-muted font-body text-[10px] font-bold tracking-wider uppercase hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <p className="font-body text-xs text-gray-500 italic flex-1">
                    {fav.personalNote || (
                      <span className="text-vault-border not-italic">
                        Sin nota
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setNoteInput(fav.personalNote);
                      setEditingId(fav.gameId);
                    }}
                    className="font-body text-[10px] text-vault-muted hover:text-vault-cyan transition-colors shrink-0"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => onPlay(fav.gameId)}
                className="w-8 h-8 border border-vault-border/60 flex items-center justify-center text-vault-muted hover:border-vault-cyan/60 hover:text-vault-cyan transition-colors duration-150"
                aria-label="Jugar"
              >
                <PlayIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onRemove(fav.gameId)}
                className="w-8 h-8 border border-vault-border/60 flex items-center justify-center text-vault-muted hover:border-vault-red/60 hover:text-vault-red transition-colors duration-150"
                aria-label="Quitar de favoritos"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
      <path d="M9 6V4h6v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
