import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/n8n-api': {
        target: 'https://n8n.polmarkai.pro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n-api/, ''),
        secure: true
      },
      '/n8n-webhook': {
        target: 'https://n8n.polmarkai.pro',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n-webhook/, ''),
        secure: true
      }
    }
  }
})
