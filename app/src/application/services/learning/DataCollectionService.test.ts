import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingData,
  TrainingMetadata,
} from '../../../domain/models/training/TrainingData'
import type { DataCollectionService } from './DataCollectionService'
import { createDataCollectionService } from './DataCollectionService'

// モックリポジトリ
interface MockTrainingDataRepository {
  save: ReturnType<typeof vi.fn>
  findAll: ReturnType<typeof vi.fn>
  findByDateRange: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

const createMockRepository = (): MockTrainingDataRepository => ({
  save: vi.fn(),
  findAll: vi.fn(),
  findByDateRange: vi.fn(),
  count: vi.fn(),
  clear: vi.fn(),
})

describe('DataCollectionService', () => {
  let service: DataCollectionService
  let mockRepository: MockTrainingDataRepository

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
    features: {
      chainScore: 40,
      heightPenalty: -10,
      connectivityScore: 20,
    },
  }

  const sampleMetadata: TrainingMetadata = {
    gameId: 'game-123',
    playerId: 'ai-001',
    difficulty: 'hard',
    version: '1.0.0',
  }

  beforeEach(() => {
    mockRepository = createMockRepository()
    service = createDataCollectionService(mockRepository)
  })

  describe('基本機能', () => {
    it('サービスが正しく作成される', () => {
      expect(service).toBeDefined()
      expect(typeof service.collectTrainingData).toBe('function')
      expect(typeof service.batchCollect).toBe('function')
      expect(typeof service.getCollectionStats).toBe('function')
    })

    it('学習データを収集できる', async () => {
      // Arrange
      const reward = 100
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      await service.collectTrainingData(
        sampleGameState,
        sampleAction,
        reward,
        sampleMetadata,
      )

      // Assert
      expect(mockRepository.save).toHaveBeenCalledOnce()
      const savedData = mockRepository.save.mock.calls[0][0]
      expect(savedData).toHaveProperty('id')
      expect(savedData).toHaveProperty('timestamp')
      expect(savedData.gameState).toStrictEqual(sampleGameState)
      expect(savedData.action).toStrictEqual(sampleAction)
      expect(savedData.reward).toBe(reward)
      expect(savedData.metadata).toStrictEqual(sampleMetadata)
    })

    it('バッチ収集ができる', async () => {
      // Arrange
      const batchData = [
        {
          gameState: sampleGameState,
          action: sampleAction,
          reward: 50,
          metadata: sampleMetadata,
        },
        {
          gameState: sampleGameState,
          action: { ...sampleAction, x: 4 },
          reward: 75,
          metadata: sampleMetadata,
        },
        {
          gameState: sampleGameState,
          action: { ...sampleAction, rotation: 2 },
          reward: 90,
          metadata: sampleMetadata,
        },
      ]
      mockRepository.save.mockResolvedValue(undefined)

      // Act
      await service.batchCollect(batchData)

      // Assert
      expect(mockRepository.save).toHaveBeenCalledTimes(3)
    })
  })

  describe('データ検証', () => {
    it('無効な報酬値でエラーを投げる', async () => {
      // Arrange
      const invalidReward = NaN

      // Act & Assert
      await expect(
        service.collectTrainingData(
          sampleGameState,
          sampleAction,
          invalidReward,
          sampleMetadata,
        ),
      ).rejects.toThrow('Invalid reward value')
    })

    it('空のゲーム状態でエラーを投げる', async () => {
      // Arrange
      const emptyGameState = null as unknown as GameState

      // Act & Assert
      await expect(
        service.collectTrainingData(
          emptyGameState,
          sampleAction,
          100,
          sampleMetadata,
        ),
      ).rejects.toThrow('Game state is required')
    })

    it('空のアクションでエラーを投げる', async () => {
      // Arrange
      const emptyAction = null as unknown as AIAction

      // Act & Assert
      await expect(
        service.collectTrainingData(
          sampleGameState,
          emptyAction,
          100,
          sampleMetadata,
        ),
      ).rejects.toThrow('Action is required')
    })
  })

  describe('統計情報', () => {
    it('収集統計を取得できる', async () => {
      // Arrange
      const mockTrainingData: TrainingData[] = [
        {
          id: '1',
          timestamp: new Date('2025-01-01'),
          gameState: sampleGameState,
          action: sampleAction,
          reward: 50,
          metadata: sampleMetadata,
        },
        {
          id: '2',
          timestamp: new Date('2025-01-02'),
          gameState: sampleGameState,
          action: sampleAction,
          reward: 100,
          metadata: sampleMetadata,
        },
      ]

      mockRepository.findAll.mockResolvedValue(mockTrainingData)
      mockRepository.count.mockResolvedValue(2)

      // Act
      const stats = await service.getCollectionStats()

      // Assert
      expect(stats.totalSamples).toBe(2)
      expect(stats.averageReward).toBe(75)
      expect(stats.minReward).toBe(50)
      expect(stats.maxReward).toBe(100)
      expect(stats.timeRange.start).toEqual(new Date('2025-01-01'))
      expect(stats.timeRange.end).toEqual(new Date('2025-01-02'))
    })

    it('データがない場合の統計を処理できる', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([])
      mockRepository.count.mockResolvedValue(0)

      // Act
      const stats = await service.getCollectionStats()

      // Assert
      expect(stats.totalSamples).toBe(0)
      expect(stats.averageReward).toBe(0)
      expect(stats.minReward).toBe(0)
      expect(stats.maxReward).toBe(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('リポジトリエラーを適切に処理する', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed')
      mockRepository.save.mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(
        service.collectTrainingData(
          sampleGameState,
          sampleAction,
          100,
          sampleMetadata,
        ),
      ).rejects.toThrow(
        'Failed to save training data: Database connection failed',
      )
    })

    it('バッチ収集でのパーシャルエラーを処理する', async () => {
      // Arrange
      const batchData = [
        {
          gameState: sampleGameState,
          action: sampleAction,
          reward: 50,
          metadata: sampleMetadata,
        },
        {
          gameState: sampleGameState,
          action: sampleAction,
          reward: NaN,
          metadata: sampleMetadata,
        },
      ]

      // Act & Assert
      await expect(service.batchCollect(batchData)).rejects.toThrow(
        'Batch collection failed',
      )
    })
  })

  describe('パフォーマンス', () => {
    it('大量データのバッチ処理が効率的である', async () => {
      // Arrange
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        gameState: sampleGameState,
        action: { ...sampleAction, x: i % 6 },
        reward: Math.random() * 100,
        metadata: sampleMetadata,
      }))

      mockRepository.save.mockResolvedValue(undefined)
      const startTime = performance.now()

      // Act
      await service.batchCollect(largeDataSet)

      // Assert
      const duration = performance.now() - startTime
      expect(duration).toBeLessThan(1000) // 1秒以内に完了
      expect(mockRepository.save).toHaveBeenCalledTimes(1000)
    })
  })
})
