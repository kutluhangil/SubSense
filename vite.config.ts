import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const isVercel = process.env.VERCEL === "1";
const basePath = process.env.VITE_BASE_PATH || "/";
const appUrl = isVercel
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
  : process.env.VITE_APP_URL || "https://subsense.app/";

export default defineConfig({
  base: basePath,
  plugins: [
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(/%APP_URL%/g, appUrl);
      },
    },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Aboneyim",
        short_name: "Aboneyim",
        description: "Tüm aboneliklerini tek yerden ücretsiz takip et ve yönet.",
        theme_color: "#111827",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: basePath,
        start_url: basePath,
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cache Firebase SDK & app chunks for offline use
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Static SEO price pages (/fiyatlar/*), /api/*, and sitemap must NOT be served
        // the SPA shell by the service worker — let them hit the network.
        navigateFallbackDenylist: [/^\/api/, /^\/fiyatlar/, /^\/sitemap/, /^\/robots/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fx-rates-cache",
              expiration: { maxAgeSeconds: 86400 }, // 24h
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://macmini-server.taild883a6.ts.net",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
});
