import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const isVercel = process.env.VERCEL === "1";
const basePath = isVercel ? "/" : "/subsense/";
const appUrl = isVercel
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
  : "https://subsense.app/";

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
        name: "SubSense",
        short_name: "SubSense",
        description: "Track and manage all your subscriptions in one place.",
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
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
});
