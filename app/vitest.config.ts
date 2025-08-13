/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        statements: 40,
        branches: 80,
        functions: 80,
        lines: 40
      },
      exclude: [
        'node_modules/',
        'src/test/',
        'e2e/',
        'dist/',
        '*.config.ts',
        '*.config.js',
        '*.config.cjs',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/main.tsx',
        'src/App.tsx',
        'src/App.css',
        'src/index.css',
        '.dependency-cruiser.cjs'
      ]
    }
  }
})