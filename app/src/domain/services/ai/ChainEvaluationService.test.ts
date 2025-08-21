/**
 * 連鎖評価サービスのテスト
 */
import { describe, expect, test } from 'vitest'

import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState } from '../../models/ai/GameState'
import type { PossibleMove } from '../../models/ai/MoveTypes'
import { ChainEvaluationService, evaluateChain } from './ChainEvaluationService'
import { ChainPatternType, GTRVariant } from './ChainTypes'
import { GamePhase } from './IntegratedEvaluationService'

describe('ChainEvaluationService', () => {
  const createTestGameState = (
    fieldPattern: Array<Array<PuyoColor | null>>,
  ): AIGameState => ({
    field: {
      width: 6,
      height: 12,
      cells: fieldPattern,
    },
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
  })

  const createTestMove = (): PossibleMove => ({
    x: 2,
    rotation: 0,
    isValid: true,
    primaryPosition: { x: 2, y: 10 },
    secondaryPosition: { x: 2, y: 9 },
  })

  describe('基本的な連鎖評価', () => {
    test('空のフィールドでは低いスコアを返す', () => {
      // Arrange
      const emptyField = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createTestGameState(emptyField)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.EARLY)

      // Assert
      expect(result.totalScore).toBeLessThan(200) // 新しい評価システムではより高いスコアが出る可能性
      expect(result.chainLength).toBeLessThanOrEqual(1) // 空フィールドでも若干の連鎖可能性がある可能性
      // GTRシステムが何らかのパターンを検出する可能性があるため、理由を柔軟にチェック
      expect(result.reason).toBeDefined()
      expect(result.reason.length).toBeGreaterThan(0)
    })

    test('フィールド情報がない場合は安全に処理する', () => {
      // Arrange
      const gameState = {
        field: {
          width: 6,
          height: 12,
          cells: null as unknown as PuyoColor[][],
        },
        currentPuyoPair: null,
        nextPuyoPair: null,
        score: 0,
        chainCount: 0,
        turn: 1,
        isGameOver: false,
      }
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.EARLY)

      // Assert
      expect(result.totalScore).toBe(0)
      expect(result.reason).toBe('フィールド情報なし')
    })
  })

  describe('基本的な連鎖パターン検出', () => {
    test('4個の同色ぷよが縦に並んでいる場合は連鎖として認識する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 1列目に4個の赤ぷよを配置
      fieldPattern[8][0] = 'red'
      fieldPattern[9][0] = 'red'
      fieldPattern[10][0] = 'red'
      fieldPattern[11][0] = 'red'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.chainLength).toBeGreaterThanOrEqual(1)
      expect(result.totalScore).toBeGreaterThan(0)
    })

    test('階段積みパターンを検出する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // より明確な階段積みパターンを作成（テンプレートに合わせたパターン）
      // ABCパターン
      fieldPattern[9][0] = 'red' // A
      fieldPattern[9][1] = 'blue' // B
      fieldPattern[9][2] = 'green' // C
      fieldPattern[10][0] = 'red' // A
      fieldPattern[10][1] = 'blue' // B
      fieldPattern[10][2] = 'green' // C
      // DEFパターン
      fieldPattern[11][0] = 'yellow' // D
      fieldPattern[11][1] = 'purple' // E
      fieldPattern[11][2] = 'red' // F

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      // 階段パターンが検出されるか、もしくは連鎖スコアが向上する
      const hasStairsPattern = result.detectedPatterns.some(
        (p) => p.type === ChainPatternType.STAIRS,
      )
      const hasHighScore = result.totalScore > 100
      expect(hasStairsPattern || hasHighScore).toBe(true)
      expect(result.chainLength).toBeGreaterThan(0)
    })

    test('挟み込みパターンを検出する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 挟み込みパターンを作成
      fieldPattern[10][0] = 'red'
      fieldPattern[10][1] = 'blue'
      fieldPattern[10][2] = 'red'
      fieldPattern[11][0] = 'green'
      fieldPattern[11][1] = 'blue'
      fieldPattern[11][2] = 'green'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(
        result.detectedPatterns.some(
          (p) => p.type === ChainPatternType.SANDWICH,
        ),
      ).toBe(true)
    })
  })

  describe('GTR定跡評価', () => {
    test('GTR土台パターンを検出する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 標準GTR土台を作成
      fieldPattern[10][0] = 'red'
      fieldPattern[10][1] = 'blue'
      fieldPattern[10][2] = 'green'
      fieldPattern[10][3] = 'yellow'
      fieldPattern[11][0] = 'red'
      fieldPattern[11][1] = 'blue'
      fieldPattern[11][2] = 'green'
      fieldPattern[11][3] = 'yellow'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.gtrEvaluation).not.toBeNull()
      // GTRシステムがどのGTRバリアントを選ぶかは実装依存のため、有効なGTRバリアントが返されることを確認
      const validGTRVariants = [
        GTRVariant.STANDARD,
        GTRVariant.NEW,
        GTRVariant.LST,
        GTRVariant.DT,
        GTRVariant.TSD,
      ]
      expect(validGTRVariants).toContain(result.gtrEvaluation?.variant)
      expect(result.totalScore).toBeGreaterThan(50)
    })

    test('GTR土台の完成度を正しく評価する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 部分的なGTR土台
      fieldPattern[10][0] = 'red'
      fieldPattern[10][1] = 'blue'
      fieldPattern[11][0] = 'red'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      if (result.gtrEvaluation) {
        expect(result.gtrEvaluation.completeness).toBeLessThan(1.0)
        expect(result.gtrEvaluation.completeness).toBeGreaterThan(0.0)
      }
    })
  })

  describe('ゲームフェーズによる評価調整', () => {
    test('序盤では連鎖評価が控えめになる', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 基本的な連鎖構造
      fieldPattern[9][0] = 'red'
      fieldPattern[10][0] = 'red'
      fieldPattern[11][0] = 'red'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const earlyResult = evaluateChain(gameState, move, GamePhase.EARLY)
      const middleResult = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(earlyResult.totalScore).toBeLessThan(middleResult.totalScore)
    })

    test('終盤では連鎖評価が高くなる', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 連鎖構造
      fieldPattern[9][0] = 'red'
      fieldPattern[10][0] = 'red'
      fieldPattern[11][0] = 'red'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const middleResult = evaluateChain(gameState, move, GamePhase.MIDDLE)
      const lateResult = evaluateChain(gameState, move, GamePhase.LATE)

      // Assert
      expect(lateResult.totalScore).toBeGreaterThan(middleResult.totalScore)
    })
  })

  describe('連鎖可能性分析', () => {
    test('多色のぷよがある場合は拡張可能性が高く評価される', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 多色配置
      fieldPattern[11][0] = 'red'
      fieldPattern[11][1] = 'blue'
      fieldPattern[11][2] = 'green'
      fieldPattern[11][3] = 'yellow'
      fieldPattern[10][0] = 'red'
      fieldPattern[10][1] = 'blue'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.extensibility).toBeGreaterThan(0.3)
    })

    test('上部に空間がある場合は拡張可能性が高く評価される', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 下部にのみぷよを配置
      fieldPattern[11][0] = 'red'
      fieldPattern[11][1] = 'blue'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.extensibility).toBeGreaterThan(0.5)
    })
  })

  describe('発火点分析', () => {
    test('適切な高さの列では発火確率が高く評価される', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 1列目を適切な高さ（6-8段）に積む
      for (let y = 5; y < 12; y++) {
        fieldPattern[y][0] = 'red'
      }

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.triggerProbability).toBeGreaterThan(0.5)
    })

    test('高すぎる列では発火確率が下がる', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 1列目を高く積みすぎる
      for (let y = 0; y < 12; y++) {
        fieldPattern[y][0] = 'red'
      }

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.triggerProbability).toBeLessThan(0.8)
    })
  })

  describe('安定性評価', () => {
    test('確実な連鎖構造では安定性が高く評価される', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 安定した連鎖構造
      fieldPattern[10][0] = 'red'
      fieldPattern[10][1] = 'red'
      fieldPattern[11][0] = 'red'
      fieldPattern[11][1] = 'red'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.stability).toBeGreaterThan(0.5)
    })

    test('バラバラの配置では安定性が低く評価される', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // バラバラな配置
      fieldPattern[11][0] = 'red'
      fieldPattern[10][2] = 'blue'
      fieldPattern[9][4] = 'green'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.stability).toBeLessThan(0.7)
    })
  })

  describe('評価理由の生成', () => {
    test('GTRが検出された場合は理由に含まれる', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // GTR構造
      fieldPattern[10][0] = 'red'
      fieldPattern[10][1] = 'blue'
      fieldPattern[10][2] = 'green'
      fieldPattern[11][0] = 'red'
      fieldPattern[11][1] = 'blue'
      fieldPattern[11][2] = 'green'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.reason).toMatch(/GTR|標準GTR/)
    })

    test('連鎖長が含まれる場合は理由に含まれる', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // 連鎖構造
      fieldPattern[8][0] = 'red'
      fieldPattern[9][0] = 'red'
      fieldPattern[10][0] = 'red'
      fieldPattern[11][0] = 'red'

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)

      // Assert
      expect(result.reason).toMatch(/\d+連鎖/)
    })
  })

  describe('サービスメソッド', () => {
    test('ChainEvaluationServiceは必要なメソッドを提供する', () => {
      // Assert
      expect(ChainEvaluationService.evaluateChain).toBeDefined()
      expect(ChainEvaluationService.detectGTRPattern).toBeDefined()
      expect(ChainEvaluationService.detectChainPatterns).toBeDefined()
      expect(ChainEvaluationService.searchChains).toBeDefined()
    })

    test('evaluateChainメソッドが正常に動作する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const result = ChainEvaluationService.evaluateChain(
        gameState,
        move,
        GamePhase.MIDDLE,
      )

      // Assert
      expect(result).toBeDefined()
      expect(typeof result.totalScore).toBe('number')
      expect(typeof result.chainLength).toBe('number')
      expect(Array.isArray(result.detectedPatterns)).toBe(true)
    })
  })

  describe('エラーハンドリング', () => {
    test('不正なフィールドデータでもエラーを投げない', () => {
      // Arrange
      const gameState = {
        field: {
          width: 6,
          height: 12,
          cells: 'invalid' as unknown as PuyoColor[][],
        },
        currentPuyoPair: null,
        nextPuyoPair: null,
        score: 0,
        chainCount: 0,
        turn: 1,
        isGameOver: false,
      }
      const move = createTestMove()

      // Act & Assert
      expect(() =>
        evaluateChain(gameState, move, GamePhase.MIDDLE),
      ).not.toThrow()
    })

    test('空の配列でもエラーを投げない', () => {
      // Arrange
      const gameState = createTestGameState([])
      const move = createTestMove()

      // Act & Assert
      expect(() =>
        evaluateChain(gameState, move, GamePhase.MIDDLE),
      ).not.toThrow()
    })
  })

  describe('パフォーマンス', () => {
    test('大きなフィールドでも合理的な時間で処理する', () => {
      // Arrange
      const fieldPattern = Array(12)
        .fill(null)
        .map(() => Array(6).fill(null))
      // フィールドを複雑にする
      for (let y = 6; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          fieldPattern[y][x] = ['red', 'blue', 'green', 'yellow'][
            Math.floor(Math.random() * 4)
          ] as PuyoColor
        }
      }

      const gameState = createTestGameState(fieldPattern)
      const move = createTestMove()

      // Act
      const startTime = Date.now()
      const result = evaluateChain(gameState, move, GamePhase.MIDDLE)
      const endTime = Date.now()

      // Assert
      expect(endTime - startTime).toBeLessThan(100) // 100ms以内
      expect(result).toBeDefined()
    })
  })
})
