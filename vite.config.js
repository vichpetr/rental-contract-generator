import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'rental_generator',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext'
  }
})
