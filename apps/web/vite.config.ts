import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5180 },
  build: {
    target: 'es2020',
    sourcemap: false,
    // Firebase and the service catalog change rarely: separate files stay cached across releases.
    rollupOptions: { output: { manualChunks: (id) => (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase') ? 'firebase' : id.includes('/core/data/explore') ? 'catalog' : undefined) } },
  },
})
