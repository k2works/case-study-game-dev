import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingData,
} from '../../../domain/models/training/TrainingData'
import type { FeatureEngineeringService } from '../../../domain/services/learning/FeatureEngineeringService'
import {
  type DataPreprocessingConfig,
  DataPreprocessingService,
} from './DataPreprocessingService'

// モックFeatureEngineeringService
const mockFeatureService = {
  extractFeatures: vi.fn(),
  normalizeFeatures: vi.fn(),
  processBatch: vi.fn(),
}

describe('DataPreprocessingService', () => {
  let service: DataPreprocessingService

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
    service = new DataPreprocessingService(
      mockFeatureService as unknown as FeatureEngineeringService,
    )

    // デフォルトモック設定
    mockFeatureService.processBatch.mockImplementation((data: TrainingData[]) =>
      data.map((item) => ({
        features: {
          fieldDensity: 0.5,
          chainPotential: 20,
          positionFeatures: { currentX: 3, rotation: 1 },
          colorDistribution: {
            red: 0.25,
            blue: 0.25,
            yellow: 0.25,
            green: 0.25,
          },
        },
        normalizedFeatures: {
          vector: [0.5, 0.2, 0.6, 0.33, 0.25, 0.25, 0.25, 0.25],
          metadata: {
            featureNames: ['density', 'chain', 'x', 'rot', 'r', 'b', 'y', 'g'],
          },
        },
        reward: item.reward,
        id: item.id,
        timestamp: item.timestamp,
      })),
    )
  })

  describe('基本機能', () => {
    it('サービスが正しく初期化される', () => {
      expect(service).toBeDefined()
      expect(typeof service.preprocessDataset).toBe('function')
      expect(typeof service.createDataSplit).toBe('function')
    })

    it('データセットを前処理できる', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 2,
        validationSplit: 0.2,
        shuffle: true,
        normalizeRewards: true,
      }

      // Act
      const result = await service.preprocessDataset(sampleTrainingData, config)

      // Assert
      expect(result).toBeDefined()
      expect(result.training).toBeDefined()
      expect(result.validation).toBeDefined()
      expect(result.statistics).toBeDefined()
      expect(mockFeatureService.processBatch).toHaveBeenCalledWith(
        sampleTrainingData,
      )
    })

    it('データ分割を作成できる', () => {
      // Arrange
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const splitRatio = 0.2

      // Act
      const result = service.createDataSplit(data, splitRatio)

      // Assert
      expect(result.training).toHaveLength(8)
      expect(result.validation).toHaveLength(2)
      expect([...result.training, ...result.validation]).toHaveLength(10)
    })
  })

  describe('データ前処理', () => {
    it('バッチサイズに従ってデータを分割する', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 1,
        validationSplit: 0,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act
      const result = await service.preprocessDataset(sampleTrainingData, config)

      // Assert
      expect(result.training.batches).toHaveLength(2)
      expect(result.training.batches[0].size).toBe(1)
    })

    it('報酬を正規化できる', async () => {
      // Arrange
      mockFeatureService.processBatch.mockReturnValue([
        {
          features: {} as unknown,
          normalizedFeatures: {} as unknown,
          reward: 100,
          id: '1',
          timestamp: new Date(),
        },
        {
          features: {} as unknown,
          normalizedFeatures: {} as unknown,
          reward: 50,
          id: '2',
          timestamp: new Date(),
        },
      ])

      const config: DataPreprocessingConfig = {
        batchSize: 2,
        validationSplit: 0,
        shuffle: false,
        normalizeRewards: true,
      }

      // Act
      const result = await service.preprocessDataset(sampleTrainingData, config)

      // Assert
      const rewards = result.training.batches[0].rewards
      expect(Math.max(...rewards)).toBeLessThanOrEqual(1)
      expect(Math.min(...rewards)).toBeGreaterThanOrEqual(0)
    })

    it('データをシャッフルできる', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 10 }, (_, i) => ({
        ...sampleTrainingData[0],
        id: `item-${i}`,
        reward: i * 10,
      }))

      mockFeatureService.processBatch.mockReturnValue(
        largeDataset.map((item) => ({
          features: {} as unknown,
          normalizedFeatures: {} as unknown,
          reward: item.reward,
          id: item.id,
          timestamp: item.timestamp,
        })),
      )

      const config: DataPreprocessingConfig = {
        batchSize: 10,
        validationSplit: 0,
        shuffle: true,
        normalizeRewards: false,
      }

      // Act
      const result = await service.preprocessDataset(largeDataset, config)

      // Assert: シャッフルされているかは完全には確認できないが、データが存在することは確認
      expect(result.training.batches[0].size).toBe(10)
    })

    it('検証データを正しく分割する', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 1,
        validationSplit: 0.5,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act
      const result = await service.preprocessDataset(sampleTrainingData, config)

      // Assert
      expect(result.training.totalSamples).toBe(1)
      expect(result.validation.totalSamples).toBe(1)
    })
  })

  describe('統計情報', () => {
    it('データセット統計を計算する', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 2,
        validationSplit: 0.2,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act
      const result = await service.preprocessDataset(sampleTrainingData, config)

      // Assert
      expect(result.statistics).toHaveProperty('totalSamples')
      expect(result.statistics).toHaveProperty('trainingSamples')
      expect(result.statistics).toHaveProperty('validationSamples')
      expect(result.statistics).toHaveProperty('rewardStatistics')
      expect(result.statistics.totalSamples).toBe(2)
    })

    it('報酬統計を計算する', async () => {
      // Arrange
      mockFeatureService.processBatch.mockReturnValue([
        {
          features: {} as unknown,
          normalizedFeatures: {} as unknown,
          reward: 100,
          id: '1',
          timestamp: new Date(),
        },
        {
          features: {} as unknown,
          normalizedFeatures: {} as unknown,
          reward: 80,
          id: '2',
          timestamp: new Date(),
        },
      ])

      const config: DataPreprocessingConfig = {
        batchSize: 2,
        validationSplit: 0,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act
      const result = await service.preprocessDataset(sampleTrainingData, config)

      // Assert
      expect(result.statistics.rewardStatistics.mean).toBe(90)
      expect(result.statistics.rewardStatistics.min).toBe(80)
      expect(result.statistics.rewardStatistics.max).toBe(100)
      expect(result.statistics.rewardStatistics.std).toBeGreaterThan(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('空のデータセットでエラーを投げる', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 1,
        validationSplit: 0.2,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(service.preprocessDataset([], config)).rejects.toThrow(
        'Dataset cannot be empty',
      )
    })

    it('無効な分割比率でエラーを投げる', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 1,
        validationSplit: 1.5,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(
        service.preprocessDataset(sampleTrainingData, config),
      ).rejects.toThrow('Validation split must be between 0 and 1')
    })

    it('無効なバッチサイズでエラーを投げる', async () => {
      // Arrange
      const config: DataPreprocessingConfig = {
        batchSize: 0,
        validationSplit: 0.2,
        shuffle: false,
        normalizeRewards: false,
      }

      // Act & Assert
      await expect(
        service.preprocessDataset(sampleTrainingData, config),
      ).rejects.toThrow('Batch size must be greater than 0')
    })
  })
})
