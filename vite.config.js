import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Parse allowed origins from env, default to the specific domain regex if not provided
  const allowedOriginsRaw = env.VITE_CORS_ALLOWED_ORIGINS
  let allowedOrigins = [
    /^https?:\/\/.*\.apps\.petrvich\.eu$/,
    /^http:\/\/localhost(:\d+)?$/
  ] // Default fallback

  if (allowedOriginsRaw) {
    allowedOrigins = allowedOriginsRaw.split(',').map(origin => {
      const trimmed = origin.trim()
      // Check if it looks like a regex (starts and ends with /)
      if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
        return new RegExp(trimmed.slice(1, -1))
      }
      return trimmed
    })
  }

  return {
    plugins: [
      react(),
      federation({
        name: 'rental_generator',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.jsx',
        },
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
          'react-router-dom': { singleton: true }
        }
      })
    ],
    build: {
      target: 'esnext'
    },
    server: {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type']
      }
    },
    preview: {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type']
      }
    }
  }
})
