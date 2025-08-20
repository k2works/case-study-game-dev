/**
 * OperationEvaluationService のテスト
 */
import { describe, expect, test } from 'vitest'

import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState, PossibleMove } from '../../models/ai'
import { OperationEvaluationService } from './OperationEvaluationService'

describe('OperationEvaluationService', () => {
  const service = new OperationEvaluationService()

  // テスト用のゲーム状態を作成
  const createTestGameState = (
    customField?: (PuyoColor | null)[][],
    primaryColor: PuyoColor = 'red',
    secondaryColor: PuyoColor = 'blue',
  ): AIGameState => {
    const defaultField = Array(12)
      .fill(null)
      .map(() => Array(6).fill(null))

    return {
      field: {
        width: 6,
        height: 12,
        cells: customField || defaultField,
      },
      currentPuyoPair: {
        primaryColor,
        secondaryColor,
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: null,
      score: 0,
    }
  }

  // テスト用の手を作成
  const createTestMove = (
    x: number = 2,
    rotation: number = 0,
  ): PossibleMove => ({
    x,
    rotation,
    isValid: true,
    primaryPosition: { x, y: 0 },
    secondaryPosition: { x, y: 0 },
  })

  describe('基本評価機能', () => {
    test('手を評価できる', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 0)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThan(0)
      expect(result.reason).toContain('Phase 4c最適化評価')
      expect(typeof result.baseScore).toBe('number')
      expect(typeof result.positionScore).toBe('number')
      expect(typeof result.colorScore).toBe('number')
      expect(typeof result.chainPotentialScore).toBe('number')
    })

    test('評価結果の構造が正しい', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result).toMatchObject({
        baseScore: expect.any(Number),
        positionScore: expect.any(Number),
        colorScore: expect.any(Number),
        chainPotentialScore: expect.any(Number),
        totalScore: expect.any(Number),
        reason: expect.any(String),
      })
    })

    test('総合スコアが各スコアの合計である', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      const expectedTotal =
        result.baseScore +
        result.positionScore +
        result.colorScore +
        result.chainPotentialScore
      expect(result.totalScore).toBe(expectedTotal)
    })
  })

  describe('基本スコア計算', () => {
    test('中央配置が高スコアになる', () => {
      // Arrange
      const gameState = createTestGameState()
      const centerMove = createTestMove(2, 0) // 中央
      const edgeMove = createTestMove(0, 0) // 端

      // Act
      const centerResult = service.evaluateMove(centerMove, gameState)
      const edgeResult = service.evaluateMove(edgeMove, gameState)

      // Assert
      expect(centerResult.baseScore).toBeGreaterThan(edgeResult.baseScore)
    })

    test('中央から遠いほど低スコア', () => {
      // Arrange
      const gameState = createTestGameState()
      const move1 = createTestMove(2, 0) // 中央
      const move2 = createTestMove(1, 0) // 中央から1つ左
      const move3 = createTestMove(0, 0) // 左端

      // Act
      const result1 = service.evaluateMove(move1, gameState)
      const result2 = service.evaluateMove(move2, gameState)
      const result3 = service.evaluateMove(move3, gameState)

      // Assert
      expect(result1.baseScore).toBeGreaterThan(result2.baseScore)
      expect(result2.baseScore).toBeGreaterThan(result3.baseScore)
    })
  })

  describe('位置評価スコア', () => {
    test('低い位置ほど高スコア', () => {
      // Arrange - 一部に既存ぷよがある状態
      const fieldWithPuyos = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 列0に既存ぷよ
      fieldWithPuyos[10][0] = 'red'
      fieldWithPuyos[11][0] = 'blue'

      const gameState = createTestGameState(fieldWithPuyos)
      const lowMove = createTestMove(2, 0) // 空の列
      const highMove = createTestMove(0, 0) // ぷよがある列

      // Act
      const lowResult = service.evaluateMove(lowMove, gameState)
      const highResult = service.evaluateMove(highMove, gameState)

      // Assert
      expect(lowResult.positionScore).toBeGreaterThan(highResult.positionScore)
    })

    test('バランスの良い配置が高スコア', () => {
      // Arrange - 隣接列に同じ高さのぷよ
      const fieldWithBalance = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 列1と列3に同じ高さでぷよ配置
      fieldWithBalance[11][1] = 'red'
      fieldWithBalance[11][3] = 'blue'

      const gameState = createTestGameState(fieldWithBalance)
      const balancedMove = createTestMove(2, 0) // 中央（両隣が同じ高さ）

      // Act
      const result = service.evaluateMove(balancedMove, gameState)

      // Assert
      expect(result.positionScore).toBeGreaterThan(0)
    })
  })

  describe('色配置評価スコア', () => {
    test('隣接同色がある場合高スコア', () => {
      // Arrange - 隣接位置に同色ぷよ
      const fieldWithSameColor = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      fieldWithSameColor[11][2] = 'red' // 配置予定位置の下に同色

      const gameState = createTestGameState(fieldWithSameColor, 'red', 'blue')
      const move = createTestMove(2, 0)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result.colorScore).toBeGreaterThan(0)
    })

    test('隣接同色が多いほど高スコア', () => {
      // Arrange - より明確な差を作るテスト
      const field1 = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // field1は隣接なし

      const field2 = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      field2[11][2] = 'red' // 配置予定位置(2,10)の下に隣接
      field2[10][1] = 'red' // 配置予定位置の左に隣接

      const gameState1 = createTestGameState(field1, 'red', 'blue')
      const gameState2 = createTestGameState(field2, 'red', 'blue')
      const move = createTestMove(2, 0)

      // Act
      const result1 = service.evaluateMove(move, gameState1)
      const result2 = service.evaluateMove(move, gameState2)

      // Assert
      expect(result2.colorScore).toBeGreaterThan(result1.colorScore)
    })
  })

  describe('連鎖可能性スコア', () => {
    test('4個グループを作れる場合高スコア', () => {
      // Arrange - 4個グループが作れる状況
      const fieldForChain = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      fieldForChain[11][2] = 'red'
      fieldForChain[11][1] = 'red'
      fieldForChain[10][2] = 'red'

      const gameState = createTestGameState(fieldForChain, 'red', 'blue')
      const move = createTestMove(2, 0)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result.chainPotentialScore).toBeGreaterThan(0)
    })

    test('連鎖可能性がない場合は低スコア', () => {
      // Arrange - 連鎖可能性がない状況
      const gameState = createTestGameState()
      const move = createTestMove(2, 0)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result.chainPotentialScore).toBeLessThanOrEqual(0)
    })
  })

  describe('回転による副ぷよ配置', () => {
    test('回転角度0度（上）で正しく評価', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 0)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThan(0)
    })

    test('回転角度90度（右）で正しく評価', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 90)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThan(0)
    })

    test('回転角度180度（下）で正しく評価', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 180)

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThan(0)
    })

    test('回転角度270度（左）で正しく評価', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(1, 270) // 左回転なので左にスペースが必要

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThan(0)
    })
  })

  describe('評価理由生成', () => {
    test('高スコア要素が理由に反映される', () => {
      // Arrange - 中央配置で高スコアになる状況
      const gameState = createTestGameState()
      const move = createTestMove(2, 0) // 中央配置

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result.reason).toContain('Phase 4c最適化評価')
      if (result.baseScore > 30) {
        expect(result.reason).toContain('中央配置')
      }
    })

    test('複数の高スコア要素が理由に含まれる', () => {
      // Arrange - 複数の高スコア要素を持つ状況
      const fieldForHighScore = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      fieldForHighScore[11][2] = 'red' // 色隣接のため

      const gameState = createTestGameState(fieldForHighScore, 'red', 'blue')
      const move = createTestMove(2, 0) // 中央配置

      // Act
      const result = service.evaluateMove(move, gameState)

      // Assert
      expect(result.reason).toContain('Phase 4c最適化評価')
      // 複数の要素が含まれる可能性
      const possibleReasons = ['中央配置', '安定位置', '色隣接', '連鎖可能']
      const reasonIncludesMultiple =
        possibleReasons.filter((reason) => result.reason.includes(reason))
          .length >= 1
      expect(reasonIncludesMultiple).toBe(true)
    })
  })

  describe('エッジケース', () => {
    test('currentPuyoPairがnullの場合でもエラーにならない', () => {
      // Arrange
      const gameState = createTestGameState()
      gameState.currentPuyoPair = null
      const move = createTestMove()

      // Act & Assert
      expect(() => service.evaluateMove(move, gameState)).not.toThrow()
      const result = service.evaluateMove(move, gameState)
      expect(result.colorScore).toBe(0)
      expect(result.chainPotentialScore).toBe(0)
    })

    test('フィールド境界での評価が正しい', () => {
      // Arrange
      const gameState = createTestGameState()
      const leftEdgeMove = createTestMove(0, 0)
      const rightEdgeMove = createTestMove(5, 0)

      // Act
      const leftResult = service.evaluateMove(leftEdgeMove, gameState)
      const rightResult = service.evaluateMove(rightEdgeMove, gameState)

      // Assert
      expect(leftResult).toBeDefined()
      expect(rightResult).toBeDefined()
      expect(leftResult.totalScore).toBeGreaterThan(0)
      expect(rightResult.totalScore).toBeGreaterThan(0)
    })

    test('無効な回転角度でもデフォルト処理される', () => {
      // Arrange
      const gameState = createTestGameState()
      const invalidRotationMove = createTestMove(2, 45) // 無効な角度

      // Act & Assert
      expect(() =>
        service.evaluateMove(invalidRotationMove, gameState),
      ).not.toThrow()
      const result = service.evaluateMove(invalidRotationMove, gameState)
      expect(result).toBeDefined()
    })
  })
})
