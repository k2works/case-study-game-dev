/**
 * ゲームフェーズ管理サービス
 * ゲームの進行状況に応じて評価の重み付けを動的に調整するドメインサービス
 */
import type { AIGameState } from '../../models/ai/GameState'
import type { GamePhase, PhaseWeights } from '../../models/ai/MayahEvaluation'
import {
  DEFAULT_PHASE_WEIGHTS,
  GamePhase as GamePhaseValues,
} from '../../models/ai/MayahEvaluation'

/**
 * フェーズ判定の閾値
 */
const PHASE_THRESHOLDS = {
  /** 序盤から中盤への移行手数 */
  EARLY_TO_MIDDLE: 30,
  /** 中盤から終盤への移行手数 */
  MIDDLE_TO_LATE: 60,
  /** 緊急モード判定の高さ */
  EMERGENCY_HEIGHT: 10,
  /** 緊急モード判定の連続フィールド数 */
  EMERGENCY_COLUMNS: 3,
} as const

/**
 * 現在のゲームフェーズを判定
 */
export const determineGamePhase = (
  gameState: AIGameState,
  moveCount: number = 0,
): GamePhase => {
  // 緊急モード判定（最優先）
  if (isEmergencyPhase(gameState)) {
    return GamePhaseValues.EMERGENCY
  }

  // 手数によるフェーズ判定
  if (moveCount >= PHASE_THRESHOLDS.MIDDLE_TO_LATE) {
    return GamePhaseValues.LATE
  }

  if (moveCount >= PHASE_THRESHOLDS.EARLY_TO_MIDDLE) {
    return GamePhaseValues.MIDDLE
  }

  return GamePhaseValues.EARLY
}

/**
 * 緊急フェーズの判定
 */
export const isEmergencyPhase = (gameState: AIGameState): boolean => {
  const field = gameState.currentField || gameState.field
  const fieldHeight = field.height
  let dangerousColumns = 0

  for (let x = 0; x < field.width; x++) {
    const columnHeight = calculateColumnHeight(field, x)

    // 危険な高さ（フィールドの上から2段以内）
    if (columnHeight >= fieldHeight - 2) {
      dangerousColumns++
    }
  }

  // 連続する列が危険な高さに達している場合は緊急モード
  return dangerousColumns >= PHASE_THRESHOLDS.EMERGENCY_COLUMNS
}

/**
 * 列の高さを計算
 */
const calculateColumnHeight = (
  field: { cells: (string | null)[][]; height: number },
  x: number,
): number => {
  // フィールド構造の安全性チェック
  if (!field.cells || !Array.isArray(field.cells)) {
    return 0
  }

  for (let y = 0; y < field.height; y++) {
    if (!field.cells[y]) {
      return 0
    }
    if (field.cells[y][x] !== null) {
      return field.height - y
    }
  }
  return 0
}

/**
 * フェーズに応じた重み設定を取得
 */
export const getPhaseWeights = (
  phase: GamePhase,
  customWeights?: Partial<Record<GamePhase, Partial<PhaseWeights>>>,
): PhaseWeights => {
  const baseWeights = DEFAULT_PHASE_WEIGHTS[phase]

  if (customWeights?.[phase]) {
    return {
      ...baseWeights,
      ...customWeights[phase],
    }
  }

  return baseWeights
}

/**
 * ゲーム状況に応じた重み調整
 */
export const adjustWeightsForSituation = (
  baseWeights: PhaseWeights,
  gameState: AIGameState,
): PhaseWeights => {
  let adjustedWeights = { ...baseWeights }

  // 相手の攻撃が迫っている場合の調整
  if (isOpponentThreatening(gameState)) {
    adjustedWeights = {
      ...adjustedWeights,
      operationWeight: Math.min(1, adjustedWeights.operationWeight + 0.1),
      strategyWeight: Math.min(1, adjustedWeights.strategyWeight + 0.15),
      chainWeight: Math.max(0, adjustedWeights.chainWeight - 0.1),
      shapeWeight: Math.max(0, adjustedWeights.shapeWeight - 0.15),
    }
  }

  // フィールドが不安定な場合の調整
  if (isFieldUnstable(gameState)) {
    adjustedWeights = {
      ...adjustedWeights,
      shapeWeight: Math.min(1, adjustedWeights.shapeWeight + 0.1),
      operationWeight: Math.min(1, adjustedWeights.operationWeight + 0.05),
      chainWeight: Math.max(0, adjustedWeights.chainWeight - 0.1),
      riskTolerance: Math.max(0, adjustedWeights.riskTolerance - 0.2),
    }
  }

  return adjustedWeights
}

/**
 * 相手の脅威度判定
 */
export const isOpponentThreatening = (gameState: AIGameState): boolean => {
  // 相手の情報が利用可能な場合の判定ロジック
  if (gameState.opponentField) {
    const opponentHeight = getMaxFieldHeight(gameState.opponentField)
    const myField = gameState.currentField || gameState.field
    const myHeight = getMaxFieldHeight(myField)

    // 相手の方が明らかに攻撃的な形状を作っている場合
    return opponentHeight > myHeight + 3
  }

  return false
}

/**
 * フィールドの不安定性判定
 */
export const isFieldUnstable = (gameState: AIGameState): boolean => {
  const field = gameState.currentField || gameState.field
  let unstableCount = 0

  for (let x = 0; x < field.width; x++) {
    const height = calculateColumnHeight(field, x)

    // 隣接列との高低差が大きい場合
    if (x > 0) {
      const leftHeight = calculateColumnHeight(field, x - 1)
      if (Math.abs(height - leftHeight) > 3) {
        unstableCount++
      }
    }

    if (x < field.width - 1) {
      const rightHeight = calculateColumnHeight(field, x + 1)
      if (Math.abs(height - rightHeight) > 3) {
        unstableCount++
      }
    }
  }

  // 不安定な列が多い場合
  return unstableCount > field.width / 2
}

/**
 * フィールドの最大高さを取得
 */
const getMaxFieldHeight = (field: {
  cells: (string | null)[][]
  height: number
  width: number
}): number => {
  let maxHeight = 0

  for (let x = 0; x < field.width; x++) {
    const height = calculateColumnHeight(field, x)
    maxHeight = Math.max(maxHeight, height)
  }

  return maxHeight
}

/**
 * フェーズ遷移の説明を生成
 */
export const generatePhaseDescription = (
  phase: GamePhase,
  moveCount: number,
): string => {
  switch (phase) {
    case GamePhaseValues.EARLY:
      return `序盤（${moveCount}手目）- 土台構築重視`
    case GamePhaseValues.MIDDLE:
      return `中盤（${moveCount}手目）- バランス重視`
    case GamePhaseValues.LATE:
      return `終盤（${moveCount}手目）- 戦略・操作重視`
    case GamePhaseValues.EMERGENCY:
      return `緊急（${moveCount}手目）- 速攻・防御優先`
    default:
      return `不明フェーズ（${moveCount}手目）`
  }
}

/**
 * フェーズ重み情報の詳細説明を生成
 */
export const generateWeightDescription = (weights: PhaseWeights): string => {
  const parts: string[] = []

  if (weights.operationWeight > 0.3) {
    parts.push('操作重視')
  }
  if (weights.shapeWeight > 0.3) {
    parts.push('形状重視')
  }
  if (weights.chainWeight > 0.3) {
    parts.push('連鎖重視')
  }
  if (weights.strategyWeight > 0.3) {
    parts.push('戦略重視')
  }

  const riskLevel =
    weights.riskTolerance > 0.6
      ? '高リスク'
      : weights.riskTolerance > 0.3
        ? '中リスク'
        : '低リスク'
  parts.push(riskLevel)

  return parts.join('・')
}
