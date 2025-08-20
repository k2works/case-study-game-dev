/**
 * mayah AI操作評価ドメインサービス（関数型リファクタリング版）
 * Phase 4c: 関数型プログラミング手法による実装
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState, PossibleMove } from '../../models/ai'

/**
 * 操作評価結果
 */
export interface OperationEvaluation {
  /** 基本スコア */
  baseScore: number
  /** 位置評価スコア */
  positionScore: number
  /** 色配置評価スコア */
  colorScore: number
  /** 連鎖可能性スコア */
  chainPotentialScore: number
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
  readonly baseScore: number
  readonly positionScore: number
  readonly colorScore: number
  readonly chainPotentialScore: number
}

// Phase 4c: 関数型キャッシュストレージ（モジュールレベル）
const fieldCache = new Map<string, number[]>()
/**
 * 関数型操作評価サービス（メイン関数）
 * 関数の合成により評価を実行
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
): ScoreComponents => ({
  baseScore: calculateBaseScore(move, context),
  positionScore: calculatePositionScore(move, context),
  colorScore: calculateColorScore(move, context),
  chainPotentialScore: calculateChainPotential(move, context),
})

/**
 * 評価結果合成（純粋関数）
 */
const composeEvaluationResult = (
  components: ScoreComponents,
): OperationEvaluation => {
  const { baseScore, positionScore, colorScore, chainPotentialScore } =
    components
  const totalScore =
    baseScore + positionScore + colorScore + chainPotentialScore
  const reason = generateReason({ ...components, totalScore })

  return {
    baseScore,
    positionScore,
    colorScore,
    chainPotentialScore,
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
 * 基本スコア計算（純粋関数）
 * フィールド中央への配置を重視
 */
const calculateBaseScore = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  const distanceFromCenter = Math.abs(move.x - context.centerX)
  // 中央に近いほど高スコア（最大50点）
  return Math.max(0, 50 - distanceFromCenter * 8)
}

/**
 * 位置評価スコア計算（純粋関数）
 * 高さと安定性を評価
 */
const calculatePositionScore = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  const height = context.heightInfo[move.x]

  // 低い位置ほど高スコア（最大30点）
  const heightScore = Math.max(0, 30 - height * 3)

  // 隣接列との高さバランス評価（最大20点）
  const balanceScore = calculateBalanceScore(move.x, context.heightInfo)

  return heightScore + balanceScore
}

/**
 * 色配置評価スコア計算（純粋関数）
 * 同色の隣接配置を評価
 */
const calculateColorScore = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  if (!context.gameState.currentPuyoPair) return 0

  const { primaryColor, secondaryColor } = context.gameState.currentPuyoPair

  // 主ぷよの評価
  const primaryY = calculateDropPosition(move.x, context.gameState)
  const primaryAdjacent = countAdjacentSameColor(
    move.x,
    primaryY,
    primaryColor,
    context.gameState,
  )

  // 副ぷよの評価
  const { subX, subY } = calculateSubPuyoPosition(move, context.gameState)
  const secondaryAdjacent = isValidPosition(subX, subY, context.gameState)
    ? countAdjacentSameColor(subX, subY, secondaryColor, context.gameState)
    : 0

  // 隣接同色1つにつき15点
  return (primaryAdjacent + secondaryAdjacent) * 15
}

/**
 * 連鎖可能性スコア計算（純粋関数）
 * 将来の連鎖につながる配置を評価
 */
const calculateChainPotential = (
  move: PossibleMove,
  context: EvaluationContext,
): number => {
  if (!context.gameState.currentPuyoPair) return 0

  const { primaryColor, secondaryColor } = context.gameState.currentPuyoPair

  // 主ぷよと副ぷよの連鎖可能性を計算
  const primaryChainScore = canForm4Group(
    move.x,
    primaryColor,
    context.gameState,
  )
    ? 40
    : 0

  const { subX } = calculateSubPuyoPosition(move, context.gameState)
  const secondaryChainScore = canForm4Group(
    subX,
    secondaryColor,
    context.gameState,
  )
    ? 40
    : 0

  return primaryChainScore + secondaryChainScore
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
  const heights = Array.from({ length: gameState.field.width }, (_, x) =>
    calculateColumnHeight(gameState.field.cells, x),
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
  const firstNonEmptyIndex = cells.findIndex((row) => row[x] !== null)
  return firstNonEmptyIndex === -1 ? cells.length : firstNonEmptyIndex
}

/**
 * ぷよが落ちる位置を計算（純粋関数）
 */
const calculateDropPosition = (x: number, gameState: AIGameState): number => {
  const cells = gameState.field.cells
  for (let y = cells.length - 1; y >= 0; y--) {
    if (cells[y][x] === null) {
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
): boolean =>
  isValidPosition(x, y, gameState) && gameState.field.cells[y][x] === color

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
 * 4個グループ形成可能性判定（純粋関数）
 */
const canForm4Group = (
  x: number,
  color: PuyoColor,
  gameState: AIGameState,
): boolean => {
  const baseHeight = calculateColumnHeight(gameState.field.cells, x)

  const adjacentPositions = [
    { x: x - 1, y: baseHeight }, // 左
    { x: x + 1, y: baseHeight }, // 右
    { x: x, y: baseHeight - 1 }, // 上
    { x: x, y: baseHeight + 1 }, // 下
  ] as const

  return adjacentPositions.some(
    (pos) =>
      isValidPosition(pos.x, pos.y, gameState) &&
      gameState.field.cells[pos.y][pos.x] === color,
  )
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
  baseScore: number
  positionScore: number
  colorScore: number
  chainPotentialScore: number
  totalScore: number
}): string => {
  const reasonMap = [
    { threshold: 30, key: 'baseScore', label: '中央配置' },
    { threshold: 25, key: 'positionScore', label: '安定位置' },
    { threshold: 20, key: 'colorScore', label: '色隣接' },
    { threshold: 30, key: 'chainPotentialScore', label: '連鎖可能' },
  ] as const

  const reasons = reasonMap
    .filter(({ threshold, key }) => scores[key] > threshold)
    .map(({ label }) => label)

  const finalReasons = reasons.length > 0 ? reasons : ['基本配置']

  return `Phase 4c関数型評価: ${finalReasons.join('・')}`
}
