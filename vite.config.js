import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  envPrefix: "VITE_",
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "terser",
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
  },
});
