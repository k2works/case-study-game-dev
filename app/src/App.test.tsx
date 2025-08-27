import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '@testing-library/react'

import App from './App'

// useKeyboardフックをモック
const mockUseKeyboard = vi.hoisted(() => vi.fn())
vi.mock('./presentation/hooks/useKeyboard', () => ({
  useKeyboard: mockUseKeyboard,
}))

// useLearningSystemフックをモック
vi.mock('./presentation/hooks/useLearningSystem', () => ({
  useLearningSystem: vi.fn(() => ({
    isLearning: false,
    learningProgress: 0,
    currentModel: 'test-model',
    latestPerformance: null,
    learningHistory: [],
    models: [],
    abTests: [],
    currentTab: 'game' as const,
    startLearning: vi.fn(),
    stopLearning: vi.fn(),
    selectModel: vi.fn(),
    startABTest: vi.fn(),
    stopABTest: vi.fn(),
    compareModels: vi.fn(),
    setCurrentTab: vi.fn(),
  })),
}))

// usePerformanceAnalysisフックをモック
vi.mock('./presentation/hooks/usePerformanceAnalysis', () => ({
  usePerformanceAnalysis: vi.fn(() => ({
    statistics: {
      totalGames: 0,
      averageScore: 0,
      averageChain: 0,
      chainSuccessRate: 0,
      averagePlayTime: 0,
      sessions: [],
      gameResults: [],
    },
    comparisonReport: null,
    recordMove: vi.fn(),
    recordChain: vi.fn(),
    startGameSession: vi.fn(),
    endGameSession: vi.fn(),
  })),
}))

// gameStoreをモック
vi.mock('./presentation/stores/gameStore', () => ({
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
      expect(
        screen.getByText('AI対戦ぷよぷよゲーム & 学習システム'),
      ).toBeInTheDocument()
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

    it('タブナビゲーションが表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByText('🎮 ゲーム')).toBeInTheDocument()
      expect(screen.getByText('🧠 AI学習')).toBeInTheDocument()
    })
  })

  describe('タブ切り替え機能', () => {
    it('初期状態でゲームタブが選択されている', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      const gameTab = screen.getByText('🎮 ゲーム')
      expect(gameTab).toHaveClass('bg-white/20')
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
