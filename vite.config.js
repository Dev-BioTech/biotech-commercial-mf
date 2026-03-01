import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      // Alias to access shared services from Shell
      "@shared-services": path.resolve(
        __dirname,
        "../biotech-shell/src/shared/services"
      ),
    },
  },
  server: {
    port: 5006,
    cors: true,
    fs: {
      allow: [".."],
    },
  },
  plugins: [
    react(),
    federation({
      name: "commercialMF",
      filename: "remoteEntry.js",
      exposes: {
        "./CommercialDashboard":
          "./src/features/dashboard/components/CommercialDashboard.jsx",
        "./SalesDashboard":
          "./src/features/sales/components/SalesDashboard.jsx",
        "./CommercialStore": "./src/shared/store/commercialStore.js",
      },
      shared: ["react", "react-dom", "react-router-dom", "zustand", "axios"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
