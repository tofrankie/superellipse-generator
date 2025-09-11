import react from '@vitejs/plugin-react'
import { defineConfig } from 'rolldown-vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  return {
    base: isProd ? '/superellipse/' : '/',
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    plugins: [react()],
  }
})
