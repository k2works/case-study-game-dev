import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from './App'

// useKeyboardフックをモック
const mockUseKeyboard = vi.hoisted(() => vi.fn())
vi.mock('./presentation/hooks/useKeyboard', () => ({
  useKeyboard: mockUseKeyboard,
}))

// gameStoreをモック
vi.mock('./application/stores/gameStore', () => ({
  useGameStore: vi.fn(() => ({
    game: {
      field: {
        getWidth: () => 6,
        getHeight: () => 12,
        getPuyo: () => null,
        isEmpty: () => true,
        isValidPosition: () => true,
      },
      score: 0,
      level: 1,
      state: 'ready' as const,
    },
    pauseGame: vi.fn(),
    resumeGame: vi.fn(),
    resetGame: vi.fn(),
    updateGame: vi.fn(),
  })),
}))

describe('Appコンポーネント', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本レンダリング', () => {
    it('アプリケーションが正常にレンダリングされる', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByText('ぷよぷよ')).toBeInTheDocument()
      expect(screen.getByText('AI対戦ぷよぷよゲーム')).toBeInTheDocument()
    })

    it('GameBoardコンポーネントが表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
    })

    it('GameInfoコンポーネントが表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByTestId('game-info')).toBeInTheDocument()
    })
  })

  describe('キーボード入力統合', () => {
    it('useKeyboardフックが呼び出される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(mockUseKeyboard).toHaveBeenCalledWith(
        expect.objectContaining({
          onLeft: expect.any(Function),
          onRight: expect.any(Function),
          onDown: expect.any(Function),
          onRotate: expect.any(Function),
          onPause: expect.any(Function),
          onReset: expect.any(Function),
        }),
      )
    })

    it('キーボード操作説明が表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByText('キーボード操作')).toBeInTheDocument()
      expect(screen.getByText('←→: 左右移動')).toBeInTheDocument()
      expect(screen.getByText('↓: 高速落下')).toBeInTheDocument()
      expect(screen.getByText('↑/Space: 回転')).toBeInTheDocument()
      expect(screen.getByText('P: ポーズ/再開')).toBeInTheDocument()
      expect(screen.getByText('R: リセット')).toBeInTheDocument()
    })
  })
})