/**
 * 評価サービスのテスト（関数型）
 */
import { describe, expect, test } from 'vitest'

import type { AIGameState } from '../../models/ai/GameState'
import type { PossibleMove } from '../../models/ai/MoveTypes'
import {
  DEFAULT_EVALUATION_SETTINGS,
  calculateBaseScores,
  createBasicMoveEvaluation,
  createInvalidMoveEvaluation,
  createMLEnhancedMoveEvaluation,
  evaluateAndSortMoves,
  evaluateAndSortMovesWithML,
  evaluateMove,
  evaluateMoveWithML,
  getBestMove,
  updateEvaluationSettings,
} from './EvaluationService'

describe('EvaluationService（関数型）', () => {
  const createTestGameState = (): AIGameState => ({
    field: { width: 6, height: 12, cells: [] },
    currentPuyoPair: {
      primaryColor: 'red',
      secondaryColor: 'blue',
      x: 2,
      y: 0,
      rotation: 0,
    },
    nextPuyoPair: null,
    score: 0,
  })

  const createTestMove = (
    x: number,
    y: number,
    isValid: boolean = true,
  ): PossibleMove => ({
    x,
    rotation: 0,
    isValid,
    primaryPosition: { x, y },
    secondaryPosition: { x, y: y - 1 },
  })

  describe('基本評価関数', () => {
    test('有効な手を正しく評価する', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 10)

      // Act
      const evaluation = evaluateMove(move, gameState)

      // Assert
      expect(evaluation.totalScore).toBeGreaterThan(0)
      expect(evaluation.heightScore).toBeGreaterThan(0)
      expect(evaluation.centerScore).toBeGreaterThan(0)
      expect(evaluation.modeScore).toBe(0)
      expect(evaluation.averageY).toBe(9.5)
      expect(evaluation.averageX).toBe(2)
      expect(evaluation.reason).toContain('標準評価')
    })

    test('無効な手は低いスコアを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      const invalidMove = createTestMove(-1, 0, false)

      // Act
      const evaluation = evaluateMove(invalidMove, gameState)

      // Assert
      expect(evaluation.totalScore).toBe(-1000)
      expect(evaluation.heightScore).toBe(-1000)
      expect(evaluation.reason).toBe('無効な手')
    })

    test('カスタム設定で評価できる', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 10)
      const customSettings = {
        heightWeight: 20,
        centerWeight: 10,
        mlWeight: 30,
      }

      // Act
      const evaluation = evaluateMove(move, gameState, customSettings)

      // Assert
      expect(evaluation.heightScore).toBe(9.5 * 20) // avgY * heightWeight
      expect(evaluation.centerScore).toBeGreaterThan(
        evaluateMove(move, gameState).centerScore,
      )
    })
  })

  describe('ML強化評価関数', () => {
    test('MLスコア付きで評価できる', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 10)
      const mlScore = 0.8

      // Act
      const evaluation = evaluateMoveWithML(move, gameState, mlScore)

      // Assert
      expect(evaluation.modeScore).toBeGreaterThan(0)
      expect(evaluation.totalScore).toBeGreaterThan(0)
      expect(evaluation.reason).toContain('ML強化判定')
    })

    test('基本評価よりMLスコア分高くなる', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 10)
      const mlScore = 0.5

      // Act
      const basicEvaluation = evaluateMove(move, gameState)
      const mlEvaluation = evaluateMoveWithML(move, gameState, mlScore)

      // Assert
      const expectedModeScore = mlScore * DEFAULT_EVALUATION_SETTINGS.mlWeight
      expect(mlEvaluation.modeScore).toBe(expectedModeScore)
      expect(mlEvaluation.totalScore).toBe(
        basicEvaluation.totalScore + expectedModeScore,
      )
    })

    test('無効な手はMLスコアが付いても低スコアになる', () => {
      // Arrange
      const gameState = createTestGameState()
      const invalidMove = createTestMove(-1, 0, false)

      // Act
      const evaluation = evaluateMoveWithML(invalidMove, gameState, 1.0)

      // Assert
      expect(evaluation.totalScore).toBe(-1000)
      expect(evaluation.reason).toBe('無効な手')
    })
  })

  describe('ヘルパー関数', () => {
    test('無効な手の評価を作成', () => {
      // Act
      const evaluation = createInvalidMoveEvaluation()

      // Assert
      expect(evaluation.totalScore).toBe(-1000)
      expect(evaluation.heightScore).toBe(-1000)
      expect(evaluation.reason).toBe('無効な手')
    })

    test('基本的な手の評価を作成', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 10)

      // Act
      const evaluation = createBasicMoveEvaluation(
        move,
        gameState,
        DEFAULT_EVALUATION_SETTINGS,
      )

      // Assert
      expect(evaluation.totalScore).toBeGreaterThan(0)
      expect(evaluation.modeScore).toBe(0)
      expect(evaluation.reason).toContain('標準評価')
    })

    test('ML強化評価を作成', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 10)
      const mlScore = 0.7

      // Act
      const evaluation = createMLEnhancedMoveEvaluation(
        move,
        gameState,
        mlScore,
        DEFAULT_EVALUATION_SETTINGS,
      )

      // Assert
      expect(evaluation.modeScore).toBeGreaterThan(0)
      expect(evaluation.reason).toContain('ML強化判定')
    })

    test('基本スコアを計算', () => {
      // Arrange
      const move = createTestMove(2, 10)
      const field = { width: 6, height: 12, cells: [] }

      // Act
      const scores = calculateBaseScores(
        move,
        field,
        DEFAULT_EVALUATION_SETTINGS,
      )

      // Assert
      expect(scores.heightScore).toBeGreaterThan(0)
      expect(scores.centerScore).toBeGreaterThan(0)
      expect(scores.avgY).toBe(9.5)
      expect(scores.avgX).toBe(2)
    })

    test('評価設定を部分更新', () => {
      // Arrange
      const currentSettings = DEFAULT_EVALUATION_SETTINGS
      const updates = { heightWeight: 25 }

      // Act
      const newSettings = updateEvaluationSettings(currentSettings, updates)

      // Assert
      expect(newSettings.heightWeight).toBe(25)
      expect(newSettings.centerWeight).toBe(
        DEFAULT_EVALUATION_SETTINGS.centerWeight,
      )
      expect(newSettings.mlWeight).toBe(DEFAULT_EVALUATION_SETTINGS.mlWeight)
    })
  })

  describe('位置による評価の違い', () => {
    test('中央に近い手がより高く評価される', () => {
      // Arrange
      const gameState = createTestGameState()
      const centerMove = createTestMove(2, 10) // 中央付近
      const edgeMove = createTestMove(0, 10) // 端

      // Act
      const centerEvaluation = evaluateMove(centerMove, gameState)
      const edgeEvaluation = evaluateMove(edgeMove, gameState)

      // Assert
      expect(centerEvaluation.centerScore).toBeGreaterThan(
        edgeEvaluation.centerScore,
      )
      expect(centerEvaluation.totalScore).toBeGreaterThan(
        edgeEvaluation.totalScore,
      )
    })

    test('下の位置の手がより高く評価される', () => {
      // Arrange
      const gameState = createTestGameState()
      const lowerMove = createTestMove(2, 10) // 下の位置
      const upperMove = createTestMove(2, 5) // 上の位置

      // Act
      const lowerEvaluation = evaluateMove(lowerMove, gameState)
      const upperEvaluation = evaluateMove(upperMove, gameState)

      // Assert
      expect(lowerEvaluation.heightScore).toBeGreaterThan(
        upperEvaluation.heightScore,
      )
      expect(lowerEvaluation.totalScore).toBeGreaterThan(
        upperEvaluation.totalScore,
      )
    })
  })

  describe('複数手の評価', () => {
    test('複数の手を評価してソートできる', () => {
      // Arrange
      const gameState = createTestGameState()
      const moves = [
        createTestMove(0, 8), // 端、上
        createTestMove(2, 10), // 中央、下 - 最高スコア
        createTestMove(5, 9), // 端、中
      ]

      // Act
      const evaluatedMoves = evaluateAndSortMoves(moves, gameState)

      // Assert
      expect(evaluatedMoves).toHaveLength(3)
      expect(evaluatedMoves[0].x).toBe(2) // 中央、下が最高スコア
      expect(evaluatedMoves[0].evaluation.totalScore).toBeGreaterThan(
        evaluatedMoves[1].evaluation.totalScore,
      )
    })

    test('ML強化評価で複数の手をソートできる', () => {
      // Arrange
      const gameState = createTestGameState()
      const movesWithML = [
        { move: createTestMove(0, 8), mlScore: 0.3 },
        { move: createTestMove(2, 10), mlScore: 0.9 }, // 最高MLスコア
        { move: createTestMove(5, 9), mlScore: 0.1 },
      ]

      // Act
      const evaluatedMoves = evaluateAndSortMovesWithML(movesWithML, gameState)

      // Assert
      expect(evaluatedMoves).toHaveLength(3)
      expect(evaluatedMoves[0].x).toBe(2) // 最高MLスコア
      expect(evaluatedMoves[0].evaluation.modeScore).toBeGreaterThan(0)
    })

    test('最高評価の手を取得できる', () => {
      // Arrange
      const gameState = createTestGameState()
      const moves = [
        createTestMove(0, 8),
        createTestMove(2, 10), // 最高スコア
        createTestMove(5, 9),
      ]

      // Act
      const bestMove = getBestMove(moves, gameState)

      // Assert
      expect(bestMove).not.toBeNull()
      expect(bestMove!.x).toBe(2)
      expect(bestMove!.evaluation.totalScore).toBeGreaterThan(0)
    })

    test('手がない場合はnullを返す', () => {
      // Arrange
      const gameState = createTestGameState()
      const moves: PossibleMove[] = []

      // Act
      const bestMove = getBestMove(moves, gameState)

      // Assert
      expect(bestMove).toBeNull()
    })
  })
})
