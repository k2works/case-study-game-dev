import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        'dist/**',
        'node_modules/**',
        '**/*.test.ts',
        '**/*.config.js',
        '**/*.config.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'gulpfile.js',
        'src/main.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
})
