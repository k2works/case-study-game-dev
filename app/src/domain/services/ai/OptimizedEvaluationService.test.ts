/**
 * 関数型最適化された評価サービスのテスト
 */
import { describe, expect, it, vi } from 'vitest'

import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import { GamePhase } from '../../models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'
import {
  DEFAULT_OPTIMIZATION_SETTINGS,
  type EvaluationContext,
  basicEvaluation,
  cachedChainEvaluation,
  cachedStrategyEvaluation,
  cachedTreeEvaluation,
  clearCache,
  createCacheState,
  createEvaluationStages,
  evaluateMovesThrottled,
  evaluateProgressive,
  executeProgressiveEvaluation,
  findBestMoves,
  findTopMovesOptimized,
  getCacheStats,
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

  const createTestContext = (
    myField: AIFieldState,
    opponentField: AIFieldState,
  ): EvaluationContext => ({
    myGameState: createTestGameState(myField),
    opponentGameState: createTestGameState(opponentField),
    gamePhase: GamePhase.EARLY,
    settings: DEFAULT_MAYAH_SETTINGS,
    optimizationSettings: DEFAULT_OPTIMIZATION_SETTINGS,
  })

  describe('createCacheState', () => {
    it('新しいキャッシュ状態を作成する', () => {
      // Act
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Assert
      expect(cacheState.fieldCache).toBeDefined()
      expect(cacheState.strategyCache).toBeDefined()
      expect(cacheState.treeCache).toBeDefined()
      expect(cacheState.progressiveCache).toBeDefined()
      expect(cacheState.stats.hits).toBe(0)
      expect(cacheState.stats.misses).toBe(0)
      expect(cacheState.stats.hitRate).toBe(0)
    })
  })

  describe('basicEvaluation', () => {
    it('基本評価を実行する', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const score = basicEvaluation(field)

      // Assert
      expect(score).toBeGreaterThanOrEqual(0)
      expect(typeof score).toBe('number')
    })

    it('ぷよが配置されたフィールドを評価する', () => {
      // Arrange
      const field = createTestField(6, 12)
      setCell(field, 0, 11, 'red')
      setCell(field, 1, 11, 'blue')

      // Act
      const score = basicEvaluation(field)

      // Assert
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('複数回呼び出しても同じ結果を返す（純粋関数）', () => {
      // Arrange
      const field = createTestField(6, 12)
      setCell(field, 0, 11, 'red')

      // Act
      const score1 = basicEvaluation(field)
      const score2 = basicEvaluation(field)

      // Assert
      expect(score1).toBe(score2)
    })
  })

  describe('cachedChainEvaluation', () => {
    it('連鎖評価を実行し新しいキャッシュ状態を返す', () => {
      // Arrange
      const field = createTestField(6, 12)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { result, newCacheState } = cachedChainEvaluation(field, cacheState)

      // Assert
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(newCacheState.stats.misses).toBe(1)
      expect(newCacheState).not.toBe(cacheState) // 新しいオブジェクト
    })

    it('キャッシュヒット時は統計を更新する', () => {
      // Arrange
      const field = createTestField(6, 12)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { newCacheState: cache1 } = cachedChainEvaluation(field, cacheState)
      const { newCacheState: cache2 } = cachedChainEvaluation(field, cache1)

      // Assert
      expect(cache2.stats.hits).toBe(1)
      expect(cache2.stats.misses).toBe(1)
      expect(cache2.stats.hitRate).toBe(0.5)
    })
  })

  describe('cachedStrategyEvaluation', () => {
    it('戦略評価を実行し新しいキャッシュ状態を返す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { result, newCacheState } = cachedStrategyEvaluation(
        context,
        cacheState,
      )

      // Assert
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(newCacheState.stats.misses).toBeGreaterThan(0)
    })
  })

  describe('cachedTreeEvaluation', () => {
    it('連鎖木評価を実行し新しいキャッシュ状態を返す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { result, newCacheState } = cachedTreeEvaluation(
        myField,
        opponentField,
        DEFAULT_MAYAH_SETTINGS,
        cacheState,
      )

      // Assert
      expect(result).toBeDefined()
      expect(result.myTree).toBeDefined()
      expect(newCacheState.stats.misses).toBe(1)
    })
  })

  describe('createEvaluationStages', () => {
    it('評価段階定義を作成する', () => {
      // Act
      const stages = createEvaluationStages(DEFAULT_OPTIMIZATION_SETTINGS)

      // Assert
      expect(stages).toHaveLength(3)
      expect(stages[0].name).toBe('basic')
      expect(stages[1].name).toBe('chain_analysis')
      expect(stages[2].name).toBe('strategy_analysis')
      expect(
        stages.every((stage) => typeof stage.evaluator === 'function'),
      ).toBe(true)
    })
  })

  describe('executeProgressiveEvaluation', () => {
    it('段階的評価を実行する', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const stages = createEvaluationStages(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const result = executeProgressiveEvaluation(context, stages, cacheState)

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.evaluationsUsed.length).toBeGreaterThan(0)
      expect(result.cacheState).toBeDefined()
    })

    it('閾値で評価を早期終了する', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = {
        ...createTestContext(myField, opponentField),
        optimizationSettings: {
          ...DEFAULT_OPTIMIZATION_SETTINGS,
          basicThreshold: 1000, // 非常に高い閾値
        },
      }
      const cacheState = createCacheState(context.optimizationSettings)
      const stages = createEvaluationStages(context.optimizationSettings)

      // Act
      const result = executeProgressiveEvaluation(context, stages, cacheState)

      // Assert
      expect(result.evaluationsUsed).toEqual(['basic']) // 基本評価のみ
    })
  })

  describe('evaluateProgressive', () => {
    it('段階的評価を実行し結果とキャッシュ状態を返す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { result, newCacheState } = evaluateProgressive(context, cacheState)

      // Assert
      expect(result.basic.score).toBeGreaterThanOrEqual(0)
      expect(result.basic.computeTime).toBeGreaterThanOrEqual(0)
      expect(result.evaluationLevels.length).toBeGreaterThan(0)
      expect(result.cacheInfo).toBeDefined()
      expect(newCacheState).not.toBe(cacheState)
    })

    it('高スコア時に詳細評価を実行する', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // 高スコアになるようなフィールドを作成
      setCell(myField, 0, 11, 'red')
      setCell(myField, 0, 10, 'red')
      setCell(myField, 0, 9, 'red')
      setCell(myField, 1, 11, 'blue')

      const context = {
        ...createTestContext(myField, opponentField),
        optimizationSettings: {
          ...DEFAULT_OPTIMIZATION_SETTINGS,
          basicThreshold: 50,
          detailedThreshold: 100,
          treeThreshold: 150,
        },
      }
      const cacheState = createCacheState(context.optimizationSettings)

      // Act
      const { result } = evaluateProgressive(context, cacheState)

      // Assert
      expect(result.detailed).toBeDefined()
      expect(result.detailed?.chainEvaluation).toBeDefined()
      expect(result.detailed?.strategyEvaluation).toBeDefined()
    })

    it('キャッシュヒット時は既存結果を返す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { result: result1, newCacheState: cache1 } = evaluateProgressive(
        context,
        cacheState,
      )
      const { result: result2, newCacheState: cache2 } = evaluateProgressive(
        context,
        cache1,
      )

      // Assert
      expect(result1.cacheInfo.hits).toBe(0)
      expect(result2.cacheInfo.hits).toBeGreaterThan(0)
      expect(cache2.stats.hits).toBeGreaterThan(cache1.stats.hits)
    })
  })

  describe('findBestMoves', () => {
    it('最適手を探索する', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const moves = [
        { x: 0, rotation: 0, score: 0 },
        { x: 1, rotation: 0, score: 0 },
        { x: 2, rotation: 0, score: 0 },
      ]

      // Act
      const bestMoves = findBestMoves(moves, context, cacheState, 2)

      // Assert
      expect(bestMoves.length).toBeLessThanOrEqual(2)
      expect(bestMoves.every((move) => moves.includes(move))).toBe(true)
    })
  })

  describe('evaluateMovesThrottled', () => {
    it('スロットル付きで手の評価を実行する', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const moves = [
        { x: 2, rotation: 0, score: 0 },
        { x: 3, rotation: 1, score: 0 },
      ]

      // Act
      const results = evaluateMovesThrottled(moves, context, cacheState)

      // Assert
      expect(results).toHaveLength(2)
      expect(results[0].move).toEqual(moves[0])
      expect(results[0].result.basic.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findTopMovesOptimized', () => {
    it('最適化された手候補探索を実行する', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const moves = [
        { x: 0, rotation: 0, score: 0 },
        { x: 1, rotation: 0, score: 0 },
        { x: 2, rotation: 0, score: 0 },
        { x: 3, rotation: 0, score: 0 },
        { x: 4, rotation: 0, score: 0 },
      ]

      const quickEvaluator = vi.fn((move) => move.x * 10) // xが大きいほど高スコア

      // Act
      const topMoves = findTopMovesOptimized(
        moves,
        quickEvaluator,
        context,
        cacheState,
        3,
      )

      // Assert
      expect(topMoves.length).toBeGreaterThan(0)
      expect(topMoves.length).toBeLessThanOrEqual(3)
      expect(quickEvaluator).toHaveBeenCalledTimes(5)
    })

    it('手候補が少ない場合の処理', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const moves = [{ x: 2, rotation: 0, score: 0 }]
      const quickEvaluator = () => 50

      // Act
      const topMoves = findTopMovesOptimized(
        moves,
        quickEvaluator,
        context,
        cacheState,
        3,
      )

      // Assert
      expect(topMoves).toHaveLength(1)
      expect(topMoves[0]).toEqual(moves[0])
    })

    it('全ての手が低スコアの場合', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const moves = [
        { x: 0, rotation: 0, score: 0 },
        { x: 1, rotation: 0, score: 0 },
      ]
      const quickEvaluator = () => 0 // 全て0点

      // Act
      const topMoves = findTopMovesOptimized(
        moves,
        quickEvaluator,
        context,
        cacheState,
        2,
      )

      // Assert
      expect(topMoves).toHaveLength(2) // 低スコアでも返される
    })
  })

  describe('getCacheStats', () => {
    it('キャッシュ統計を取得する', () => {
      // Arrange
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const stats = getCacheStats(cacheState)

      // Assert
      expect(stats.fieldCache).toBeDefined()
      expect(stats.strategyCache).toBeDefined()
      expect(stats.treeCache).toBeDefined()
      expect(stats.progressiveCache).toBeDefined()
      expect(stats.overall).toBeDefined()
      expect(stats.overall.hits).toBe(0)
      expect(stats.overall.misses).toBe(0)
    })
  })

  describe('clearCache', () => {
    it('キャッシュクリア後の新しい状態を返す', () => {
      // Arrange
      const originalCacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // 何かをキャッシュに保存
      const myField = createTestField(6, 12)
      const { newCacheState } = cachedChainEvaluation(
        myField,
        originalCacheState,
      )

      // Act
      const clearedCacheState = clearCache(DEFAULT_OPTIMIZATION_SETTINGS)

      // Assert
      expect(clearedCacheState.stats.hits).toBe(0)
      expect(clearedCacheState.stats.misses).toBe(0)
      expect(clearedCacheState).not.toBe(newCacheState) // 新しいオブジェクト
    })
  })

  describe('パフォーマンス特性', () => {
    it('基本評価は高速に完了する（純粋関数）', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const start = performance.now()
      const score = basicEvaluation(field)
      const end = performance.now()

      // Assert
      expect(end - start).toBeLessThan(50) // 50ms以内
      expect(score).toBeGreaterThanOrEqual(0)
    })

    it('段階的評価は効率的に実行される', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const context = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const start = performance.now()
      const { result } = evaluateProgressive(context, cacheState)
      const end = performance.now()

      // Assert
      expect(end - start).toBeLessThan(100) // 100ms以内
      expect(result.basic.computeTime).toBeLessThan(50) // 基本評価は50ms以内
    })
  })

  describe('不変性の確認', () => {
    it('元のキャッシュ状態は変更されない', () => {
      // Arrange
      const originalCacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
      const originalHits = originalCacheState.stats.hits
      const originalMisses = originalCacheState.stats.misses
      const field = createTestField(6, 12)

      // Act
      const { newCacheState } = cachedChainEvaluation(field, originalCacheState)

      // Assert
      expect(originalCacheState.stats.hits).toBe(originalHits)
      expect(originalCacheState.stats.misses).toBe(originalMisses)
      expect(newCacheState.stats.misses).toBe(originalMisses + 1)
      expect(newCacheState).not.toBe(originalCacheState)
    })

    it('評価コンテキストは変更されない', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)
      const originalContext = createTestContext(myField, opponentField)
      const cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)

      // Act
      const { result } = evaluateProgressive(originalContext, cacheState)

      // Assert
      expect(originalContext.myGameState.score).toBe(0) // 変更されていない
      expect(originalContext.gamePhase).toBe(GamePhase.EARLY) // 変更されていない
      expect(result).toBeDefined() // 結果は正常に取得
    })
  })
})
