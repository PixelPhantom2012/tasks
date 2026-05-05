import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Dev uses "/" so http://localhost:5173/ loads; production build keeps GitHub Pages path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tasks/' : '/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
}))
