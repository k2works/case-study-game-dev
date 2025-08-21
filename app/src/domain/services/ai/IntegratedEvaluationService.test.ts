/**
 * IntegratedEvaluationService テスト
 */
import { describe, expect, it } from 'vitest'

import type { AIGameState, PossibleMove } from '../../models/ai'
import {
  GamePhase,
  evaluateWithIntegratedSystem,
  getGamePhase,
  getPhaseAdjustments,
} from './IntegratedEvaluationService'

describe('IntegratedEvaluationService', () => {
  // テスト用のゲーム状態を作成
  const createMockGameState = (puyoCount: number): AIGameState => {
    const field = {
      width: 6,
      height: 13,
      cells: Array(13)
        .fill(null)
        .map(() => Array(6).fill(null)),
    }

    // 指定された数のぷよを配置
    let placed = 0
    for (let y = 12; y >= 0 && placed < puyoCount; y--) {
      for (let x = 0; x < 6 && placed < puyoCount; x++) {
        field.cells[y][x] = 'red'
        placed++
      }
    }

    return {
      field,
      currentPuyoPair: {
        primaryColor: 'red',
        secondaryColor: 'blue',
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: null,
      score: 0,
      chainCount: 0,
      turn: 1,
      isGameOver: false,
    }
  }

  // テスト用の手を作成
  const createMockMove = (): PossibleMove => ({
    x: 2,
    rotation: 0,
    isValid: true,
    primaryPosition: { x: 2, y: 10 },
    secondaryPosition: { x: 2, y: 11 },
  })

  describe('getGamePhase', () => {
    it('序盤（ぷよ数 < 30）を正しく判定する', () => {
      // Arrange
      const gameState = createMockGameState(20)

      // Act
      const phase = getGamePhase(gameState)

      // Assert
      expect(phase).toBe(GamePhase.EARLY)
    })

    it('中盤（30 <= ぷよ数 < 60）を正しく判定する', () => {
      // Arrange
      const gameState = createMockGameState(45)

      // Act
      const phase = getGamePhase(gameState)

      // Assert
      expect(phase).toBe(GamePhase.MIDDLE)
    })

    it('終盤（ぷよ数 >= 60）を正しく判定する', () => {
      // Arrange
      const gameState = createMockGameState(70)

      // Act
      const phase = getGamePhase(gameState)

      // Assert
      expect(phase).toBe(GamePhase.LATE)
    })

    it('空のフィールドは序盤と判定する', () => {
      // Arrange
      const gameState = createMockGameState(0)

      // Act
      const phase = getGamePhase(gameState)

      // Assert
      expect(phase).toBe(GamePhase.EARLY)
    })
  })

  describe('getPhaseAdjustments', () => {
    it('序盤の調整パラメータを正しく返す', () => {
      // Arrange & Act
      const adjustments = getPhaseAdjustments(GamePhase.EARLY)

      // Assert
      expect(adjustments.gapTolerance).toBe(0.5)
      expect(adjustments.chainPriority).toBe(0.7)
      expect(adjustments.shapePriority).toBe(1.0)
      expect(adjustments.shapeWeight).toBe(1.2)
    })

    it('中盤の調整パラメータを正しく返す', () => {
      // Arrange & Act
      const adjustments = getPhaseAdjustments(GamePhase.MIDDLE)

      // Assert
      expect(adjustments.gapTolerance).toBe(0.3)
      expect(adjustments.chainPriority).toBe(1.0)
      expect(adjustments.shapePriority).toBe(0.8)
      expect(adjustments.operationWeight).toBe(1.0)
    })

    it('終盤の調整パラメータを正しく返す', () => {
      // Arrange & Act
      const adjustments = getPhaseAdjustments(GamePhase.LATE)

      // Assert
      expect(adjustments.gapTolerance).toBe(0.1)
      expect(adjustments.chainPriority).toBe(1.2)
      expect(adjustments.shapePriority).toBe(0.5)
      expect(adjustments.chainWeight).toBe(1.3)
    })
  })

  describe('evaluateWithIntegratedSystem', () => {
    it('4要素の評価を統合して総合スコアを計算する', () => {
      // Arrange
      const move = createMockMove()
      const gameState = createMockGameState(10) // 序盤
      const evaluationResults = {
        operation: { totalScore: 100 },
        shape: { totalScore: 80 },
        chain: { totalScore: 60 },
        strategy: { totalScore: 40 },
      }

      // Act
      const result = evaluateWithIntegratedSystem(
        move,
        gameState,
        evaluationResults,
      )

      // Assert
      expect(result.operationScore).toBeGreaterThan(0)
      expect(result.shapeScore).toBeGreaterThan(0)
      expect(result.chainScore).toBeGreaterThan(0)
      expect(result.strategyScore).toBeGreaterThan(0)
      expect(result.totalScore).toBe(
        result.operationScore +
          result.shapeScore +
          result.chainScore +
          result.strategyScore,
      )
      expect(result.gamePhase).toBe(GamePhase.EARLY)
    })

    it('序盤では形評価の重みが高くなる', () => {
      // Arrange
      const move = createMockMove()
      const gameState = createMockGameState(10) // 序盤
      const evaluationResults = {
        operation: { totalScore: 100 },
        shape: { totalScore: 100 }, // 同じスコア
      }

      // Act
      const result = evaluateWithIntegratedSystem(
        move,
        gameState,
        evaluationResults,
      )

      // Assert
      // 序盤では形評価の重みが1.2、操作評価の重みが0.8
      expect(result.shapeScore).toBeGreaterThan(result.operationScore)
    })

    it('終盤では連鎖評価の重みが高くなる', () => {
      // Arrange
      const move = createMockMove()
      const gameState = createMockGameState(70) // 終盤
      const evaluationResults = {
        operation: { totalScore: 100 },
        shape: { totalScore: 100 },
        chain: { totalScore: 100 }, // 同じスコア
      }

      // Act
      const result = evaluateWithIntegratedSystem(
        move,
        gameState,
        evaluationResults,
      )

      // Assert
      // 終盤では連鎖評価の重みが1.3、形評価の重みが0.6
      expect(result.chainScore).toBeGreaterThan(result.shapeScore)
    })

    it('カスタム設定を適用できる', () => {
      // Arrange
      const move = createMockMove()
      const gameState = createMockGameState(40) // 中盤
      const evaluationResults = {
        operation: { totalScore: 100 },
        shape: { totalScore: 100 },
      }
      const customSettings = {
        baseOperationWeight: 2.0,
        baseShapeWeight: 0.5,
      }

      // Act
      const result = evaluateWithIntegratedSystem(
        move,
        gameState,
        evaluationResults,
        customSettings,
      )

      // Assert
      // カスタム重みが適用される
      expect(result.operationScore).toBeGreaterThan(result.shapeScore)
    })

    it('評価理由に適切な情報が含まれる', () => {
      // Arrange
      const move = createMockMove()
      const gameState = createMockGameState(10) // 序盤
      const evaluationResults = {
        operation: { totalScore: 50 },
        shape: { totalScore: 100 }, // 最高スコア
        chain: { totalScore: 30 },
        strategy: { totalScore: 20 },
      }

      // Act
      const result = evaluateWithIntegratedSystem(
        move,
        gameState,
        evaluationResults,
      )

      // Assert
      expect(result.reason).toContain('良好な形状')
      expect(result.reason).toContain('序盤：形重視')
    })

    it('連鎖・戦略評価が未提供の場合でもエラーにならない', () => {
      // Arrange
      const move = createMockMove()
      const gameState = createMockGameState(30)
      const evaluationResults = {
        operation: { totalScore: 100 },
        shape: { totalScore: 80 },
        // chain と strategy は省略
      }

      // Act & Assert
      expect(() => {
        const result = evaluateWithIntegratedSystem(
          move,
          gameState,
          evaluationResults,
        )
        expect(result.chainScore).toBeGreaterThan(0) // デフォルト値が使用される
        expect(result.strategyScore).toBeGreaterThan(0)
      }).not.toThrow()
    })
  })
})
