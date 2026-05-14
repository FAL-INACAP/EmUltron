// ─── EmulatorPage — usa EmulatorPlayer de last_one ────────────────────────
import { useParams, Link } from "react-router-dom";
import { gamesConfig } from "../data/gamesConfig";
import { EmulatorPlayer } from "../components/EmulatorPlayer";

export function EmulatorPage() {
  const { gameId } = useParams<{ gameId: string }>();

  const game = gamesConfig.find((g) => g.id === gameId);

  if (!game) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-2xl text-white mb-3">
            Juego no encontrado
          </h1>
          <p className="font-body text-vault-muted mb-6">
            El juego <code className="text-vault-cyan">{gameId}</code> no existe
            en el catálogo.
          </p>
          <Link
            to="/"
            className="font-body text-sm text-vault-cyan underline underline-offset-2 hover:text-white transition-colors"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // CRÍTICO: hard navigation en lugar de navigate(-1).
  // emulatorjs.com crea Web Workers, AudioContexts y SharedArrayBuffers que
  // son recursos del browser — sobreviven al unmount de React y no se pueden
  // destruir desde JS. Un reload completo los mata y garantiza que el próximo
  // juego arranque en un entorno limpio.
  const handleClose = () => {
    window.location.href = "/";
  };

  return <EmulatorPlayer game={game} onClose={handleClose} />;
}
