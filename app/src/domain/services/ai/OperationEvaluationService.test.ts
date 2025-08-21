/**
 * OperationEvaluationService のテスト (mayah型操作評価)
 */
import { describe, expect, test } from 'vitest'

import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState, PossibleMove } from '../../models/ai'
import { evaluateMove } from './OperationEvaluationService'

describe('OperationEvaluationService (mayah型)', () => {
  // テスト用のゲーム状態を作成
  const createTestGameState = (
    customField?: (PuyoColor | null)[][],
    primaryColor: PuyoColor = 'red',
    secondaryColor: PuyoColor = 'blue',
  ): AIGameState => {
    const defaultField = Array(13)
      .fill(null)
      .map(() => Array(6).fill(null))

    return {
      field: {
        width: 6,
        height: 13,
        cells: customField || defaultField,
      },
      currentPuyoPair: {
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
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
  const createTestMove = (
    x: number = 2,
    rotation: number = 0,
  ): PossibleMove => ({
    x,
    rotation,
    isValid: true,
    primaryPosition: { x, y: 11 },
    secondaryPosition: { x, y: 12 },
  })

  describe('基本評価機能', () => {
    test('手を評価できる', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove(2, 0)

      // Act
      const result = evaluateMove(move, gameState)

      // Assert
      expect(result).toBeDefined()
      expect(result.totalScore).toBeGreaterThan(0)
      expect(result.reason).toContain('操作評価')
      expect(typeof result.frameCount).toBe('number')
      expect(typeof result.frameScore).toBe('number')
      expect(typeof result.tearCount).toBe('number')
      expect(typeof result.tearScore).toBe('number')
      expect(typeof result.efficiencyScore).toBe('number')
    })

    test('評価結果の構造が正しい', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      // Act
      const result = evaluateMove(move, gameState)

      // Assert
      expect(result).toMatchObject({
        frameCount: expect.any(Number),
        frameScore: expect.any(Number),
        tearCount: expect.any(Number),
        tearScore: expect.any(Number),
        efficiencyScore: expect.any(Number),
        totalScore: expect.any(Number),
        reason: expect.any(String),
      })
    })

    test('総合スコアが各スコアの合計である', () => {
      // Arrange
      const gameState = createTestGameState()
      const move = createTestMove()

      // Act
      const result = evaluateMove(move, gameState)

      // Assert
      const expectedTotal =
        result.frameScore + result.tearScore + result.efficiencyScore
      expect(result.totalScore).toBe(expectedTotal)
    })
  })

  describe('フレーム数評価', () => {
    test('中央配置が高速になる', () => {
      // Arrange
      const gameState = createTestGameState()
      const centerMove = createTestMove(2, 0) // 中央
      const edgeMove = createTestMove(0, 0) // 端

      // Act
      const centerResult = evaluateMove(centerMove, gameState)
      const edgeResult = evaluateMove(edgeMove, gameState)

      // Assert
      expect(centerResult.frameCount).toBeLessThan(edgeResult.frameCount)
      expect(centerResult.frameScore).toBeGreaterThan(edgeResult.frameScore)
    })

    test('回転するほどフレーム数が増える', () => {
      // Arrange
      const gameState = createTestGameState()
      const move0 = createTestMove(2, 0) // 回転なし
      const move90 = createTestMove(2, 90) // 90度回転
      const move180 = createTestMove(2, 180) // 180度回転

      // Act
      const result0 = evaluateMove(move0, gameState)
      const result90 = evaluateMove(move90, gameState)
      const result180 = evaluateMove(move180, gameState)

      // Assert
      expect(result0.frameCount).toBeLessThan(result90.frameCount)
      expect(result90.frameCount).toBeLessThan(result180.frameCount)
    })

    test('6列目（右端）は追加フレームがかかる', () => {
      // Arrange
      const gameState = createTestGameState()
      const normalMove = createTestMove(4, 0) // 5列目
      const edgeMove = createTestMove(5, 0) // 6列目（右端）

      // Act
      const normalResult = evaluateMove(normalMove, gameState)
      const edgeResult = evaluateMove(edgeMove, gameState)

      // Assert
      expect(edgeResult.frameCount).toBeGreaterThan(normalResult.frameCount)
    })
  })

  describe('ちぎり評価', () => {
    test('縦配置（回転0, 180度）はちぎりなし', () => {
      // Arrange
      const gameState = createTestGameState()
      const verticalMove0 = createTestMove(2, 0) // 上向き
      const verticalMove180 = createTestMove(2, 180) // 下向き

      // Act
      const result0 = evaluateMove(verticalMove0, gameState)
      const result180 = evaluateMove(verticalMove180, gameState)

      // Assert
      expect(result0.tearCount).toBe(0)
      expect(result180.tearCount).toBe(0)
      expect(result0.tearScore).toBe(0)
      expect(result180.tearScore).toBe(0)
    })

    test('横配置で高さ差があるとちぎり判定', () => {
      // Arrange - 高さ差のあるフィールド
      const fieldWithHeightDiff = Array(13)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 列0に高く積む
      for (let y = 8; y < 13; y++) {
        fieldWithHeightDiff[y][0] = 'red'
      }
      // 列1は空（低い）

      const gameState = createTestGameState(fieldWithHeightDiff)
      const horizontalMove = createTestMove(0, 90) // 横配置（高さ差あり）
      const verticalMove = createTestMove(0, 0) // 縦配置

      // Act
      const horizontalResult = evaluateMove(horizontalMove, gameState)
      const verticalResult = evaluateMove(verticalMove, gameState)

      // Assert
      expect(horizontalResult.tearCount).toBeGreaterThan(
        verticalResult.tearCount,
      )
      expect(horizontalResult.tearScore).toBeLessThan(verticalResult.tearScore)
    })

    test('フィールド外への横配置はちぎり扱い', () => {
      // Arrange
      const gameState = createTestGameState()
      const edgeMove270 = createTestMove(0, 270) // 左端から左へ（範囲外）
      const normalMove = createTestMove(2, 0) // 通常配置

      // Act
      const edgeResult = evaluateMove(edgeMove270, gameState)
      const normalResult = evaluateMove(normalMove, gameState)

      // Assert
      expect(edgeResult.tearCount).toBeGreaterThan(normalResult.tearCount)
    })
  })

  describe('効率性評価', () => {
    test('中央配置が効率的', () => {
      // Arrange
      const gameState = createTestGameState()
      const centerMove = createTestMove(2, 0) // 中央
      const edgeMove = createTestMove(0, 0) // 端

      // Act
      const centerResult = evaluateMove(centerMove, gameState)
      const edgeResult = evaluateMove(edgeMove, gameState)

      // Assert
      expect(centerResult.efficiencyScore).toBeGreaterThan(
        edgeResult.efficiencyScore,
      )
    })

    test('低い位置への配置が効率的', () => {
      // Arrange - 一部に既存ぷよがある状態
      const fieldWithPuyos = Array(13)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 列0に既存ぷよ
      for (let y = 8; y < 13; y++) {
        fieldWithPuyos[y][0] = 'red'
      }

      const gameState = createTestGameState(fieldWithPuyos)
      const lowMove = createTestMove(2, 0) // 空の列（低い）
      const highMove = createTestMove(0, 0) // ぷよがある列（高い）

      // Act
      const lowResult = evaluateMove(lowMove, gameState)
      const highResult = evaluateMove(highMove, gameState)

      // Assert
      expect(lowResult.efficiencyScore).toBeGreaterThan(
        highResult.efficiencyScore,
      )
    })

    test('同色隣接配置にボーナス', () => {
      // Arrange - 隣接位置に同色ぷよ
      const fieldWithSameColor = Array(13)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 列2の隣に赤ぷよ
      fieldWithSameColor[12][1] = 'red'
      fieldWithSameColor[12][3] = 'red'

      const gameState = createTestGameState(fieldWithSameColor, 'red', 'blue')
      const adjacentMove = createTestMove(2, 0) // 同色隣接あり
      const isolatedMove = createTestMove(5, 0) // 同色隣接なし

      // Act
      const adjacentResult = evaluateMove(adjacentMove, gameState)
      const isolatedResult = evaluateMove(isolatedMove, gameState)

      // Assert
      expect(adjacentResult.efficiencyScore).toBeGreaterThan(
        isolatedResult.efficiencyScore,
      )
    })
  })

  describe('評価理由生成', () => {
    test('フレーム数に応じた理由が生成される', () => {
      // Arrange
      const gameState = createTestGameState()
      const fastMove = createTestMove(2, 0) // 高速
      const slowMove = createTestMove(5, 180) // 低速

      // Act
      const fastResult = evaluateMove(fastMove, gameState)
      const slowResult = evaluateMove(slowMove, gameState)

      // Assert
      expect(fastResult.reason).toContain('高速配置')
      expect(slowResult.reason).toContain('低速配置')
    })

    test('ちぎりの有無が理由に反映される', () => {
      // Arrange
      const gameState = createTestGameState()
      const noTearMove = createTestMove(2, 0) // ちぎりなし
      const tearMove = createTestMove(0, 270) // ちぎりあり

      // Act
      const noTearResult = evaluateMove(noTearMove, gameState)
      const tearResult = evaluateMove(tearMove, gameState)

      // Assert
      expect(noTearResult.reason).toContain('ちぎりなし')
      expect(tearResult.reason).toContain('ちぎり')
    })

    test('効率性が理由に反映される', () => {
      // Arrange
      const gameState = createTestGameState()
      const efficientMove = createTestMove(2, 0) // 効率的
      const inefficientMove = createTestMove(0, 180) // 非効率

      // Act
      const efficientResult = evaluateMove(efficientMove, gameState)
      const inefficientResult = evaluateMove(inefficientMove, gameState)

      // Assert
      expect(efficientResult.reason).toContain('高効率')
      expect(inefficientResult.reason).toContain('低効率')
    })
  })
})
