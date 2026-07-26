import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  // Pas de `base` : Cloudflare Pages sert le site à la racine du domaine.
  // Il faudrait le rétablir pour un hébergement en sous-dossier.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js'
  }
})