import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  // You can add theme customization here if needed
  css: {
    postcss: {
      plugins: [
        // PostCSS plugins if needed
      ]
    },
  },
})
