import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LearningConfig, LearningResult } from './LearningService'
import {
  LearningWorkerService,
  type WorkerLearningConfig,
} from './LearningWorkerService'

// Worker APIのモック
const mockWorker = {
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  onmessage: null,
  onerror: null,
  onmessageerror: null,
}

vi.stubGlobal(
  'Worker',
  vi.fn(() => mockWorker),
)

describe('LearningWorkerService', () => {
  let service: LearningWorkerService

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

    service = new LearningWorkerService({
      onProgress: vi.fn(),
      onComplete: vi.fn(),
      onError: vi.fn(),
    })
  })

  describe('基本機能', () => {
    it('サービスが正しく初期化される', () => {
      expect(service).toBeDefined()
      expect(typeof service.startLearning).toBe('function')
      expect(typeof service.stopLearning).toBe('function')
      expect(typeof service.isLearning).toBe('function')
    })

    it('Workerを作成して初期化する', () => {
      expect(Worker).toHaveBeenCalledWith('/learning-worker.js')
      expect(mockWorker.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function),
      )
      expect(mockWorker.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      )
    })

    it('学習が開始されていない状態ではfalseを返す', () => {
      expect(service.isLearning()).toBe(false)
    })
  })

  describe('学習実行', () => {
    it('学習を開始できる', async () => {
      // Arrange
      const learningPromise = service.startLearning(sampleConfig)

      // Act - 学習開始状態確認
      expect(service.isLearning()).toBe(true)
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'start',
        config: {
          epochs: 10,
          learningRate: 0.001,
          batchSize: 32,
          validationSplit: 0.2,
          modelArchitecture: 'dense',
          dataRange: {
            startDate: '2025-01-01T00:00:00.000Z',
            endDate: '2025-01-31T00:00:00.000Z',
          },
          maxSamples: 1000,
          shuffle: true,
          normalizeRewards: true,
          crossValidation: undefined,
          kFolds: undefined,
        },
      })

      // Simulate worker completion
      const messageListener = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message',
      )?.[1]

      if (messageListener) {
        messageListener({
          data: {
            type: 'complete',
            result: sampleResult,
          },
        })
      }

      // Assert
      const result = await learningPromise
      expect(result).toEqual(sampleResult)
      expect(service.isLearning()).toBe(false)
    })

    it('学習プログレスを受信できる', async () => {
      // Arrange
      const progressSpy = vi.fn()
      const serviceWithCallback = new LearningWorkerService({
        onProgress: progressSpy,
        onComplete: vi.fn(),
        onError: vi.fn(),
      })

      // Act - 学習開始
      const learningPromise = serviceWithCallback.startLearning(sampleConfig)

      // Simulate progress updates
      const messageListener = mockWorker.addEventListener.mock.calls
        .filter((call) => call[0] === 'message')
        .pop()?.[1]

      if (messageListener) {
        messageListener({
          data: { type: 'progress', progress: 0.3 },
        })
        messageListener({
          data: { type: 'progress', progress: 0.6 },
        })
        messageListener({
          data: { type: 'complete', result: sampleResult },
        })
      }

      // Assert
      await learningPromise
      expect(progressSpy).toHaveBeenCalledWith(0.3)
      expect(progressSpy).toHaveBeenCalledWith(0.6)
    })

    it('学習を停止できる', async () => {
      // Arrange
      const learningPromise = service.startLearning(sampleConfig)

      // Act
      service.stopLearning()

      // Simulate worker stop response
      const messageListener = mockWorker.addEventListener.mock.calls
        .filter((call) => call[0] === 'message')
        .pop()?.[1]

      if (messageListener) {
        messageListener({
          data: { type: 'stopped' },
        })
      }

      // Assert
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'stop',
      })
      expect(service.isLearning()).toBe(false)

      await expect(learningPromise).rejects.toThrow('Learning stopped')
    })

    it('複数の学習リクエストを順次処理する', async () => {
      // Arrange
      const config1 = { ...sampleConfig, epochs: 5 }
      const config2 = { ...sampleConfig, epochs: 10 }

      // Act
      const promise1 = service.startLearning(config1)
      const promise2 = service.startLearning(config2)

      // Assert - 2つ目のリクエストはキューに入る
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(1)
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'start',
        config: {
          epochs: 5,
          learningRate: 0.001,
          batchSize: 32,
          validationSplit: 0.2,
          modelArchitecture: 'dense',
          dataRange: {
            startDate: '2025-01-01T00:00:00.000Z',
            endDate: '2025-01-31T00:00:00.000Z',
          },
          maxSamples: 1000,
          shuffle: true,
          normalizeRewards: true,
          crossValidation: undefined,
          kFolds: undefined,
        },
      })

      // Simulate first learning completion
      const messageListener = mockWorker.addEventListener.mock.calls
        .filter((call) => call[0] === 'message')
        .pop()?.[1]

      if (messageListener) {
        messageListener({
          data: { type: 'complete', result: sampleResult },
        })

        // Wait for first promise to resolve
        await promise1

        // Now second learning should start
        expect(mockWorker.postMessage).toHaveBeenCalledWith({
          type: 'start',
          config: {
            epochs: 10,
            learningRate: 0.001,
            batchSize: 32,
            validationSplit: 0.2,
            modelArchitecture: 'dense',
            dataRange: {
              startDate: '2025-01-01T00:00:00.000Z',
              endDate: '2025-01-31T00:00:00.000Z',
            },
            maxSamples: 1000,
            shuffle: true,
            normalizeRewards: true,
            crossValidation: undefined,
            kFolds: undefined,
          },
        })

        // Complete second learning
        messageListener({
          data: { type: 'complete', result: sampleResult },
        })
      }

      await promise2
    })
  })

  describe('エラーハンドリング', () => {
    it('Worker エラーを適切に処理する', async () => {
      // Arrange
      const learningPromise = service.startLearning(sampleConfig)

      // Act - Simulate worker error
      const errorListener = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'error',
      )?.[1]

      if (errorListener) {
        errorListener({
          message: 'Worker script failed to load',
          filename: '/learning-worker.js',
          lineno: 1,
        })
      }

      // Assert
      await expect(learningPromise).rejects.toThrow(
        'Worker script failed to load',
      )
      expect(service.isLearning()).toBe(false)
    })

    it('学習エラーメッセージを処理する', async () => {
      // Arrange
      const learningPromise = service.startLearning(sampleConfig)

      // Act - Simulate learning error from worker
      const messageListener = mockWorker.addEventListener.mock.calls.find(
        (call) => call[0] === 'message',
      )?.[1]

      if (messageListener) {
        messageListener({
          data: {
            type: 'error',
            error: 'Insufficient training data',
          },
        })
      }

      // Assert
      await expect(learningPromise).rejects.toThrow(
        'Insufficient training data',
      )
      expect(service.isLearning()).toBe(false)
    })

    it('無効な設定でエラーを投げる', async () => {
      // Arrange
      const invalidConfig = {
        ...sampleConfig,
        epochs: -1,
      }

      // Act & Assert
      await expect(service.startLearning(invalidConfig)).rejects.toThrow(
        'Invalid learning configuration',
      )
    })
  })

  describe('Worker管理', () => {
    it('サービス終了時にWorkerを終了する', () => {
      // Act
      service.dispose()

      // Assert
      expect(mockWorker.terminate).toHaveBeenCalled()
      expect(service.isLearning()).toBe(false)
    })

    it('学習中にWorkerが終了された場合エラーを投げる', async () => {
      // Arrange
      const learningPromise = service.startLearning(sampleConfig)

      // Act
      service.dispose()

      // Assert
      await expect(learningPromise).rejects.toThrow('Worker terminated')
      expect(service.isLearning()).toBe(false)
    })

    it('Workerメッセージフォーマットを検証する', async () => {
      // Arrange
      const workerConfig: WorkerLearningConfig = {
        epochs: 10,
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-01-31T00:00:00.000Z',
        },
        maxSamples: 1000,
        shuffle: true,
        normalizeRewards: true,
        crossValidation: undefined,
        kFolds: undefined,
      }

      // Act
      service.startLearning(sampleConfig)

      // Assert
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: 'start',
        config: workerConfig,
      })
    })
  })

  describe('コールバック処理', () => {
    it('進捗コールバックが呼び出される', async () => {
      // Arrange
      const progressCallback = vi.fn()
      const serviceWithCallback = new LearningWorkerService({
        onProgress: progressCallback,
        onComplete: vi.fn(),
        onError: vi.fn(),
      })

      // Act
      const learningPromise = serviceWithCallback.startLearning(sampleConfig)

      const messageListener = mockWorker.addEventListener.mock.calls
        .filter((call) => call[0] === 'message')
        .pop()?.[1]

      if (messageListener) {
        messageListener({
          data: { type: 'progress', progress: 0.5 },
        })
        messageListener({
          data: { type: 'complete', result: sampleResult },
        })
      }

      // Assert
      await learningPromise
      expect(progressCallback).toHaveBeenCalledWith(0.5)
    })

    it('完了コールバックが呼び出される', async () => {
      // Arrange
      const completeCallback = vi.fn()
      const serviceWithCallback = new LearningWorkerService({
        onProgress: vi.fn(),
        onComplete: completeCallback,
        onError: vi.fn(),
      })

      // Act
      const learningPromise = serviceWithCallback.startLearning(sampleConfig)

      const messageListener = mockWorker.addEventListener.mock.calls
        .filter((call) => call[0] === 'message')
        .pop()?.[1]

      if (messageListener) {
        messageListener({
          data: { type: 'complete', result: sampleResult },
        })
      }

      // Assert
      await learningPromise
      expect(completeCallback).toHaveBeenCalledWith(sampleResult)
    })

    it('エラーコールバックが呼び出される', async () => {
      // Arrange
      const errorCallback = vi.fn()
      const serviceWithCallback = new LearningWorkerService({
        onProgress: vi.fn(),
        onComplete: vi.fn(),
        onError: errorCallback,
      })

      // Act
      const learningPromise = serviceWithCallback.startLearning(sampleConfig)

      const messageListener = mockWorker.addEventListener.mock.calls
        .filter((call) => call[0] === 'message')
        .pop()?.[1]

      if (messageListener) {
        messageListener({
          data: {
            type: 'error',
            error: 'Training failed',
          },
        })
      }

      // Assert
      await expect(learningPromise).rejects.toThrow('Training failed')
      expect(errorCallback).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
