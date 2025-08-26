import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AsyncLearningService,
  type LearningProgress,
  type LearningStatusType,
} from './AsyncLearningService'
import type { LearningConfig, LearningResult } from './LearningService'
import type { LearningWorkerService } from './LearningWorkerService'

// LearningWorkerServiceのモック
const mockWorkerService = {
  startLearning: vi.fn(),
  stopLearning: vi.fn(),
  isLearning: vi.fn(),
  dispose: vi.fn(),
}

describe('AsyncLearningService', () => {
  let service: AsyncLearningService
  let progressCallback: (progress: LearningProgress) => void
  let statusCallback: (status: LearningStatusType) => void
  let resultCallback: (result: LearningResult) => void

  const sampleConfig: LearningConfig = {
    epochs: 10,
    learningRate: 0.001,
    batchSize: 32,
    validationSplit: 0.2,
    modelArchitecture: 'dense',
    dataRange: {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    },
    maxSamples: 1000,
    shuffle: true,
    normalizeRewards: true,
  }

  const sampleResult: LearningResult = {
    success: true,
    modelPath: 'models/dense_123456789.json',
    statistics: {
      totalSamples: 800,
      trainingAccuracy: 0.85,
      validationAccuracy: 0.82,
      trainingTime: 5000,
      modelSize: 2048,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    // コールバック関数の準備
    progressCallback = vi.fn()
    statusCallback = vi.fn()
    resultCallback = vi.fn()

    service = new AsyncLearningService(
      mockWorkerService as unknown as LearningWorkerService,
      {
        onProgress: progressCallback,
        onStatusChange: statusCallback,
        onComplete: resultCallback,
      },
    )

    // デフォルトのモック設定
    mockWorkerService.startLearning.mockResolvedValue(sampleResult)
    mockWorkerService.isLearning.mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本機能', () => {
    it('サービスが正しく初期化される', () => {
      expect(service).toBeDefined()
      expect(typeof service.startAsyncLearning).toBe('function')
      expect(typeof service.stopAsyncLearning).toBe('function')
      expect(typeof service.getLearningStatus).toBe('function')
      expect(typeof service.getLearningProgress).toBe('function')
    })

    it('初期状態では学習していない', () => {
      expect(service.getLearningStatus()).toBe('idle')
      expect(service.getLearningProgress()).toEqual({
        progress: 0,
        currentEpoch: 0,
        totalEpochs: 0,
        estimatedTimeRemaining: 0,
      })
    })
  })

  describe('非同期学習実行', () => {
    it('学習を非同期で開始できる', async () => {
      // Act
      await service.startAsyncLearning(sampleConfig)

      // Assert
      expect(mockWorkerService.startLearning).toHaveBeenCalledWith(sampleConfig)
      expect(statusCallback).toHaveBeenCalledWith('running')
      expect(statusCallback).toHaveBeenCalledWith('completed')
      expect(resultCallback).toHaveBeenCalledWith(sampleResult)
    })

    it('学習ステータスが正しく更新される', async () => {
      // Arrange
      mockWorkerService.startLearning.mockResolvedValue(sampleResult)

      // Act
      const learningPromise = service.startAsyncLearning(sampleConfig)

      // 学習開始直後の状態確認
      expect(service.getLearningStatus()).toBe('running')

      await learningPromise

      // Assert
      expect(service.getLearningStatus()).toBe('completed')
    })

    it('学習プログレスが正しく更新される', () => {
      // Act
      service.updateProgress(0.5, 5, 10)

      // Assert
      const progress = service.getLearningProgress()
      expect(progress.progress).toBe(0.5)
      expect(progress.currentEpoch).toBe(5)
      expect(progress.totalEpochs).toBe(10)
      expect(progress.estimatedTimeRemaining).toBeGreaterThanOrEqual(0)
      expect(progressCallback).toHaveBeenCalledWith(progress)
    })

    it('学習停止機能が動作する', async () => {
      // Arrange
      let resolveLearning: (result: LearningResult) => void
      mockWorkerService.startLearning.mockImplementation(async () => {
        return new Promise((resolve) => {
          resolveLearning = resolve
        })
      })

      // Act
      const learningPromise = service.startAsyncLearning(sampleConfig)
      expect(service.getLearningStatus()).toBe('running')

      service.stopAsyncLearning()
      expect(service.getLearningStatus()).toBe('stopping')
      expect(mockWorkerService.stopLearning).toHaveBeenCalled()

      // Complete the learning
      resolveLearning!(sampleResult)
      await learningPromise
    })

    it('学習エラーを適切に処理する', async () => {
      // Arrange
      const errorMessage = 'Insufficient training data'
      mockWorkerService.startLearning.mockRejectedValue(new Error(errorMessage))

      // Act
      await service.startAsyncLearning(sampleConfig)

      // Assert
      expect(service.getLearningStatus()).toBe('error')
      expect(service.getLastError()).toEqual(
        expect.objectContaining({
          message: errorMessage,
        }),
      )
    })
  })

  describe('プログレス管理', () => {
    it('推定残り時間を計算する', async () => {
      // Arrange - 学習を開始してstartTimeを設定
      const learningPromise = service.startAsyncLearning(sampleConfig)

      // 最初のプログレス更新
      service.updateProgress(0.2, 2, 10)

      // 少し時間を経過させる（実際にはタイマーをモック）
      vi.advanceTimersByTime(1000)

      // Act - 次のプログレス更新
      service.updateProgress(0.4, 4, 10)

      // Assert
      const progress = service.getLearningProgress()
      expect(progress.estimatedTimeRemaining).toBeGreaterThan(0)

      // 学習を完了
      await learningPromise
    })

    it('プログレスリセット機能が動作する', () => {
      // Arrange
      service.updateProgress(0.6, 6, 10)

      // Act
      service.resetProgress()

      // Assert
      const progress = service.getLearningProgress()
      expect(progress.progress).toBe(0)
      expect(progress.currentEpoch).toBe(0)
      expect(progress.totalEpochs).toBe(0)
      expect(progress.estimatedTimeRemaining).toBe(0)
    })

    it('プログレス履歴を記録する', () => {
      // Act
      service.updateProgress(0.2, 2, 10)
      service.updateProgress(0.4, 4, 10)
      service.updateProgress(0.6, 6, 10)

      // Assert
      const history = service.getProgressHistory()
      expect(history).toHaveLength(3)
      expect(history[0].progress).toBe(0.2)
      expect(history[1].progress).toBe(0.4)
      expect(history[2].progress).toBe(0.6)
    })
  })

  describe('状態管理', () => {
    it('学習統計情報を取得できる', async () => {
      // Act
      await service.startAsyncLearning(sampleConfig)

      // Assert
      const stats = service.getLearningStatistics()
      expect(stats).toEqual(sampleResult.statistics)
    })

    it('学習設定を取得できる', async () => {
      // Act
      await service.startAsyncLearning(sampleConfig)

      // Assert
      const config = service.getCurrentConfig()
      expect(config).toEqual(sampleConfig)
    })

    it('複数の学習リクエストを順次処理する', async () => {
      // Arrange
      const config1 = { ...sampleConfig, epochs: 5 }
      const config2 = { ...sampleConfig, epochs: 10 }

      // Act
      const promise1 = service.startAsyncLearning(config1)
      const promise2 = service.startAsyncLearning(config2)

      await Promise.all([promise1, promise2])

      // Assert
      expect(mockWorkerService.startLearning).toHaveBeenCalledTimes(2)
    })
  })

  describe('エラーハンドリング', () => {
    it('設定検証エラーを処理する', async () => {
      // Arrange
      const invalidConfig = {
        ...sampleConfig,
        epochs: -1, // 無効なエポック数
      }

      // Workerサービスがエラーを投げるようにモック設定
      mockWorkerService.startLearning.mockRejectedValue(
        new Error('Invalid learning configuration: epochs must be positive'),
      )

      // Act
      await service.startAsyncLearning(invalidConfig)

      // Assert
      expect(service.getLearningStatus()).toBe('error')
      expect(service.getLastError()?.message).toContain('Invalid')
    })

    it('Worker通信エラーを処理する', async () => {
      // Arrange
      mockWorkerService.startLearning.mockRejectedValue(
        new Error('Worker terminated'),
      )

      // Act
      await service.startAsyncLearning(sampleConfig)

      // Assert
      expect(service.getLearningStatus()).toBe('error')
      expect(service.getLastError()?.message).toBe('Worker terminated')
    })

    it('エラー状態をリセットできる', async () => {
      // Arrange
      mockWorkerService.startLearning.mockRejectedValue(new Error('Test error'))
      await service.startAsyncLearning(sampleConfig)

      // Act
      service.resetError()

      // Assert
      expect(service.getLearningStatus()).toBe('idle')
      expect(service.getLastError()).toBeNull()
    })
  })

  describe('リソース管理', () => {
    it('サービス終了時にリソースを適切にクリーンアップする', () => {
      // Act
      service.dispose()

      // Assert
      expect(mockWorkerService.dispose).toHaveBeenCalled()
      expect(service.getLearningStatus()).toBe('idle')
    })

    it('学習中の終了処理を適切に行う', async () => {
      // Arrange
      let resolveLearning: (result: LearningResult) => void
      mockWorkerService.startLearning.mockImplementation(async () => {
        return new Promise((resolve) => {
          resolveLearning = resolve
        })
      })

      // Act
      const learningPromise = service.startAsyncLearning(sampleConfig)
      expect(service.getLearningStatus()).toBe('running')

      service.dispose()
      expect(mockWorkerService.dispose).toHaveBeenCalled()

      // Complete learning
      resolveLearning!(sampleResult)
      await learningPromise
    })
  })
})
