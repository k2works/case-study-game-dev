import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright設定
 * テスト戦略に基づいたE2Eテストの設定
 */
export default defineConfig({
  testDir: './tests',
  /* 並列テスト実行 */
  fullyParallel: true,
  /* CI環境でのテスト失敗時の再試行を無効 */
  forbidOnly: !!process.env.CI,
  /* CI環境での再試行設定 */
  retries: process.env.CI ? 2 : 0,
  /* 並列実行ワーカー数 */
  workers: process.env.CI ? 1 : undefined,
  /* レポート設定 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],

  /* テスト実行前の設定 */
  use: {
    /* 実行時のベースURL */
    baseURL: 'http://127.0.0.1:5173',
    /* すべての操作をトレース */
    trace: 'on-first-retry',
    /* スクリーンショット設定 */
    screenshot: 'only-on-failure',
    /* 音響系の自動再生を許可 */
    launchOptions: {
      args: [
        '--autoplay-policy=no-user-gesture-required',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    },
  },

  /* テスト実行前にローカルサーバーを起動 */
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* クロスブラウザテスト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* モバイルテスト */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
})
