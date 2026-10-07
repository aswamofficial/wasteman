/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  server: {
    port: 5299,
  },
  build: {
    // Split large vendor groups into separate cacheable chunks so the initial
    // load is smaller and vendor code is cached across app updates.
    rollupOptions: {
      output: {
        manualChunks: {
          // React + Ionic are tightly coupled (Ionic imports React), so keep
          // them in one stable, cacheable vendor chunk to avoid circular splits.
          'vendor-ui': ['react', 'react-dom', 'react-router', 'react-router-dom', '@ionic/react', '@ionic/react-router'],
          'vendor-capacitor': [
            '@capacitor/core', '@capacitor/camera', '@capacitor/geolocation',
            '@capacitor/preferences',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
