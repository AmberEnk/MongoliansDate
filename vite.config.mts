import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import type { Plugin } from "vite";
import type { VercelRequest, VercelResponse } from "@vercel/node";

function loadLocalDbEnv() {
  const file = path.join(process.cwd(), ".env.vercel.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function forumDevApi(): Plugin {
  return {
    name: "forum-dev-api",
    configureServer(server) {
      loadLocalDbEnv();
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/forum")) {
          next();
          return;
        }
        try {
          const { default: handler } = await import("./api/forum");
          const parsed = new URL(url, "http://127.0.0.1");
          const query: Record<string, string> = {};
          parsed.searchParams.forEach((value, key) => {
            query[key] = value;
          });
          let rawBody = "";
          if (req.method === "POST" || req.method === "PUT") {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            rawBody = Buffer.concat(chunks).toString("utf8");
          }
          let body: unknown = rawBody;
          try {
            body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            body = rawBody;
          }
          const vercelReq = {
            method: req.method,
            headers: req.headers,
            query,
            body,
            url,
          } as unknown as VercelRequest;
          const vercelRes = {
            status(code: number) {
              res.statusCode = code;
              return this;
            },
            setHeader(name: string, value: string) {
              res.setHeader(name, value);
              return this;
            },
            json(payload: unknown) {
              if (!res.getHeader("Content-Type")) res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(payload));
              return this;
            },
            get headersSent() {
              return res.headersSent;
            },
          } as unknown as VercelResponse;
          await handler(vercelReq, vercelRes);
          if (!res.writableEnded) res.end();
        } catch (error) {
          console.error(error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Server error." }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = (env.VITE_DEV_API_ORIGIN || "").replace(/\/$/, "");

  return {
    plugins: [
      react(),
      forumDevApi(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["apple-touch-icon.png", "favicon-32.png", "robots.txt"],
        manifest: {
          name: "Uchral",
          short_name: "Uchral",
          description: "A Mongolian community forum — dating optional.",
          theme_color: "#c43d5c",
          background_color: "#f8bbd0",
          display: "standalone",
          start_url: "/",
          scope: "/",
          lang: "en",
          categories: ["social", "lifestyle"],
          icons: [
            { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            {
              src: "icon-maskable-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: { cacheName: "google-fonts-stylesheets" },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      port: 5173,
      host: "0.0.0.0",
      strictPort: false,
      proxy: apiOrigin
        ? {
            "/api/waitlist": { target: apiOrigin, changeOrigin: true },
            "/api/waitlist-admin": { target: apiOrigin, changeOrigin: true },
            "/api/waitlist-export": { target: apiOrigin, changeOrigin: true },
            "/api/waitlist-health": { target: apiOrigin, changeOrigin: true },
            "/api/ping": { target: apiOrigin, changeOrigin: true },
          }
        : undefined,
    },
  };
});
