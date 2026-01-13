import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      /* 8px spacing grid */
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "grid-1": "8px",
        "grid-2": "16px",
        "grid-3": "24px",
        "grid-4": "32px",
        "grid-5": "40px",
        "grid-6": "48px",
        "grid-8": "64px",
        "grid-10": "80px",
      },
      colors: {
        /* Design token colors using CSS variables */
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-2": "rgb(var(--bg-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-2": "rgb(var(--accent-2) / <alpha-value>)",
        glow: "rgb(var(--glow) / <alpha-value>)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        glass: "14px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(var(--accent), 0.20), 0 0 30px rgba(var(--glow), var(--glow-alpha))",
        "glow-strong": "0 0 0 1px rgba(var(--accent), 0.30), 0 0 40px rgba(var(--glow), 0.5)",
      },
      fontSize: {
        /* Hero text sizing for outline-word */
        hero: ["clamp(48px, 12vw, 140px)", { lineHeight: "1", fontWeight: "900" }],
      },
    },
  },
  plugins: [],
};

export default config;
