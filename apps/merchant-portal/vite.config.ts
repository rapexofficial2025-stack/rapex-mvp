import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Defaults to "/" (unchanged) -- only set by the GitHub Pages staging
  // deploy workflow, which serves this app from a /merchant/ subpath
  // alongside the other portals. Never hardcode a production domain's path here.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  // @rapex/api-client pins a different React patch version than this app, so
  // a production build otherwise bundles TWO copies of React and every hook
  // from the shared packages crashes ("Cannot read properties of null
  // (reading 'useContext')") -- a blank page. Force a single copy.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
})
