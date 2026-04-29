import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./functions/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      colors: {
        ink: {
          950: "#07111e",
          900: "#0a1525",
          800: "#12233c"
        },
        aqua: {
          300: "#7ae3ff",
          400: "#40cfff",
          500: "#00b8ff"
        },
        sand: {
          100: "#f7f4ee",
          200: "#ebe4d6"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(122,227,255,0.15), 0 24px 80px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;