import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ], 
  base: '/', 

  server: {
    
    proxy: {
      // If you're running a separate PHP server
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})