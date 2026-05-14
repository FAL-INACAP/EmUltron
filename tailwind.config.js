/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#060609",
          card: "#0c0c18",
          border: "#1e1e35",
          cyan: "#00e5ff",
          red: "#ff1a3e",
          purple: "#9d4edd",
          gold: "#ffd700",
          muted: "#52607a",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        body: ["Rajdhani", "sans-serif"],
      },
      animation: {
        "slide-up": "slideUp 0.2s ease-out",
        "fade-in": "fadeIn 0.18s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
