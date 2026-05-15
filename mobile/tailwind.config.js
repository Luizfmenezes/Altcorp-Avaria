/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f4f6fb", 100: "#e7ecf6", 200: "#c5d0e8", 300: "#9badd6",
          400: "#5d77b8", 500: "#2d4a8e", 600: "#1f3673", 700: "#15265a",
          800: "#0a1438", 900: "#010118",
        },
        brand: { 500: "#3b66ff", 600: "#2543ed" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
