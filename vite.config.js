import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        news: resolve(__dirname, 'news/index.html'),
        openFrame500: resolve(__dirname, 'products/open-frame-500/index.html'),
        openFrame1200: resolve(__dirname, 'products/open-frame-1200/index.html'),
        silent: resolve(__dirname, 'products/silent/index.html'),
        mobileTrailer: resolve(__dirname, 'products/mobile-trailer/index.html'),
        highVoltage: resolve(__dirname, 'products/high-voltage/index.html'),
      },
    },
  },
})
