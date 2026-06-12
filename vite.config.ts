
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const isVercel = process.env.VERCEL === '1';
const basePath = isVercel ? '/' : '/subsense/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'SubSense',
        short_name: 'SubSense',
        description: 'Track and manage all your subscriptions in one place.',
        theme_color: '#111827',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: basePath,
        start_url: basePath,
        // Place icon-192.png and icon-512.png in /public before deploying
        icons: [
          { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache Firebase SDK & app chunks for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fx-rates-cache',
              expiration: { maxAgeSeconds: 86400 }, // 24h
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'react-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('lucide-react')) return 'lucide-icons';
            return 'vendor';
          }
        },
      },
    },
  },
});
