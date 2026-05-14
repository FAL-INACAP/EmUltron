import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { EmulatorPage } from './pages/EmulatorPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/emulator/:gameId" element={<EmulatorPage />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-vault-bg flex items-center justify-center">
              <div className="text-center border border-vault-border p-12 clip-corner-br">
                <p className="font-display text-7xl font-black text-vault-cyan text-glow-cyan mb-2">404</p>
                <p className="font-body text-vault-muted mb-6 tracking-wider">Página no encontrada</p>
                <a href="/" className="font-body text-sm text-vault-cyan underline hover:text-white transition-colors">
                  ← Volver al inicio
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
