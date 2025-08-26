import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingData,
} from '../../../domain/models/training/TrainingData'
import type { BatchProcessingService } from './BatchProcessingService'
import type { DataCollectionService } from './DataCollectionService'
import { type LearningConfig, LearningService } from './LearningService'

// モックサービス
const mockDataCollectionService = {
  collectData: vi.fn(),
  getDataByDateRange: vi.fn(),
  clearCollectedData: vi.fn(),
}

const mockBatchProcessingService = {
  processBatch: vi.fn(),
  processDataFromDateRange: vi.fn(),
}

describe('LearningService', () => {
  let service: LearningService

  const sampleGameState: GameState = {
    field: Array(13)
      .fill(null)
      .map(() => Array(6).fill(null)),
    currentPuyo: {
      puyo1: { color: 'red', x: 2, y: 0 },
      puyo2: { color: 'blue', x: 2, y: 1 },
    },
    nextPuyo: {
      puyo1: { color: 'yellow', x: 0, y: 0 },
      puyo2: { color: 'green', x: 0, y: 1 },
    },
    score: 1000,
    chainCount: 2,
    turn: 10,
  }

  const sampleAction: AIAction = {
    x: 3,
    rotation: 1,
    evaluationScore: 85.5,
    features: { chainScore: 40 },
  }

  const sampleTrainingData: TrainingData[] = [
    {
      id: '1',
      timestamp: new Date('2025-01-01'),
      gameState: sampleGameState,
      action: sampleAction,
      reward: 100,
      metadata: {
        gameId: 'test1',
        playerId: 'ai1',
        difficulty: 'normal',
        version: '1.0.0',
      },
    },
    {
      id: '2',
      timestamp: new Date('2025-01-02'),
      gameState: sampleGameState,
      action: { ...sampleAction, x: 4 },
      reward: 80,
      metadata: {
        gameId: 'test2',
        playerId: 'ai1',
        difficulty: 'normal',
        version: '1.0.0',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    service = new LearningService(
      mockDataCollectionService as unknown as DataCollectionService,
      mockBatchProcessingService as unknown as BatchProcessingService,
    )

    // デフォルトモック設定
    mockDataCollectionService.getDataByDateRange.mockResolvedValue(
      sampleTrainingData,
    )

    mockBatchProcessingService.processDataFromDateRange.mockResolvedValue({
      processedDataset: {
        training: {
          batches: [
            {
              features: [
                [0.5, 0.2, 0.6, 0.33, 0.25, 0.25, 0.25, 0.25],
                [0.4, 0.3, 0.7, 0.5, 0.3, 0.2, 0.3, 0.2],
              ],
              rewards: [1.0, 0.8],
              size: 2,
              metadata: {
                ids: ['1', '2'],
                timestamps: [new Date(), new Date()],
              },
            },
          ],
          totalSamples: 2,
        },
        validation: {
          batches: [],
          totalSamples: 0,
        },
        statistics: {
          totalSamples: 2,
          trainingSamples: 2,
          validationSamples: 0,
          rewardStatistics: { mean: 0.9, std: 0.1, min: 0.8, max: 1.0 },
        },
      },
      metadata: {
        processingTime: 100,
        originalSamples: 2,
        processedSamples: 2,
        samplingApplied: false,
        config: {
          batchSize: 32,
          validationSplit: 0.2,
          shuffle: true,
          normalizeRewards: true,
          maxSamples: 1000,
        },
      },
    })
  })

  describe('基本機能', () => {
    it('サービスが正しく初期化される', () => {
      expect(service).toBeDefined()
      expect(typeof service.startLearning).toBe('function')
      expect(typeof service.evaluateLearning).toBe('function')
    })

    it('学習を開始できる', async () => {
      // Arrange
      const config: LearningConfig = {
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

      // Act
      const result = await service.startLearning(config)

      // Assert
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.statistics).toBeDefined()
      expect(
        mockBatchProcessingService.processDataFromDateRange,
      ).toHaveBeenCalled()
    })

    it('学習評価を実行できる', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: 5,
        learningRate: 0.01,
        batchSize: 16,
        validationSplit: 0.3,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-15'),
        },
        maxSamples: 500,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act
      const result = await service.evaluateLearning(config)

      // Assert
      expect(result).toBeDefined()
      expect(result.accuracy).toBeGreaterThanOrEqual(0)
      expect(result.accuracy).toBeLessThanOrEqual(1)
      expect(result.loss).toBeGreaterThanOrEqual(0)
    })
  })

  describe('学習実行', () => {
    it('データ収集から学習まで一貫して実行できる', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: 3,
        learningRate: 0.005,
        batchSize: 64,
        validationSplit: 0.25,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-10'),
        },
        maxSamples: 200,
        shuffle: true,
        normalizeRewards: true,
      }

      // Act
      const result = await service.startLearning(config)

      // Assert
      expect(result.success).toBe(true)
      expect(result.modelPath).toBeDefined()
      expect(result.statistics.totalSamples).toBeGreaterThan(0)
      expect(result.statistics.trainingTime).toBeGreaterThan(0)
    })

    it('学習結果の統計情報が正しく生成される', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: 2,
        learningRate: 0.002,
        batchSize: 8,
        validationSplit: 0.1,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-07'),
        },
        maxSamples: 100,
        shuffle: true,
        normalizeRewards: true,
      }

      // Act
      const result = await service.startLearning(config)

      // Assert
      expect(result.statistics).toHaveProperty('totalSamples')
      expect(result.statistics).toHaveProperty('trainingAccuracy')
      expect(result.statistics).toHaveProperty('validationAccuracy')
      expect(result.statistics).toHaveProperty('trainingTime')
      expect(result.statistics).toHaveProperty('modelSize')
    })

    it('異なるモデルアーキテクチャに対応できる', async () => {
      // Arrange
      const configs: LearningConfig[] = [
        {
          epochs: 1,
          learningRate: 0.001,
          batchSize: 16,
          validationSplit: 0.2,
          modelArchitecture: 'dense',
          dataRange: {
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
          },
          maxSamples: 50,
          shuffle: false,
          normalizeRewards: false,
        },
        {
          epochs: 1,
          learningRate: 0.001,
          batchSize: 16,
          validationSplit: 0.2,
          modelArchitecture: 'cnn',
          dataRange: {
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-02'),
          },
          maxSamples: 50,
          shuffle: false,
          normalizeRewards: false,
        },
      ]

      // Act & Assert
      for (const config of configs) {
        const result = await service.startLearning(config)
        expect(result.success).toBe(true)
        expect(result.modelPath).toContain(config.modelArchitecture)
      }
    })
  })

  describe('学習評価', () => {
    it('モデルの性能評価を実行できる', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: 5,
        learningRate: 0.01,
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-15'),
        },
        maxSamples: 300,
        shuffle: true,
        normalizeRewards: true,
      }

      // Act
      const result = await service.evaluateLearning(config)

      // Assert
      expect(result).toHaveProperty('accuracy')
      expect(result).toHaveProperty('loss')
      expect(result).toHaveProperty('precision')
      expect(result).toHaveProperty('recall')
      expect(result).toHaveProperty('f1Score')
      expect(result.accuracy).toBeGreaterThanOrEqual(0)
      expect(result.loss).toBeGreaterThanOrEqual(0)
    })

    it('クロスバリデーションによる評価ができる', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: 3,
        learningRate: 0.005,
        batchSize: 16,
        validationSplit: 0.3,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-20'),
        },
        maxSamples: 400,
        shuffle: true,
        normalizeRewards: true,
        crossValidation: true,
        kFolds: 5,
      }

      // Act
      const result = await service.evaluateLearning(config)

      // Assert
      expect(result.crossValidationResults).toBeDefined()
      expect(result.crossValidationResults).toHaveLength(5)
      expect(result.meanAccuracy).toBeGreaterThanOrEqual(0)
      expect(result.stdAccuracy).toBeGreaterThanOrEqual(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('データが不足している場合はエラーを投げる', async () => {
      // Arrange
      mockBatchProcessingService.processDataFromDateRange.mockResolvedValue({
        processedDataset: {
          training: {
            batches: [],
            totalSamples: 0,
          },
          validation: {
            batches: [],
            totalSamples: 0,
          },
          statistics: {
            totalSamples: 0,
            trainingSamples: 0,
            validationSamples: 0,
            rewardStatistics: { mean: 0, std: 0, min: 0, max: 0 },
          },
        },
        metadata: {
          processingTime: 100,
          originalSamples: 0,
          processedSamples: 0,
          samplingApplied: false,
          config: {
            batchSize: 32,
            validationSplit: 0.2,
            shuffle: false,
            normalizeRewards: false,
            maxSamples: 100,
          },
        },
      })

      const config: LearningConfig = {
        epochs: 1,
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-02'),
        },
        maxSamples: 100,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(service.startLearning(config)).rejects.toThrow(
        'Insufficient training data',
      )
    })

    it('無効な学習設定でエラーを投げる', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: -1, // 無効なエポック数
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-02'),
          endDate: new Date('2025-01-01'), // 無効な日付範囲
        },
        maxSamples: 100,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(service.startLearning(config)).rejects.toThrow(
        'Invalid learning configuration',
      )
    })

    it('バッチ処理エラーを適切に処理する', async () => {
      // Arrange
      mockBatchProcessingService.processDataFromDateRange.mockRejectedValue(
        new Error('Batch processing failed'),
      )

      const config: LearningConfig = {
        epochs: 1,
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-02'),
        },
        maxSamples: 100,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(service.startLearning(config)).rejects.toThrow(
        'Learning failed',
      )
    })
  })

  describe('設定検証', () => {
    it('学習率の範囲を検証する', async () => {
      // Arrange
      const invalidConfigs = [
        { learningRate: 0 }, // 0は無効
        { learningRate: -0.1 }, // 負の値は無効
        { learningRate: 1.1 }, // 1を超える値は無効
      ]

      const baseConfig: LearningConfig = {
        epochs: 1,
        learningRate: 0.001, // この値は上書きされる
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-02'),
        },
        maxSamples: 100,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      for (const invalidConfig of invalidConfigs) {
        const config = { ...baseConfig, ...invalidConfig }
        await expect(service.startLearning(config)).rejects.toThrow(
          'Invalid learning configuration',
        )
      }
    })

    it('バッチサイズの範囲を検証する', async () => {
      // Arrange
      const config: LearningConfig = {
        epochs: 1,
        learningRate: 0.001,
        batchSize: 0, // 無効なバッチサイズ
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        dataRange: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-02'),
        },
        maxSamples: 100,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(service.startLearning(config)).rejects.toThrow(
        'Invalid learning configuration',
      )
    })
  })
})
