import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { analyzer } from 'vite-bundle-analyzer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // バンドル分析（環境変数でオン・オフ制御）
    process.env.ANALYZE && analyzer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // 最適化設定
    rollupOptions: {
      output: {
        manualChunks: {
          // React関連を別チャンクに分離
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // チャンクサイズ警告の閾値を調整
    chunkSizeWarningLimit: 600,
    // より積極的なminification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log削除
        drop_debugger: true, // debugger削除
        pure_funcs: ['console.log'], // 特定の関数削除
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/*.e2e.*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'dist/**',
        'node_modules/**',
        '**/*.test.{ts,tsx}',
        '**/*.config.{js,ts}',
        '**/types/**',
        'src/test/**',
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 80,
          functions: 90,
          lines: 85,
        },
      },
    },
  },
})
