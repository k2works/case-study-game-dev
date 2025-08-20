/**
 * 操作評価サービス
 * フレーム数、ちぎり、効率性の評価を行うドメインサービス
 */
import type { Position } from '../../models/Position'
import type { OperationEvaluation } from '../../models/ai/MayahEvaluation'
import type { PossibleMove } from '../../models/ai/MoveTypes'

/**
 * 操作フレーム数の計算定数
 */
const FRAME_CONSTANTS = {
  /** 1マスの横移動にかかるフレーム数 */
  HORIZONTAL_MOVE_FRAMES: 2,
  /** 90度回転にかかるフレーム数 */
  ROTATION_FRAMES: 3,
  /** 高速落下1マスあたりのフレーム数 */
  SOFT_DROP_FRAMES: 1,
  /** 通常落下1マスあたりのフレーム数 */
  NORMAL_DROP_FRAMES: 4,
  /** ちぎり発生時の追加フレーム数 */
  CHIGIRI_PENALTY_FRAMES: 5,
} as const

/**
 * 操作評価の計算
 */
export const evaluateOperation = (
  move: PossibleMove,
  initialX: number = 2,
  initialRotation: number = 0,
  fieldHeight: number = 12,
): OperationEvaluation => {
  // フレーム数計算
  const frameCount = calculateFrameCount(
    move,
    initialX,
    initialRotation,
    fieldHeight,
  )

  // ちぎり数計算
  const chigiriCount = calculateChigiriCount(
    move.primaryPosition,
    move.secondaryPosition,
  )

  // 効率性スコア計算
  const efficiencyScore = calculateEfficiencyScore(frameCount, chigiriCount)

  // 総合スコア計算
  const totalScore = calculateOperationTotalScore(
    frameCount,
    chigiriCount,
    efficiencyScore,
  )

  return {
    frameCount,
    chigiriCount,
    efficiencyScore,
    totalScore,
  }
}

/**
 * フレーム数の計算
 */
export const calculateFrameCount = (
  move: PossibleMove,
  initialX: number,
  initialRotation: number,
  fieldHeight: number,
): number => {
  let frames = 0

  // 横移動のフレーム数
  const horizontalDistance = Math.abs(move.x - initialX)
  frames += horizontalDistance * FRAME_CONSTANTS.HORIZONTAL_MOVE_FRAMES

  // 回転のフレーム数
  const rotationCount = calculateRotationCount(initialRotation, move.rotation)
  frames += rotationCount * FRAME_CONSTANTS.ROTATION_FRAMES

  // 落下のフレーム数（最も低い位置までの距離）
  const dropDistance =
    fieldHeight - 1 - Math.min(move.primaryPosition.y, move.secondaryPosition.y)
  frames += dropDistance * FRAME_CONSTANTS.SOFT_DROP_FRAMES

  // ちぎりペナルティ
  const chigiriCount = calculateChigiriCount(
    move.primaryPosition,
    move.secondaryPosition,
  )
  if (chigiriCount > 0) {
    frames += FRAME_CONSTANTS.CHIGIRI_PENALTY_FRAMES * chigiriCount
  }

  return frames
}

/**
 * 回転回数の計算
 */
export const calculateRotationCount = (from: number, to: number): number => {
  // 0: 上, 1: 右, 2: 下, 3: 左
  const normalizedFrom = ((from % 4) + 4) % 4
  const normalizedTo = ((to % 4) + 4) % 4

  // 最短回転数を計算
  const clockwise = (normalizedTo - normalizedFrom + 4) % 4
  const counterClockwise = (normalizedFrom - normalizedTo + 4) % 4

  return Math.min(clockwise, counterClockwise)
}

/**
 * ちぎり数の計算
 */
export const calculateChigiriCount = (
  primaryPos: Position,
  secondaryPos: Position,
): number => {
  // 縦または横に隣接していない場合はちぎり
  const xDiff = Math.abs(primaryPos.x - secondaryPos.x)
  const yDiff = Math.abs(primaryPos.y - secondaryPos.y)

  // 隣接している場合（縦または横に1マス差）
  if ((xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1)) {
    return 0
  }

  // ちぎり数は離れているマス数
  return Math.max(xDiff, yDiff) - 1
}

/**
 * 効率性スコアの計算（0-100）
 */
export const calculateEfficiencyScore = (
  frameCount: number,
  chigiriCount: number,
): number => {
  // 理想的なフレーム数（10フレーム）からの乖離でスコアを計算
  const idealFrames = 10
  const maxFrames = 60

  // フレーム数による基本スコア
  const frameScore = Math.max(
    0,
    100 - ((frameCount - idealFrames) / (maxFrames - idealFrames)) * 100,
  )

  // ちぎりペナルティ（1ちぎりごとに-20点）
  const chigiriPenalty = chigiriCount * 20

  // 最終スコア（0-100に正規化）
  return Math.max(0, Math.min(100, frameScore - chigiriPenalty))
}

/**
 * 操作総合スコアの計算
 */
export const calculateOperationTotalScore = (
  frameCount: number,
  chigiriCount: number,
  efficiencyScore: number,
): number => {
  // 基本スコアは効率性スコア
  let score = efficiencyScore * 10 // 0-1000のスケール

  // フレーム数によるペナルティ（30フレーム以上で減点）
  if (frameCount > 30) {
    score -= (frameCount - 30) * 5
  }

  // ちぎりによる大幅減点
  score -= chigiriCount * 100

  return Math.max(0, score)
}

/**
 * 複数の手の操作評価を行い、最も効率的な手を選択
 */
export const selectMostEfficientMove = (
  moves: PossibleMove[],
  initialX: number = 2,
  initialRotation: number = 0,
  fieldHeight: number = 12,
): { move: PossibleMove; evaluation: OperationEvaluation } | null => {
  if (moves.length === 0) {
    return null
  }

  const evaluatedMoves = moves.map((move) => ({
    move,
    evaluation: evaluateOperation(move, initialX, initialRotation, fieldHeight),
  }))

  // 効率性スコアが最も高い手を選択
  return evaluatedMoves.reduce((best, current) =>
    current.evaluation.efficiencyScore > best.evaluation.efficiencyScore
      ? current
      : best,
  )
}

/**
 * 操作評価の詳細説明を生成
 */
export const generateOperationDescription = (
  evaluation: OperationEvaluation,
): string => {
  const parts: string[] = []

  // フレーム数
  parts.push(`${evaluation.frameCount}F`)

  // ちぎり
  if (evaluation.chigiriCount > 0) {
    parts.push(`ちぎり${evaluation.chigiriCount}`)
  }

  // 効率性
  if (evaluation.efficiencyScore >= 80) {
    parts.push('高効率')
  } else if (evaluation.efficiencyScore >= 50) {
    parts.push('標準効率')
  } else {
    parts.push('低効率')
  }

  return parts.join(', ')
}
