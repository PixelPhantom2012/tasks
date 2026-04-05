import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/tasks/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
