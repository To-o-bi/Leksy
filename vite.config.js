// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    base: '/',
    
    server: {
      port: 3000,
      host: true, // Allow connections from network
      // Handle HTML5 history routing
      historyApiFallback: true,
      proxy: {
        // Proxy API requests to the live server
        '/api': {
          target: 'https://leksycosmetics.com',
          changeOrigin: true,
          secure: true,
          // Add headers to help with CORS if needed
          headers: {
            'Origin': 'https://leksycosmetics.com',
            'Referer': 'https://leksycosmetics.com'
          },
          // Log proxy requests for debugging
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending request to:', req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received response from:', req.url, 'Status:', proxyRes.statusCode);
            });
          }
        }
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    }
  }
})