import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    // Test fetch mocks parse absolute URLs; CI has no .env (it is gitignored).
    env: { VITE_API_URL: 'http://localhost:3000' },
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
