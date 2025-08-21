/**
 * mayah AI操作評価ドメインサービス
 * mayah型評価：フレーム数・ちぎり・効率性を評価
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState, PossibleMove } from '../../models/ai'

/**
 * mayah型操作評価結果
 */
export interface OperationEvaluation {
  /** フレーム数（操作に要する時間） */
  frameCount: number
  /** フレーム数スコア（少ないほど高評価） */
  frameScore: number
  /** ちぎり回数 */
  tearCount: number
  /** ちぎりスコア（ちぎりは大幅減点） */
  tearScore: number
  /** 配置効率性スコア */
  efficiencyScore: number
  /** 総合スコア */
  totalScore: number
  /** 評価理由 */
  reason: string
}

/**
 * 評価コンテキスト（関数間で共有される文脈情報）
 */
interface EvaluationContext {
  readonly gameState: AIGameState
  readonly centerX: number
  readonly fieldKey: string
  readonly heightInfo: readonly number[]
}

/**
 * スコア構成要素
 */
interface ScoreComponents {
  readonly frameCount: number
  readonly frameScore: number
  readonly tearCount: number
  readonly tearScore: number
  readonly efficiencyScore: number
}

// Phase 4c: 関数型キャッシュストレージ（モジュールレベル）
const fieldCache = new Map<string, number[]>()
/**
 * mayah型操作評価サービス（メイン関数）
 * フレーム数・ちぎり・効率性を評価
 */
export const evaluateMove = (
  move: PossibleMove,
  gameState: AIGameState,
): OperationEvaluation => {
  // 評価コンテキストを生成
  const context = createEvaluationContext(gameState)

  // 各スコア要素を関数合成で計算
  const scoreComponents = calculateScoreComponents(move, context)

  // 結果を合成して返す
  return composeEvaluationResult(scoreComponents)
}

/**
 * 評価コンテキスト生成（純粋関数）
 */
const createEvaluationContext = (gameState: AIGameState): EvaluationContext => {
  const fieldKey = generateFieldCacheKey(gameState)
  const centerX = Math.floor(gameState.field.width / 2)
  const heightInfo = getColumnHeightInfo(gameState, fieldKey)

  return {
    gameState,
    centerX,
    fieldKey,
    heightInfo,
  }
}

/**
 * スコア要素計算（関数合成）
 */
const calculateScoreComponents = (
  move: PossibleMove,
  context: EvaluationContext,
): ScoreComponents => {
  // フレーム数計算
  const frameCount = calculateFrameCount(move, context)
  const frameScore = calculateFrameScore(frameCount)

  // ちぎり判定
  const tearCount = calculateTearCount(move, context)
  const tearScore = calculateTearScore(tearCount)

  // 効率性評価
  const efficiencyScore = calculatePlacementEfficiency(move, context)

  return {
    frameCount,
    frameScore,
    tearCount,
    tearScore,
    efficiencyScore,
  }
}

/**
 * 評価結果合成（純粋関数）
 */
const composeEvaluationResult = (
  components: ScoreComponents,
): OperationEvaluation => {
  const { frameCount, frameScore, tearCount, tearScore, efficiencyScore } =
    components
  const totalScore = frameScore + tearScore + efficiencyScore
  const reason = generateReason({ ...components, totalScore })

  return {
    frameCount,
    frameScore,
    tearCount,
    tearScore,
    efficiencyScore,
    totalScore,
    reason,
  }
}

/**
 * フィールドキャッシュキー生成（純粋関数）
 */
const generateFieldCacheKey = (gameState: AIGameState): string =>
  gameState.field.cells
    .map((row) => row.map((cell) => (cell ? cell[0] : 'n')).join(''))
    .join('|')

/**
 * フレーム数計算（純粋関数）
 * 操作に必要なフレーム数を計算
 */
const calculateFrameCount = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  // 基本フレーム数（横移動）
  const horizontalFrames = Math.abs(move.x - context.centerX) * 2

  // 回転フレーム数（1回転につき2フレーム）
  const rotationFrames = (move.rotation / 90) * 2

  // 6列目は若干遅い（追加2フレーム）
  const edgeColumnPenalty = move.x === context.gameState.field.width - 1 ? 2 : 0

  // 落下フレーム数（高さに依存）
  const dropFrames = Math.max(0, 12 - context.heightInfo[move.x])

  return horizontalFrames + rotationFrames + edgeColumnPenalty + dropFrames
}

/**
 * フレーム数スコア計算（純粋関数）
 * フレーム数が少ないほど高評価
 */
const calculateFrameScore = (frameCount: number): number => {
  // 1フレームあたり0.1点減点
  const baseScore = 100 - frameCount * 0.1
  return Math.max(0, baseScore)
}

/**
 * 縦配置かどうか判定（純粋関数）
 */
const isVerticalPlacement = (rotation: number): boolean => {
  return rotation === 0 || rotation === 180
}

/**
 * 横配置の右側X座標を計算（純粋関数）
 */
const calculateRightX = (x: number, rotation: number): number => {
  return rotation === 90 ? x + 1 : x - 1
}

/**
 * 位置が範囲外かどうか判定（純粋関数）
 */
const isOutOfBounds = (x: number, width: number): boolean => {
  return x < 0 || x >= width
}

/**
 * ちぎり回数計算（純粋関数）
 * ぷよが分離して落ちる場合を検出
 */
const calculateTearCount = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  if (!context.gameState.currentPuyoPair) return 0

  // 縦配置の場合、ちぎりなし
  if (isVerticalPlacement(move.rotation)) {
    return 0
  }

  // 横配置の場合、高さ差を確認
  const leftHeight = context.heightInfo[move.x]
  const rightX = calculateRightX(move.x, move.rotation)

  // 横配置先が範囲外の場合はちぎり扱い
  if (isOutOfBounds(rightX, context.gameState.field.width)) {
    return 1
  }

  const rightHeight = context.heightInfo[rightX]
  const heightDiff = Math.abs(leftHeight - rightHeight)

  // 高さの差が2以上の場合はちぎり
  return heightDiff >= 2 ? 1 : 0
}

/**
 * ちぎりスコア計算（純粋関数）
 * ちぎりは大幅に減点
 */
const calculateTearScore = (tearCount: number): number => {
  // 1回のちぎりにつき100点減点
  const score = -tearCount * 100
  return score === 0 ? 0 : score // -0を0に変換
}

/**
 * 配置効率性評価（純粋関数）
 * 配置の効率性を総合的に評価
 */
const calculatePlacementEfficiency = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  let efficiencyScore = 0

  // 中央への配置は効率的（最大30点）
  const distanceFromCenter = Math.abs(move.x - context.centerX)
  efficiencyScore += Math.max(0, 30 - distanceFromCenter * 10)

  // 低い位置への配置は効率的（最大20点）
  const height = context.heightInfo[move.x]
  efficiencyScore += Math.max(0, 20 - height * 2)

  // 同色隣接配置は効率的
  if (context.gameState.currentPuyoPair) {
    const adjacentScore = calculateAdjacentColorBonus(move, context)
    efficiencyScore += adjacentScore
  }

  // バランスの良い配置は効率的（最大20点）
  const balanceScore = calculateBalanceScore(move.x, context.heightInfo)
  efficiencyScore += balanceScore

  return efficiencyScore
}

/**
 * 同色隣接ボーナス計算（純粋関数）
 */
const calculateAdjacentColorBonus = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  if (!context.gameState.currentPuyoPair) return 0

  const { primaryColor, secondaryColor } = context.gameState.currentPuyoPair
  const primaryY = calculateDropPosition(move.x, context.gameState)
  const primaryAdjacent = countAdjacentSameColor(
    move.x,
    primaryY,
    primaryColor,
    context.gameState,
  )

  const { subX, subY } = calculateSubPuyoPosition(move, context.gameState)
  const secondaryAdjacent = isValidPosition(subX, subY, context.gameState)
    ? countAdjacentSameColor(subX, subY, secondaryColor, context.gameState)
    : 0

  // 隣接同色1つにつき10点
  return (primaryAdjacent + secondaryAdjacent) * 10
}

/**
 * 列高さ情報をキャッシュ付きで取得（純粋関数＋副作用）
 */
const getColumnHeightInfo = (
  gameState: AIGameState,
  fieldKey: string,
): readonly number[] => {
  const cacheKey = `heights_${fieldKey}`

  // キャッシュから取得を試行
  const cached = fieldCache.get(cacheKey)
  if (cached) return cached

  // キャッシュにない場合は計算してキャッシュに保存
  const fieldWidth = gameState.field?.width || 6
  const heights = Array.from({ length: fieldWidth }, (_, x) =>
    calculateColumnHeight(gameState.field?.cells, x),
  )

  fieldCache.set(cacheKey, heights)
  return heights
}

/**
 * 列の高さを計算（純粋関数）
 */
const calculateColumnHeight = (
  cells: readonly (readonly (PuyoColor | null)[])[],
  x: number,
): number => {
  if (!cells || !Array.isArray(cells)) {
    return 0
  }

  const firstNonEmptyIndex = cells.findIndex((row) => {
    if (!row || !Array.isArray(row)) return false
    return row[x] !== null
  })
  return firstNonEmptyIndex === -1 ? 0 : cells.length - firstNonEmptyIndex
}

/**
 * ぷよが落ちる位置を計算（純粋関数）
 */
const calculateDropPosition = (x: number, gameState: AIGameState): number => {
  const cells = gameState.field.cells
  if (!cells || !Array.isArray(cells)) {
    return 0
  }

  for (let y = cells.length - 1; y >= 0; y--) {
    const row = cells[y]
    if (!row || !Array.isArray(row)) {
      continue
    }
    if (row[x] === null) {
      return y
    }
  }
  return 0 // フィールドが満杯の場合
}

/**
 * バランススコア計算（純粋関数）
 */
const calculateBalanceScore = (
  x: number,
  heightInfo: readonly number[],
): number => {
  const currentHeight = heightInfo[x]

  // 隣接列との高さ差評価を関数合成で計算
  const leftScore =
    x > 0
      ? Math.max(0, 10 - Math.abs(currentHeight - heightInfo[x - 1]) * 2)
      : 0

  const rightScore =
    x < heightInfo.length - 1
      ? Math.max(0, 10 - Math.abs(currentHeight - heightInfo[x + 1]) * 2)
      : 0

  return leftScore + rightScore
}

/**
 * 隣接同色ぷよをカウント（純粋関数）
 */
const countAdjacentSameColor = (
  x: number,
  y: number,
  color: PuyoColor,
  gameState: AIGameState,
): number => {
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const

  return directions.filter(([dx, dy]) =>
    isSameColorAt(x + dx, y + dy, color, gameState),
  ).length
}

/**
 * 指定位置が同色かチェック（純粋関数）
 */
const isSameColorAt = (
  x: number,
  y: number,
  color: PuyoColor,
  gameState: AIGameState,
): boolean => {
  if (!isValidPosition(x, y, gameState)) {
    return false
  }

  const cells = gameState.field.cells
  if (!cells || !Array.isArray(cells)) {
    return false
  }

  const row = cells[y]
  if (!row || !Array.isArray(row)) {
    return false
  }

  return row[x] === color
}

/**
 * 副ぷよの配置位置を計算（純粋関数）
 */
const calculateSubPuyoPosition = (
  move: PossibleMove,
  gameState: AIGameState,
): { subX: number; subY: number } => {
  const primaryY = calculateDropPosition(move.x, gameState)

  const rotationMap = {
    0: { subX: move.x, subY: primaryY - 1 }, // 上
    90: {
      subX: move.x + 1,
      subY: calculateDropPosition(move.x + 1, gameState),
    }, // 右
    180: { subX: move.x, subY: primaryY + 1 }, // 下
    270: {
      subX: move.x - 1,
      subY: calculateDropPosition(move.x - 1, gameState),
    }, // 左
  } as const

  return (
    rotationMap[move.rotation as keyof typeof rotationMap] ?? rotationMap[0]
  ) // デフォルトは上向き
}

/**
 * 位置が有効かどうかチェック（純粋関数）
 */
const isValidPosition = (
  x: number,
  y: number,
  gameState: AIGameState,
): boolean => {
  const { width, height, cells } = gameState.field
  return (
    x >= 0 &&
    x < width &&
    y >= 0 &&
    y < height &&
    cells[y] &&
    cells[y][x] !== undefined
  )
}

/**
 * 評価理由を生成（純粋関数）
 */
const generateReason = (scores: {
  frameCount: number
  frameScore: number
  tearCount: number
  tearScore: number
  efficiencyScore: number
  totalScore: number
}): string => {
  const reasons: string[] = []

  // フレーム数評価
  if (scores.frameCount <= 15) {
    reasons.push('高速配置')
  } else if (scores.frameCount >= 20) {
    reasons.push('低速配置')
  }

  // ちぎり評価
  if (scores.tearCount > 0) {
    reasons.push(`ちぎり${scores.tearCount}回`)
  } else {
    reasons.push('ちぎりなし')
  }

  // 効率性評価
  if (scores.efficiencyScore >= 60) {
    reasons.push('高効率')
  } else if (scores.efficiencyScore >= 40) {
    reasons.push('中効率')
  } else {
    reasons.push('低効率')
  }

  return `操作評価: ${reasons.join('・')}`
}
