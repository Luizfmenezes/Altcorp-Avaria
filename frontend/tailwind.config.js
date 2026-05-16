/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#ececef",
          200: "#d1d1d6",
          300: "#a3a3ac",
          400: "#6e6e78",
          500: "#46464e",
          600: "#2c2c33",
          700: "#1c1c22",
          800: "#131318",
          900: "#0a0a0c",
          950: "#050507",
        },
        lime: {
          50: "#f9fde7",
          100: "#f1fbc7",
          200: "#e4f793",
          300: "#d2ef55",
          400: "#bce416",
          500: "#a3cd0c",
          600: "#7ea306",
          700: "#5f7c0b",
          800: "#4d6310",
          900: "#3f5212",
        },
        paper: {
          50: "#fbfbf9",
          100: "#f5f5f0",
          200: "#eceae0",
          300: "#d9d5c4",
        },
        navy: {
          50: "#f4f6fb", 100: "#e7ecf6", 200: "#c5d0e8", 300: "#9badd6",
          400: "#5d77b8", 500: "#2d4a8e", 600: "#1f3673", 700: "#15265a",
          800: "#0a1438", 900: "#010118", 950: "#010118",
        },
        brand: {
          50: "#eff5ff", 100: "#dbe8ff", 200: "#bfd5ff", 300: "#93b6ff",
          400: "#608dff", 500: "#3b66ff", 600: "#2543ed", 700: "#1c33d3",
          800: "#1d2da9", 900: "#1d2c84",
        },
        danger: { 500: "#ff3d2e", 600: "#e02416" },
        warn: { 500: "#ffb020", 600: "#e09000" },
        success: { 500: "#16c77f", 600: "#0fa365" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        crush: "-0.06em",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(10, 10, 12, 0.06)",
        card: "0 1px 2px rgba(10,10,12,0.04), 0 8px 24px -8px rgba(10,10,12,0.08)",
        hero: "0 30px 80px -20px rgba(10,10,12,0.18), 0 8px 24px -8px rgba(10,10,12,0.08)",
        glow: "0 0 0 1px rgba(188,228,22,0.4), 0 8px 32px -4px rgba(188,228,22,0.35)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(10,10,12,0) 0%, rgba(10,10,12,0.04) 100%), radial-gradient(rgba(10,10,12,0.08) 1px, transparent 1px)",
        "lime-shine":
          "linear-gradient(135deg, #bce416 0%, #d2ef55 40%, #bce416 100%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-down": "slideDown 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "blur-in": "blurIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-ring": "pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.8s linear infinite",
        "marquee": "marquee 30s linear infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "draw": "draw 1.6s ease-out forwards",
        "ticker": "ticker 800ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blurIn: {
          "0%": { opacity: "0", filter: "blur(8px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        draw: {
          "0%": { strokeDashoffset: "400" },
          "100%": { strokeDashoffset: "0" },
        },
        ticker: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
