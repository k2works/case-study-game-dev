import { defineConfig } from 'vite'

export default defineConfig({
  root: './public',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
})
