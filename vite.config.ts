import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxy = {
  "/api/product-service": {
    target: "http://localhost:8084",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/product-service/, ""),
  },
  "/api/user-service": {
    target: "http://localhost:8085",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/user-service/, ""),
  },
  "/api/recommendation-service": {
    target: "http://localhost:8086",
    changeOrigin: true,
    rewrite: (path: string) =>
      path.replace(/^\/api\/recommendation-service/, ""),
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy,
  },
  preview: {
    port: 4173,
    proxy,
  },
});
