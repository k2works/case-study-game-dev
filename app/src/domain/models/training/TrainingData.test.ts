import { describe, expect, it } from 'vitest'

import {
  type AIAction,
  type GameState,
  type TrainingMetadata,
  createTrainingData,
} from './TrainingData'

describe('TrainingData', () => {
  describe('データ構造', () => {
    it('必要なフィールドを持つ', () => {
      // Arrange
      const gameState: GameState = {
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
        chainCount: 0,
        turn: 10,
      }

      const action: AIAction = {
        x: 3,
        rotation: 1,
        evaluationScore: 85.5,
        features: {
          chainScore: 40,
          heightPenalty: -10,
          connectivityScore: 20,
          futureChainPotential: 35.5,
        },
      }

      const metadata: TrainingMetadata = {
        gameId: 'game-123',
        playerId: 'ai-001',
        difficulty: 'hard',
        version: '1.0.0',
      }

      // Act
      const trainingData = createTrainingData(gameState, action, 100, metadata)

      // Assert
      expect(trainingData).toHaveProperty('id')
      expect(trainingData).toHaveProperty('timestamp')
      expect(trainingData.gameState).toStrictEqual(gameState)
      expect(trainingData.action).toStrictEqual(action)
      expect(trainingData.reward).toBe(100)
      expect(trainingData.metadata).toStrictEqual(metadata)
    })

    it('IDが一意である', () => {
      // Arrange
      const gameState: GameState = {
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
        score: 0,
        chainCount: 0,
        turn: 1,
      }

      const action: AIAction = {
        x: 0,
        rotation: 0,
        evaluationScore: 0,
        features: {},
      }
      const metadata: TrainingMetadata = {
        gameId: 'test',
        playerId: 'test',
        difficulty: 'normal',
        version: '1.0.0',
      }

      // Act
      const data1 = createTrainingData(gameState, action, 0, metadata)
      const data2 = createTrainingData(gameState, action, 0, metadata)

      // Assert
      expect(data1.id).not.toBe(data2.id)
    })

    it('タイムスタンプが現在時刻に近い', () => {
      // Arrange
      const gameState: GameState = {
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
        score: 0,
        chainCount: 0,
        turn: 1,
      }

      const action: AIAction = {
        x: 0,
        rotation: 0,
        evaluationScore: 0,
        features: {},
      }
      const metadata: TrainingMetadata = {
        gameId: 'test',
        playerId: 'test',
        difficulty: 'normal',
        version: '1.0.0',
      }
      const before = Date.now()

      // Act
      const trainingData = createTrainingData(gameState, action, 0, metadata)
      const after = Date.now()

      // Assert
      expect(trainingData.timestamp.getTime()).toBeGreaterThanOrEqual(before)
      expect(trainingData.timestamp.getTime()).toBeLessThanOrEqual(after)
    })
  })

  describe('データ検証', () => {
    it('報酬が数値である', () => {
      // Arrange
      const gameState: GameState = {
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
        score: 0,
        chainCount: 0,
        turn: 1,
      }

      const action: AIAction = {
        x: 0,
        rotation: 0,
        evaluationScore: 0,
        features: {},
      }
      const metadata: TrainingMetadata = {
        gameId: 'test',
        playerId: 'test',
        difficulty: 'normal',
        version: '1.0.0',
      }

      // Act
      const trainingData = createTrainingData(
        gameState,
        action,
        -50.5,
        metadata,
      )

      // Assert
      expect(typeof trainingData.reward).toBe('number')
      expect(trainingData.reward).toBe(-50.5)
    })

    it('メタデータに必須フィールドが含まれる', () => {
      // Arrange
      const gameState: GameState = {
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
        score: 0,
        chainCount: 0,
        turn: 1,
      }

      const action: AIAction = {
        x: 0,
        rotation: 0,
        evaluationScore: 0,
        features: {},
      }
      const metadata: TrainingMetadata = {
        gameId: 'game-456',
        playerId: 'player-789',
        difficulty: 'easy',
        version: '2.0.0',
      }

      // Act
      const trainingData = createTrainingData(gameState, action, 0, metadata)

      // Assert
      expect(trainingData.metadata.gameId).toBe('game-456')
      expect(trainingData.metadata.playerId).toBe('player-789')
      expect(trainingData.metadata.difficulty).toBe('easy')
      expect(trainingData.metadata.version).toBe('2.0.0')
    })
  })

  describe('不変性', () => {
    it('作成後のデータは不変である', () => {
      // Arrange
      const gameState: GameState = {
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
        score: 0,
        chainCount: 0,
        turn: 1,
      }

      const action: AIAction = {
        x: 0,
        rotation: 0,
        evaluationScore: 0,
        features: {},
      }
      const metadata: TrainingMetadata = {
        gameId: 'test',
        playerId: 'test',
        difficulty: 'normal',
        version: '1.0.0',
      }

      // Act
      const trainingData = createTrainingData(gameState, action, 0, metadata)

      // Assert - オブジェクトがフリーズされているか確認
      expect(Object.isFrozen(trainingData)).toBe(true)
      expect(Object.isFrozen(trainingData.metadata)).toBe(true)
    })
  })
})
