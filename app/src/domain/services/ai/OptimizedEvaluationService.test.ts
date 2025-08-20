/**
 * 最適化された評価サービスのテスト
 */
import { describe, expect, it, vi } from 'vitest'

import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import { GamePhase } from '../../models/ai/MayahEvaluation'
import {
  DEFAULT_OPTIMIZATION_SETTINGS,
  OptimizedEvaluationService,
  type OptimizedEvaluationSettings,
  evaluateMovesThrottled,
  findTopMovesOptimized,
} from './OptimizedEvaluationService'

describe('OptimizedEvaluationService', () => {
  const createTestField = (width: number, height: number): AIFieldState => ({
    width,
    height,
    cells: Array(height)
      .fill(null)
      .map(() => Array(width).fill(null)),
  })

  const setCell = (
    field: AIFieldState,
    x: number,
    y: number,
    color: string,
  ) => {
    field.cells[y][x] = color as never
  }

  const createTestGameState = (field: AIFieldState): AIGameState => ({
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
  })

  describe('OptimizedEvaluationService', () => {
    it('基本的な段階的評価を実行', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const result = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )

      // Assert
      expect(result.basic.score).toBeGreaterThanOrEqual(0)
      expect(result.basic.computeTime).toBeGreaterThanOrEqual(0)
      expect(result.evaluationLevels.length).toBeGreaterThan(0)
      expect(result.cacheInfo).toBeDefined()
    })

    it('高スコア時に詳細評価を実行', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 高スコアになるようなフィールドを作成
      setCell(myField, 2, 8, 'red')
      setCell(myField, 2, 9, 'red')
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')
      setCell(myField, 3, 9, 'blue')
      setCell(myField, 3, 10, 'blue')
      setCell(myField, 3, 11, 'blue')
      setCell(myField, 4, 11, 'blue')

      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const result = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.MIDDLE,
      )

      // Assert
      expect(result.detailed).toBeDefined()
      expect(result.detailed?.chainEvaluation).toBeDefined()
      expect(result.detailed?.strategyEvaluation).toBeDefined()
      expect(result.evaluationLevels.length).toBeGreaterThan(1)
    })

    it('キャッシュ機能が動作', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const result1 = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )
      const result2 = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )

      // Assert
      expect(result1.cacheInfo.hits).toBe(0) // 初回は全てミス
      expect(result2.cacheInfo.hits).toBeGreaterThan(0) // 2回目はヒットあり
    })

    it('最適化設定のカスタマイズ', () => {
      // Arrange
      const customSettings: OptimizedEvaluationSettings = {
        ...DEFAULT_OPTIMIZATION_SETTINGS,
        basicThreshold: 100,
        detailedThreshold: 200,
        cacheSize: 100,
      }
      const service = new OptimizedEvaluationService(customSettings)
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const result = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )

      // Assert
      expect(result).toBeDefined()
      expect(result.basic.score).toBeGreaterThanOrEqual(0)
    })

    it('キャッシュ統計の取得', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )
      const stats = service.getCacheStats()

      // Assert
      expect(stats.fieldCache).toBeDefined()
      expect(stats.strategyCache).toBeDefined()
      expect(stats.treeCache).toBeDefined()
      expect(stats.overall).toBeDefined()
      expect(stats.overall.hits).toBeGreaterThanOrEqual(0)
      expect(stats.overall.misses).toBeGreaterThanOrEqual(0)
    })

    it('キャッシュクリア機能', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )
      const statsBefore = service.getCacheStats()
      service.clearCache()
      const statsAfter = service.getCacheStats()

      // Assert
      expect(
        statsBefore.overall.hits + statsBefore.overall.misses,
      ).toBeGreaterThan(0)
      expect(statsAfter.overall.hits).toBe(0)
      expect(statsAfter.overall.misses).toBe(0)
    })

    it('段階的評価の早期終了', () => {
      // Arrange
      const service = new OptimizedEvaluationService({
        ...DEFAULT_OPTIMIZATION_SETTINGS,
        basicThreshold: 1000, // 非常に高い閾値
      })
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const result = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )

      // Assert
      expect(result.evaluationLevels).toEqual(['basic']) // 基本評価のみ
      expect(result.detailed).toBeUndefined()
    })
  })

  describe('evaluateMovesThrottled', () => {
    it('スロットル付きで手の評価を実行', () => {
      // Arrange
      const mockEvaluator = vi.fn(() => ({
        basic: { score: 100, computeTime: 10 },
        evaluationLevels: ['basic'],
        cacheInfo: { hits: 0, misses: 1, hitRate: 0 },
      }))

      const moves = [
        { x: 2, rotation: 0, score: 0 },
        { x: 3, rotation: 1, score: 0 },
      ]

      // Act
      const results = evaluateMovesThrottled(moves, mockEvaluator)

      // Assert
      expect(results).toHaveLength(2)
      expect(results[0].move).toEqual(moves[0])
      expect(results[0].result.basic.score).toBe(100)
      expect(mockEvaluator).toHaveBeenCalledTimes(2)
    })
  })

  describe('findTopMovesOptimized', () => {
    it('最適化された手候補探索', () => {
      // Arrange
      const moves = [
        { x: 0, rotation: 0, score: 0 },
        { x: 1, rotation: 0, score: 0 },
        { x: 2, rotation: 0, score: 0 },
        { x: 3, rotation: 0, score: 0 },
        { x: 4, rotation: 0, score: 0 },
      ]

      const quickEvaluator = vi.fn((move) => move.x * 10) // xが大きいほど高スコア
      const detailedEvaluator = vi.fn(() => ({
        basic: { score: 100, computeTime: 10 },
        detailed: {
          chainEvaluation: {} as any,
          strategyEvaluation: { totalScore: 150 } as any,
          computeTime: 20,
        },
        evaluationLevels: ['basic', 'detailed'],
        cacheInfo: { hits: 0, misses: 1, hitRate: 0 },
      }))

      // Act
      const topMoves = findTopMovesOptimized(
        moves,
        quickEvaluator,
        detailedEvaluator,
        3,
      )

      // Assert
      expect(topMoves.length).toBeGreaterThan(0) // 結果が返される
      expect(quickEvaluator).toHaveBeenCalledTimes(5) // 全ての手を基本評価
      expect(detailedEvaluator).toHaveBeenCalled() // 詳細評価が呼ばれる
    })

    it('手候補が少ない場合の処理', () => {
      // Arrange
      const moves = [{ x: 2, rotation: 0, score: 0 }]
      const quickEvaluator = () => 50
      const detailedEvaluator = () => ({
        basic: { score: 50, computeTime: 5 },
        evaluationLevels: ['basic'],
        cacheInfo: { hits: 0, misses: 1, hitRate: 0 },
      })

      // Act
      const topMoves = findTopMovesOptimized(
        moves,
        quickEvaluator,
        detailedEvaluator,
        3,
      )

      // Assert
      expect(topMoves).toHaveLength(1)
      expect(topMoves[0]).toEqual(moves[0])
    })

    it('全ての手が低スコアの場合', () => {
      // Arrange
      const moves = [
        { x: 0, rotation: 0, score: 0 },
        { x: 1, rotation: 0, score: 0 },
      ]
      const quickEvaluator = () => 0 // 全て0点
      const detailedEvaluator = () => ({
        basic: { score: 0, computeTime: 5 },
        evaluationLevels: ['basic'],
        cacheInfo: { hits: 0, misses: 1, hitRate: 0 },
      })

      // Act
      const topMoves = findTopMovesOptimized(
        moves,
        quickEvaluator,
        detailedEvaluator,
        2,
      )

      // Assert
      expect(topMoves).toHaveLength(2) // 低スコアでも返される
    })
  })

  describe('パフォーマンス特性', () => {
    it('基本評価は高速に完了', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const start = performance.now()
      const result = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )
      const end = performance.now()

      // Assert
      expect(end - start).toBeLessThan(100) // 100ms以内
      expect(result.basic.computeTime).toBeLessThan(50) // 基本評価は50ms以内
    })

    it('キャッシュヒット時は更に高速', () => {
      // Arrange
      const service = new OptimizedEvaluationService()
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const myGameState = createTestGameState(myField)
      const opponentGameState = createTestGameState(opponentField)

      // Act
      const result1 = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )
      const start = performance.now()
      const result2 = service.evaluateProgressive(
        myGameState,
        opponentGameState,
        GamePhase.EARLY,
      )
      const end = performance.now()

      // Assert
      expect(end - start).toBeLessThan(result1.basic.computeTime) // キャッシュの方が高速
      expect(result2.cacheInfo.hits).toBeGreaterThan(0)
    })
  })
})
