/**
 * 最適化された評価サービス
 * パフォーマンス向上版mayah AI評価システム
 */
import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import type {
  ChainEvaluation,
  GamePhase,
  MayahEvaluationSettings,
  RensaHandTree,
  StrategyEvaluation,
} from '../../models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'
import type { AIMove as Move } from '../../models/ai/MoveTypes'
import { evaluateChain } from './ChainEvaluationService'
import {
  type LRUCache,
  LRUCache as LRUCacheClass,
  findOptimal,
  generateFieldHash,
  memoize,
  progressiveEvaluation,
} from './PerformanceOptimizer'
import {
  type ChainSearchSettings,
  DEFAULT_CHAIN_SEARCH_SETTINGS,
  buildRensaHandTree,
} from './RensaHandTreeService'
import { evaluateStrategy } from './StrategyEvaluationService'

/**
 * 最適化された評価結果
 */
export interface OptimizedEvaluationResult {
  /** 基本評価 */
  basic: {
    score: number
    computeTime: number
  }
  /** 詳細評価（必要時のみ） */
  detailed?: {
    chainEvaluation: ChainEvaluation
    strategyEvaluation: StrategyEvaluation
    rensaHandTree?: RensaHandTree
    computeTime: number
  }
  /** 使用された評価段階 */
  evaluationLevels: string[]
  /** キャッシュヒット情報 */
  cacheInfo: {
    hits: number
    misses: number
    hitRate: number
  }
}

/**
 * 評価設定
 */
export interface OptimizedEvaluationSettings {
  /** 基本評価のみで十分な閾値 */
  basicThreshold: number
  /** 詳細評価を行う閾値 */
  detailedThreshold: number
  /** RensaHandTree構築を行う閾値 */
  treeThreshold: number
  /** キャッシュサイズ */
  cacheSize: number
  /** キャッシュTTL（ミリ秒） */
  cacheTTL: number
  /** 並列処理の同時実行数 */
  concurrency: number
  /** デバウンス時間（ミリ秒） */
  debounceTime: number
}

/**
 * デフォルト最適化設定
 */
export const DEFAULT_OPTIMIZATION_SETTINGS: OptimizedEvaluationSettings = {
  basicThreshold: 300,
  detailedThreshold: 500,
  treeThreshold: 700,
  cacheSize: 500,
  cacheTTL: 15000,
  concurrency: 4,
  debounceTime: 50,
}

/**
 * 最適化された評価サービス
 */
export class OptimizedEvaluationService {
  private fieldCache: LRUCache<string, ChainEvaluation>
  private strategyCache: LRUCache<string, StrategyEvaluation>
  private treeCache: LRUCache<string, RensaHandTree>
  private settings: OptimizedEvaluationSettings
  private cacheStats = { hits: 0, misses: 0 }

  constructor(
    settings: OptimizedEvaluationSettings = DEFAULT_OPTIMIZATION_SETTINGS,
  ) {
    this.settings = settings

    this.fieldCache = new LRUCacheClass(settings.cacheSize, settings.cacheTTL)
    this.strategyCache = new LRUCacheClass(
      settings.cacheSize,
      settings.cacheTTL,
    )
    this.treeCache = new LRUCacheClass(
      Math.floor(settings.cacheSize / 2),
      settings.cacheTTL,
    )
  }

  /**
   * 段階的評価実行
   */
  evaluateProgressive = memoize(
    (
      myGameState: AIGameState,
      opponentGameState: AIGameState,
      gamePhase: GamePhase,
      mayahSettings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
    ): OptimizedEvaluationResult => {
      const startTime = performance.now()
      // フィールドハッシュはキー生成で使用される

      // 段階的評価定義
      const evaluators = [
        {
          name: 'basic',
          evaluator: () => this.basicEvaluation(myGameState.field),
          threshold: this.settings.basicThreshold,
          weight: 1.0,
        },
        {
          name: 'chain_analysis',
          evaluator: () => this.chainEvaluation(myGameState.field).totalScore,
          threshold: this.settings.detailedThreshold,
          weight: 1.5,
        },
        {
          name: 'strategy_analysis',
          evaluator: () =>
            this.strategyEvaluation(
              myGameState,
              opponentGameState,
              gamePhase,
              mayahSettings,
            ).totalScore,
          threshold: this.settings.treeThreshold,
          weight: 2.0,
        },
      ]

      const progressiveResult = progressiveEvaluation(
        { myGameState, opponentGameState, gamePhase },
        evaluators,
      )

      const basicComputeTime = performance.now() - startTime

      let detailed: OptimizedEvaluationResult['detailed']

      // 詳細評価が必要な場合
      if (progressiveResult.evaluationsUsed.includes('strategy_analysis')) {
        const detailedStart = performance.now()

        const myChainEval = this.chainEvaluation(myGameState.field)
        // 対戦相手の連鎖評価は戦略評価内で使用される

        const strategyEval = this.strategyEvaluation(
          myGameState,
          opponentGameState,
          gamePhase,
          mayahSettings,
        )

        let rensaHandTree: RensaHandTree | undefined
        if (progressiveResult.score >= this.settings.treeThreshold) {
          rensaHandTree = this.treeEvaluation(
            myGameState.field,
            opponentGameState.field,
            mayahSettings,
          )
        }

        detailed = {
          chainEvaluation: myChainEval,
          strategyEvaluation: strategyEval,
          rensaHandTree,
          computeTime: performance.now() - detailedStart,
        }
      }

      return {
        basic: {
          score: progressiveResult.score,
          computeTime: basicComputeTime,
        },
        detailed,
        evaluationLevels: progressiveResult.evaluationsUsed,
        cacheInfo: {
          hits: this.cacheStats.hits,
          misses: this.cacheStats.misses,
          hitRate:
            this.cacheStats.hits + this.cacheStats.misses > 0
              ? this.cacheStats.hits /
                (this.cacheStats.hits + this.cacheStats.misses)
              : 0,
        },
      }
    },
    (myGameState, opponentGameState, gamePhase) => {
      return `${generateFieldHash(myGameState.field)}-${generateFieldHash(
        opponentGameState.field,
      )}-${gamePhase}`
    },
  )

  /**
   * 基本評価（最軽量）
   */
  private basicEvaluation(field: AIFieldState): number {
    let score = 0

    // 高さバランス（軽量計算）
    const heights = []
    for (let x = 0; x < field.width; x++) {
      let height = 0
      for (let y = 0; y < field.height; y++) {
        if (field.cells[y][x] !== null) {
          height = field.height - y
          break
        }
      }
      heights.push(height)
    }

    // 高さの標準偏差（簡易版）
    const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length
    const variance =
      heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) /
      heights.length
    score += Math.max(0, 50 - Math.sqrt(variance) * 10)

    // 空きスペース
    let emptySpaces = 0
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (field.cells[y][x] === null) emptySpaces++
      }
    }
    score += (emptySpaces / (field.width * field.height)) * 100

    return score
  }

  /**
   * 連鎖評価（キャッシュ付き）
   */
  private chainEvaluation(field: AIFieldState): ChainEvaluation {
    const fieldHash = generateFieldHash(field)
    const cached = this.fieldCache.get(fieldHash)

    if (cached) {
      this.cacheStats.hits++
      return cached
    }

    this.cacheStats.misses++
    const evaluation = evaluateChain(field)
    this.fieldCache.set(fieldHash, evaluation)
    return evaluation
  }

  /**
   * 戦略評価（キャッシュ付き）
   */
  private strategyEvaluation(
    myGameState: AIGameState,
    opponentGameState: AIGameState,
    gamePhase: GamePhase,
    settings: MayahEvaluationSettings,
  ): StrategyEvaluation {
    const key = `${generateFieldHash(myGameState.field)}-${generateFieldHash(
      opponentGameState.field,
    )}-${gamePhase}`
    const cached = this.strategyCache.get(key)

    if (cached) {
      this.cacheStats.hits++
      return cached
    }

    this.cacheStats.misses++
    const myChainEval = this.chainEvaluation(myGameState.field)
    const opponentChainEval = this.chainEvaluation(opponentGameState.field)

    const evaluation = evaluateStrategy(
      myGameState,
      opponentGameState,
      myChainEval,
      opponentChainEval,
      undefined,
      gamePhase,
      settings,
    )

    this.strategyCache.set(key, evaluation)
    return evaluation
  }

  /**
   * 連鎖木評価（キャッシュ付き・軽量設定）
   */
  private treeEvaluation(
    myField: AIFieldState,
    opponentField: AIFieldState,
    settings: MayahEvaluationSettings,
  ): RensaHandTree {
    const key = `${generateFieldHash(myField)}-${generateFieldHash(opponentField)}`
    const cached = this.treeCache.get(key)

    if (cached) {
      this.cacheStats.hits++
      return cached
    }

    this.cacheStats.misses++

    // 軽量設定で実行
    const lightSettings: ChainSearchSettings = {
      ...DEFAULT_CHAIN_SEARCH_SETTINGS,
      maxDepth: 5, // 通常の8から5に削減
      maxNodes: 500, // 通常の1000から500に削減
      timeLimit: 2000, // 通常の5000から2000に削減
    }

    const result = buildRensaHandTree(
      myField,
      opponentField,
      settings,
      lightSettings,
    )
    this.treeCache.set(key, result.tree)
    return result.tree
  }

  /**
   * 最適手の高速探索
   */
  findBestMoves(
    moves: Move[],
    evaluator: (move: Move) => OptimizedEvaluationResult,
    maxMoves: number = 3,
  ): Move[] {
    // 段階的評価で早期フィルタリング
    const quickScored = moves.map((move) => ({
      move,
      basicScore: evaluator(move).basic.score,
    }))

    // 基本スコアでソートして上位のみ詳細評価
    const topCandidates = quickScored
      .sort((a, b) => b.basicScore - a.basicScore)
      .slice(0, Math.min(maxMoves * 2, moves.length))

    // 詳細評価
    const detailedScored = topCandidates.map(({ move }) => ({
      move,
      evaluation: evaluator(move),
    }))

    return detailedScored
      .sort((a, b) => {
        const aScore =
          a.evaluation.detailed?.strategyEvaluation.totalScore ??
          a.evaluation.basic.score
        const bScore =
          b.evaluation.detailed?.strategyEvaluation.totalScore ??
          b.evaluation.basic.score
        return bScore - aScore
      })
      .slice(0, maxMoves)
      .map(({ move }) => move)
  }

  /**
   * キャッシュ統計取得
   */
  getCacheStats(): {
    fieldCache: { size: number; hitRate: number }
    strategyCache: { size: number; hitRate: number }
    treeCache: { size: number; hitRate: number }
    overall: { hits: number; misses: number; hitRate: number }
  } {
    return {
      fieldCache: this.fieldCache.getStats(),
      strategyCache: this.strategyCache.getStats(),
      treeCache: this.treeCache.getStats(),
      overall: {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRate:
          this.cacheStats.hits + this.cacheStats.misses > 0
            ? this.cacheStats.hits /
              (this.cacheStats.hits + this.cacheStats.misses)
            : 0,
      },
    }
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.fieldCache.clear()
    this.strategyCache.clear()
    this.treeCache.clear()
    this.cacheStats = { hits: 0, misses: 0 }
  }
}

/**
 * スロットル付き一括評価
 */
export const evaluateMovesThrottled = (
  moves: Move[],
  evaluator: (move: Move) => OptimizedEvaluationResult,
): Array<{ move: Move; result: OptimizedEvaluationResult }> => {
  return moves.map((move) => ({
    move,
    result: evaluator(move),
  }))
}

/**
 * 高速手候補探索
 */
export const findTopMovesOptimized = (
  moves: Move[],
  quickEvaluator: (move: Move) => number,
  detailedEvaluator: (move: Move) => OptimizedEvaluationResult,
  topN: number = 5,
): Move[] => {
  // 1. 基本評価で大幅フィルタリング
  const quickResults = moves.map((move) => ({
    move,
    score: quickEvaluator(move),
  }))

  // 2. 上位候補のみ選別
  const topCandidates = findOptimal(
    quickResults,
    (item) => item.score,
    undefined, // 閾値なし、全体を評価
  )

  if (!topCandidates) return []

  const candidateThreshold = topCandidates.score * 0.7 // 上位の70%以上のスコア
  const viableCandidates = quickResults
    .filter((item) => item.score >= candidateThreshold)
    .slice(0, topN * 2) // 最大でもtopNの2倍まで

  // 3. 詳細評価
  const detailedResults = viableCandidates.map((candidate) => ({
    move: candidate.move,
    evaluation: detailedEvaluator(candidate.move),
  }))

  // 4. 最終ソート
  return detailedResults
    .sort((a, b) => {
      const aScore =
        a.evaluation.detailed?.strategyEvaluation.totalScore ??
        a.evaluation.basic.score
      const bScore =
        b.evaluation.detailed?.strategyEvaluation.totalScore ??
        b.evaluation.basic.score
      return bScore - aScore
    })
    .slice(0, topN)
    .map((result) => result.move)
}
