import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = (env.VITE_DEV_API_ORIGIN || "").replace(/\/$/, "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: "0.0.0.0",
      strictPort: false,
      proxy: apiOrigin
        ? {
            "/api": { target: apiOrigin, changeOrigin: true },
          }
        : undefined,
    },
  };
});
