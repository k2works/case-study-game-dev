/**
 * DataCollectionServiceImplクラスのテスト
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingMetadata,
} from '../../../domain/models/training/TrainingData'
import {
  type CollectionBatchItem,
  DataCollectionServiceImpl,
  type TrainingDataRepositoryPort,
  createCollectionBatch,
  normalizeReward,
} from './DataCollectionService'

// リポジトリのモック
interface MockRepository extends TrainingDataRepositoryPort {
  isInitialized?: () => boolean
  initialize?: () => Promise<void>
}

const createMockRepository = (): MockRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue([]),
  findByDateRange: vi.fn().mockResolvedValue([]),
  count: vi.fn().mockResolvedValue(0),
  clear: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
  initialize: vi.fn().mockResolvedValue(undefined),
})

describe('DataCollectionServiceImpl', () => {
  let service: DataCollectionServiceImpl
  let mockRepository: MockRepository

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
    vi.clearAllMocks()
    mockRepository = createMockRepository()
    service = new DataCollectionServiceImpl(mockRepository)
  })

  describe('初期化', () => {
    it('正常に初期化される', () => {
      expect(service).toBeDefined()
      expect(service).toBeInstanceOf(DataCollectionServiceImpl)
    })

    it('リポジトリの初期化状態を確認する', async () => {
      mockRepository.isInitialized = vi.fn().mockReturnValue(false)

      await service.collectTrainingData(
        sampleGameState,
        sampleAction,
        100,
        sampleMetadata,
      )

      expect(mockRepository.initialize).toHaveBeenCalledOnce()
    })

    it('既に初期化済みの場合は初期化をスキップする', async () => {
      mockRepository.isInitialized = vi.fn().mockReturnValue(true)

      await service.collectTrainingData(
        sampleGameState,
        sampleAction,
        100,
        sampleMetadata,
      )

      expect(mockRepository.initialize).not.toHaveBeenCalled()
    })

    it('初期化メソッドがないリポジトリを適切に処理する', async () => {
      const repoWithoutInit = {
        ...mockRepository,
        isInitialized: vi.fn().mockReturnValue(false),
        initialize: undefined,
      }
      delete repoWithoutInit.initialize

      const serviceWithoutInit = new DataCollectionServiceImpl(repoWithoutInit)

      await expect(
        serviceWithoutInit.collectTrainingData(
          sampleGameState,
          sampleAction,
          100,
          sampleMetadata,
        ),
      ).resolves.not.toThrow()
    })
  })

  describe('データ収集', () => {
    it('正常な学習データを収集できる', async () => {
      const reward = 100

      await service.collectTrainingData(
        sampleGameState,
        sampleAction,
        reward,
        sampleMetadata,
      )

      expect(mockRepository.save).toHaveBeenCalledOnce()
      const savedData = mockRepository.save.mock.calls[0][0]
      expect(savedData).toHaveProperty('id')
      expect(savedData).toHaveProperty('timestamp')
      expect(savedData.gameState).toEqual(sampleGameState)
      expect(savedData.action).toEqual(sampleAction)
      expect(savedData.reward).toBe(reward)
      expect(savedData.metadata).toEqual(sampleMetadata)
    })

    it('リポジトリエラー時に適切なエラーメッセージを投げる', async () => {
      const saveError = new Error('Repository save failed')
      mockRepository.save.mockRejectedValueOnce(saveError)

      await expect(
        service.collectTrainingData(
          sampleGameState,
          sampleAction,
          100,
          sampleMetadata,
        ),
      ).rejects.toThrow('Failed to save training data: Repository save failed')
    })

    it('未知のエラー時に適切に処理する', async () => {
      mockRepository.save.mockRejectedValueOnce('Unknown error')

      await expect(
        service.collectTrainingData(
          sampleGameState,
          sampleAction,
          100,
          sampleMetadata,
        ),
      ).rejects.toThrow('Failed to save training data: Unknown error')
    })
  })

  describe('バッチ収集', () => {
    it('空の配列に対して正常に処理する', async () => {
      await service.batchCollect([])

      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('複数のアイテムをバッチ処理できる', async () => {
      const batchData: CollectionBatchItem[] = [
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
      ]

      await service.batchCollect(batchData)

      expect(mockRepository.save).toHaveBeenCalledTimes(2)
    })

    it('バッチ処理でエラーが発生した場合に適切に処理する', async () => {
      const batchData: CollectionBatchItem[] = [
        {
          gameState: sampleGameState,
          action: sampleAction,
          reward: 50,
          metadata: sampleMetadata,
        },
      ]

      mockRepository.save.mockRejectedValueOnce(new Error('Batch save failed'))

      await expect(service.batchCollect(batchData)).rejects.toThrow(
        'Batch collection failed: Batch save failed',
      )
    })
  })

  describe('統計情報', () => {
    it('初期統計情報を取得できる', async () => {
      mockRepository.count.mockResolvedValueOnce(0)
      mockRepository.findAll.mockResolvedValueOnce([])

      const stats = await service.getCollectionStats()

      expect(stats.totalSamples).toBe(0)
      expect(stats.collectionRate).toBe(0)
      expect(stats.lastCollectionTime).toBeNull()
    })

    it('データ収集後に統計情報が適切に処理される', async () => {
      const mockTrainingData = [
        {
          id: 'test-1',
          timestamp: new Date(),
          gameState: sampleGameState,
          action: sampleAction,
          reward: 100,
          metadata: sampleMetadata,
        },
      ]

      mockRepository.count.mockResolvedValueOnce(1)
      mockRepository.findAll.mockResolvedValueOnce(mockTrainingData)

      // データを収集
      await service.collectTrainingData(
        sampleGameState,
        sampleAction,
        100,
        sampleMetadata,
      )

      const stats = await service.getCollectionStats()

      expect(stats.totalSamples).toBe(1)
    })

    it('統計計算でエラーが発生した場合にエラーを投げる', async () => {
      mockRepository.count.mockRejectedValueOnce(new Error('Count failed'))

      await expect(service.getCollectionStats()).rejects.toThrow(
        'Failed to get collection stats: Count failed',
      )
    })
  })

  describe('データクリア', () => {
    it('収集データを正常にクリアできる', async () => {
      await service.clearCollectedData()

      expect(mockRepository.clear).toHaveBeenCalledOnce()
    })
  })

  describe('日付範囲検索', () => {
    it('日付範囲でデータを取得できる', async () => {
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-12-31')
      const mockData = [
        {
          id: 'test-1',
          timestamp: new Date('2023-06-01'),
          gameState: sampleGameState,
          action: sampleAction,
          reward: 100,
          metadata: sampleMetadata,
        },
      ]

      mockRepository.findByDateRange.mockResolvedValueOnce(mockData)

      const result = await service.getDataByDateRange(startDate, endDate)

      expect(mockRepository.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
      )
      expect(result).toEqual(mockData)
    })
  })
})

describe('ユーティリティ関数', () => {
  describe('createCollectionBatch', () => {
    it('有効なアイテムのみをフィルタリングする', () => {
      const items: CollectionBatchItem[] = [
        {
          gameState: {} as GameState,
          action: {} as AIAction,
          reward: 100,
          metadata: {} as TrainingMetadata,
        },
        {
          gameState: {} as GameState,
          action: {} as AIAction,
          reward: NaN, // 無効な報酬
          metadata: {} as TrainingMetadata,
        },
        {
          gameState: {} as GameState,
          action: {} as AIAction,
          reward: 200,
          metadata: {} as TrainingMetadata,
        },
      ]

      const result = createCollectionBatch(items)

      expect(result).toHaveLength(2)
      expect(result[0].reward).toBe(100)
      expect(result[1].reward).toBe(200)
    })
  })

  describe('normalizeReward', () => {
    it('報酬を正規化できる', () => {
      const score = 1000
      const chainLength = 5
      const timeBonus = 50

      const result = normalizeReward(score, chainLength, timeBonus)

      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
    })

    it('負のスコアを適切に処理する', () => {
      const result = normalizeReward(-100, 0, 0)

      // Math.log(-100 + 1) = Math.log(-99) = NaN となるため、NaNをチェック
      expect(Number.isNaN(result)).toBe(true)
    })
  })
})
