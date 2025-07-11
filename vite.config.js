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
        target: 'http://localhost:3000', // Tu backend
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000', // Para acceder a imágenes o archivos estáticos
        changeOrigin: true,
      },
    },
  },
  publicDir: 'public', // Directorio para archivos estáticos
})
