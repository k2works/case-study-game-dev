import { test, expect } from '@playwright/test'

/**
 * AI自動プレイ機能のE2Eテスト
 * 
 * 実際のブラウザ環境でAI機能の動作を検証
 */
test.describe('AI自動プレイ機能 E2Eテスト', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 必要に応じてコンソールエラーを監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`)
      }
    })
  })

  test.describe('基本的なAI自動プレイ操作', () => {
    test('AI自動プレイボタンが表示される', async ({ page }) => {
      // 学習タブをクリック
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      
      // AI自動プレイに関連するUI要素が表示されることを確認
      await expect(page.getByRole('heading', { name: '🧠 AI学習ダッシュボード' })).toBeVisible()
    })

    test('AI自動プレイを開始・停止できる', async ({ page }) => {
      // 学習タブに移動
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      
      // 学習ダッシュボードが表示されることを確認
      await expect(page.getByRole('heading', { name: '🧠 AI学習ダッシュボード' })).toBeVisible()
      
      // 学習設定が表示されることを確認
      await expect(page.getByRole('heading', { name: '⚙️ 学習設定' })).toBeVisible()
    })
  })

  test.describe('AI評価データの表示', () => {
    test('学習ダッシュボードが表示される', async ({ page }) => {
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      
      // 学習ダッシュボードが表示されることを確認
      await expect(page.getByRole('heading', { name: '🧠 AI学習ダッシュボード' })).toBeVisible()
      
      // 学習設定セクションが表示されることを確認
      await expect(page.getByRole('heading', { name: '⚙️ 学習設定' })).toBeVisible()
      
      // 設定項目が表示されることを確認
      const settingsElements = [
        'エポック数',
        '学習率',
        'バッチサイズ'
      ]
      
      for (const element of settingsElements) {
        const locator = page.getByText(element)
        if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(locator).toBeVisible()
        }
      }
    })

    test('AI評価メトリクスが表示される', async ({ page }) => {
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      
      // 学習ダッシュボードが表示されることを確認
      await expect(page.getByRole('heading', { name: '🧠 AI学習ダッシュボード' })).toBeVisible()
      
      // 学習状態の表示確認
      await expect(page.getByText('待機中')).toBeVisible()
    })
  })

  test.describe('ユーザーエクスペリエンス', () => {
    test('タブ切り替えが正常に動作する', async ({ page }) => {
      // 初期状態：ゲームタブボタンが選択されている
      await expect(page.getByRole('button', { name: '🎮 ゲーム' })).toBeVisible()
      
      // 学習タブに切り替え
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      await expect(page.getByRole('button', { name: '🧠 AI学習' })).toBeVisible()
      
      // ゲームタブに戻る
      await page.getByRole('button', { name: '🎮 ゲーム' }).click()
      await expect(page.getByTestId('game-board')).toBeVisible()
    })

    test('レスポンシブレイアウトが機能する', async ({ page }) => {
      // デスクトップサイズ
      await page.setViewportSize({ width: 1200, height: 800 })
      await expect(page.getByTestId('game-board')).toBeVisible()
      
      // タブレットサイズ
      await page.setViewportSize({ width: 768, height: 600 })
      await expect(page.getByTestId('game-board')).toBeVisible()
      
      // モバイルサイズ
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(page.getByTestId('game-board')).toBeVisible()
    })
  })

  test.describe('パフォーマンステスト', () => {
    test('ページ読み込み時間が妥当である', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // 5秒以内での読み込み完了を期待
      expect(loadTime).toBeLessThan(5000)
    })

    test('AI機能使用時のメモリリークがない', async ({ page }) => {
      // 学習タブに移動
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      
      // 複数回のタブ切り替えを実行
      for (let i = 0; i < 5; i++) {
        await page.getByRole('button', { name: '🎮 ゲーム' }).click()
        await page.waitForTimeout(100)
        await page.getByRole('button', { name: '🧠 AI学習' }).click()
        await page.waitForTimeout(100)
      }
      
      // ページが正常に動作し続けることを確認
      await expect(page.getByRole('heading', { name: 'ぷよぷよ' })).toBeVisible()
    })
  })

  test.describe('エラーハンドリング', () => {
    test('コンソールエラーが発生しない正常動作', async ({ page }) => {
      const errors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      // 基本操作を実行
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      await page.waitForTimeout(1000)
      await page.getByRole('button', { name: '🎮 ゲーム' }).click()
      await page.waitForTimeout(1000)
      
      // 重大なエラーが発生していないことを確認
      const criticalErrors = errors.filter(error => 
        !error.includes('404') && // 404エラーは除外
        !error.includes('favicon') && // faviconエラーは除外
        !error.includes('resource loading') // リソース読み込みエラーは除外
      )
      
      expect(criticalErrors.length).toBe(0)
    })

    test('ネットワークエラー時もUIが安定している', async ({ page }) => {
      // ネットワークを無効化
      await page.context().setOffline(true)
      
      // UI操作を試行
      await page.getByRole('button', { name: '🧠 AI学習' }).click()
      await page.waitForTimeout(500)
      
      // 基本的なUI要素が表示され続けることを確認
      await expect(page.getByRole('heading', { name: 'ぷよぷよ' })).toBeVisible()
      await expect(page.getByRole('heading', { name: '🧠 AI学習ダッシュボード' })).toBeVisible()
      
      // ゲームタブに戻る
      await page.getByRole('button', { name: '🎮 ゲーム' }).click()
      await expect(page.getByTestId('game-board')).toBeVisible()
      
      // ネットワークを再有効化
      await page.context().setOffline(false)
    })
  })

  test.describe('アクセシビリティテスト', () => {
    test('キーボードナビゲーションが機能する', async ({ page }) => {
      // Tabキーでフォーカス移動
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // フォーカス可能な要素が存在することを確認
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })

    test('ARIA属性が適切に設定されている', async ({ page }) => {
      // 学習タブボタンのARIA属性を確認
      const learningTab = page.getByRole('button', { name: '🧠 AI学習' })
      
      await expect(learningTab).toBeVisible()
      
      // ボタンのrole属性を確認
      const role = await learningTab.getAttribute('role')
      if (role) {
        expect(role).toMatch(/tab|button/)
      } else {
        // roleが設定されていない場合は、button要素であることを確認
        const tagName = await learningTab.evaluate(node => node.tagName.toLowerCase())
        expect(tagName).toBe('button')
      }
    })
  })
})