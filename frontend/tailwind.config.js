/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f4f6fb",
          100: "#e7ecf6",
          200: "#c5d0e8",
          300: "#9badd6",
          400: "#5d77b8",
          500: "#2d4a8e",
          600: "#1f3673",
          700: "#15265a",
          800: "#0a1438",
          900: "#010118",
          950: "#010118",
        },
        brand: {
          50: "#eff5ff",
          100: "#dbe8ff",
          200: "#bfd5ff",
          300: "#93b6ff",
          400: "#608dff",
          500: "#3b66ff",
          600: "#2543ed",
          700: "#1c33d3",
          800: "#1d2da9",
          900: "#1d2c84",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(1, 1, 24, 0.06)",
        card: "0 1px 2px rgba(1,1,24,0.04), 0 8px 24px -8px rgba(1,1,24,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
