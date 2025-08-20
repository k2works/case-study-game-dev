/**
 * 統合評価サービス
 * mayah型評価システムと既存評価関数を統合するドメインサービス
 */
import type { AIGameState } from '../../models/ai/GameState'
import type {
  GamePhase,
  MayahEvaluationSettings,
  PhaseWeights,
} from '../../models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'
import type { MoveEvaluation, PossibleMove } from '../../models/ai/MoveTypes'
// 既存評価関数のインポート
import {
  DEFAULT_EVALUATION_SETTINGS,
  type EvaluationSettings as LegacyEvaluationSettings,
  evaluateMove as legacyEvaluateMove,
} from './EvaluationService'
// mayah型評価システムのインポート
import { evaluateOperation } from './OperationEvaluationService'
import {
  adjustWeightsForSituation,
  determineGamePhase,
  generatePhaseDescription,
  getPhaseWeights,
} from './PhaseManagementService'
import { evaluateShape } from './ShapeEvaluationService'

/**
 * 統合評価設定
 */
export interface IntegratedEvaluationSettings {
  /** mayah型評価の設定 */
  mayahSettings: MayahEvaluationSettings
  /** 既存評価の設定 */
  legacySettings: LegacyEvaluationSettings
  /** mayah型評価の重み（0-1） */
  mayahWeight: number
  /** 既存評価の重み（0-1） */
  legacyWeight: number
  /** フェーズ管理を有効にするか */
  enablePhaseManagement: boolean
  /** カスタムフェーズ重みの設定 */
  customPhaseWeights?: Partial<Record<GamePhase, Partial<PhaseWeights>>>
}

/**
 * デフォルト統合評価設定
 */
export const DEFAULT_INTEGRATED_SETTINGS: IntegratedEvaluationSettings = {
  mayahSettings: DEFAULT_MAYAH_SETTINGS,
  legacySettings: DEFAULT_EVALUATION_SETTINGS,
  mayahWeight: 0.7, // mayah型を主体とする
  legacyWeight: 0.3, // 既存評価は補助
  enablePhaseManagement: true,
  customPhaseWeights: undefined,
}

/**
 * 統合評価結果
 */
export interface IntegratedEvaluation {
  /** mayah型評価結果（暫定：操作+形のみ） */
  mayahEvaluation: {
    operation: ReturnType<typeof evaluateOperation>
    shape: ReturnType<typeof evaluateShape>
    // chain と strategy は Phase 4b で実装予定
    totalScore: number
  }
  /** 既存評価結果 */
  legacyEvaluation: MoveEvaluation
  /** 統合後の総合スコア */
  totalScore: number
  /** フェーズ情報 */
  phaseInfo: {
    phase: GamePhase
    weights: PhaseWeights
    description: string
  }
  /** 評価理由の詳細説明 */
  reason: string
}

/**
 * 統合評価の実行
 */
export const evaluateIntegratedMove = (
  move: PossibleMove,
  gameState: AIGameState,
  moveCount: number = 0,
  settings: IntegratedEvaluationSettings = DEFAULT_INTEGRATED_SETTINGS,
): IntegratedEvaluation => {
  // フェーズ判定と重み調整
  const phase = determineGamePhase(gameState, moveCount)
  let phaseWeights = getPhaseWeights(phase, settings.customPhaseWeights)

  if (settings.enablePhaseManagement) {
    phaseWeights = adjustWeightsForSituation(phaseWeights, gameState)
  }

  // mayah型評価（現在実装済みの2要素のみ）
  const operationEval = evaluateOperation(move)
  const field = gameState.currentField || gameState.field
  const shapeEval = evaluateShape(field, settings.mayahSettings)

  // mayah型の暫定総合スコア（操作+形のみ）
  const mayahTotalScore = Math.round(
    operationEval.totalScore * phaseWeights.operationWeight +
      shapeEval.totalScore * phaseWeights.shapeWeight,
  )

  // 既存評価
  const legacyEval = legacyEvaluateMove(
    move,
    gameState,
    settings.legacySettings,
  )

  // 統合スコア計算
  const totalScore = Math.round(
    mayahTotalScore * settings.mayahWeight +
      legacyEval.totalScore * settings.legacyWeight,
  )

  // 評価理由の生成
  const phaseDescription = generatePhaseDescription(phase, moveCount)
  const reason = generateIntegratedReason(
    operationEval,
    shapeEval,
    legacyEval,
    phaseDescription,
    settings,
  )

  return {
    mayahEvaluation: {
      operation: operationEval,
      shape: shapeEval,
      totalScore: mayahTotalScore,
    },
    legacyEvaluation: legacyEval,
    totalScore,
    phaseInfo: {
      phase,
      weights: phaseWeights,
      description: phaseDescription,
    },
    reason,
  }
}

/**
 * 複数の手を統合評価してスコア順にソート
 */
export const evaluateAndSortIntegratedMoves = (
  moves: PossibleMove[],
  gameState: AIGameState,
  moveCount: number = 0,
  settings: IntegratedEvaluationSettings = DEFAULT_INTEGRATED_SETTINGS,
): Array<PossibleMove & { evaluation: IntegratedEvaluation }> =>
  moves
    .map((move) => ({
      ...move,
      evaluation: evaluateIntegratedMove(move, gameState, moveCount, settings),
    }))
    .sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore)

/**
 * 最高評価の手を取得（統合評価版）
 */
export const getBestIntegratedMove = (
  moves: PossibleMove[],
  gameState: AIGameState,
  moveCount: number = 0,
  settings: IntegratedEvaluationSettings = DEFAULT_INTEGRATED_SETTINGS,
): (PossibleMove & { evaluation: IntegratedEvaluation }) | null => {
  if (moves.length === 0) {
    return null
  }

  const evaluatedMoves = evaluateAndSortIntegratedMoves(
    moves,
    gameState,
    moveCount,
    settings,
  )
  return evaluatedMoves[0]
}

/**
 * 評価システム比較分析
 */
export interface EvaluationComparison {
  /** mayah型評価のスコア */
  mayahScore: number
  /** 既存評価のスコア */
  legacyScore: number
  /** スコア差（mayah - legacy） */
  scoreDifference: number
  /** スコア差の割合 */
  scoreDifferencePercentage: number
  /** mayah型の優位性（-1〜1） */
  mayahAdvantage: number
  /** 評価の一致度（0〜1） */
  agreementLevel: number
  /** 比較結果の説明 */
  comparisonDescription: string
}

/**
 * 評価システム間の比較分析
 */
export const compareEvaluationSystems = (
  move: PossibleMove,
  gameState: AIGameState,
  moveCount: number = 0,
  settings: IntegratedEvaluationSettings = DEFAULT_INTEGRATED_SETTINGS,
): EvaluationComparison => {
  const integratedEval = evaluateIntegratedMove(
    move,
    gameState,
    moveCount,
    settings,
  )
  const mayahScore = integratedEval.mayahEvaluation.totalScore
  const legacyScore = integratedEval.legacyEvaluation.totalScore

  const scoreDifference = mayahScore - legacyScore
  const maxScore = Math.max(Math.abs(mayahScore), Math.abs(legacyScore), 1)
  const scoreDifferencePercentage = (scoreDifference / maxScore) * 100

  // mayah型の優位性（正規化）
  const mayahAdvantage = Math.max(-1, Math.min(1, scoreDifference / 1000))

  // 評価の一致度（スコアが近いほど高い）
  const normalizedDiff =
    Math.abs(scoreDifference) /
    (Math.abs(mayahScore) + Math.abs(legacyScore) + 1)
  const agreementLevel = Math.max(0, 1 - normalizedDiff)

  const comparisonDescription = generateComparisonDescription(
    mayahScore,
    legacyScore,
    mayahAdvantage,
    agreementLevel,
  )

  return {
    mayahScore,
    legacyScore,
    scoreDifference,
    scoreDifferencePercentage,
    mayahAdvantage,
    agreementLevel,
    comparisonDescription,
  }
}

/**
 * 統合評価の理由説明を生成
 */
const generateIntegratedReason = (
  operationEval: ReturnType<typeof evaluateOperation>,
  shapeEval: ReturnType<typeof evaluateShape>,
  legacyEval: MoveEvaluation,
  phaseDescription: string,
  settings: IntegratedEvaluationSettings,
): string => {
  const parts: string[] = []

  // フェーズ情報
  parts.push(phaseDescription)

  // mayah型評価の要約
  const operationDesc =
    operationEval.efficiencyScore >= 70 ? '高効率操作' : '標準操作'
  const shapeDesc = shapeEval.totalScore >= 60 ? '良好な形状' : '標準形状'
  parts.push(
    `mayah評価: ${operationDesc}・${shapeDesc}(${Math.round(operationEval.totalScore + shapeEval.totalScore)})`,
  )

  // 既存評価の要約
  parts.push(`既存評価: ${legacyEval.reason}`)

  // 重み配分
  const mayahPercentage = Math.round(settings.mayahWeight * 100)
  const legacyPercentage = Math.round(settings.legacyWeight * 100)
  parts.push(`統合重み: mayah${mayahPercentage}%・既存${legacyPercentage}%`)

  return parts.join(' | ')
}

/**
 * 比較結果の説明を生成
 */
const generateComparisonDescription = (
  mayahScore: number,
  legacyScore: number,
  mayahAdvantage: number,
  agreementLevel: number,
): string => {
  const advantageDesc =
    mayahAdvantage > 0.3
      ? 'mayah型が優位'
      : mayahAdvantage < -0.3
        ? '既存評価が優位'
        : '評価が拮抗'

  const agreementDesc =
    agreementLevel > 0.8
      ? '評価システム間の一致度が高い'
      : agreementLevel > 0.5
        ? '評価システム間で中程度の一致'
        : '評価システム間で判断が分かれている'

  return `${advantageDesc}（mayah: ${mayahScore}, 既存: ${legacyScore}）- ${agreementDesc}`
}

/**
 * 設定の部分更新
 */
export const updateIntegratedSettings = (
  currentSettings: IntegratedEvaluationSettings,
  updates: Partial<IntegratedEvaluationSettings>,
): IntegratedEvaluationSettings => ({
  ...currentSettings,
  ...updates,
})

/**
 * 評価システムの重みバランス調整
 */
export const adjustEvaluationBalance = (
  settings: IntegratedEvaluationSettings,
  mayahWeight: number,
): IntegratedEvaluationSettings => {
  const clampedMayahWeight = Math.max(0, Math.min(1, mayahWeight))
  const legacyWeight = 1 - clampedMayahWeight

  return {
    ...settings,
    mayahWeight: clampedMayahWeight,
    legacyWeight,
  }
}
