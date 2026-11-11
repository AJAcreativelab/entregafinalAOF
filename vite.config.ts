import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Presentación estática: no requiere backend. `base: './'` permite abrir el build
// desde cualquier carpeta o subruta (hosting estático, pendrive, etc.).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
