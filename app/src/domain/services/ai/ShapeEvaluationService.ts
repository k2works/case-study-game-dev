/**
 * mayah AI形評価ドメインサービス
 * U字型・連結・山谷・バランスを評価
 */
import type { AIFieldState, AIGameState } from '../../models/ai'
import { GamePhase } from './IntegratedEvaluationService'

/**
 * mayah型形評価結果
 */
export interface ShapeEvaluation {
  /** U字型スコア */
  uShapeScore: number
  /** 連結スコア */
  connectionScore: number
  /** 谷ペナルティ */
  valleyPenalty: number
  /** 山ペナルティ */
  mountainPenalty: number
  /** 高さバランススコア */
  heightBalanceScore: number
  /** 総合スコア */
  totalScore: number
  /** 評価理由 */
  reason: string
}

/**
 * 理想的なU字型の高さ配置
 * 中央が低く、両端が高い形状を理想とする
 */
// eslint-disable-next-line complexity
const calculateIdealUShape = (
  field: AIFieldState,
  gamePhase: GamePhase,
): readonly number[] => {
  const width = field.width
  const heights = new Array(width)

  // フェーズに応じて理想形状を調整
  const baseHeight =
    gamePhase === GamePhase.EARLY ? 2 : gamePhase === GamePhase.MIDDLE ? 4 : 6
  const edgeHeight =
    gamePhase === GamePhase.EARLY ? 4 : gamePhase === GamePhase.MIDDLE ? 6 : 8

  for (let x = 0; x < width; x++) {
    if (x === 0 || x === width - 1) {
      // 両端は高め
      heights[x] = edgeHeight
    } else if (x === Math.floor(width / 2) || x === Math.floor(width / 2) - 1) {
      // 中央は低め
      heights[x] = baseHeight
    } else {
      // その他は中間
      heights[x] = (baseHeight + edgeHeight) / 2
    }
  }

  return heights
}

/**
 * 現在の列高さを取得
 */
// eslint-disable-next-line complexity
const getColumnHeights = (field: AIFieldState): readonly number[] => {
  const heights = new Array(field.width).fill(0)

  // フィールドの存在チェック
  if (!field?.cells || !Array.isArray(field.cells)) {
    return heights
  }

  for (let x = 0; x < field.width; x++) {
    // 上から見て最初に見つかったぷよの位置が高さ
    let height = 0
    for (let y = 0; y < field.height; y++) {
      const row = field.cells[y]
      if (!row || !Array.isArray(row)) {
        continue
      }
      if (row[x] !== null) {
        height = field.height - y
        break
      }
    }
    heights[x] = height
  }

  return heights
}

/**
 * U字型スコア計算
 * 理想形状との差異を二乗誤差で評価
 */
const calculateUShapeScore = (
  currentHeights: readonly number[],
  idealHeights: readonly number[],
  gamePhase: GamePhase,
): number => {
  let sumSquaredError = 0

  for (let x = 0; x < currentHeights.length; x++) {
    const diff = currentHeights[x] - idealHeights[x]
    sumSquaredError += diff * diff
  }

  // フェーズに応じて重み調整
  const phaseWeight =
    gamePhase === GamePhase.EARLY
      ? 1.5
      : gamePhase === GamePhase.MIDDLE
        ? 1.0
        : 0.5

  // 二乗誤差が小さいほど高スコア（最大100点）
  const baseScore = Math.max(0, 100 - sumSquaredError * 2)
  return baseScore * phaseWeight
}

/**
 * 連結数評価
 * 同色ぷよの連結を評価
 */
// eslint-disable-next-line complexity
const evaluateConnections = (field: AIFieldState): number => {
  // フィールドの存在チェック
  if (!field?.cells || !Array.isArray(field.cells)) {
    return 0
  }

  let totalConnectionScore = 0
  const visited = Array(field.height)
    .fill(null)
    .map(() => Array(field.width).fill(false))

  for (let y = 0; y < field.height; y++) {
    const row = field.cells[y]
    if (!row || !Array.isArray(row)) {
      continue
    }
    for (let x = 0; x < field.width; x++) {
      if (!visited[y][x] && row[x] !== null) {
        const groupSize = countConnectedGroup(field, x, y, visited)

        // 2連結: 10点、3連結: 30点、4連結以上: 50点
        if (groupSize === 2) {
          totalConnectionScore += 10
        } else if (groupSize === 3) {
          totalConnectionScore += 30
        } else if (groupSize >= 4) {
          totalConnectionScore += 50
        }
      }
    }
  }

  return totalConnectionScore
}

/**
 * 連結グループのサイズをカウント（DFS）
 */
// eslint-disable-next-line complexity
const countConnectedGroup = (
  field: AIFieldState,
  startX: number,
  startY: number,
  visited: boolean[][],
): number => {
  // フィールドの存在チェック
  if (!field?.cells || !Array.isArray(field.cells)) {
    return 0
  }

  const row = field.cells[startY]
  if (!row || !Array.isArray(row)) {
    return 0
  }

  const color = row[startX]
  if (color === null) return 0

  const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]
  let count = 0

  while (stack.length > 0) {
    const pos = stack.pop()!
    if (visited[pos.y][pos.x]) continue

    visited[pos.y][pos.x] = true
    count++

    // 4方向を確認
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]
    for (const [dx, dy] of directions) {
      const nx = pos.x + dx
      const ny = pos.y + dy

      if (
        nx >= 0 &&
        nx < field.width &&
        ny >= 0 &&
        ny < field.height &&
        !visited[ny][nx]
      ) {
        const nextRow = field.cells[ny]
        if (nextRow && Array.isArray(nextRow) && nextRow[nx] === color) {
          stack.push({ x: nx, y: ny })
        }
      }
    }
  }

  return count
}

/**
 * 山谷評価
 * 深い谷や高い山をペナルティとして評価
 */
// eslint-disable-next-line complexity
const evaluateMountainsAndValleys = (
  field: AIFieldState,
): { valleyPenalty: number; mountainPenalty: number } => {
  const heights = getColumnHeights(field)
  let valleyPenalty = 0
  let mountainPenalty = 0

  for (let x = 1; x < heights.length - 1; x++) {
    const leftHeight = heights[x - 1]
    const centerHeight = heights[x]
    const rightHeight = heights[x + 1]

    // 谷判定（両隣より低いか、少なくとも片方より2以上低い）
    const leftDiff = leftHeight - centerHeight
    const rightDiff = rightHeight - centerHeight
    const maxValleyDepth = Math.max(leftDiff, rightDiff)

    if (
      (centerHeight < leftHeight && centerHeight < rightHeight) ||
      maxValleyDepth >= 2
    ) {
      // 深さ4以上で2000点減点
      if (maxValleyDepth >= 4) {
        valleyPenalty += 2000
      } else if (maxValleyDepth >= 2) {
        valleyPenalty += maxValleyDepth * 100
      }
    }

    // 山判定（両隣より高いか、少なくとも片方より2以上高い）
    const leftMountain = centerHeight - leftHeight
    const rightMountain = centerHeight - rightHeight
    const maxMountainHeight = Math.max(leftMountain, rightMountain)

    if (
      (centerHeight > leftHeight && centerHeight > rightHeight) ||
      maxMountainHeight >= 2
    ) {
      // 高さ4以上で2000点減点
      if (maxMountainHeight >= 4) {
        mountainPenalty += 2000
      } else if (maxMountainHeight >= 2) {
        mountainPenalty += maxMountainHeight * 100
      }
    }
  }

  return { valleyPenalty, mountainPenalty }
}

/**
 * 高さバランス評価
 * 列間の高さの分散を評価
 */
const calculateHeightBalance = (heights: readonly number[]): number => {
  // 平均高さを計算
  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length

  // 分散を計算
  let variance = 0
  for (const height of heights) {
    const diff = height - avgHeight
    variance += diff * diff
  }
  variance /= heights.length

  // 分散が小さいほど高スコア（最大50点）
  return Math.max(0, 50 - variance * 5)
}

/**
 * 評価理由生成
 */
// eslint-disable-next-line complexity
const generateShapeReason = (scores: {
  uShapeScore: number
  connectionScore: number
  valleyPenalty: number
  mountainPenalty: number
  heightBalanceScore: number
}): string => {
  const reasons: string[] = []

  // U字型評価
  if (scores.uShapeScore >= 80) {
    reasons.push('理想的U字型')
  } else if (scores.uShapeScore >= 40) {
    reasons.push('U字型良好')
  }

  // 連結評価
  if (scores.connectionScore >= 100) {
    reasons.push('高連結')
  } else if (scores.connectionScore >= 50) {
    reasons.push('中連結')
  }

  // 山谷評価
  if (scores.valleyPenalty > 0) {
    reasons.push('谷あり')
  }
  if (scores.mountainPenalty > 0) {
    reasons.push('山あり')
  }

  // バランス評価
  if (scores.heightBalanceScore >= 40) {
    reasons.push('バランス良好')
  }

  return reasons.length > 0
    ? `形評価: ${reasons.join('・')}`
    : '形評価: 標準形状'
}

/**
 * mayah型形評価サービス（メイン関数）
 * U字型・連結・山谷・バランスを総合的に評価
 */
export const evaluateShape = (
  gameState: AIGameState,
  gamePhase: GamePhase,
): ShapeEvaluation => {
  const field = gameState.field

  // 理想形状と現在の高さを取得
  const idealHeights = calculateIdealUShape(field, gamePhase)
  const currentHeights = getColumnHeights(field)

  // 各評価項目を計算
  const uShapeScore = calculateUShapeScore(
    currentHeights,
    idealHeights,
    gamePhase,
  )
  const connectionScore = evaluateConnections(field)
  const { valleyPenalty, mountainPenalty } = evaluateMountainsAndValleys(field)
  const heightBalanceScore = calculateHeightBalance(currentHeights)

  // 総合スコアを計算（ペナルティは減点）
  const totalScore =
    uShapeScore +
    connectionScore +
    heightBalanceScore -
    valleyPenalty -
    mountainPenalty

  // 評価理由を生成
  const reason = generateShapeReason({
    uShapeScore,
    connectionScore,
    valleyPenalty,
    mountainPenalty,
    heightBalanceScore,
  })

  return {
    uShapeScore,
    connectionScore,
    valleyPenalty,
    mountainPenalty,
    heightBalanceScore,
    totalScore: Math.max(0, totalScore), // 負のスコアは0にクリップ
    reason,
  }
}
