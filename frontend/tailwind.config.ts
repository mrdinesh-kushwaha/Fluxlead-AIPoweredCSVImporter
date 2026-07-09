import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060A",
          900: "#0B0E17",
          800: "#121627",
          700: "#1B2036",
        },
        mist: {
          400: "#7C879E",
          300: "#9CA7BD",
          100: "#E7EAF2",
        },
        flow: {
          violet: "#6D5EF5",
          purple: "#A855F7",
          pink: "#EC4899",
        },
        signal: {
          success: "#34D399",
          warning: "#FBBF24",
          danger: "#F87171",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "flow-gradient": "linear-gradient(115deg, #6D5EF5 0%, #A855F7 50%, #EC4899 100%)",
        "flow-radial": "radial-gradient(circle at 20% -10%, rgba(109,94,245,0.35), transparent 55%), radial-gradient(circle at 90% 10%, rgba(236,72,153,0.25), transparent 45%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(109, 94, 245, 0.25)",
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
      animation: {
        "pulse-slow": "pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
