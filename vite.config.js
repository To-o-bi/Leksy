// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  base: '/',
  
  server: {
    port: 3000,
    host: true,
    // Add proxy configuration for API requests
    proxy: {
      '/api': {
        target: 'https://leksycosmetics.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    // Enable CORS for the dev server
    cors: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          framer: ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Define environment variables
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'https://leksycosmetics.com/api')
  }
})