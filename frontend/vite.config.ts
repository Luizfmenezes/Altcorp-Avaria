import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("date-fns")) return "dates";
          if (id.includes("react-router")) return "router";
          if (id.includes("lucide-react")) return "icons";
          // three.js stack — kept in its own chunk so it loads on demand
          // (only the lazily-imported Bus3D modal pulls it in).
          if (id.includes("@react-three") || /node_modules[\\/]three/.test(id)) return "three3d";
          return "vendor";
        },
      },
    },
  },
  server: { port: 5173, host: true },
});
