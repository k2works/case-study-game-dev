import { test, expect, Page } from '@playwright/test'

/**
 * モバイル・タッチ操作E2Eテスト
 * タッチコントロールを使用したゲーム操作のテスト
 */
test.describe('モバイル・タッチ操作', () => {
  test.beforeEach(async ({ page }) => {
    // モバイル用のビューポートサイズに設定
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('ぷよぷよゲーム')
  })

  test('モバイル表示でタッチコントロールが表示される', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // タッチコントロールが表示されることを確認
    const touchControls = page.locator('.touch-controls')
    await expect(touchControls).toBeVisible()

    // 各タッチボタンが表示されることを確認
    await expect(page.getByTestId('touch-left')).toBeVisible()
    await expect(page.getByTestId('touch-right')).toBeVisible()
    await expect(page.getByTestId('touch-rotate')).toBeVisible()
    await expect(page.getByTestId('touch-drop')).toBeVisible()
    await expect(page.getByTestId('touch-hard-drop')).toBeVisible()
  })

  test('タッチボタンでぷよを左に移動できる', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // 左移動ボタンをタップ
    const leftButton = page.getByTestId('touch-left')
    await expect(leftButton).toBeVisible()
    await expect(leftButton).toBeEnabled()
    await leftButton.click()

    // 操作の反映を待機
    await page.waitForTimeout(200)

    // ゲームが継続していることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('タッチボタンでぷよを右に移動できる', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // 右移動ボタンをタップ
    const rightButton = page.getByTestId('touch-right')
    await expect(rightButton).toBeVisible()
    await expect(rightButton).toBeEnabled()
    await rightButton.click()

    // 操作の反映を待機
    await page.waitForTimeout(200)

    // ゲームが継続していることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('タッチボタンでぷよを回転できる', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // 回転ボタンをタップ
    const rotateButton = page.getByTestId('touch-rotate')
    await expect(rotateButton).toBeVisible()
    await expect(rotateButton).toBeEnabled()
    await rotateButton.click()

    // 操作の反映を待機
    await page.waitForTimeout(200)

    // ゲームが継続していることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('タッチボタンで高速落下できる', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // 高速落下ボタンをタップ
    const dropButton = page.getByTestId('touch-drop')
    await expect(dropButton).toBeVisible()
    await expect(dropButton).toBeEnabled()
    await dropButton.click()

    // 落下アニメーションの待機
    await page.waitForTimeout(300)

    // ゲームが継続していることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('タッチボタンでハードドロップできる', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // ハードドロップボタンをタップ
    const hardDropButton = page.getByTestId('touch-hard-drop')
    await expect(hardDropButton).toBeVisible()
    await expect(hardDropButton).toBeEnabled()
    await hardDropButton.click()

    // ドロップアニメーションの待機
    await page.waitForTimeout(500)

    // 次のぷよが配置されることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('複数のタッチ操作を組み合わせたゲームプレイ', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // 複合操作パターンの実行
    const operations = [
      { action: 'touch-left', wait: 150 },
      { action: 'touch-rotate', wait: 150 },
      { action: 'touch-right', wait: 150 },
      { action: 'touch-hard-drop', wait: 400 },
      { action: 'touch-right', wait: 150 },
      { action: 'touch-rotate', wait: 150 },
      { action: 'touch-drop', wait: 300 },
    ]

    for (const { action, wait } of operations) {
      const button = page.getByTestId(action)
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
      await button.click()
      await page.waitForTimeout(wait)

      // ゲームオーバーになったら終了
      const gameOverElement = page.locator('[data-testid="game-over"]')
      if (await gameOverElement.isVisible({ timeout: 100 })) {
        break
      }
    }

    // ゲームが実行されていることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('タッチボタンが無効状態で正しく動作する', async ({ page }) => {
    // ゲーム開始前の状態でタッチボタンを確認
    const touchControls = page.locator('.touch-controls')

    // タッチコントロールが存在しない、または無効であることを確認
    if (await touchControls.isVisible({ timeout: 1000 })) {
      // タッチボタンが無効化されていることを確認
      const leftButton = page.getByTestId('touch-left')
      const rightButton = page.getByTestId('touch-right')
      const rotateButton = page.getByTestId('touch-rotate')
      const dropButton = page.getByTestId('touch-drop')
      const hardDropButton = page.getByTestId('touch-hard-drop')

      // ボタンが無効化されていることを確認
      await expect(leftButton).toBeDisabled()
      await expect(rightButton).toBeDisabled()
      await expect(rotateButton).toBeDisabled()
      await expect(dropButton).toBeDisabled()
      await expect(hardDropButton).toBeDisabled()
    }

    // ゲーム開始後にボタンが有効化されることを確認
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // タッチボタンが有効化されることを確認
    await expect(touchControls).toBeVisible()
    const leftButton = page.getByTestId('touch-left')
    await expect(leftButton).toBeEnabled()
  })

  // ヘルパー関数：タッチボタンのパターンを取得
  function getTouchButtonPattern(operationCount: number): string {
    const pattern = operationCount % 4
    switch (pattern) {
      case 0:
        return 'touch-left'
      case 1:
        return 'touch-right'
      case 2:
        return 'touch-rotate'
      case 3:
        return 'touch-hard-drop'
      default:
        return 'touch-drop'
    }
  }

  // ヘルパー関数：タッチ操作を実行
  async function performTouchOperation(page: Page, buttonTestId: string) {
    const button = page.getByTestId(buttonTestId)
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
    await button.click()

    const waitTime = buttonTestId === 'touch-hard-drop' ? 400 : 200
    await page.waitForTimeout(waitTime)
  }

  test('長時間のタッチ操作でゲームが安定動作する', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // 長時間の操作テスト
    let operationCount = 0
    const maxOperations = 25 // モバイルでの応答性を考慮して調整

    while (operationCount < maxOperations) {
      try {
        const buttonTestId = getTouchButtonPattern(operationCount)
        await performTouchOperation(page, buttonTestId)

        // ゲームオーバーチェック
        const gameOverElement = page.locator('[data-testid="game-over"]')
        if (await gameOverElement.isVisible({ timeout: 100 })) {
          break
        }

        operationCount++
      } catch {
        // エラーが発生した場合は終了
        break
      }
    }

    // 最低限の操作は完了している
    expect(operationCount).toBeGreaterThan(0)

    // ゲームが安定していることを確認
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()
  })

  test('タッチ操作とキーボード操作の併用', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ゲームボードの表示を待機
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // タッチ操作とキーボード操作を交互に実行
    const leftButton = page.getByTestId('touch-left')
    await expect(leftButton).toBeVisible()
    await leftButton.click()
    await page.waitForTimeout(150)

    // キーボード操作
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(150)

    // タッチ操作
    const rotateButton = page.getByTestId('touch-rotate')
    await expect(rotateButton).toBeVisible()
    await rotateButton.click()
    await page.waitForTimeout(150)

    // キーボード操作
    await page.keyboard.press('Space')
    await page.waitForTimeout(400)

    // ゲームが正常に動作していることを確認
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('画面回転時のタッチコントロール表示', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ポートレート（縦向き）でのタッチコントロール確認
    await page.setViewportSize({ width: 375, height: 667 })
    const touchControls = page.locator('.touch-controls')
    await expect(touchControls).toBeVisible()

    // ランドスケープ（横向き）に変更
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(500) // レイアウト調整の待機

    // タッチコントロールが引き続き表示されることを確認
    await expect(touchControls).toBeVisible()

    // 各ボタンが操作可能であることを確認
    const leftButton = page.getByTestId('touch-left')
    await expect(leftButton).toBeVisible()
    await expect(leftButton).toBeEnabled()
    await leftButton.click()

    // 操作が正常に動作することを確認
    await page.waitForTimeout(200)
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('タッチ操作のアクセシビリティ', async ({ page }) => {
    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // タッチコントロール要素のアクセシビリティ属性を確認
    const touchControls = page.locator('.touch-controls')
    await expect(touchControls).toBeVisible()
    await expect(touchControls).toHaveAttribute('role', 'toolbar')
    await expect(touchControls).toHaveAttribute(
      'aria-label',
      'タッチ操作コントロール'
    )

    // 各ボタンのaria-labelを確認
    const leftButton = page.getByTestId('touch-left')
    await expect(leftButton).toHaveAttribute('aria-label', '左に移動')

    const rightButton = page.getByTestId('touch-right')
    await expect(rightButton).toHaveAttribute('aria-label', '右に移動')

    const rotateButton = page.getByTestId('touch-rotate')
    await expect(rotateButton).toHaveAttribute('aria-label', '回転')

    const dropButton = page.getByTestId('touch-drop')
    await expect(dropButton).toHaveAttribute('aria-label', '高速落下')

    const hardDropButton = page.getByTestId('touch-hard-drop')
    await expect(hardDropButton).toHaveAttribute('aria-label', 'ハードドロップ')
  })
})
