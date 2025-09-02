/**
 * useAutoLearningGameフックのテスト
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@testing-library/react'

import type {
  AutoLearningGameConfig,
  AutoLearningGameService,
  LearningGameProcess,
} from '../../application/services/ai/AutoLearningGameService'
import { useAutoLearningGame } from './useAutoLearningGame'

// AutoLearningGameServiceのモック
const createMockAutoLearningGameService = (): AutoLearningGameService => ({
  startAutoLearningGame: vi.fn().mockResolvedValue(undefined),
  stopAutoLearningGame: vi.fn(),
  isAutoLearningGameRunning: vi.fn().mockReturnValue(false),
  getCurrentProcess: vi.fn().mockReturnValue(null),
  getProcessHistory: vi.fn().mockReturnValue([]),
  updateConfig: vi.fn(),
  getConfig: vi.fn().mockReturnValue(null),
})

// サンプルデータ
const sampleConfig: AutoLearningGameConfig = {
  maxGames: 100,
  learningRate: 0.01,
  batchSize: 32,
  evaluationInterval: 10,
  saveInterval: 50,
}

const sampleProcess: LearningGameProcess = {
  id: 'process-1',
  status: 'running',
  startTime: new Date('2025-01-01T00:00:00Z'),
  gameStats: {
    completedGames: 5,
    successRate: 0.8,
    averageScore: 1500,
    bestScore: 2000,
  },
  learningStats: {
    accuracy: 0.85,
    loss: 0.15,
  },
  config: sampleConfig,
}

describe('useAutoLearningGame', () => {
  let mockService: AutoLearningGameService

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockService = createMockAutoLearningGameService()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('初期状態', () => {
    it('正しい初期状態で初期化される', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Assert
      expect(result.current.isRunning).toBe(false)
      expect(result.current.currentProcess).toBeNull()
      expect(result.current.processHistory).toEqual([])
      expect(result.current.stats).toEqual({
        totalProcesses: 0,
        runningProcesses: 0,
        completedProcesses: 0,
        successRate: 0,
        averageAccuracy: 0,
        totalGamesPlayed: 0,
        averageScore: 0,
        bestScore: 0,
      })
      expect(result.current.error).toBeNull()
      expect(result.current.config).toBeNull()
      expect(result.current.isEnabled).toBe(true)
    })

    it('disabled状態で初期化される', () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useAutoLearningGame({
          autoLearningGameService: mockService,
          enabled: false,
        }),
      )

      // Assert
      expect(result.current.isEnabled).toBe(false)
    })
  })

  describe('自動学習ゲーム制御', () => {
    it('自動学習ゲームを開始できる', async () => {
      // Arrange
      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      await act(async () => {
        await result.current.startAutoLearningGame()
      })

      // Assert
      expect(mockService.startAutoLearningGame).toHaveBeenCalledOnce()
    })

    it('自動学習ゲーム開始エラーを適切に処理する', async () => {
      // Arrange
      const errorMessage = 'Start failed'
      mockService.startAutoLearningGame = vi
        .fn()
        .mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      await act(async () => {
        await result.current.startAutoLearningGame()
      })

      // Assert
      expect(result.current.error).toBe(errorMessage)
    })

    it('自動学習ゲームを停止できる', () => {
      // Arrange
      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        result.current.stopAutoLearningGame()
      })

      // Assert
      expect(mockService.stopAutoLearningGame).toHaveBeenCalledOnce()
    })

    it('自動学習ゲーム停止エラーを適切に処理する', () => {
      // Arrange
      const errorMessage = 'Stop failed'
      mockService.stopAutoLearningGame = vi.fn().mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        result.current.stopAutoLearningGame()
      })

      // Assert
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('設定管理', () => {
    it('設定を更新できる', () => {
      // Arrange
      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      const newConfig = { maxGames: 200 }

      // Act
      act(() => {
        result.current.updateConfig(newConfig)
      })

      // Assert
      expect(mockService.updateConfig).toHaveBeenCalledWith(newConfig)
    })

    it('設定更新エラーを適切に処理する', () => {
      // Arrange
      const errorMessage = 'Config update failed'
      mockService.updateConfig = vi.fn().mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        result.current.updateConfig({ maxGames: 200 })
      })

      // Assert
      expect(result.current.error).toBe(errorMessage)
    })

    it('設定を取得できる', () => {
      // Arrange
      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act & Assert
      expect(result.current.getConfig()).toBeNull()
    })
  })

  describe('状態更新', () => {
    it('実行中のプロセス状態を更新する', () => {
      // Arrange
      mockService.isAutoLearningGameRunning = vi.fn().mockReturnValue(true)
      mockService.getCurrentProcess = vi.fn().mockReturnValue(sampleProcess)

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act - ポーリングを手動でトリガー
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.isRunning).toBe(true)
      expect(result.current.currentProcess).toEqual(sampleProcess)
    })

    it('プロセス履歴を更新する', () => {
      // Arrange
      const completedProcess: LearningGameProcess = {
        ...sampleProcess,
        status: 'completed',
        endTime: new Date('2025-01-01T01:00:00Z'),
      }

      mockService.getProcessHistory = vi
        .fn()
        .mockReturnValue([completedProcess])

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.processHistory).toEqual([completedProcess])
    })

    it('状態更新エラーを適切に処理する', () => {
      // Arrange
      const errorMessage = 'State update failed'
      mockService.isAutoLearningGameRunning = vi.fn().mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('統計情報計算', () => {
    it('実行中プロセスの統計を正しく計算する', () => {
      // Arrange
      mockService.isAutoLearningGameRunning = vi.fn().mockReturnValue(true)
      mockService.getCurrentProcess = vi.fn().mockReturnValue(sampleProcess)

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.stats.runningProcesses).toBe(1)
      expect(result.current.stats.totalProcesses).toBe(1)
      expect(result.current.stats.totalGamesPlayed).toBe(5)
    })

    it('完了プロセスの統計を正しく計算する', () => {
      // Arrange
      const completedProcess: LearningGameProcess = {
        ...sampleProcess,
        status: 'completed',
        endTime: new Date('2025-01-01T01:00:00Z'),
      }

      mockService.getProcessHistory = vi
        .fn()
        .mockReturnValue([completedProcess])

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.stats.completedProcesses).toBe(1)
      expect(result.current.stats.successRate).toBe(0.8)
      expect(result.current.stats.averageAccuracy).toBe(0.85)
      expect(result.current.stats.averageScore).toBe(1500)
      expect(result.current.stats.bestScore).toBe(2000)
    })

    it('複数プロセスの統計を正しく計算する', () => {
      // Arrange
      const process1: LearningGameProcess = {
        id: 'process-1',
        status: 'completed',
        startTime: new Date('2025-01-01T00:00:00Z'),
        gameStats: {
          completedGames: 10,
          successRate: 0.7,
          averageScore: 1000,
          bestScore: 1500,
        },
        learningStats: {
          accuracy: 0.75,
          loss: 0.25,
        },
        config: sampleConfig,
      }

      const process2: LearningGameProcess = {
        id: 'process-2',
        status: 'completed',
        startTime: new Date('2025-01-01T02:00:00Z'),
        gameStats: {
          completedGames: 20,
          successRate: 0.9,
          averageScore: 2000,
          bestScore: 3000,
        },
        learningStats: {
          accuracy: 0.95,
          loss: 0.05,
        },
        config: sampleConfig,
      }

      mockService.getProcessHistory = vi
        .fn()
        .mockReturnValue([process1, process2])

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.stats.completedProcesses).toBe(2)
      expect(result.current.stats.successRate).toBe(0.8) // (0.7 + 0.9) / 2
      expect(result.current.stats.averageAccuracy).toBe(0.85) // (0.75 + 0.95) / 2
      expect(result.current.stats.totalGamesPlayed).toBe(30) // 10 + 20
      expect(result.current.stats.averageScore).toBe(1500) // (1000 + 2000) / 2
      expect(result.current.stats.bestScore).toBe(3000) // max(1500, 3000)
    })

    it('統計なしプロセスを適切に処理する', () => {
      // Arrange
      const processWithoutStats: LearningGameProcess = {
        id: 'process-without-stats',
        status: 'completed',
        startTime: new Date('2025-01-01T00:00:00Z'),
        gameStats: {
          completedGames: 0,
          successRate: 0,
          averageScore: 0,
          bestScore: 0,
        },
        config: sampleConfig,
      }

      mockService.getProcessHistory = vi
        .fn()
        .mockReturnValue([processWithoutStats])

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.stats.successRate).toBe(0)
      expect(result.current.stats.averageAccuracy).toBe(0)
      expect(result.current.stats.averageScore).toBe(0)
      expect(result.current.stats.bestScore).toBe(0)
    })
  })

  describe('ポーリング機能', () => {
    it('指定間隔でポーリングを実行する', () => {
      // Arrange
      const pollingInterval = 500
      vi.clearAllMocks() // ポーリングテスト前にモックをクリア

      renderHook(() =>
        useAutoLearningGame({
          autoLearningGameService: mockService,
          pollingInterval,
        }),
      )

      // 初期化時の呼び出しを確認
      // ポーリングuseEffect + サービス更新useEffectで2回呼ばれる
      expect(mockService.isAutoLearningGameRunning).toHaveBeenCalledTimes(2)

      act(() => {
        vi.advanceTimersByTime(pollingInterval)
      })

      expect(mockService.isAutoLearningGameRunning).toHaveBeenCalledTimes(3)

      act(() => {
        vi.advanceTimersByTime(pollingInterval)
      })

      expect(mockService.isAutoLearningGameRunning).toHaveBeenCalledTimes(4)
    })

    it('disabled時はポーリングを実行しない', () => {
      // Arrange
      vi.clearAllMocks() // disabled テスト前にモックをクリア

      // Act
      renderHook(() =>
        useAutoLearningGame({
          autoLearningGameService: mockService,
          enabled: false,
        }),
      )

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert - disabled時でもサービス更新useEffectで1回は呼ばれる
      expect(mockService.isAutoLearningGameRunning).toHaveBeenCalledTimes(1)
    })
  })

  describe('履歴管理', () => {
    it('プロセス履歴をクリアできる', () => {
      // Arrange
      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        result.current.clearHistory()
      })

      // Assert
      expect(result.current.processHistory).toEqual([])
    })
  })

  describe('サービス変更', () => {
    it('サービス変更時に状態を再取得する', () => {
      // Arrange
      const newService = createMockAutoLearningGameService()
      newService.isAutoLearningGameRunning = vi.fn().mockReturnValue(true)

      const { rerender } = renderHook(
        ({ service }) =>
          useAutoLearningGame({ autoLearningGameService: service }),
        { initialProps: { service: mockService } },
      )

      // Act
      rerender({ service: newService })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Assert
      expect(newService.isAutoLearningGameRunning).toHaveBeenCalled()
    })
  })

  describe('クリーンアップ', () => {
    it('アンマウント時にポーリングをクリーンアップする', () => {
      // Arrange
      const { unmount } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      unmount()

      // Assert - エラーが発生しないことを確認
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      // アンマウント後はポーリングされない
    })
  })

  describe('エラーハンドリング', () => {
    it('不明なエラーを適切に処理する', async () => {
      // Arrange
      mockService.startAutoLearningGame = vi
        .fn()
        .mockRejectedValue('Unknown error')

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      await act(async () => {
        await result.current.startAutoLearningGame()
      })

      // Assert
      expect(result.current.error).toBe('Failed to start auto learning game')
    })

    it('プロセスエラーを状態に反映する', () => {
      // Arrange
      const processWithError: LearningGameProcess = {
        ...sampleProcess,
        error: 'Process failed',
      }

      mockService.getCurrentProcess = vi.fn().mockReturnValue(processWithError)

      const { result } = renderHook(() =>
        useAutoLearningGame({ autoLearningGameService: mockService }),
      )

      // Act
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Assert
      expect(result.current.error).toBe('Process failed')
    })
  })
})
