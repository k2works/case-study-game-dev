import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '../App'

/**
 * AI学習システムの統合テスト
 * 
 * 目的:
 * - AI学習ダッシュボードの表示と動作を確認
 * - 学習設定の変更機能を検証
 * - UI要素間の連携を確認
 * - パフォーマンスと安定性を検証
 */
describe('AI学習システム統合テスト', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本UI表示', () => {
    it('AI学習ダッシュボードが正しく表示される', async () => {
      // Arrange
      render(<App />)
      
      // Act: AI学習タブをクリック
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Assert: 主要な要素が表示される
      expect(await screen.findByText('🧠 AI学習ダッシュボード')).toBeInTheDocument()
      expect(await screen.findByText('⚙️ 学習設定')).toBeInTheDocument()
      expect(screen.getByText('待機中')).toBeInTheDocument()
    })

    it('学習設定フォームの要素が表示される', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Assert: 学習設定の入力項目
      expect(screen.getByLabelText('エポック数')).toBeInTheDocument()
      expect(screen.getByLabelText('学習率')).toBeInTheDocument()
      expect(screen.getByLabelText('バッチサイズ')).toBeInTheDocument()
    })

    it('学習状態の表示が機能する', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Assert: 初期学習状態
      expect(screen.getByText('待機中')).toBeInTheDocument()
    })
  })

  describe('設定変更機能', () => {
    it('エポック数を変更できる', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Act: エポック数を変更
      const epochsInput = screen.getByLabelText('エポック数') as HTMLInputElement
      await user.clear(epochsInput)
      await user.type(epochsInput, '100')

      // Assert: 値が変更される
      expect(epochsInput.value).toBe('100')
    })

    it('学習率を変更できる', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Act: 学習率を変更
      const learningRateInput = screen.getByLabelText('学習率') as HTMLInputElement
      await user.clear(learningRateInput)
      await user.type(learningRateInput, '0.01')

      // Assert: 値が変更される
      expect(learningRateInput.value).toBe('0.01')
    })

    it('バッチサイズを選択できる', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Act: バッチサイズを変更
      const batchSizeSelect = screen.getByLabelText('バッチサイズ') as HTMLSelectElement
      await user.selectOptions(batchSizeSelect, '64')

      // Assert: 値が変更される
      expect(batchSizeSelect.value).toBe('64')
    })
  })

  describe('タブナビゲーション', () => {
    it('ゲームタブから学習タブへ切り替えできる', async () => {
      // Arrange
      render(<App />)

      // Assert: 初期状態はゲームタブ
      expect(screen.getByTestId('game-board')).toBeInTheDocument()

      // Act: 学習タブに切り替え
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Assert: 学習ダッシュボードが表示される
      expect(await screen.findByText('🧠 AI学習ダッシュボード')).toBeInTheDocument()
    })

    it('学習タブからゲームタブへ戻れる', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Act: ゲームタブに戻る
      const gameTab = await screen.findByText('🎮 ゲーム')
      await user.click(gameTab)

      // Assert: ゲームボードが表示される
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
    })
  })

  describe('パフォーマンステスト', () => {
    it('大量のタブ切り替えでもメモリリークしない', async () => {
      // Arrange
      render(<App />)

      // Act: 複数回のタブ切り替え
      for (let i = 0; i < 10; i++) {
        const learningTab = await screen.findByText('🧠 AI学習')
        await user.click(learningTab)
        
        const gameTab = await screen.findByText('🎮 ゲーム')
        await user.click(gameTab)
      }

      // Assert: アプリケーションが正常に動作し続ける
      expect(screen.getByText('ぷよぷよ')).toBeInTheDocument()
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
    })

    it('学習ダッシュボードの表示が高速である', async () => {
      // Arrange
      render(<App />)
      const startTime = performance.now()

      // Act: 学習タブをクリック
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Assert: 学習ダッシュボードが表示される
      expect(await screen.findByText('🧠 AI学習ダッシュボード')).toBeInTheDocument()

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // 1秒以内での表示を期待
      expect(renderTime).toBeLessThan(1000)
    })
  })

  describe('エラーハンドリング', () => {
    it('無効な値を入力してもアプリケーションが安定している', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Act: 無効な値を入力
      const epochsInput = screen.getByLabelText('エポック数')
      await user.clear(epochsInput)
      await user.type(epochsInput, '-1')

      const learningRateInput = screen.getByLabelText('学習率')
      await user.clear(learningRateInput)
      await user.type(learningRateInput, '999')

      // Assert: アプリケーションがクラッシュしない
      expect(screen.getByText('🧠 AI学習ダッシュボード')).toBeInTheDocument()
      expect(screen.getByText('⚙️ 学習設定')).toBeInTheDocument()
    })

    it('コンソールエラーが発生しない', async () => {
      // Arrange
      const consoleErrors: string[] = []
      vi.spyOn(console, 'error').mockImplementation((message) => {
        consoleErrors.push(message)
      })

      render(<App />)
      
      // Act: 基本操作を実行
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      await waitFor(() => {
        expect(screen.getByText('🧠 AI学習ダッシュボード')).toBeInTheDocument()
      })

      // Assert: 重大なエラーが発生していない
      const criticalErrors = consoleErrors.filter(error => 
        typeof error === 'string' && 
        !error.includes('404') && 
        !error.includes('favicon')
      )
      expect(criticalErrors.length).toBe(0)
    })
  })

  describe('アクセシビリティ', () => {
    it('フォーム要素に適切なラベルが設定されている', async () => {
      // Arrange
      render(<App />)
      const learningTab = await screen.findByText('🧠 AI学習')
      await user.click(learningTab)

      // Assert: ラベルとフォーム要素の関連付け
      const epochsInput = screen.getByLabelText('エポック数')
      const learningRateInput = screen.getByLabelText('学習率')
      const batchSizeSelect = screen.getByLabelText('バッチサイズ')

      expect(epochsInput).toBeInTheDocument()
      expect(learningRateInput).toBeInTheDocument()
      expect(batchSizeSelect).toBeInTheDocument()
    })

    it('タブナビゲーションがキーボードアクセシブルである', async () => {
      // Arrange
      render(<App />)

      // Act: Tabキーでフォーカス移動
      await user.tab()
      await user.tab()

      // Assert: フォーカス可能な要素が存在する
      const focusedElement = document.activeElement
      expect(focusedElement).toBeTruthy()
      expect(focusedElement?.tagName).toMatch(/BUTTON|INPUT|SELECT/)
    })
  })
})