/**
 * 最適化された評価サービス
 * 純粋関数による実装、副作用の排除、イミュータブルデータ
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import type {
  ChainEvaluation,
  GamePhase,
  MayahEvaluationSettings,
  RensaHandTree,
  StrategyEvaluation,
} from '../../models/ai/MayahEvaluation'
import type { AIMove as Move } from '../../models/ai/MoveTypes'
import { evaluateChain } from './ChainEvaluationService'
import {
  type LRUCache,
  LRUCache as LRUCacheClass,
  findOptimal,
  generateFieldHash,
} from './PerformanceOptimizer'
import {
  type ChainSearchSettings,
  DEFAULT_CHAIN_SEARCH_SETTINGS,
  buildRensaHandTree,
} from './RensaHandTreeService'
import { evaluateStrategy } from './StrategyEvaluationService'

/**
 * 評価コンテキスト（不変データ）
 */
export interface EvaluationContext {
  readonly myGameState: AIGameState
  readonly opponentGameState: AIGameState
  readonly gamePhase: GamePhase
  readonly settings: MayahEvaluationSettings
  readonly optimizationSettings: OptimizedEvaluationSettings
}

/**
 * キャッシュ状態（不変データ）
 */
export interface CacheState {
  readonly fieldCache: LRUCache<string, ChainEvaluation>
  readonly strategyCache: LRUCache<string, StrategyEvaluation>
  readonly treeCache: LRUCache<string, RensaHandTree>
  readonly progressiveCache: LRUCache<string, OptimizedEvaluationResult>
  readonly stats: CacheStats
}

/**
 * キャッシュ統計（不変データ）
 */
export interface CacheStats {
  readonly hits: number
  readonly misses: number
  readonly hitRate: number
}

/**
 * 評価結果（不変データ）
 */
export interface OptimizedEvaluationResult {
  readonly basic: {
    readonly score: number
    readonly computeTime: number
  }
  readonly detailed?: {
    readonly chainEvaluation: ChainEvaluation
    readonly strategyEvaluation: StrategyEvaluation
    readonly rensaHandTree?: RensaHandTree
    readonly computeTime: number
  }
  readonly evaluationLevels: readonly string[]
  readonly cacheInfo: CacheStats
}

/**
 * 評価設定（不変データ）
 */
export interface OptimizedEvaluationSettings {
  readonly basicThreshold: number
  readonly detailedThreshold: number
  readonly treeThreshold: number
  readonly cacheSize: number
  readonly cacheTTL: number
  readonly concurrency: number
  readonly debounceTime: number
}

/**
 * 評価段階定義
 */
export interface EvaluationStage {
  readonly name: string
  readonly evaluator: (
    context: EvaluationContext,
    cacheState: CacheState,
  ) => number
  readonly threshold: number
  readonly weight: number
}

/**
 * 段階的評価結果
 */
export interface ProgressiveResult {
  readonly score: number
  readonly evaluationsUsed: readonly string[]
  readonly cacheState: CacheState
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
} as const

// =============================================================================
// 純粋関数群
// =============================================================================

/**
 * 新しいキャッシュ状態を作成
 */
export const createCacheState = (
  settings: OptimizedEvaluationSettings,
): CacheState => ({
  fieldCache: new LRUCacheClass(settings.cacheSize, settings.cacheTTL),
  strategyCache: new LRUCacheClass(settings.cacheSize, settings.cacheTTL),
  treeCache: new LRUCacheClass(
    Math.floor(settings.cacheSize / 2),
    settings.cacheTTL,
  ),
  progressiveCache: new LRUCacheClass(settings.cacheSize, settings.cacheTTL),
  stats: { hits: 0, misses: 0, hitRate: 0 },
})

/**
 * キャッシュ統計を更新（新しい状態を返す）
 */
const updateCacheStats = (stats: CacheStats, isHit: boolean): CacheStats => {
  const newHits = stats.hits + (isHit ? 1 : 0)
  const newMisses = stats.misses + (isHit ? 0 : 1)
  const total = newHits + newMisses

  return {
    hits: newHits,
    misses: newMisses,
    hitRate: total > 0 ? newHits / total : 0,
  }
}

/**
 * キャッシュ状態を更新（新しい状態を返す）
 */
const updateCacheState = (
  cacheState: CacheState,
  isHit: boolean,
): CacheState => ({
  ...cacheState,
  stats: updateCacheStats(cacheState.stats, isHit),
})

/**
 * キャッシュキー生成
 */
const generateCacheKey = (
  myField: AIFieldState,
  opponentField: AIFieldState,
  gamePhase: GamePhase,
): string =>
  `${generateFieldHash(myField)}-${generateFieldHash(opponentField)}-${gamePhase}`

/**
 * 基本評価（純粋関数）
 */
export const basicEvaluation = (field: AIFieldState): number => {
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
 * キャッシュ付き連鎖評価（純粋関数型）
 */
export const cachedChainEvaluation = (
  field: AIFieldState,
  cacheState: CacheState,
): { result: ChainEvaluation; newCacheState: CacheState } => {
  const fieldHash = generateFieldHash(field)
  const cached = cacheState.fieldCache.get(fieldHash)

  if (cached) {
    return {
      result: cached,
      newCacheState: updateCacheState(cacheState, true),
    }
  }

  const evaluation = evaluateChain(field)
  cacheState.fieldCache.set(fieldHash, evaluation)

  return {
    result: evaluation,
    newCacheState: updateCacheState(cacheState, false),
  }
}

/**
 * キャッシュ付き戦略評価（純粋関数型）
 */
export const cachedStrategyEvaluation = (
  context: EvaluationContext,
  cacheState: CacheState,
): { result: StrategyEvaluation; newCacheState: CacheState } => {
  const key = generateCacheKey(
    context.myGameState.field,
    context.opponentGameState.field,
    context.gamePhase,
  )
  const cached = cacheState.strategyCache.get(key)

  if (cached) {
    return {
      result: cached,
      newCacheState: updateCacheState(cacheState, true),
    }
  }

  // 連鎖評価を取得（キャッシュ状態は更新しない - 読み取り専用）
  const { result: myChainEval } = cachedChainEvaluation(
    context.myGameState.field,
    cacheState,
  )
  const { result: opponentChainEval } = cachedChainEvaluation(
    context.opponentGameState.field,
    cacheState,
  )

  const evaluation = evaluateStrategy(
    context.myGameState,
    context.opponentGameState,
    myChainEval,
    opponentChainEval,
    undefined,
    context.gamePhase,
    context.settings,
  )

  cacheState.strategyCache.set(key, evaluation)

  return {
    result: evaluation,
    newCacheState: updateCacheState(cacheState, false),
  }
}

/**
 * キャッシュ付き連鎖木評価（純粋関数型）
 */
export const cachedTreeEvaluation = (
  myField: AIFieldState,
  opponentField: AIFieldState,
  settings: MayahEvaluationSettings,
  cacheState: CacheState,
): { result: RensaHandTree; newCacheState: CacheState } => {
  const key = `${generateFieldHash(myField)}-${generateFieldHash(opponentField)}`
  const cached = cacheState.treeCache.get(key)

  if (cached) {
    return {
      result: cached,
      newCacheState: updateCacheState(cacheState, true),
    }
  }

  // 軽量設定で実行
  const lightSettings: ChainSearchSettings = {
    ...DEFAULT_CHAIN_SEARCH_SETTINGS,
    maxDepth: 5,
    maxNodes: 500,
    timeLimit: 2000,
  }

  const result = buildRensaHandTree(
    myField,
    opponentField,
    settings,
    lightSettings,
  )

  cacheState.treeCache.set(key, result.tree)

  return {
    result: result.tree,
    newCacheState: updateCacheState(cacheState, false),
  }
}

/**
 * 評価段階定義を作成
 */
export const createEvaluationStages = (
  settings: OptimizedEvaluationSettings,
): readonly EvaluationStage[] =>
  [
    {
      name: 'basic',
      evaluator: (context) => basicEvaluation(context.myGameState.field),
      threshold: settings.basicThreshold,
      weight: 1.0,
    },
    {
      name: 'chain_analysis',
      evaluator: (context, cacheState) => {
        const { result } = cachedChainEvaluation(
          context.myGameState.field,
          cacheState,
        )
        return result.totalScore
      },
      threshold: settings.detailedThreshold,
      weight: 1.5,
    },
    {
      name: 'strategy_analysis',
      evaluator: (context, cacheState) => {
        const { result } = cachedStrategyEvaluation(context, cacheState)
        return result.totalScore
      },
      threshold: settings.treeThreshold,
      weight: 2.0,
    },
  ] as const

/**
 * 段階的評価実行（純粋関数）
 */
export const executeProgressiveEvaluation = (
  context: EvaluationContext,
  stages: readonly EvaluationStage[],
  initialCacheState: CacheState,
): ProgressiveResult => {
  let currentScore = 0
  const currentCacheState = initialCacheState
  const evaluationsUsed: string[] = []

  for (const stage of stages) {
    const stageScore = stage.evaluator(context, currentCacheState)
    currentScore = Math.max(currentScore, stageScore * stage.weight)
    evaluationsUsed.push(stage.name)

    // 閾値チェック
    if (currentScore < stage.threshold) {
      break
    }
  }

  return {
    score: currentScore,
    evaluationsUsed,
    cacheState: currentCacheState,
  }
}

/**
 * メイン評価関数（純粋関数）
 */
export const evaluateProgressive = (
  context: EvaluationContext,
  cacheState: CacheState,
): { result: OptimizedEvaluationResult; newCacheState: CacheState } => {
  const cacheKey = generateCacheKey(
    context.myGameState.field,
    context.opponentGameState.field,
    context.gamePhase,
  )

  // キャッシュ確認
  const cached = cacheState.progressiveCache.get(cacheKey)
  if (cached) {
    return {
      result: {
        ...cached,
        cacheInfo: updateCacheStats(cacheState.stats, true),
      },
      newCacheState: updateCacheState(cacheState, true),
    }
  }

  const startTime = performance.now()

  // 段階的評価実行
  const stages = createEvaluationStages(context.optimizationSettings)
  const progressiveResult = executeProgressiveEvaluation(
    context,
    stages,
    cacheState,
  )

  const basicComputeTime = performance.now() - startTime

  // 詳細評価が必要な場合
  let detailed: OptimizedEvaluationResult['detailed']
  let finalCacheState = progressiveResult.cacheState

  if (progressiveResult.evaluationsUsed.includes('strategy_analysis')) {
    const detailedStart = performance.now()

    const { result: myChainEval, newCacheState: cacheState1 } =
      cachedChainEvaluation(context.myGameState.field, finalCacheState)
    finalCacheState = cacheState1

    const { result: strategyEval, newCacheState: cacheState2 } =
      cachedStrategyEvaluation(context, finalCacheState)
    finalCacheState = cacheState2

    let rensaHandTree: RensaHandTree | undefined
    if (progressiveResult.score >= context.optimizationSettings.treeThreshold) {
      const { result: tree, newCacheState: cacheState3 } = cachedTreeEvaluation(
        context.myGameState.field,
        context.opponentGameState.field,
        context.settings,
        finalCacheState,
      )
      rensaHandTree = tree
      finalCacheState = cacheState3
    }

    detailed = {
      chainEvaluation: myChainEval,
      strategyEvaluation: strategyEval,
      rensaHandTree,
      computeTime: performance.now() - detailedStart,
    }
  }

  const result: OptimizedEvaluationResult = {
    basic: {
      score: progressiveResult.score,
      computeTime: basicComputeTime,
    },
    detailed,
    evaluationLevels: progressiveResult.evaluationsUsed,
    cacheInfo: updateCacheStats(finalCacheState.stats, false),
  }

  // キャッシュに保存
  finalCacheState.progressiveCache.set(cacheKey, result)

  return {
    result,
    newCacheState: updateCacheState(finalCacheState, false),
  }
}

// =============================================================================
// 高次関数・ユーティリティ
// =============================================================================

/**
 * 最適手探索（関数型）
 */
export const findBestMoves = (
  moves: readonly Move[],
  context: EvaluationContext,
  cacheState: CacheState,
  maxMoves: number = 3,
): readonly Move[] => {
  // 段階的評価で早期フィルタリング
  const quickScored = moves.map((move) => {
    const moveContext = {
      ...context,
      myGameState: {
        ...context.myGameState,
        currentPuyoPair: {
          ...context.myGameState.currentPuyoPair,
          x: move.x,
          y: 0,
          rotation: move.rotation,
          primaryColor: 'red' as PuyoColor,
          secondaryColor: 'blue' as PuyoColor,
        },
      },
    }
    const { result } = evaluateProgressive(moveContext, cacheState)
    return {
      move,
      basicScore: result.basic.score,
    }
  })

  // 基本スコアでソートして上位のみ詳細評価
  const topCandidates = quickScored
    .sort((a, b) => b.basicScore - a.basicScore)
    .slice(0, Math.min(maxMoves * 2, moves.length))

  // 詳細評価
  const detailedScored = topCandidates.map(({ move }) => {
    const moveContext = {
      ...context,
      myGameState: {
        ...context.myGameState,
        currentPuyoPair: {
          ...context.myGameState.currentPuyoPair,
          x: move.x,
          y: 0,
          rotation: move.rotation,
          primaryColor: 'red' as PuyoColor,
          secondaryColor: 'blue' as PuyoColor,
        },
      },
    }
    const { result: evaluation } = evaluateProgressive(moveContext, cacheState)
    return {
      move,
      evaluation,
    }
  })

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
 * スロットル付き一括評価（関数型）
 */
export const evaluateMovesThrottled = (
  moves: readonly Move[],
  context: EvaluationContext,
  cacheState: CacheState,
): readonly { move: Move; result: OptimizedEvaluationResult }[] => {
  return moves.map((move) => {
    const moveContext = {
      ...context,
      myGameState: {
        ...context.myGameState,
        currentPuyoPair: {
          ...context.myGameState.currentPuyoPair,
          x: move.x,
          y: 0,
          rotation: move.rotation,
          primaryColor: 'red' as PuyoColor,
          secondaryColor: 'blue' as PuyoColor,
        },
      },
    }
    const { result } = evaluateProgressive(moveContext, cacheState)
    return {
      move,
      result,
    }
  })
}

/**
 * 高速手候補探索（関数型）
 */
export const findTopMovesOptimized = (
  moves: readonly Move[],
  quickEvaluator: (move: Move) => number,
  context: EvaluationContext,
  cacheState: CacheState,
  topN: number = 5,
): readonly Move[] => {
  // 1. 基本評価で大幅フィルタリング
  const quickResults = moves.map((move) => ({
    move,
    score: quickEvaluator(move),
  }))

  // 2. 上位候補のみ選別
  const topCandidates = findOptimal(
    quickResults,
    (item) => item.score,
    undefined,
  )

  if (!topCandidates) return []

  const candidateThreshold = topCandidates.score * 0.7
  const viableCandidates = quickResults
    .filter((item) => item.score >= candidateThreshold)
    .slice(0, topN * 2)

  // 3. 詳細評価
  const detailedResults = viableCandidates.map((candidate) => {
    const moveContext = {
      ...context,
      myGameState: {
        ...context.myGameState,
        currentPuyoPair: {
          ...context.myGameState.currentPuyoPair,
          x: candidate.move.x,
          y: 0,
          rotation: candidate.move.rotation,
          primaryColor: 'red' as PuyoColor,
          secondaryColor: 'blue' as PuyoColor,
        },
      },
    }
    const { result: evaluation } = evaluateProgressive(moveContext, cacheState)
    return {
      move: candidate.move,
      evaluation,
    }
  })

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

/**
 * キャッシュ統計取得（純粋関数）
 */
export const getCacheStats = (cacheState: CacheState) => ({
  fieldCache: cacheState.fieldCache.getStats(),
  strategyCache: cacheState.strategyCache.getStats(),
  treeCache: cacheState.treeCache.getStats(),
  progressiveCache: cacheState.progressiveCache.getStats(),
  overall: cacheState.stats,
})

/**
 * キャッシュクリア（新しい状態を返す）
 */
export const clearCache = (settings: OptimizedEvaluationSettings): CacheState =>
  createCacheState(settings)
