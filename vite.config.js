import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './src'), // para usar @/components/Button.jsx
  //   },
  // },
  server: {
    port: 5173, // Vite dev server
    proxy: {
      '/api': {
        target: import.meta.env.VITE_SOCKET_URL, // Tu backend
        changeOrigin: true,
      },
      '/uploads': {
        target: import.meta.env.VITE_SOCKET_URL, // Para acceder a imágenes o archivos estáticos
        changeOrigin: true,
      },
    },
    // Fix for SPA routing - serve index.html for all non-static routes
    historyApiFallback: true,
  },
  // For production builds - ensure SPA routing works
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public', // Directorio para archivos estáticos
})
