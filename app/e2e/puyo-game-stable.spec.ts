import { test, expect } from '@playwright/test'

test.describe('ぷよぷよゲーム 安定E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('アプリケーションが正常に起動する', async ({ page }) => {
    // ページタイトルが表示される
    await expect(page.locator('h1')).toHaveText('ぷよぷよ')
    await expect(page.locator('p.text-blue-200')).toHaveText('AI対戦ぷよぷよゲーム')
  })

  test('ゲーム情報パネルが正しく表示される', async ({ page }) => {
    // ゲーム情報セクションの存在確認
    const gameInfo = page.getByTestId('game-info')
    await expect(gameInfo).toBeVisible()

    // 各情報項目の確認
    await expect(page.getByTestId('score-display')).toBeVisible()
    await expect(page.getByTestId('level-display')).toBeVisible()
    await expect(page.getByTestId('state-display')).toBeVisible()

    // 初期値の確認
    await expect(page.getByTestId('score-value')).toHaveText('0')
    await expect(page.getByTestId('level-value')).toHaveText('1')
    await expect(page.getByTestId('state-value')).toHaveText('準備中')
  })

  test('ゲームボードが存在する', async ({ page }) => {
    // ゲームボードセクションの存在確認
    const gameBoard = page.getByTestId('game-board')
    await expect(gameBoard).toBeVisible()
  })

  test('キーボード操作説明が表示される', async ({ page }) => {
    // キーボード操作セクションの確認（AI機能追加により複数のh3要素があるため、特定の文字列で指定）
    await expect(page.getByRole('heading', { name: 'キーボード操作' })).toBeVisible()
    
    // 操作説明の確認
    await expect(page.locator('text=←→: 左右移動')).toBeVisible()
    await expect(page.locator('text=↓: 高速落下')).toBeVisible()
    await expect(page.locator('text=↑/Space: 回転')).toBeVisible()
    await expect(page.locator('text=P: ポーズ/再開')).toBeVisible()
    await expect(page.locator('text=R: リセット')).toBeVisible()
  })

  test('基本的なキーボード入力が動作する', async ({ page }) => {
    // ページにフォーカスを当てる
    await page.click('body')

    // 基本的なキー操作（準備中状態では変化なし）
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)

    // 状態が変わらないことを確認
    await expect(page.getByTestId('state-value')).toHaveText('準備中')
  })

  test('ページの基本パフォーマンス', async ({ page }) => {
    // ページロード時間の測定
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // ページが10秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(10000)
    
    // 基本要素の表示確認
    await expect(page.getByTestId('game-board')).toBeVisible()
    await expect(page.getByTestId('game-info')).toBeVisible()
  })

  test('基本的なアクセシビリティ', async ({ page }) => {
    // セマンティックなHTML構造の確認
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
    
    // 適切な見出し構造
    await expect(page.locator('h1')).toBeVisible()
    
    // data-testid属性の存在確認
    await expect(page.getByTestId('game-board')).toBeVisible()
    await expect(page.getByTestId('game-info')).toBeVisible()
  })

  test('レスポンシブレイアウトの基本確認', async ({ page }) => {
    // デスクトップレイアウト
    await page.setViewportSize({ width: 1024, height: 768 })
    
    const gameInfo = page.getByTestId('game-info')
    const gameBoard = page.getByTestId('game-board')
    
    await expect(gameInfo).toBeVisible()
    await expect(gameBoard).toBeVisible()
    
    // タブレットレイアウト
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await expect(gameInfo).toBeVisible()
    await expect(gameBoard).toBeVisible()
  })

  test('エラーハンドリングの基本確認', async ({ page }) => {
    // 無効なキー入力を行っても画面が正常に表示されることを確認
    await page.click('body')
    
    await page.keyboard.press('Escape')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    
    // 基本要素が正常に表示されていることを確認
    await expect(page.getByTestId('game-board')).toBeVisible()
    await expect(page.getByTestId('game-info')).toBeVisible()
    
    // ゲーム状態が「準備中」または「プレイ中」のいずれかであることを確認
    // 自動落下システムの実装により、初期状態が変化する可能性がある
    const stateValue = await page.getByTestId('state-value').textContent()
    expect(stateValue).toMatch(/^(準備中|プレイ中)$/)
  })

  test('フッター情報が表示される', async ({ page }) => {
    // フッターの情報確認
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('text=テスト駆動開発で作られたぷよぷよゲーム')).toBeVisible()
  })

  test('ゲームオーバー時にリスタートボタンが表示される', async ({ page }) => {
    // ゲーム開始ボタンを押してゲームを開始
    const startButton = page.locator('button', { hasText: 'ゲーム開始' })
    await expect(startButton).toBeVisible()
    await startButton.click()
    
    // ゲーム状態が「プレイ中」になることを確認
    await page.waitForTimeout(500)
    await expect(page.getByTestId('state-value')).toHaveText('プレイ中')
    
    // 手動でゲームオーバー状態を作る（新しいヘキサゴナルアーキテクチャ使用）
    await page.evaluate(() => {
      // 新しいアーキテクチャのAPIを使用してゲームオーバー状態にする
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const game = (window as any).game
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setGame = (window as any).setGame
      if (game && setGame) {
        setGame({
          ...game,
          state: 'gameOver'
        })
      }
    })
    
    // ゲームオーバー状態になることを確認
    await page.waitForTimeout(100)
    await expect(page.getByTestId('state-value')).toHaveText('ゲームオーバー')
    
    // GameInfoコンポーネント内のリスタートボタンが表示されることを確認
    await expect(page.getByTestId('restart-button')).toBeVisible()
    await expect(page.getByTestId('restart-button')).toHaveText('リスタート')
  })

  test('リスタートボタンクリックでゲームがリセットされる', async ({ page }) => {
    // ゲーム開始
    const startButton = page.locator('button', { hasText: 'ゲーム開始' })
    await expect(startButton).toBeVisible()
    await startButton.click()
    
    await page.waitForTimeout(500)
    
    // ゲームオーバー状態にする（新しいヘキサゴナルアーキテクチャ使用）
    await page.evaluate(() => {
      // 新しいアーキテクチャのAPIを使用してゲームオーバー状態にする
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const game = (window as any).game
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setGame = (window as any).setGame
      if (game && setGame) {
        setGame({
          ...game,
          state: 'gameOver'
        })
      }
    })
    
    await page.waitForTimeout(100)
    await expect(page.getByTestId('state-value')).toHaveText('ゲームオーバー')
    
    // リスタートボタンをクリック
    const restartButton = page.getByTestId('restart-button')
    await expect(restartButton).toBeVisible()
    await restartButton.click()
    
    // ゲーム状態が「準備中」にリセットされることを確認
    await page.waitForTimeout(100)
    await expect(page.getByTestId('state-value')).toHaveText('準備中')
    
    // スコアとレベルがリセットされることを確認
    await expect(page.getByTestId('score-value')).toHaveText('0')
    await expect(page.getByTestId('level-value')).toHaveText('1')
    
    // ゲーム開始ボタンが再び表示されることを確認
    await expect(page.locator('button', { hasText: 'ゲーム開始' })).toBeVisible()
  })

  test('AI機能の基本動作確認', async ({ page }) => {
    // AIコントロールパネルが存在することを確認
    await expect(page.getByRole('heading', { name: '🤖 AI自動プレイ' })).toBeVisible()
    
    // AI切り替えトグルが存在することを確認（実装はbuttonで行われている）
    const aiToggleSection = page.locator('text=AI自動プレイ').first()
    await expect(aiToggleSection).toBeVisible()
    
    // AI設定セクションが存在することを確認
    await expect(page.locator('text=思考速度')).toBeVisible()
    
    // AI設定の詳細要素を確認（思考速度スライダー）
    await expect(page.locator('input[type="range"]')).toBeVisible()
  })
})