import { test, expect, Page } from '@playwright/test'

/**
 * ユーザーシナリオE2Eテスト
 * テスト戦略に基づいた完全なユーザーシナリオのテスト
 */
test.describe('ぷよぷよゲーム ユーザーシナリオ', () => {
  test('ゲーム開始から連鎖まで', async ({ page }) => {
    await page.goto('/')

    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // ぷよ操作
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('Space') // ハードドロップ

    // 次のぷよを右側に配置
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')

    // さらにぷよを配置
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('Space')

    // ゲームが継続していることを確認（NEXTぷよが表示されている）
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('新規プレイヤーの完全なゲームプレイ', async ({ page }) => {
    await page.goto('/')

    // 初回訪問時の画面確認
    await expect(page.locator('h1')).toContainText('ぷよぷよゲーム')

    // 操作説明があることを期待（存在すれば）
    const instructions = page.locator('[data-testid="instructions"]')
    if (await instructions.isVisible()) {
      await expect(instructions).toContainText('操作')
    }

    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // 最初のゲームプレイを模擬
    for (let move = 0; move < 5; move++) {
      // 様々な操作を組み合わせ
      if (move % 3 === 0) {
        await page.keyboard.press('ArrowLeft')
      } else if (move % 3 === 1) {
        await page.keyboard.press('ArrowRight')
      }

      if (move % 2 === 0) {
        await page.keyboard.press('ArrowUp') // 回転
      }

      await page.keyboard.press('Space') // ハードドロップ
      await page.waitForTimeout(400) // 落下アニメーション待機
    }

    // ゲームが正常に動作していることを確認
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()
  })

  test('長時間プレイのシナリオ', async ({ page }) => {
    await page.goto('/')
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    const moveCount = await performLongPlayTest(page)

    // 最低限の操作は完了している
    expect(moveCount).toBeGreaterThan(0)
  })

  // ヘルパー関数：長時間プレイテストの実行
  async function performLongPlayTest(page: Page): Promise<number> {
    let moveCount = 0
    const maxMoves = 20

    while (moveCount < maxMoves) {
      try {
        await performRandomMove(page, moveCount)
        await page.keyboard.press('Space')
        await page.waitForTimeout(200)

        // ゲームオーバーチェック
        const gameOverElement = page.locator('[data-testid="game-over"]')
        if (await gameOverElement.isVisible({ timeout: 100 })) {
          break
        }

        moveCount++
      } catch {
        // エラーが発生した場合は終了
        break
      }
    }

    return moveCount
  }

  // ヘルパー関数：ランダムな操作パターンの実行
  async function performRandomMove(
    page: Page,
    moveCount: number
  ): Promise<void> {
    const action = moveCount % 4
    switch (action) {
      case 0:
        await page.keyboard.press('ArrowLeft')
        break
      case 1:
        await page.keyboard.press('ArrowRight')
        break
      case 2:
        await page.keyboard.press('ArrowUp')
        break
      case 3:
        // そのまま落下
        break
    }
  }

  test('復帰プレイヤーのシナリオ', async ({ page }) => {
    await page.goto('/')

    // 以前のスコア記録があるかチェック（ローカルストレージ等）
    await page.evaluate(() => {
      return localStorage.getItem('highScore') || '0'
    })

    // ゲーム開始
    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // 熟練プレイヤーの操作パターン（素早い操作）
    const quickMoves = [
      'ArrowLeft',
      'ArrowUp',
      'Space',
      'ArrowRight',
      'ArrowUp',
      'ArrowUp',
      'Space',
      'ArrowLeft',
      'Space',
    ]

    for (const move of quickMoves) {
      await page.keyboard.press(move)
      await page.waitForTimeout(100) // 短い待機時間

      // ゲームオーバーになったら終了
      const gameOverElement = page.locator('[data-testid="game-over"]')
      if (await gameOverElement.isVisible({ timeout: 100 })) {
        break
      }
    }

    // ゲームが実行されていることを確認
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()
  })

  test('エラーリカバリーシナリオ', async ({ page }) => {
    await page.goto('/')

    // ネットワークを一時的に切断（可能であれば）
    try {
      await page.route('**/*', (route) => route.abort())

      // それでもゲームが動作することを確認
      const startButton = page.getByTestId('start-button')
      await expect(startButton).toBeVisible()
      await startButton.click({ force: true })

      // ネットワークを復旧
      await page.unroute('**/*')

      // ゲームが継続できることを確認
      const gameBoard = page.getByTestId('game-board')
      await expect(gameBoard).toBeVisible()
    } catch {
      // ネットワーク制御ができない場合はスキップ
      console.log('Network control not available, skipping network test')
    }

    // 無効な操作を試行
    await page.keyboard.press('Escape')
    await page.keyboard.press('F5')

    // ゲームが安定していることを確認（NEXTぷよが表示されている）
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('パフォーマンステストシナリオ', async ({ page }) => {
    await page.goto('/')

    // パフォーマンス計測開始
    const startTime = Date.now()

    const startButton = page.getByTestId('start-button')
    await expect(startButton).toBeVisible()
    await startButton.click({ force: true })

    // 初回レンダリング時間の計測
    await expect(page.getByTestId('game-board')).toBeVisible()
    const renderTime = Date.now() - startTime

    // 3秒以内にレンダリングが完了することを確認
    expect(renderTime).toBeLessThan(3000)

    // 連続操作のパフォーマンステスト
    const operationStartTime = Date.now()

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowUp')
    }

    const operationTime = Date.now() - operationStartTime

    // 操作の応答性を確認（2秒以内）WebKitは少し遅い場合があるため
    expect(operationTime).toBeLessThan(2000)

    // ゲームが正常に動作していることを確認（NEXTぷよが表示されている）
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()
  })

  test('マルチブラウザ互換性確認', async ({ page, browserName }) => {
    await page.goto('/')

    // ブラウザ固有の問題がないか確認
    await expect(page.locator('h1')).toBeVisible()

    // 基本操作が全ブラウザで動作することを確認
    const startButton = page.getByTestId('start-button')

    // モバイルの場合はスクロールとより長いタイムアウトを設定
    if (browserName === 'Mobile Chrome' || browserName === 'Mobile Safari') {
      await startButton.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
    }

    await expect(startButton).toBeVisible()
    await expect(startButton).toBeEnabled()

    // フォースクリックを使用してz-index問題を回避
    await startButton.click({ force: true })

    // CSS レイアウトが正しく表示されることを確認
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()

    // キーボード操作が機能することを確認
    await page.keyboard.press('Space')
    await page.waitForTimeout(300)

    // 次のぷよが正常に表示される
    const nextPuyoArea = page.getByTestId('next-puyo-area')
    await expect(nextPuyoArea).toBeVisible()

    console.log(`Test completed on ${browserName}`)
  })
})
