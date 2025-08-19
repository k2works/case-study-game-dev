/**
 * 評価サービス
 * AI判断における手の評価を行うドメインサービス（関数型）
 */
import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import type { MoveEvaluation, PossibleMove } from '../../models/ai/MoveTypes'

/**
 * 評価設定
 */
export interface EvaluationSettings {
  /** 高さの重要度 */
  heightWeight: number
  /** 中央位置の重要度 */
  centerWeight: number
  /** MLスコアの重要度 */
  mlWeight: number
}

/**
 * デフォルト評価設定
 */
export const DEFAULT_EVALUATION_SETTINGS: EvaluationSettings = {
  heightWeight: 10,
  centerWeight: 5,
  mlWeight: 20,
}

/**
 * 基本的な手の評価（MLスコアなし）
 */
export const evaluateMove = (
  move: PossibleMove,
  gameState: AIGameState,
  settings: EvaluationSettings = DEFAULT_EVALUATION_SETTINGS,
): MoveEvaluation => {
  if (!move.isValid) {
    return createInvalidMoveEvaluation()
  }

  return createBasicMoveEvaluation(move, gameState, settings)
}

/**
 * ML強化評価（MLスコア付き）
 */
export const evaluateMoveWithML = (
  move: PossibleMove,
  gameState: AIGameState,
  mlScore: number,
  settings: EvaluationSettings = DEFAULT_EVALUATION_SETTINGS,
): MoveEvaluation => {
  if (!move.isValid) {
    return createInvalidMoveEvaluation()
  }

  return createMLEnhancedMoveEvaluation(move, gameState, mlScore, settings)
}

/**
 * 無効な手の評価を作成
 */
export const createInvalidMoveEvaluation = (): MoveEvaluation => ({
  heightScore: -1000,
  centerScore: 0,
  modeScore: 0,
  totalScore: -1000,
  averageY: -1,
  averageX: -1,
  distanceFromCenter: 0,
  reason: '無効な手',
})

/**
 * 基本的な手の評価を作成
 */
export const createBasicMoveEvaluation = (
  move: PossibleMove,
  gameState: AIGameState,
  settings: EvaluationSettings,
): MoveEvaluation => {
  const { heightScore, centerScore, avgY, avgX, distanceFromCenter } =
    calculateBaseScores(move, gameState.field, settings)

  const totalScore = heightScore + centerScore

  return {
    heightScore,
    centerScore,
    modeScore: 0,
    totalScore,
    averageY: avgY,
    averageX: avgX,
    distanceFromCenter,
    reason: `位置(${move.x}, ${Math.round(avgY)}), 標準評価, スコア: ${Math.round(totalScore)}`,
  }
}

/**
 * ML強化評価を作成
 */
export const createMLEnhancedMoveEvaluation = (
  move: PossibleMove,
  gameState: AIGameState,
  mlScore: number,
  settings: EvaluationSettings,
): MoveEvaluation => {
  const { heightScore, centerScore, avgY, avgX, distanceFromCenter } =
    calculateBaseScores(move, gameState.field, settings)

  const modeScore = mlScore * settings.mlWeight
  const totalScore = heightScore + centerScore + modeScore

  return {
    heightScore,
    centerScore,
    modeScore,
    totalScore,
    averageY: avgY,
    averageX: avgX,
    distanceFromCenter,
    reason: `位置(${move.x}, ${Math.round(avgY)}), ML強化判定, スコア: ${Math.round(totalScore)}`,
  }
}

/**
 * 基本スコアの計算
 */
export const calculateBaseScores = (
  move: PossibleMove,
  field: AIFieldState,
  settings: EvaluationSettings,
) => {
  // 高さベースの評価（下の位置ほど高スコア - y値が大きいほど良い）
  const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2
  const heightScore = avgY * settings.heightWeight

  // 中央付近を優遇
  const centerX = (field.width - 1) / 2 // 6列なら中央は2.5
  const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2
  const distanceFromCenter = Math.abs(centerX - avgX)
  const centerScore = (field.width - distanceFromCenter) * settings.centerWeight

  return {
    heightScore,
    centerScore,
    avgY,
    avgX,
    distanceFromCenter,
  }
}

/**
 * 評価設定の部分更新
 */
export const updateEvaluationSettings = (
  currentSettings: EvaluationSettings,
  updates: Partial<EvaluationSettings>,
): EvaluationSettings => ({
  ...currentSettings,
  ...updates,
})

/**
 * 複数の手を評価してスコア順にソート
 */
export const evaluateAndSortMoves = (
  moves: PossibleMove[],
  gameState: AIGameState,
  settings: EvaluationSettings = DEFAULT_EVALUATION_SETTINGS,
): Array<PossibleMove & { evaluation: MoveEvaluation }> =>
  moves
    .map((move) => ({
      ...move,
      evaluation: evaluateMove(move, gameState, settings),
    }))
    .sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore)

/**
 * 複数の手をML強化評価してスコア順にソート
 */
export const evaluateAndSortMovesWithML = (
  movesWithMLScores: Array<{ move: PossibleMove; mlScore: number }>,
  gameState: AIGameState,
  settings: EvaluationSettings = DEFAULT_EVALUATION_SETTINGS,
): Array<PossibleMove & { evaluation: MoveEvaluation }> =>
  movesWithMLScores
    .map(({ move, mlScore }) => ({
      ...move,
      evaluation: evaluateMoveWithML(move, gameState, mlScore, settings),
    }))
    .sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore)

/**
 * 最高評価の手を取得
 */
export const getBestMove = (
  moves: PossibleMove[],
  gameState: AIGameState,
  settings: EvaluationSettings = DEFAULT_EVALUATION_SETTINGS,
): (PossibleMove & { evaluation: MoveEvaluation }) | null => {
  if (moves.length === 0) {
    return null
  }

  const evaluatedMoves = evaluateAndSortMoves(moves, gameState, settings)
  return evaluatedMoves[0]
}
