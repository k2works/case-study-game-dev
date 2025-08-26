import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingData,
} from '../../../domain/models/training/TrainingData'
import {
  type BatchProcessingConfig,
  BatchProcessingService,
} from './BatchProcessingService'
import type { DataCollectionService } from './DataCollectionService'
import type { DataPreprocessingService } from './DataPreprocessingService'

// モックサービス
const mockCollectionService = {
  getDataByDateRange: vi.fn(),
  clearCollectedData: vi.fn(),
}

const mockPreprocessingService = {
  preprocessDataset: vi.fn(),
}

describe('BatchProcessingService', () => {
  let service: BatchProcessingService

  const sampleTrainingData: TrainingData[] = [
    {
      id: '1',
      timestamp: new Date('2025-01-01'),
      gameState: {} as GameState,
      action: {} as AIAction,
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
      gameState: {} as GameState,
      action: {} as AIAction,
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
    service = new BatchProcessingService(
      mockCollectionService as unknown as DataCollectionService,
      mockPreprocessingService as unknown as DataPreprocessingService,
    )

    // デフォルトモック設定
    mockCollectionService.getDataByDateRange.mockResolvedValue(
      sampleTrainingData,
    )
    mockPreprocessingService.preprocessDataset.mockResolvedValue({
      training: {
        batches: [
          {
            features: [
              [0.5, 0.2, 0.6],
              [0.4, 0.3, 0.7],
            ],
            rewards: [100, 80],
            size: 2,
            metadata: { ids: ['1', '2'], timestamps: [new Date(), new Date()] },
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
        rewardStatistics: { mean: 90, std: 10, min: 80, max: 100 },
      },
    })
  })

  describe('基本機能', () => {
    it('サービスが正しく初期化される', () => {
      expect(service).toBeDefined()
      expect(typeof service.processBatch).toBe('function')
      expect(typeof service.processDataFromDateRange).toBe('function')
    })

    it('バッチ処理を実行できる', async () => {
      // Arrange
      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 1000,
      }

      // Act
      const result = await service.processBatch(sampleTrainingData, config)

      // Assert
      expect(result).toBeDefined()
      expect(result.processedDataset).toBeDefined()
      expect(result.metadata).toBeDefined()
      expect(mockPreprocessingService.preprocessDataset).toHaveBeenCalledWith(
        sampleTrainingData,
        expect.objectContaining({
          batchSize: 32,
          validationSplit: 0.2,
          shuffle: true,
          normalizeRewards: true,
        }),
      )
    })

    it('日付範囲からデータを処理できる', async () => {
      // Arrange
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')
      const config: BatchProcessingConfig = {
        batchSize: 16,
        validationSplit: 0.3,
        shuffle: false,
        normalizeRewards: false,
        maxSamples: 500,
      }

      // Act
      const result = await service.processDataFromDateRange(
        startDate,
        endDate,
        config,
      )

      // Assert
      expect(result).toBeDefined()
      expect(mockCollectionService.getDataByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
      )
      expect(mockPreprocessingService.preprocessDataset).toHaveBeenCalled()
    })
  })

  describe('データ処理', () => {
    it('最大サンプル数制限を適用する', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...sampleTrainingData[0],
        id: `item-${i}`,
      }))

      mockCollectionService.getDataByDateRange.mockResolvedValue(largeDataset)

      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 100,
      }

      // Act
      await service.processDataFromDateRange(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        config,
      )

      // Assert
      const processedData =
        mockPreprocessingService.preprocessDataset.mock.calls[0][0]
      expect(processedData).toHaveLength(100)
    })

    it('データをランダムサンプリングする', async () => {
      // Arrange
      const dataset = Array.from({ length: 100 }, (_, i) => ({
        ...sampleTrainingData[0],
        id: `item-${i}`,
      }))

      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 50,
      }

      // Act
      const result = await service.processBatch(dataset, config)

      // Assert
      expect(result.metadata.originalSamples).toBe(100)
      expect(result.metadata.processedSamples).toBe(50)
      expect(result.metadata.samplingApplied).toBe(true)
    })

    it('全データを使用する場合サンプリングしない', async () => {
      // Arrange
      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 10,
      }

      // Act
      const result = await service.processBatch(sampleTrainingData, config)

      // Assert
      expect(result.metadata.originalSamples).toBe(2)
      expect(result.metadata.processedSamples).toBe(2)
      expect(result.metadata.samplingApplied).toBe(false)
    })
  })

  describe('メタデータ生成', () => {
    it('処理メタデータを生成する', async () => {
      // Arrange
      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 1000,
      }

      // Act
      const result = await service.processBatch(sampleTrainingData, config)

      // Assert
      expect(result.metadata).toHaveProperty('processingTime')
      expect(result.metadata).toHaveProperty('originalSamples')
      expect(result.metadata).toHaveProperty('processedSamples')
      expect(result.metadata).toHaveProperty('samplingApplied')
      expect(result.metadata).toHaveProperty('config')
      expect(result.metadata.processingTime).toBeGreaterThan(0)
    })

    it('設定情報を保持する', async () => {
      // Arrange
      const config: BatchProcessingConfig = {
        batchSize: 64,
        validationSplit: 0.15,
        shuffle: false,
        normalizeRewards: false,
        maxSamples: 2000,
      }

      // Act
      const result = await service.processBatch(sampleTrainingData, config)

      // Assert
      expect(result.metadata.config).toEqual(config)
    })
  })

  describe('エラーハンドリング', () => {
    it('空のデータセットでエラーを投げる', async () => {
      // Arrange
      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 1000,
      }

      // Act & Assert
      await expect(service.processBatch([], config)).rejects.toThrow(
        'No data to process',
      )
    })

    it('無効な日付範囲でエラーを投げる', async () => {
      // Arrange
      const startDate = new Date('2025-01-31')
      const endDate = new Date('2025-01-01')
      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 1000,
      }

      // Act & Assert
      await expect(
        service.processDataFromDateRange(startDate, endDate, config),
      ).rejects.toThrow('Start date must be before end date')
    })

    it('収集サービスエラーを処理する', async () => {
      // Arrange
      mockCollectionService.getDataByDateRange.mockRejectedValue(
        new Error('Database error'),
      )

      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 1000,
      }

      // Act & Assert
      await expect(
        service.processDataFromDateRange(
          new Date('2025-01-01'),
          new Date('2025-01-31'),
          config,
        ),
      ).rejects.toThrow('Failed to process data from date range')
    })

    it('前処理サービスエラーを処理する', async () => {
      // Arrange
      mockPreprocessingService.preprocessDataset.mockRejectedValue(
        new Error('Preprocessing failed'),
      )

      const config: BatchProcessingConfig = {
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
        maxSamples: 1000,
      }

      // Act & Assert
      await expect(
        service.processBatch(sampleTrainingData, config),
      ).rejects.toThrow('Failed to process batch')
    })
  })
})
