import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { analyzer } from 'vite-bundle-analyzer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA設定
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // 開発環境ではPWAを無効化（MIME typeエラー回避）
      },
      manifest: {
        name: 'ぷよぷよゲーム - パズルゲーム',
        short_name: 'ぷよぷよ',
        description:
          'クラシックなぷよぷよパズルゲーム。オフラインでもプレイ可能で、連鎖を作って高得点を目指しましょう！',
        theme_color: '#4ecdc4',
        background_color: '#242424',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?source=pwa',
        lang: 'ja',
        dir: 'ltr',
        categories: ['games', 'entertainment'],
        prefer_related_applications: false,
        icons: [
          {
            src: 'icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
        shortcuts: [
          {
            name: '新しいゲーム',
            short_name: '新規',
            description: '新しいゲームを開始',
            url: '/?action=new-game',
            icons: [
              {
                src: 'icon-96.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
          {
            name: '設定',
            short_name: '設定',
            description: 'ゲーム設定を変更',
            url: '/?action=settings',
            icons: [
              {
                src: 'icon-96.png',
                sizes: '96x96',
                type: 'image/png',
              },
            ],
          },
        ],
      },
    }),
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
        'src/main.tsx',
        '.dependency-cruiser.cjs',
        'dev-dist/**',
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
