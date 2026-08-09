import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Defaults to "/" (unchanged) -- only set by the GitHub Pages staging
  // deploy workflow, which serves this app from a /merchant/ subpath
  // alongside the other portals. Never hardcode a production domain's path here.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
})
