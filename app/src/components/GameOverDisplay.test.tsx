import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameOverDisplay } from './GameOverDisplay'

describe('GameOverDisplay', () => {
  const mockOnRestart = vi.fn()

  beforeEach(() => {
    mockOnRestart.mockClear()
  })

  describe('ゲームオーバー画面の表示', () => {
    it('ゲームオーバーメッセージが表示される', () => {
      render(<GameOverDisplay score={1000} onRestart={mockOnRestart} />)

      expect(screen.getByText('ゲームオーバー')).toBeInTheDocument()
    })

    it('最終スコアが表示される', () => {
      render(<GameOverDisplay score={12345} onRestart={mockOnRestart} />)

      expect(screen.getByText('最終スコア')).toBeInTheDocument()
      expect(screen.getByText('12,345')).toBeInTheDocument()
    })

    it('リトライボタンが表示される', () => {
      render(<GameOverDisplay score={0} onRestart={mockOnRestart} />)

      const retryButton = screen.getByRole('button', {
        name: 'ゲームを再開してもう一度プレイします',
      })
      expect(retryButton).toBeInTheDocument()
    })
  })

  describe('リトライ機能', () => {
    it('リトライボタンをクリックするとonRestartが呼ばれる', () => {
      render(<GameOverDisplay score={2500} onRestart={mockOnRestart} />)

      const retryButton = screen.getByRole('button', {
        name: 'ゲームを再開してもう一度プレイします',
      })
      fireEvent.click(retryButton)

      expect(mockOnRestart).toHaveBeenCalledTimes(1)
    })
  })

  describe('スコア表示のフォーマット', () => {
    it('スコア0でも正しく表示される', () => {
      render(<GameOverDisplay score={0} onRestart={mockOnRestart} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('大きなスコアもカンマ区切りで表示される', () => {
      render(<GameOverDisplay score={1234567} onRestart={mockOnRestart} />)

      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })
  })

  describe('テストID確認', () => {
    it('適切なテストIDが設定されている', () => {
      render(<GameOverDisplay score={5000} onRestart={mockOnRestart} />)

      expect(screen.getByTestId('game-over-display')).toBeInTheDocument()
      expect(screen.getByTestId('final-score')).toBeInTheDocument()
      expect(screen.getByTestId('restart-button')).toBeInTheDocument()
    })
  })
})
