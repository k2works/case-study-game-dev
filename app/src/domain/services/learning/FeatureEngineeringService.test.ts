import { beforeEach, describe, expect, it } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingData,
} from '../../models/training/TrainingData'
import { FeatureEngineeringService } from './FeatureEngineeringService'

describe('FeatureEngineeringService', () => {
  let service: FeatureEngineeringService

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

  beforeEach(() => {
    service = new FeatureEngineeringService()
  })

  describe('基本機能', () => {
    it('サービスが正しく初期化される', () => {
      expect(service).toBeDefined()
      expect(typeof service.extractFeatures).toBe('function')
      expect(typeof service.normalizeFeatures).toBe('function')
    })

    it('ゲーム状態から特徴量を抽出できる', () => {
      // Act
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Assert
      expect(features).toHaveProperty('fieldDensity')
      expect(features).toHaveProperty('chainPotential')
      expect(features).toHaveProperty('positionFeatures')
      expect(features).toHaveProperty('colorDistribution')
      expect(features.fieldDensity).toBeGreaterThanOrEqual(0)
      expect(features.fieldDensity).toBeLessThanOrEqual(1)
    })

    it('特徴量を正規化できる', () => {
      // Arrange
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Act
      const normalized = service.normalizeFeatures(features)

      // Assert
      expect(normalized).toHaveProperty('vector')
      expect(normalized).toHaveProperty('metadata')
      expect(normalized.vector).toBeInstanceOf(Array)
      expect(normalized.vector.length).toBeGreaterThan(0)
    })
  })

  describe('特徴量抽出', () => {
    it('フィールド密度を正しく計算する', () => {
      // Arrange
      const denseField = Array(13)
        .fill(null)
        .map((_, row) =>
          Array(6)
            .fill(null)
            .map(() => (row > 6 ? 'red' : null)),
        )
      const denseGameState = { ...sampleGameState, field: denseField }

      // Act
      const features = service.extractFeatures(denseGameState, sampleAction)

      // Assert
      expect(features.fieldDensity).toBeGreaterThan(0.3)
    })

    it('連鎖ポテンシャルを評価する', () => {
      // Act
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Assert
      expect(features.chainPotential).toBeDefined()
      expect(typeof features.chainPotential).toBe('number')
      expect(features.chainPotential).toBeGreaterThanOrEqual(0)
    })

    it('位置特徴量を抽出する', () => {
      // Act
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Assert
      expect(features.positionFeatures).toBeDefined()
      expect(features.positionFeatures.currentX).toBe(sampleAction.x)
      expect(features.positionFeatures.rotation).toBe(sampleAction.rotation)
    })

    it('色分布を計算する', () => {
      // Act
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Assert
      expect(features.colorDistribution).toBeDefined()
      expect(typeof features.colorDistribution.red).toBe('number')
      expect(typeof features.colorDistribution.blue).toBe('number')
      expect(typeof features.colorDistribution.yellow).toBe('number')
      expect(typeof features.colorDistribution.green).toBe('number')
    })
  })

  describe('正規化処理', () => {
    it('すべての特徴量を0-1の範囲に正規化する', () => {
      // Arrange
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Act
      const normalized = service.normalizeFeatures(features)

      // Assert
      normalized.vector.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
      })
    })

    it('正規化後のベクターサイズが一定である', () => {
      // Arrange
      const features1 = service.extractFeatures(sampleGameState, sampleAction)
      const altAction = { ...sampleAction, x: 1, rotation: 2 }
      const features2 = service.extractFeatures(sampleGameState, altAction)

      // Act
      const norm1 = service.normalizeFeatures(features1)
      const norm2 = service.normalizeFeatures(features2)

      // Assert
      expect(norm1.vector.length).toBe(norm2.vector.length)
    })

    it('メタデータが保持される', () => {
      // Arrange
      const features = service.extractFeatures(sampleGameState, sampleAction)

      // Act
      const normalized = service.normalizeFeatures(features)

      // Assert
      expect(normalized.metadata).toBeDefined()
      expect(normalized.metadata.featureNames).toBeInstanceOf(Array)
      expect(normalized.metadata.featureNames.length).toBe(
        normalized.vector.length,
      )
    })
  })

  describe('バッチ処理', () => {
    it('複数のTrainingDataを一括処理できる', () => {
      // Arrange
      const trainingData: TrainingData[] = [
        {
          id: '1',
          timestamp: new Date(),
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
          timestamp: new Date(),
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

      // Act
      const processed = service.processBatch(trainingData)

      // Assert
      expect(processed).toHaveLength(2)
      expect(processed[0]).toHaveProperty('features')
      expect(processed[0]).toHaveProperty('normalizedFeatures')
      expect(processed[0]).toHaveProperty('reward')
    })

    it('空のバッチを適切に処理する', () => {
      // Act
      const processed = service.processBatch([])

      // Assert
      expect(processed).toHaveLength(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なゲーム状態でエラーを投げる', () => {
      // Arrange
      const invalidGameState = null as unknown as GameState

      // Act & Assert
      expect(() =>
        service.extractFeatures(invalidGameState, sampleAction),
      ).toThrow('Invalid game state')
    })

    it('無効なアクションでエラーを投げる', () => {
      // Arrange
      const invalidAction = null as unknown as AIAction

      // Act & Assert
      expect(() =>
        service.extractFeatures(sampleGameState, invalidAction),
      ).toThrow('Invalid action')
    })
  })
})
