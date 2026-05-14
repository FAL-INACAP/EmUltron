import { Link } from "react-router-dom";

interface NavbarProps {
  onShowFavorites?: () => void;
  favoritesCount?: number;
  activePage?: "catalog" | "favorites";
}

export function Navbar({
  onShowFavorites,
  favoritesCount = 0,
  activePage = "catalog",
}: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 md:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-vault-bg/95 backdrop-blur-md border-b border-vault-border/70" />

      <nav className="relative w-full max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-vault-card border border-vault-border flex items-center justify-center">
            <ControllerIcon className="w-3.5 h-3.5 text-vault-cyan" />
          </div>
          <span className="font-display text-sm font-black tracking-widest text-white group-hover:text-vault-cyan transition-colors duration-200">
            Em<span className="text-vault-cyan">Ultron</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block font-body text-[11px] text-vault-muted tracking-[0.3em] uppercase">
            Nintendo 64
          </span>

          <div className="h-4 w-px bg-vault-border" />

          {/* Favoritos */}
          {onShowFavorites && (
            <button
              onClick={onShowFavorites}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 font-body text-xs font-semibold tracking-wider uppercase transition-colors duration-200 border",
                activePage === "favorites"
                  ? "border-vault-red/60 text-vault-red bg-vault-red/8"
                  : "border-vault-border text-vault-muted hover:border-vault-border/80 hover:text-white",
              ].join(" ")}
            >
              <HeartIcon
                className="w-3.5 h-3.5"
                filled={activePage === "favorites"}
              />
              Favoritos
              {favoritesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-px font-bold ${
                    activePage === "favorites"
                      ? "bg-vault-red/20 text-vault-red"
                      : "bg-vault-border/60 text-vault-muted"
                  }`}
                >
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Status dot — estático */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-vault-cyan/80" />
            <span className="font-body text-[11px] text-vault-muted tracking-widest uppercase">
              Online
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}

function ControllerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 12h4M8 10v4" strokeLinecap="round" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M4 7h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
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
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
