import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig((): UserConfig => {
  return {
    plugins: [react()],
    base: "/intrasphere/", // 🔴 Gardé pour les assets
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "assets"),
      },
    },
    root: __dirname,
    build: {
      outDir: path.resolve(__dirname, "dist"), // 🔴 ADAPTÉ: Build vers dist/ local
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Optimiser pour hébergement mutualisé
          manualChunks: undefined,
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        }
      }
    },
    server: {
      fs: {
        strict: false,
      },
      // Pour dev local avec backend PHP
      proxy: {
        '/intrasphere/api': {
          target: 'http://localhost', // Adapter selon votre serveur local
          changeOrigin: true,
          secure: false
        }
      }
    },
  };
});