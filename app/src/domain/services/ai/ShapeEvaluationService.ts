/**
 * 形評価サービス
 * フィールド形状（U字型・連結・山谷・バランス）の評価を行うドメインサービス
 */
import type { AIFieldState } from '../../models/ai/GameState'
import type {
  MayahEvaluationSettings,
  ShapeEvaluation,
} from '../../models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'

/**
 * 形評価の計算
 */
export const evaluateShape = (
  field: AIFieldState,
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): ShapeEvaluation => {
  // 各列の高さを計算
  const columnHeights = calculateColumnHeights(field)

  // U字型スコア計算
  const uShapeScore = calculateUShapeScore(
    columnHeights,
    settings.idealUShapeDepth,
  )

  // 連結性スコア計算
  const connectivityScore = calculateConnectivityScore(
    field,
    settings.idealConnectivity,
  )

  // 山谷バランススコア計算
  const valleyScore = calculateValleyScore(
    columnHeights,
    settings.idealValleyBalance,
  )

  // 左右バランススコア計算
  const balanceScore = calculateBalanceScore(columnHeights)

  // 総合スコア計算
  const totalScore = calculateShapeTotalScore(
    uShapeScore,
    connectivityScore,
    valleyScore,
    balanceScore,
  )

  return {
    uShapeScore,
    connectivityScore,
    valleyScore,
    balanceScore,
    totalScore,
  }
}

/**
 * 各列の高さを計算
 */
export const calculateColumnHeights = (field: AIFieldState): number[] => {
  const heights: number[] = []

  for (let x = 0; x < field.width; x++) {
    let height = 0
    for (let y = field.height - 1; y >= 0; y--) {
      if (field.cells[y][x] !== null) {
        height = field.height - y
        break
      }
    }
    heights.push(height)
  }

  return heights
}

/**
 * U字型スコアの計算
 * 理想的な連鎖形状（中央が低く、両端が高い）を評価
 */
export const calculateUShapeScore = (
  columnHeights: number[],
  idealDepth: number,
): number => {
  if (columnHeights.length < 3) {
    return 0
  }

  // 中央の凹み度合いを基本スコアとする
  const centerIndex = Math.floor(columnHeights.length / 2)
  const leftSideHeight = Math.max(...columnHeights.slice(0, centerIndex))
  const rightSideHeight = Math.max(...columnHeights.slice(centerIndex + 1))
  const centerHeight = columnHeights[centerIndex]

  // 実際の凹み深度
  const actualDepth = Math.min(
    leftSideHeight - centerHeight,
    rightSideHeight - centerHeight,
  )

  // 基本スコア：理想的な深度に近いほど高スコア
  let score = 30 // ベーススコア
  if (actualDepth > 0) {
    const depthDiff = Math.abs(actualDepth - idealDepth)
    // 理想深度への近さでボーナス（より敏感な評価）
    const depthBonus = Math.max(0, 70 - depthDiff * 20)
    score += depthBonus
  } else {
    score -= 20 // 凹みがない場合は減点
  }

  // 対称性ボーナス
  const symmetryScore = calculateSymmetryBonus(columnHeights)
  score += symmetryScore

  // 極端な形状へのペナルティ
  const extremePenalty = calculateExtremePenalty(columnHeights)
  score -= extremePenalty

  return Math.max(0, Math.min(100, score))
}

/**
 * 対称性ボーナスの計算
 */
const calculateSymmetryBonus = (columnHeights: number[]): number => {
  const centerIndex = Math.floor(columnHeights.length / 2)
  let symmetryScore = 0

  for (let i = 0; i < centerIndex; i++) {
    const leftHeight = columnHeights[i]
    const rightHeight = columnHeights[columnHeights.length - 1 - i]
    const diff = Math.abs(leftHeight - rightHeight)
    symmetryScore += Math.max(0, 5 - diff)
  }

  return symmetryScore
}

/**
 * 極端な形状へのペナルティ計算
 */
const calculateExtremePenalty = (columnHeights: number[]): number => {
  let penalty = 0

  // 平坦すぎる場合のペナルティ
  const maxHeight = Math.max(...columnHeights)
  const minHeight = Math.min(...columnHeights)
  if (maxHeight - minHeight < 1) {
    penalty += 20
  }

  // 山型（逆U字）のペナルティ
  const centerIndex = Math.floor(columnHeights.length / 2)
  const centerHeight = columnHeights[centerIndex]
  const edgeMaxHeight = Math.max(
    columnHeights[0],
    columnHeights[columnHeights.length - 1],
  )
  if (centerHeight > edgeMaxHeight + 1) {
    penalty += 30
  }

  return penalty
}

/**
 * 連結性スコアの計算
 * ぷよの繋がりやすさを評価
 */
export const calculateConnectivityScore = (
  field: AIFieldState,
  idealConnectivity: number,
): number => {
  const { totalConnections, totalPuyos } = calculateFieldConnections(field)

  if (totalPuyos === 0) {
    return 100 // 空フィールドは最高スコア
  }

  // 平均連結数を計算
  const avgConnections = totalConnections / totalPuyos

  // 理想的な連結数との差を評価
  const diff = Math.abs(avgConnections - idealConnectivity)
  return Math.max(0, 100 - diff * 25)
}

/**
 * フィールドの連結数を計算
 */
const calculateFieldConnections = (
  field: AIFieldState,
): { totalConnections: number; totalPuyos: number } => {
  let totalConnections = 0
  let totalPuyos = 0

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const color = field.cells[y][x]
      if (color === null) continue

      totalPuyos++
      const connections = countAdjacentSameColor(field, x, y, color)
      totalConnections += connections
    }
  }

  return { totalConnections, totalPuyos }
}

/**
 * 隣接する同色ぷよの数をカウント
 */
const countAdjacentSameColor = (
  field: AIFieldState,
  x: number,
  y: number,
  color: string,
): number => {
  const directions = [
    { dx: 0, dy: -1 }, // 上
    { dx: 1, dy: 0 }, // 右
    { dx: 0, dy: 1 }, // 下
    { dx: -1, dy: 0 }, // 左
  ]

  let connections = 0
  for (const { dx, dy } of directions) {
    const nx = x + dx
    const ny = y + dy

    if (nx >= 0 && nx < field.width && ny >= 0 && ny < field.height) {
      if (field.cells[ny][nx] === color) {
        connections++
      }
    }
  }

  return connections
}

/**
 * 山谷バランススコアの計算
 * 高低差の適切さを評価
 */
export const calculateValleyScore = (
  columnHeights: number[],
  idealValleyBalance: number,
): number => {
  if (columnHeights.length < 2) {
    return 100
  }

  const { totalDiff, valleyCount, peakCount } =
    analyzeHeightVariations(columnHeights)

  // 平均高低差
  const avgDiff = totalDiff / (columnHeights.length - 1)

  // 理想的な高低差との差を評価
  const diffScore = Math.max(
    0,
    100 - Math.abs(avgDiff - idealValleyBalance) * 20,
  )

  // 山谷のバランスを評価（谷が多い方が良い）
  const balanceScore = valleyCount > peakCount ? 20 : 0

  return Math.min(100, diffScore + balanceScore)
}

/**
 * 高さの変化を分析
 */
const analyzeHeightVariations = (
  columnHeights: number[],
): { totalDiff: number; valleyCount: number; peakCount: number } => {
  let totalDiff = 0
  let valleyCount = 0
  let peakCount = 0

  for (let i = 1; i < columnHeights.length - 1; i++) {
    const leftDiff = columnHeights[i] - columnHeights[i - 1]
    const rightDiff = columnHeights[i] - columnHeights[i + 1]

    // 谷（両隣より低い）
    if (leftDiff < 0 && rightDiff < 0) {
      valleyCount++
    }
    // 山（両隣より高い）
    else if (leftDiff > 0 && rightDiff > 0) {
      peakCount++
    }

    totalDiff += Math.abs(columnHeights[i] - columnHeights[i - 1])
  }

  // 最後の差分を追加
  totalDiff += Math.abs(
    columnHeights[columnHeights.length - 1] -
      columnHeights[columnHeights.length - 2],
  )

  return { totalDiff, valleyCount, peakCount }
}

/**
 * 左右バランススコアの計算
 */
export const calculateBalanceScore = (columnHeights: number[]): number => {
  if (columnHeights.length < 2) {
    return 100
  }

  const midPoint = columnHeights.length / 2
  let leftSum = 0
  let rightSum = 0

  for (let i = 0; i < columnHeights.length; i++) {
    if (i < midPoint) {
      leftSum += columnHeights[i]
    } else {
      rightSum += columnHeights[i]
    }
  }

  // 左右の重みを正規化
  const leftAvg = leftSum / Math.ceil(midPoint)
  const rightAvg = rightSum / Math.floor(midPoint)

  // 左右の差を評価（差が小さいほど良い）
  const diff = Math.abs(leftAvg - rightAvg)

  return Math.max(0, 100 - diff * 10)
}

/**
 * 形状総合スコアの計算
 */
export const calculateShapeTotalScore = (
  uShapeScore: number,
  connectivityScore: number,
  valleyScore: number,
  balanceScore: number,
): number => {
  // 重み付け平均
  const weights = {
    uShape: 0.35, // U字型形状が最重要
    connectivity: 0.3, // 連結性も重要
    valley: 0.2, // 山谷バランス
    balance: 0.15, // 左右バランス
  }

  return Math.round(
    uShapeScore * weights.uShape +
      connectivityScore * weights.connectivity +
      valleyScore * weights.valley +
      balanceScore * weights.balance,
  )
}

/**
 * フィールドの形状評価の詳細説明を生成
 */
export const generateShapeDescription = (
  evaluation: ShapeEvaluation,
): string => {
  const parts: string[] = []

  // U字型評価
  if (evaluation.uShapeScore >= 70) {
    parts.push('良好なU字型')
  } else if (evaluation.uShapeScore >= 40) {
    parts.push('標準的な形状')
  } else {
    parts.push('形状改善必要')
  }

  // 連結性評価
  if (evaluation.connectivityScore >= 70) {
    parts.push('高連結')
  } else if (evaluation.connectivityScore >= 40) {
    parts.push('標準連結')
  } else {
    parts.push('低連結')
  }

  // バランス評価
  if (evaluation.balanceScore >= 80) {
    parts.push('良バランス')
  }

  return parts.join(', ')
}

/**
 * 複数のフィールド状態から最適な形状を選択
 */
export const selectBestShapeField = (
  fields: AIFieldState[],
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): { field: AIFieldState; evaluation: ShapeEvaluation } | null => {
  if (fields.length === 0) {
    return null
  }

  const evaluatedFields = fields.map((field) => ({
    field,
    evaluation: evaluateShape(field, settings),
  }))

  return evaluatedFields.reduce((best, current) =>
    current.evaluation.totalScore > best.evaluation.totalScore ? current : best,
  )
}
