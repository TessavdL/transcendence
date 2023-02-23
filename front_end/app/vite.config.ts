import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true, // Makes it accept connections from `0.0.0.0`
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:3001/",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
