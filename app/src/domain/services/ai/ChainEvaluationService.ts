/**
 * 連鎖評価サービス
 * パターンマッチング、GTR定跡、連鎖可能性評価を統合した高度な連鎖分析システム
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState, AIGameState, PossibleMove } from '../../models/ai'
import { ChainPatternMatcher } from './ChainPatternMatcher'
import {
  type ChainPattern,
  ChainPatternType,
  type GTREvaluation,
  GTRVariant,
} from './ChainTypes'
import { GTRSystem } from './GTRSystem'
import type { GamePhase } from './IntegratedEvaluationService'

// 型の再エクスポート
export { ChainPatternType, GTRVariant, type ChainPattern, type GTREvaluation }

/**
 * 連鎖評価結果
 */
export interface ChainEvaluationResult {
  /** 総合スコア */
  totalScore: number
  /** 連鎖長 */
  chainLength: number
  /** 連鎖威力（予想消去ぷよ数） */
  chainPower: number
  /** 連鎖発火確率 */
  triggerProbability: number
  /** 検出されたパターン */
  detectedPatterns: ChainPattern[]
  /** GTR定跡評価 */
  gtrEvaluation: GTREvaluation | null
  /** 連鎖安定性 */
  stability: number
  /** 拡張可能性 */
  extensibility: number
  /** 評価理由 */
  reason: string
}

/**
 * 連鎖探索結果
 */
interface ChainSearchResult {
  /** 連鎖数 */
  chainCount: number
  /** 消去ぷよ数 */
  erasedPuyos: number
  /** 連鎖経路 */
  chainPath: Array<{
    /** 消去位置 */
    erasePositions: Array<{ x: number; y: number }>
    /** 消去色 */
    color: PuyoColor
    /** 消去数 */
    count: number
  }>
}

/**
 * GTR定跡パターン定義
 */
const GTR_PATTERNS = {
  [GTRVariant.STANDARD]: {
    name: '標準GTR',
    description: '最も基本的なGTR形。安定した連鎖を構築可能',
    template: [
      // 6x12のフィールドでの理想形パターン
      // 実際の実装ではより詳細なパターンマッチング
    ],
    minChainLength: 4,
    maxChainLength: 12,
  },
  [GTRVariant.NEW]: {
    name: '新GTR',
    description: '改良されたGTR。より高い連鎖が可能',
    template: [],
    minChainLength: 5,
    maxChainLength: 15,
  },
  [GTRVariant.LST]: {
    name: 'LST積み',
    description: 'L字、S字、T字を組み合わせた積み方',
    template: [],
    minChainLength: 3,
    maxChainLength: 10,
  },
  [GTRVariant.DT]: {
    name: 'DT砲',
    description: 'ダブルトリプル砲台',
    template: [],
    minChainLength: 4,
    maxChainLength: 8,
  },
  [GTRVariant.TSD]: {
    name: 'TSD',
    description: 'T-Spin Doubleに似た形',
    template: [],
    minChainLength: 3,
    maxChainLength: 7,
  },
}

/**
 * フィールドの基本的な有効性をチェック
 */
const isValidField = (field: AIFieldState): boolean => {
  return field?.cells && Array.isArray(field.cells)
}

/**
 * 座標の範囲をチェック
 */
const isValidCoordinate = (
  field: AIFieldState,
  x: number,
  y: number,
): boolean => {
  return y >= 0 && y < field.height && x >= 0 && x < field.width
}

/**
 * フィールドの指定位置のぷよ色を安全に取得
 */
const getPuyoAt = (
  field: AIFieldState,
  x: number,
  y: number,
): PuyoColor | null => {
  if (!isValidField(field)) return null
  if (!isValidCoordinate(field, x, y)) return null

  const row = field.cells[y]
  if (!row || !Array.isArray(row)) return null

  return row[x] || null
}

/**
 * 連鎖探索（DFS）
 */
const searchChains = (field: AIFieldState): ChainSearchResult[] => {
  const chains: ChainSearchResult[] = []
  const fieldCopy = JSON.parse(JSON.stringify(field)) as AIFieldState

  // 簡易的な連鎖探索実装
  // 実際の実装では、重力処理、消去処理、連鎖判定を正確に行う
  let chainCount = 0
  let totalErased = 0

  while (true) {
    const erasedGroups = findErasableGroups(fieldCopy)
    if (erasedGroups.length === 0) break

    chainCount++
    let chainErased = 0

    for (const group of erasedGroups) {
      chainErased += group.positions.length
      // ぷよを消去
      for (const pos of group.positions) {
        if (fieldCopy.cells[pos.y]) {
          fieldCopy.cells[pos.y][pos.x] = null
        }
      }
    }

    totalErased += chainErased

    // 重力処理
    applyGravity(fieldCopy)
  }

  if (chainCount > 0) {
    chains.push({
      chainCount,
      erasedPuyos: totalErased,
      chainPath: [], // 簡略化
    })
  }

  return chains
}

/**
 * 消去可能なグループを検索
 */
const findErasableGroups = (
  field: AIFieldState,
): Array<{
  color: PuyoColor
  positions: Array<{ x: number; y: number }>
}> => {
  const groups: Array<{
    color: PuyoColor
    positions: Array<{ x: number; y: number }>
  }> = []

  const visited = Array(field.height)
    .fill(null)
    .map(() => Array(field.width).fill(false))

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      if (visited[y][x]) continue

      const color = getPuyoAt(field, x, y)
      if (!color) continue

      const group = findConnectedGroup(field, x, y, color, visited)
      if (group.length >= 4) {
        groups.push({
          color,
          positions: group,
        })
      }
    }
  }

  return groups
}

/**
 * 隣接する座標を取得
 */
const getAdjacentCoordinates = (x: number, y: number) => [
  { x: x, y: y - 1 }, // 上
  { x: x, y: y + 1 }, // 下
  { x: x - 1, y: y }, // 左
  { x: x + 1, y: y }, // 右
]

/**
 * 座標が有効で未訪問かつ同色かチェック
 */
const canVisit = (
  field: AIFieldState,
  x: number,
  y: number,
  targetColor: PuyoColor,
  visited: boolean[][],
): boolean => {
  return (
    isValidCoordinate(field, x, y) &&
    !visited[y][x] &&
    getPuyoAt(field, x, y) === targetColor
  )
}

/**
 * 連結グループを検索（DFS）
 */
const findConnectedGroup = (
  field: AIFieldState,
  startX: number,
  startY: number,
  targetColor: PuyoColor,
  visited: boolean[][],
): Array<{ x: number; y: number }> => {
  const group: Array<{ x: number; y: number }> = []
  const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]

  while (stack.length > 0) {
    const current = stack.pop()!
    const { x, y } = current

    if (visited[y][x]) continue
    if (getPuyoAt(field, x, y) !== targetColor) continue

    visited[y][x] = true
    group.push({ x, y })

    const adjacentCoords = getAdjacentCoordinates(x, y)
    for (const coord of adjacentCoords) {
      if (canVisit(field, coord.x, coord.y, targetColor, visited)) {
        stack.push(coord)
      }
    }
  }

  return group
}

/**
 * 重力処理
 */
const applyGravity = (field: AIFieldState): void => {
  for (let x = 0; x < field.width; x++) {
    // 各列で下から詰める
    let writeIndex = field.height - 1

    for (let y = field.height - 1; y >= 0; y--) {
      const puyo = getPuyoAt(field, x, y)
      if (puyo) {
        field.cells[writeIndex][x] = puyo
        if (writeIndex !== y) {
          field.cells[y][x] = null
        }
        writeIndex--
      }
    }
  }
}

/**
 * GTR定跡パターンを検出
 */
const detectGTRPattern = (field: AIFieldState): GTREvaluation | null => {
  // GTR検出の簡易実装
  // 実際の実装では、各GTRバリアントの詳細なパターンマッチングを行う

  // 土台の安定性をチェック
  const foundationStability = evaluateFoundationStability(field)

  // 基本的なGTR形状の検出
  const hasGTRLikeStructure = checkGTRStructure(field)

  if (!hasGTRLikeStructure) return null

  return {
    variant: GTRVariant.STANDARD,
    completeness: foundationStability,
    idealMatch: foundationStability * 0.8,
    triggerability: foundationStability * 0.9,
    foundationStability,
    extensionPotential: foundationStability * 0.7,
    details: {
      foundation: foundationStability,
      chainTail: foundationStability * 0.8,
      extension: foundationStability * 0.7,
      pressure: foundationStability * 0.6,
    },
  }
}

/**
 * 土台の安定性を評価
 */
const evaluateFoundationStability = (field: AIFieldState): number => {
  let stability = 0
  let positions = 0

  // 下部3段の安定性をチェック
  for (let y = field.height - 3; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      positions++
      const puyo = getPuyoAt(field, x, y)
      if (puyo) {
        stability += 0.8

        // 隣接ぷよとの組み合わせをチェック
        const neighbors = [
          getPuyoAt(field, x - 1, y),
          getPuyoAt(field, x + 1, y),
          getPuyoAt(field, x, y - 1),
        ].filter(Boolean)

        if (neighbors.some((neighbor) => neighbor === puyo)) {
          stability += 0.2
        }
      }
    }
  }

  return Math.min(1, stability / positions)
}

/**
 * GTR構造をチェック
 */
const checkGTRStructure = (field: AIFieldState): boolean => {
  // 簡易的なGTR構造チェック
  // 実際の実装では、より詳細な形状パターンマッチングを行う

  let puyoCount = 0
  let validPositions = 0

  // 下部の構造をチェック
  for (let y = field.height - 4; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      validPositions++
      if (getPuyoAt(field, x, y)) {
        puyoCount++
      }
    }
  }

  // ある程度ぷよが積まれていればGTR可能性ありとする
  return puyoCount / validPositions > 0.3
}

/**
 * 連鎖パターンを検出
 */
const detectChainPatterns = (field: AIFieldState): ChainPattern[] => {
  const patterns: ChainPattern[] = []

  // 階段積みパターンの検出
  const stairsPattern = detectStairsPattern(field)
  if (stairsPattern) {
    patterns.push(stairsPattern)
  }

  // 挟み込みパターンの検出
  const sandwichPattern = detectSandwichPattern(field)
  if (sandwichPattern) {
    patterns.push(sandwichPattern)
  }

  return patterns
}

/**
 * 特定位置で階段パターンをチェック
 */
const checkStairPatternAt = (
  field: AIFieldState,
  x: number,
  y: number,
): boolean => {
  const current = getPuyoAt(field, x, y)
  const right = getPuyoAt(field, x + 1, y)
  const above = getPuyoAt(field, x, y - 1)

  return !!(current && right && above && current === right && current !== above)
}

/**
 * 階段パターンスコアを計算
 */
const calculateStairScore = (
  field: AIFieldState,
): { stairScore: number; positions: number } => {
  let stairScore = 0
  let positions = 0

  for (let x = 0; x < field.width - 1; x++) {
    for (let y = field.height - 4; y < field.height - 1; y++) {
      positions++
      if (checkStairPatternAt(field, x, y)) {
        stairScore++
      }
    }
  }

  return { stairScore, positions }
}

/**
 * 階段積みパターンを検出
 */
const detectStairsPattern = (field: AIFieldState): ChainPattern | null => {
  const { stairScore, positions } = calculateStairScore(field)

  if (stairScore / positions > 0.3) {
    return {
      type: ChainPatternType.STAIRS,
      confidence: stairScore / positions,
      position: { x: 0, y: field.height - 4 },
      size: { width: field.width, height: 4 },
      estimatedChainLength: Math.min(8, stairScore + 2),
      details: { stairScore, positions },
    }
  }

  return null
}

/**
 * 特定位置で挟み込みパターンをチェック
 */
const checkSandwichPatternAt = (
  field: AIFieldState,
  x: number,
  y: number,
): boolean => {
  const left = getPuyoAt(field, x - 1, y)
  const center = getPuyoAt(field, x, y)
  const right = getPuyoAt(field, x + 1, y)

  return !!(left && center && right && left === right && left !== center)
}

/**
 * 挟み込みパターン数をカウント
 */
const countSandwichPatterns = (field: AIFieldState): number => {
  let sandwichCount = 0

  for (let x = 1; x < field.width - 1; x++) {
    for (let y = field.height - 3; y < field.height; y++) {
      if (checkSandwichPatternAt(field, x, y)) {
        sandwichCount++
      }
    }
  }

  return sandwichCount
}

/**
 * 挟み込みパターンを検出
 */
const detectSandwichPattern = (field: AIFieldState): ChainPattern | null => {
  const sandwichCount = countSandwichPatterns(field)

  if (sandwichCount > 0) {
    return {
      type: ChainPatternType.SANDWICH,
      confidence: Math.min(1, sandwichCount / 3),
      position: { x: 1, y: field.height - 3 },
      size: { width: field.width - 2, height: 3 },
      estimatedChainLength: Math.min(6, sandwichCount + 1),
      details: { sandwichCount },
    }
  }

  return null
}

/**
 * 連鎖安定性を評価
 */
const evaluateChainStability = (
  patterns: ChainPattern[],
  gtr: GTREvaluation | null,
): number => {
  let stability = 0.5 // ベーススコア

  // パターンによる安定性ボーナス
  for (const pattern of patterns) {
    stability += pattern.confidence * 0.2
  }

  // GTRによる安定性ボーナス
  if (gtr) {
    stability += gtr.foundationStability * 0.3
  }

  return Math.min(1, stability)
}

/**
 * 連鎖拡張可能性を評価
 */
const evaluateExtensibility = (
  field: AIFieldState,
  patterns: ChainPattern[],
): number => {
  let extensibility = 0.3 // ベーススコア

  // 上部空間の評価
  let upperSpace = 0
  for (let y = 0; y < field.height / 2; y++) {
    for (let x = 0; x < field.width; x++) {
      if (!getPuyoAt(field, x, y)) {
        upperSpace++
      }
    }
  }

  const spaceRatio = upperSpace / ((field.width * field.height) / 2)
  extensibility += spaceRatio * 0.4

  // パターンによる拡張性ボーナス
  for (const pattern of patterns) {
    if (
      pattern.type === ChainPatternType.GTR ||
      pattern.type === ChainPatternType.STAIRS
    ) {
      extensibility += pattern.confidence * 0.3
    }
  }

  return Math.min(1, extensibility)
}

/**
 * 連鎖発火確率を計算
 */
const calculateTriggerProbability = (
  patterns: ChainPattern[],
  gtr: GTREvaluation | null,
  stability: number,
): number => {
  let probability = stability * 0.6 // 安定性ベース

  // GTRの発火可能性
  if (gtr) {
    probability += gtr.triggerability * 0.3
  }

  // パターンによる発火しやすさ
  for (const pattern of patterns) {
    if (pattern.type === ChainPatternType.STAIRS) {
      probability += pattern.confidence * 0.2
    }
  }

  return Math.min(1, probability)
}

/**
 * 評価理由を生成
 */
const generateEvaluationReason = (
  patterns: ChainPattern[],
  gtr: GTREvaluation | null,
  chainLength: number,
): string => {
  const reasons: string[] = []

  if (gtr) {
    reasons.push(
      `${GTR_PATTERNS[gtr.variant].name}(完成度${Math.round(gtr.completeness * 100)}%)`,
    )
  }

  for (const pattern of patterns) {
    const patternName =
      {
        [ChainPatternType.STAIRS]: '階段積み',
        [ChainPatternType.SANDWICH]: '挟み込み',
        [ChainPatternType.TSURUKAME]: '鶴亀',
        [ChainPatternType.BOTTOM_UP]: '底上げ',
        [ChainPatternType.COUNTER]: 'カウンター',
        [ChainPatternType.SUB_TOWER]: '副砲台',
        [ChainPatternType.GTR]: 'GTR',
        [ChainPatternType.UNKNOWN]: '不明',
      }[pattern.type] || '不明'

    reasons.push(
      `${patternName}(信頼度${Math.round(pattern.confidence * 100)}%)`,
    )
  }

  if (chainLength > 0) {
    reasons.push(`${chainLength}連鎖可能`)
  }

  return reasons.length > 0 ? reasons.join('、') : '連鎖構造なし'
}

/**
 * フィールドから色別データを収集
 */
const collectColorData = (
  field: AIFieldState,
): {
  colorCounts: Map<PuyoColor, number>
  adjacentPairs: Map<PuyoColor, number>
  totalPuyos: number
} => {
  const colorCounts = new Map<PuyoColor, number>()
  const adjacentPairs = new Map<PuyoColor, number>()
  let totalPuyos = 0

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const color = getPuyoAt(field, x, y)
      if (color) {
        totalPuyos++
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1)

        // 隣接する同色ぷよをカウント
        const neighbors = [
          getPuyoAt(field, x + 1, y),
          getPuyoAt(field, x, y + 1),
        ].filter((neighbor) => neighbor === color)

        adjacentPairs.set(
          color,
          (adjacentPairs.get(color) || 0) + neighbors.length,
        )
      }
    }
  }

  return { colorCounts, adjacentPairs, totalPuyos }
}

/**
 * 色別の連鎖可能性を計算
 */
const calculateColorChainPotential = (
  colorCounts: Map<PuyoColor, number>,
  adjacentPairs: Map<PuyoColor, number>,
): { potentialChains: number; maxPotentialLength: number } => {
  let potentialChains = 0
  let maxPotentialLength = 0

  for (const [color, count] of colorCounts.entries()) {
    const pairs = adjacentPairs.get(color) || 0
    const groupPotential = Math.floor(count / 4) // 4個で1連鎖
    const connectionBonus = pairs > 0 ? Math.ceil(pairs / 2) : 0

    potentialChains += groupPotential + connectionBonus

    const maxLengthForColor = Math.min(8, groupPotential + connectionBonus)
    maxPotentialLength = Math.max(maxPotentialLength, maxLengthForColor)
  }

  return { potentialChains, maxPotentialLength }
}

/**
 * 高度な連鎖可能性分析
 */
const analyzeChainPotential = (
  field: AIFieldState,
): {
  potentialChains: number
  maxPotentialLength: number
  chainDensity: number
  futureExtensibility: number
} => {
  const { colorCounts, adjacentPairs, totalPuyos } = collectColorData(field)
  const { potentialChains, maxPotentialLength } = calculateColorChainPotential(
    colorCounts,
    adjacentPairs,
  )
  const chainDensity = totalPuyos > 0 ? potentialChains / (totalPuyos / 4) : 0
  const futureExtensibility = calculateFutureExtensibility(field, colorCounts)

  return {
    potentialChains,
    maxPotentialLength,
    chainDensity,
    futureExtensibility,
  }
}

/**
 * 将来の拡張可能性を計算
 */
const calculateFutureExtensibility = (
  field: AIFieldState,
  colorCounts: Map<PuyoColor, number>,
): number => {
  let extensibility = 0

  // 上部空間の評価
  let upperSpace = 0
  const upperRows = Math.floor(field.height / 3)

  for (let y = 0; y < upperRows; y++) {
    for (let x = 0; x < field.width; x++) {
      if (!getPuyoAt(field, x, y)) {
        upperSpace++
      }
    }
  }

  const spaceRatio = upperSpace / (field.width * upperRows)
  extensibility += spaceRatio * 0.4

  // 色バランスの評価
  const colors = Array.from(colorCounts.keys())
  const avgCount =
    colors.length > 0
      ? Array.from(colorCounts.values()).reduce(
          (sum, count) => sum + count,
          0,
        ) / colors.length
      : 0

  let balanceScore = 0
  for (const count of colorCounts.values()) {
    const deviation = Math.abs(count - avgCount) / avgCount
    balanceScore += Math.max(0, 1 - deviation)
  }

  extensibility += colors.length > 0 ? (balanceScore / colors.length) * 0.3 : 0

  // 連鎖の複雑性評価
  const complexityBonus = Math.min(0.3, colors.length * 0.05)
  extensibility += complexityBonus

  return Math.min(1, extensibility)
}

/**
 * 列の高さと最上部位置を計算
 */
const calculateColumnInfo = (
  field: AIFieldState,
  x: number,
): { columnHeight: number; topY: number } => {
  let columnHeight = 0
  let topY = -1

  for (let y = field.height - 1; y >= 0; y--) {
    if (getPuyoAt(field, x, y)) {
      columnHeight = field.height - y
      topY = y - 1
      break
    }
  }

  return { columnHeight, topY }
}

/**
 * 発火確率を計算
 */
const calculateTriggerProbabilityForColumn = (
  field: AIFieldState,
  x: number,
  topY: number,
  columnHeight: number,
): number => {
  let probability = 0.5 // ベース確率

  // 適切な高さボーナス
  if (columnHeight >= 6 && columnHeight <= 8) {
    probability += 0.3
  } else if (columnHeight > 8) {
    probability -= 0.2
  }

  // 周辺の連鎖構造ボーナス
  const surroundingChains = evaluateSurroundingChains(field, x, topY)
  probability += surroundingChains * 0.2

  return Math.max(0, Math.min(1, probability))
}

/**
 * 最適な発火点を選択
 */
const findOptimalTrigger = (
  triggerPoints: Array<{ x: number; y: number; probability: number }>,
): { x: number; y: number; probability: number } | null => {
  return triggerPoints.reduce(
    (best, current) =>
      !best || current.probability > best.probability ? current : best,
    null as { x: number; y: number; probability: number } | null,
  )
}

/**
 * 連鎖発火点の分析
 */
const analyzeTriggerPoints = (
  field: AIFieldState,
): {
  triggerPoints: Array<{ x: number; y: number; probability: number }>
  optimalTrigger: { x: number; y: number; probability: number } | null
} => {
  const triggerPoints: Array<{ x: number; y: number; probability: number }> = []

  // 各列の上部を発火点候補として評価
  for (let x = 0; x < field.width; x++) {
    const { columnHeight, topY } = calculateColumnInfo(field, x)

    if (topY >= 0 && topY < field.height) {
      const probability = calculateTriggerProbabilityForColumn(
        field,
        x,
        topY,
        columnHeight,
      )

      triggerPoints.push({ x, y: topY, probability })
    }
  }

  const optimalTrigger = findOptimalTrigger(triggerPoints)

  return { triggerPoints, optimalTrigger }
}

/**
 * 特定位置の隣接連鎖スコアを計算
 */
const calculatePositionChainScore = (
  field: AIFieldState,
  x: number,
  y: number,
): number => {
  const color = getPuyoAt(field, x, y)
  if (!color) return 0

  const neighbors = [
    getPuyoAt(field, x - 1, y),
    getPuyoAt(field, x + 1, y),
    getPuyoAt(field, x, y - 1),
    getPuyoAt(field, x, y + 1),
  ].filter((neighbor) => neighbor === color).length

  return neighbors >= 1 ? 0.1 : 0
}

/**
 * 周辺の連鎖構造を評価
 */
const evaluateSurroundingChains = (
  field: AIFieldState,
  centerX: number,
  centerY: number,
): number => {
  let chainScore = 0
  const radius = 2

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue

      const x = centerX + dx
      const y = centerY + dy
      chainScore += calculatePositionChainScore(field, x, y)
    }
  }

  return Math.min(1, chainScore)
}

/**
 * GTR評価を実行
 */
const performGTREvaluation = (
  field: AIFieldState,
  patternResult: {
    gtrResult?: { variant: GTRVariant; confidence: number } | null
  },
): GTREvaluation | null => {
  if (patternResult.gtrResult) {
    return GTRSystem.evaluateGTRDetailed(field, patternResult.gtrResult.variant)
  } else {
    return GTRSystem.detectBestGTRVariant(field)
  }
}

/**
 * 連鎖長を推定
 */
const estimateChainLength = (
  maxChain: { chainCount: number },
  chainPotential: { maxPotentialLength: number },
  patterns: ChainPattern[],
): number => {
  return Math.max(
    maxChain.chainCount,
    chainPotential.maxPotentialLength,
    patterns.reduce((max, p) => Math.max(max, p.estimatedChainLength), 0),
  )
}

/**
 * ベーススコアを計算
 */
const calculateBaseScore = (
  estimatedChainLength: number,
  chainPotential: {
    potentialChains: number
    chainDensity: number
  },
  maxChain: { erasedPuyos: number },
  stability: number,
  extensibility: number,
  triggerProbability: number,
): number => {
  return (
    estimatedChainLength * 20 +
    chainPotential.potentialChains * 10 +
    maxChain.erasedPuyos * 3 +
    stability * 25 +
    extensibility * 20 +
    triggerProbability * 30 +
    chainPotential.chainDensity * 15
  )
}

/**
 * 連鎖を評価（拡張版）
 */
export const evaluateChain = (
  gameState: AIGameState,
  _move: PossibleMove,
  gamePhase: GamePhase,
): ChainEvaluationResult => {
  const field = gameState.field

  // 基本的な安全性チェック
  if (!field?.cells || !Array.isArray(field.cells)) {
    return {
      totalScore: 0,
      chainLength: 0,
      chainPower: 0,
      triggerProbability: 0,
      detectedPatterns: [],
      gtrEvaluation: null,
      stability: 0,
      extensibility: 0,
      reason: 'フィールド情報なし',
    }
  }

  // 高度なパターンマッチングを使用
  const patternResult = ChainPatternMatcher.matchAllPatterns(field)
  const patterns = patternResult.patterns

  // GTRシステムを使用した詳細評価
  const gtrEvaluation = performGTREvaluation(field, patternResult)

  // 連鎖探索
  const chainResults = searchChains(field)
  const maxChain = chainResults.reduce(
    (max, current) => (current.chainCount > max.chainCount ? current : max),
    { chainCount: 0, erasedPuyos: 0, chainPath: [] },
  )

  // 高度な連鎖可能性分析
  const chainPotential = analyzeChainPotential(field)

  // 発火点分析
  const triggerAnalysis = analyzeTriggerPoints(field)

  // 各種評価の統合
  const stability = evaluateChainStability(patterns, gtrEvaluation)
  const extensibility = Math.max(
    evaluateExtensibility(field, patterns),
    chainPotential.futureExtensibility,
  )

  const triggerProbability =
    triggerAnalysis.optimalTrigger?.probability ||
    calculateTriggerProbability(patterns, gtrEvaluation, stability)

  const estimatedChainLength = estimateChainLength(
    maxChain,
    chainPotential,
    patterns,
  )

  // ゲームフェーズによる調整
  const phaseMultiplier =
    {
      early: 0.7, // 序盤は形重視
      middle: 1.0, // 中盤は標準
      late: 1.3, // 終盤は連鎖重視
    }[gamePhase] || 1.0

  const baseScore = calculateBaseScore(
    estimatedChainLength,
    chainPotential,
    maxChain,
    stability,
    extensibility,
    triggerProbability,
  )

  const totalScore = Math.round(baseScore * phaseMultiplier)

  const reason = generateEvaluationReason(
    patterns,
    gtrEvaluation,
    estimatedChainLength,
  )

  return {
    totalScore,
    chainLength: estimatedChainLength,
    chainPower: Math.max(
      maxChain.erasedPuyos,
      chainPotential.potentialChains * 4,
    ),
    triggerProbability,
    detectedPatterns: patterns,
    gtrEvaluation,
    stability,
    extensibility,
    reason,
  }
}

/**
 * 連鎖評価サービスのデフォルトエクスポート
 */
export const ChainEvaluationService = {
  evaluateChain,
  detectGTRPattern,
  detectChainPatterns,
  searchChains,
}
