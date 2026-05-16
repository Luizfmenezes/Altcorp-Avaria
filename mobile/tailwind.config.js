/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8", 100: "#ececef", 200: "#d1d1d6", 300: "#a3a3ac",
          400: "#6e6e78", 500: "#46464e", 600: "#2c2c33", 700: "#1c1c22",
          800: "#131318", 900: "#0a0a0c", 950: "#050507",
        },
        lime: {
          50: "#f9fde7", 100: "#f1fbc7", 200: "#e4f793", 300: "#d2ef55",
          400: "#bce416", 500: "#a3cd0c", 600: "#7ea306", 700: "#5f7c0b",
          800: "#4d6310", 900: "#3f5212",
        },
        paper: { 50: "#fbfbf9", 100: "#f5f5f0", 200: "#eceae0" },
        danger: { 500: "#ff3d2e", 600: "#e02416" },
        warn: { 500: "#ffb020" },
        success: { 500: "#16c77f" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: { tightest: "-0.04em", crush: "-0.06em" },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(10, 10, 12, 0.06)",
        card: "0 1px 2px rgba(10,10,12,0.04), 0 8px 24px -8px rgba(10,10,12,0.08)",
        hero: "0 30px 80px -20px rgba(10,10,12,0.25), 0 8px 24px -8px rgba(10,10,12,0.1)",
        glow: "0 0 0 1px rgba(188,228,22,0.4), 0 12px 36px -4px rgba(188,228,22,0.45)",
        floating: "0 18px 40px -12px rgba(10,10,12,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-ring": "pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "shimmer": "shimmer 2.4s linear infinite",
        "tap": "tap 250ms ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        tap: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
