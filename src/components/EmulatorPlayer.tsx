import { useEffect, useRef } from "react";
import { useEmulator } from "../hooks/useEmulator";
import type { GameConfig } from "../types";
import styles from "./EmulatorPlayer.module.css";

interface Props {
  game: GameConfig;
  onClose: () => void;
}

const CONTAINER_ID = "ejs-container";

export function EmulatorPlayer({ game, onClose }: Props): JSX.Element {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEmulator({
    romUrl: game.romPath,
    gameName: game.title,
    enabled: true,
    containerId: CONTAINER_ID,
    accentColor: game.color,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className={styles.overlay} ref={overlayRef}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.platform}>N64</span>
          <span className={styles.divider} />
          <span className={styles.headerTitle}>{game.title}</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar emulador"
          >
            Salir
          </button>
        </div>
      </div>

      {/* ── Emulador ── */}
      <div className={styles.emulatorWrap}>
        {/*
          CRÍTICO: emulatorDiv usa aspect-ratio: 4/3 + max-width: 960px.
          Sin esto el div queda en 0px de alto y el emulador monta invisible.
        */}
        <div id={CONTAINER_ID} className={styles.emulatorDiv} />
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          engine: <strong>emulatorjs.com</strong> · core:{" "}
          <strong>{game.core ?? "mupen64plus-nx"}</strong> · renderer:{" "}
          <strong>GLideN64</strong>
        </p>
      </div>
    </div>
  );
}
