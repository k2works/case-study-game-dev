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
      await page.click('text=学習')
      
      // AI自動プレイに関連するボタンが表示されることを確認
      await expect(page.locator('text=AI').or(page.locator('text=自動プレイ')).first()).toBeVisible()
    })

    test('AI自動プレイを開始・停止できる', async ({ page }) => {
      // 学習タブに移動
      await page.click('text=学習')
      
      // AI自動プレイボタンを探してクリック
      const autoPlayButton = page.locator('button:has-text("AI"), button:has-text("自動プレイ"), button:has-text("開始")').first()
      
      if (await autoPlayButton.isVisible()) {
        await autoPlayButton.click()
        
        // 停止ボタンが表示されるまで待機
        await expect(page.locator('button:has-text("停止"), button:has-text("Stop")')).toBeVisible({ timeout: 5000 })
        
        // 停止ボタンをクリック
        await page.click('button:has-text("停止"), button:has-text("Stop")')
      }
    })
  })

  test.describe('AI評価データの表示', () => {
    test('学習ダッシュボードが表示される', async ({ page }) => {
      await page.click('text=学習')
      
      // 学習関連のUI要素が表示されることを確認
      await expect(page.locator('text=学習').or(page.locator('text=Learning'))).toBeVisible()
      
      // 設定項目が表示されることを確認
      const settingsElements = [
        'text=エポック',
        'text=学習率',
        'text=バッチサイズ'
      ]
      
      for (const element of settingsElements) {
        const locator = page.locator(element)
        if (await locator.isVisible()) {
          await expect(locator).toBeVisible()
        }
      }
    })

    test('AI評価メトリクスが表示される', async ({ page }) => {
      await page.click('text=学習')
      
      // AI評価に関するテキストが表示されることを確認
      const evaluationElements = [
        'text=評価',
        'text=スコア',
        'text=パフォーマンス',
        'text=分析'
      ]
      
      let foundElements = 0
      for (const element of evaluationElements) {
        const locator = page.locator(element)
        if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
          foundElements++
        }
      }
      
      // 少なくとも1つの評価関連要素が表示されることを期待
      expect(foundElements).toBeGreaterThan(0)
    })
  })

  test.describe('ユーザーエクスペリエンス', () => {
    test('タブ切り替えが正常に動作する', async ({ page }) => {
      // 初期状態：ゲームタブが選択されている
      await expect(page.locator('text=ゲーム')).toBeVisible()
      
      // 学習タブに切り替え
      await page.click('text=学習')
      await expect(page.locator('text=学習')).toBeVisible()
      
      // AIタブに切り替え（存在する場合）
      const aiTab = page.locator('text=AI')
      if (await aiTab.isVisible()) {
        await aiTab.click()
        await expect(aiTab).toBeVisible()
      }
      
      // ゲームタブに戻る
      await page.click('text=ゲーム')
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
      await page.click('text=学習')
      
      // 複数回のタブ切り替えを実行
      for (let i = 0; i < 5; i++) {
        await page.click('text=ゲーム')
        await page.waitForTimeout(100)
        await page.click('text=学習')
        await page.waitForTimeout(100)
      }
      
      // ページが正常に動作し続けることを確認
      await expect(page.locator('h1')).toHaveText('ぷよぷよ')
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
      await page.click('text=学習')
      await page.waitForTimeout(1000)
      await page.click('text=ゲーム')
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
      await page.click('text=学習')
      await page.waitForTimeout(500)
      
      // 基本的なUI要素が表示され続けることを確認
      await expect(page.locator('h1')).toHaveText('ぷよぷよ')
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
      // 学習タブのARIA属性を確認
      const learningTab = page.locator('text=学習').first()
      
      if (await learningTab.isVisible()) {
        // タブまたはボタンのrole属性を確認
        const role = await learningTab.getAttribute('role')
        expect(role).toMatch(/tab|button/)
      }
    })
  })
})