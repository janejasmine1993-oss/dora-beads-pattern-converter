import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    allowedHosts: ['dora-beads-api-267650-4-1440665484.sh.run.tcloudbase.com'],
  },
})
