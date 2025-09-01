import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@testing-library/react'

import type { AIPort } from '../../application/ports/AIPort'
import type { GamePort } from '../../application/ports/GamePort'
import type { InputPort } from '../../application/ports/InputPort'
import type { PerformanceAnalysisService } from '../../application/services/PerformanceAnalysisService'
import type { GameViewModel } from '../../application/viewmodels/GameViewModel'
import type { AIMove } from '../../domain/models/ai'
import { useGameSystem } from './useGameSystem'

// モック関数を作成
const createMockGameService = (): GamePort => ({
  createReadyGame: vi.fn(() => ({
    field: { width: 6, height: 12, cells: [] },
    currentPuyoPair: null,
    nextPuyoPair: null,
    state: 'ready' as const,
    score: { current: 0 },
  })),
  startNewGame: vi.fn(() => ({
    field: { width: 6, height: 12, cells: [] },
    currentPuyoPair: {
      main: { color: 'red' },
      sub: { color: 'blue' },
      x: 2,
      y: 0,
      rotation: 0,
    },
    nextPuyoPair: null,
    state: 'playing' as const,
    score: { current: 0 },
  })),
  updateGameState: vi.fn((game: GameViewModel) => game),
})

const createMockInputService = (): InputPort => ({
  processInput: vi.fn(),
})

const createMockAIService = (): AIPort => ({
  setEnabled: vi.fn(),
  updateSettings: vi.fn(),
  decideMove: vi.fn().mockResolvedValue({
    x: 2,
    rotation: 0,
  } as AIMove),
})

const createMockPerformanceService = (): PerformanceAnalysisService => ({
  recordMove: vi.fn(),
  recordChain: vi.fn(),
  getStatistics: vi.fn().mockReturnValue({
    totalGames: 0,
    averageScore: 0,
    averageChain: 0,
    chainSuccessRate: 0,
    averagePlayTime: 0,
    sessions: [],
    gameResults: [],
  }),
  getPerformanceStatistics: vi.fn().mockReturnValue({
    totalGames: 0,
    averageScore: 0,
    averageChain: 0,
    chainSuccessRate: 0,
    averagePlayTime: 0,
    sessions: [],
    gameResults: [],
  }),
  getAIvsHumanComparison: vi.fn().mockReturnValue(null),
  reset: vi.fn(),
  resetPerformanceData: vi.fn(),
  startGameSession: vi.fn(),
  endGameSession: vi.fn(),
  getComparisonReport: vi.fn().mockReturnValue(null),
})

describe('useGameSystem', () => {
  let gameService: GamePort
  let inputService: InputPort
  let aiService: AIPort
  let performanceService: PerformanceAnalysisService

  beforeEach(() => {
    vi.clearAllMocks()
    gameService = createMockGameService()
    inputService = createMockInputService()
    aiService = createMockAIService()
    performanceService = createMockPerformanceService()
  })

  describe('基本機能', () => {
    it('初期化時に準備状態のゲームが作成される', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      // Assert
      expect(result.current.game.state).toBe('ready')
      expect(result.current.aiEnabled).toBe(false)
      expect(gameService.createReadyGame).toHaveBeenCalled()
    })

    it('AI有効化/無効化が正常に動作する', () => {
      // Arrange
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      // Act
      act(() => {
        result.current.handleToggleAI()
      })

      // Assert
      expect(result.current.aiEnabled).toBe(true)
      expect(aiService.setEnabled).toHaveBeenCalledWith(true)
    })

    it('ゲームリセットが正常に動作する', () => {
      // Arrange
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      // Act
      act(() => {
        result.current.handleReset()
      })

      // Assert
      expect(gameService.createReadyGame).toHaveBeenCalled()
    })
  })

  describe('AI自動再開機能', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('AI有効時にready状態のゲームを自動開始する', async () => {
      // Arrange
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      // Act: AIを有効化
      act(() => {
        result.current.handleToggleAI()
      })

      // タイマーを進める
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(gameService.startNewGame).toHaveBeenCalled()
    })

    it('AI有効時にゲームオーバー後自動でリスタートする', async () => {
      // Arrange
      const gameOverGame: GameViewModel = {
        field: { width: 6, height: 12, cells: [] },
        currentPuyoPair: null,
        nextPuyoPair: null,
        state: 'gameOver' as const,
        score: { current: 1000 },
      }

      const { result, rerender } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      // Act: AIを有効化
      act(() => {
        result.current.handleToggleAI()
      })

      // ゲーム状態をゲームオーバーに変更
      act(() => {
        result.current.updateGame(gameOverGame)
      })

      rerender()

      // タイマーを進める
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // Assert: 自動的に新しいゲームが開始される
      expect(gameService.startNewGame).toHaveBeenCalled()
    })

    it('AI無効時はゲームオーバー後に自動リスタートしない', async () => {
      // Arrange
      const gameOverGame: GameViewModel = {
        field: { width: 6, height: 12, cells: [] },
        currentPuyoPair: null,
        nextPuyoPair: null,
        state: 'gameOver' as const,
        score: { current: 1000 },
      }

      const { result, rerender } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      // Act: ゲーム状態をゲームオーバーに変更（AI無効状態）
      act(() => {
        result.current.updateGame(gameOverGame)
      })

      rerender()

      // タイマーを進める
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // Assert: 自動的にゲームは再開されない
      expect(gameService.startNewGame).not.toHaveBeenCalled()
    })
  })

  describe('追加のゲーム機能', () => {
    it('ゲーム状態の更新が正常に動作する', () => {
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      const newGame: GameViewModel = {
        field: { width: 6, height: 12, cells: [] },
        currentPuyoPair: {
          main: { color: 'red' },
          sub: { color: 'blue' },
          x: 3,
          y: 1,
          rotation: 1,
        },
        nextPuyoPair: null,
        state: 'playing',
        score: { current: 500 },
      }

      act(() => {
        result.current.updateGame(newGame)
      })

      expect(result.current.game.state).toBe('playing')
      expect(result.current.game.score.current).toBe(500)
    })

    it('AI設定の更新が正常に動作する', () => {
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      const newSettings = { enabled: true, thinkingSpeed: 500 }

      act(() => {
        result.current.handleAISettingsChange(newSettings)
      })

      expect(aiService.updateSettings).toHaveBeenCalledWith(newSettings)
    })

    it('ゲームサービスが正常に利用可能', () => {
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      expect(result.current.gameService).toBeDefined()
      expect(result.current.gameService).toBe(gameService)
    })

    it('パフォーマンスサービスが利用可能である', () => {
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      expect(result.current.performanceService).toBeDefined()
      expect(result.current.performanceService).toBe(performanceService)
    })

    it('データリセットが正常に動作する', () => {
      const { result } = renderHook(() =>
        useGameSystem(gameService, inputService, aiService, performanceService),
      )

      act(() => {
        result.current.resetData()
      })

      // データリセットが実行されることを確認
      expect(result.current.statistics).toBeDefined()
    })
  })
})
