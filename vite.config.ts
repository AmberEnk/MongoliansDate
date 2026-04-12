import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Bind IPv4 + IPv6 so both http://127.0.0.1:5173 and http://localhost:5173 work
    host: "0.0.0.0",
    strictPort: false,
  },
});
