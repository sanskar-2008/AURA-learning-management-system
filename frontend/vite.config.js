import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_PRODUCTION_API_URL = 'https://aura-learning-management-system.onrender.com'
const LOCAL_BACKEND_URL = 'http://127.0.0.1:5000'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const resolvedApiUrl =
    env.VITE_API_URL?.trim() ||
    (mode === 'production' ? DEFAULT_PRODUCTION_API_URL : '')

  return {
    plugins: [react(), tailwindcss()],
    envDir: __dirname,
    envPrefix: 'VITE_',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: LOCAL_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(resolvedApiUrl),
    },
  }
})
