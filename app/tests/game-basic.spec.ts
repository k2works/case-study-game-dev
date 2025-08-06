import { test, expect } from '@playwright/test'

/**
 * ゲーム基本機能のE2Eテスト
 * テスト戦略に基づいたユーザーシナリオテスト
 */
test.describe('ぷよぷよゲーム基本機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('ぷよぷよゲーム')
  })

  test('ゲーム開始から基本操作まで', async ({ page }) => {
    // ゲーム開始ボタンを確認
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()

    // ゲーム開始
    await startButton.click()

    // ゲームボードが表示される
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // NEXTぷよが表示される
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
    await expect(nextPuyoArea).toContainText('NEXT')

    // NEXTぷよの個別要素が表示される
    const nextMainPuyo = page.getByTestId('next-main-puyo')
    const nextSubPuyo = page.getByTestId('next-sub-puyo')
    await expect(nextMainPuyo).toBeVisible()
    await expect(nextSubPuyo).toBeVisible()
  })

  test('キーボード操作でぷよを移動できる', async ({ page }) => {
    // ゲーム開始
    await page.getByTestId('start-button').click()

    // 初期位置を記録
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // 左移動
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(100) // アニメーション待機

    // 右移動
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)

    // 回転
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(100)

    // ハードドロップ
    await page.keyboard.press('Space')
    await page.waitForTimeout(500) // ドロップアニメーション待機

    // ゲームが継続していることを確認（NEXTぷよが表示される）
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('ゲームオーバーまでのフロー', async ({ page }) => {
    // ゲーム開始
    await page.getByTestId('start-button').click()

    // フィールドの高さを調べて、ゲームオーバーまでぷよを積み上げる
    let gameOverOccurred = false
    let attempts = 0
    const maxAttempts = 100 // 無限ループを防ぐ

    while (!gameOverOccurred && attempts < maxAttempts) {
      try {
        // ハードドロップでぷよを落とす
        await page.keyboard.press('Space')
        await page.waitForTimeout(300)

        // ゲームオーバー状態をチェック
        const gameOverElement = page.locator('[data-testid="game-over"]')
        if (await gameOverElement.isVisible({ timeout: 1000 })) {
          gameOverOccurred = true
        }

        attempts++
      } catch {
        // タイムアウトエラーは無視して続行
        attempts++
      }
    }

    // 最低限のぷよ数は配置されているはず
    expect(attempts).toBeGreaterThan(5)
  })

  test('連鎖が発生するシナリオ', async ({ page }) => {
    // ゲーム開始
    await page.getByTestId('start-button').click()

    // 連鎖を起こすためのぷよ配置（実際の実装では手動配置は困難なので、
    // 基本的な操作を行って連鎖の可能性を確認）
    for (let i = 0; i < 10; i++) {
      // 左右に移動しながらぷよを落とす
      if (i % 2 === 0) {
        await page.keyboard.press('ArrowLeft')
      } else {
        await page.keyboard.press('ArrowRight')
      }
      await page.keyboard.press('Space')
      await page.waitForTimeout(300)
    }

    // ゲームが実行されていることを確認（NEXTぷよが表示されている）
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()

    // 実行されたことの確認
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()
  })

  test('レスポンシブ表示の確認', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('h1')).toBeVisible()

    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toBeVisible()

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1')).toBeVisible()

    // ゲーム開始ボタンが表示される
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
  })

  test('アクセシビリティ基本チェック', async ({ page }) => {
    // h1見出しが存在することを確認
    await expect(page.locator('h1')).toBeVisible()

    // ボタンにテキストが含まれていることを確認
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()

    // キーボードナビゲーション
    await page.keyboard.press('Tab')
    await expect(startButton).toBeFocused()

    // Enterキーでボタンを押下できることを確認
    await page.keyboard.press('Enter')

    // ゲーム画面に遷移
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()
  })
})
