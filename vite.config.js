import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  
  return {
    plugins: [react()],
    // resolve: {
    //   alias: {
    //     '@': path.resolve(__dirname, './src'), // para usar @/components/Button.jsx
    //   },
    // },
    server: {
      port: 5173, // Vite dev server //!pasar a env variable
      proxy: {
        '/api': {
          target: 'https://pixelcafe-fye3hqena8gwergr.chilecentral-01.azurewebsites.net', // Tu backend //!pasar a env variable
          changeOrigin: true,
        },
        '/uploads': {
          target: 'https://pixelcafe-fye3hqena8gwergr.chilecentral-01.azurewebsites.net', // Para acceder a imágenes o archivos estáticos //!pasar a env variable
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
  }
})
