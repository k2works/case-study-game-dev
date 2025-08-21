/**
 * GTR定跡システム
 * GTR（ぷよぷよ通の定跡）の詳細な分析と評価システム
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState } from '../../models/ai'
import { type GTREvaluation, GTRVariant } from './ChainTypes'
import type { GTRVariant as GTRVariantValues } from './ChainTypes'

/**
 * GTR構成要素
 */
interface GTRComponent {
  /** 要素名 */
  name: string
  /** 重要度 */
  importance: number
  /** 位置 */
  positions: Array<{ x: number; y: number }>
  /** 期待色パターン */
  expectedColors: Array<{ position: { x: number; y: number }; color: string }>
}

/**
 * GTR定跡詳細定義
 */
interface GTRDefinition {
  /** バリアント名 */
  name: string
  /** 説明 */
  description: string
  /** 推定連鎖長 */
  chainLength: { min: number; max: number }
  /** 必要な構成要素 */
  components: GTRComponent[]
  /** 理想的なフィールド状態 */
  idealField: Array<Array<string | null>>
  /** 評価基準 */
  evaluationCriteria: {
    /** 土台の重要度 */
    foundationWeight: number
    /** 連鎖尻の重要度 */
    chainTailWeight: number
    /** 伸ばしの重要度 */
    extensionWeight: number
    /** 発火点の重要度 */
    triggerWeight: number
  }
}

/**
 * GTR定跡データベース
 */
const GTR_DEFINITIONS: Record<GTRVariantValues, GTRDefinition> = {
  [GTRVariant.STANDARD]: {
    name: '標準GTR',
    description: '最も基本的なGTR形。初心者から上級者まで幅広く使用される',
    chainLength: { min: 4, max: 12 },
    components: [
      {
        name: '土台',
        importance: 1.0,
        positions: [
          { x: 0, y: 10 },
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
          { x: 0, y: 11 },
          { x: 1, y: 11 },
          { x: 2, y: 11 },
          { x: 3, y: 11 },
        ],
        expectedColors: [
          { position: { x: 0, y: 10 }, color: 'A' },
          { position: { x: 0, y: 11 }, color: 'A' },
          { position: { x: 1, y: 11 }, color: 'B' },
          { position: { x: 2, y: 10 }, color: 'C' },
          { position: { x: 2, y: 11 }, color: 'C' },
          { position: { x: 3, y: 11 }, color: 'D' },
        ],
      },
      {
        name: '連鎖尻',
        importance: 0.8,
        positions: [
          { x: 4, y: 9 },
          { x: 5, y: 9 },
          { x: 4, y: 10 },
          { x: 5, y: 10 },
          { x: 4, y: 11 },
          { x: 5, y: 11 },
        ],
        expectedColors: [
          { position: { x: 4, y: 9 }, color: 'E' },
          { position: { x: 4, y: 10 }, color: 'E' },
          { position: { x: 5, y: 10 }, color: 'F' },
          { position: { x: 5, y: 11 }, color: 'F' },
        ],
      },
    ],
    idealField: [
      [null, null, null, null, null, null], // y=0
      [null, null, null, null, null, null], // y=1
      [null, null, null, null, null, null], // y=2
      [null, null, null, null, null, null], // y=3
      [null, null, null, null, null, null], // y=4
      [null, null, null, null, null, null], // y=5
      [null, null, null, null, null, null], // y=6
      [null, null, null, null, null, null], // y=7
      [null, null, null, null, null, null], // y=8
      [null, null, null, null, 'E', null], // y=9
      ['A', 'B', 'C', 'D', 'E', 'F'], // y=10
      ['A', 'B', 'C', 'D', null, 'F'], // y=11
    ],
    evaluationCriteria: {
      foundationWeight: 0.4,
      chainTailWeight: 0.3,
      extensionWeight: 0.2,
      triggerWeight: 0.1,
    },
  },
  [GTRVariant.NEW]: {
    name: '新GTR',
    description: '改良されたGTR。より高い連鎖と安定性を実現',
    chainLength: { min: 5, max: 15 },
    components: [
      {
        name: '新GTR土台',
        importance: 1.0,
        positions: [
          { x: 0, y: 9 },
          { x: 1, y: 9 },
          { x: 2, y: 9 },
          { x: 3, y: 9 },
          { x: 0, y: 10 },
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
          { x: 0, y: 11 },
          { x: 1, y: 11 },
          { x: 2, y: 11 },
          { x: 3, y: 11 },
        ],
        expectedColors: [
          { position: { x: 0, y: 9 }, color: 'A' },
          { position: { x: 0, y: 10 }, color: 'A' },
          { position: { x: 0, y: 11 }, color: 'A' },
          { position: { x: 1, y: 10 }, color: 'B' },
          { position: { x: 1, y: 11 }, color: 'C' },
          { position: { x: 2, y: 9 }, color: 'D' },
          { position: { x: 2, y: 10 }, color: 'D' },
          { position: { x: 2, y: 11 }, color: 'D' },
          { position: { x: 3, y: 10 }, color: 'E' },
          { position: { x: 3, y: 11 }, color: 'F' },
        ],
      },
    ],
    idealField: [
      [null, null, null, null, null, null], // y=0-8
      ['A', 'B', 'D', 'E', null, null], // y=9
      ['A', 'B', 'D', 'E', null, null], // y=10
      ['A', 'C', 'D', 'F', null, null], // y=11
    ],
    evaluationCriteria: {
      foundationWeight: 0.5,
      chainTailWeight: 0.25,
      extensionWeight: 0.15,
      triggerWeight: 0.1,
    },
  },
  [GTRVariant.LST]: {
    name: 'LST積み',
    description: 'L字、S字、T字を組み合わせた柔軟性の高い積み方',
    chainLength: { min: 3, max: 10 },
    components: [
      {
        name: 'L字部分',
        importance: 0.7,
        positions: [
          { x: 0, y: 10 },
          { x: 0, y: 11 },
          { x: 1, y: 11 },
        ],
        expectedColors: [
          { position: { x: 0, y: 10 }, color: 'A' },
          { position: { x: 0, y: 11 }, color: 'A' },
          { position: { x: 1, y: 11 }, color: 'B' },
        ],
      },
      {
        name: 'S字部分',
        importance: 0.7,
        positions: [
          { x: 2, y: 9 },
          { x: 3, y: 9 },
          { x: 1, y: 10 },
          { x: 2, y: 10 },
        ],
        expectedColors: [
          { position: { x: 2, y: 9 }, color: 'C' },
          { position: { x: 3, y: 9 }, color: 'C' },
          { position: { x: 1, y: 10 }, color: 'D' },
          { position: { x: 2, y: 10 }, color: 'D' },
        ],
      },
      {
        name: 'T字部分',
        importance: 0.6,
        positions: [
          { x: 4, y: 8 },
          { x: 5, y: 8 },
          { x: 6, y: 8 },
          { x: 5, y: 9 },
        ],
        expectedColors: [
          { position: { x: 4, y: 8 }, color: 'E' },
          { position: { x: 5, y: 8 }, color: 'E' },
          { position: { x: 6, y: 8 }, color: 'E' },
          { position: { x: 5, y: 9 }, color: 'F' },
        ],
      },
    ],
    idealField: [
      [null, null, null, null, 'E', 'E', 'E'], // y=8
      [null, null, 'C', 'C', null, 'F', null], // y=9
      ['A', 'D', 'D', null, null, null, null], // y=10
      ['A', 'B', null, null, null, null, null], // y=11
    ],
    evaluationCriteria: {
      foundationWeight: 0.3,
      chainTailWeight: 0.3,
      extensionWeight: 0.3,
      triggerWeight: 0.1,
    },
  },
  [GTRVariant.DT]: {
    name: 'DT砲',
    description: 'ダブルトリプル砲台。速攻性に優れる',
    chainLength: { min: 4, max: 8 },
    components: [
      {
        name: 'DT土台',
        importance: 1.0,
        positions: [
          { x: 0, y: 9 },
          { x: 1, y: 9 },
          { x: 2, y: 9 },
          { x: 3, y: 9 },
          { x: 0, y: 10 },
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 3, y: 10 },
          { x: 0, y: 11 },
          { x: 1, y: 11 },
          { x: 2, y: 11 },
          { x: 3, y: 11 },
        ],
        expectedColors: [
          { position: { x: 0, y: 9 }, color: 'A' },
          { position: { x: 0, y: 10 }, color: 'A' },
          { position: { x: 1, y: 10 }, color: 'B' },
          { position: { x: 1, y: 11 }, color: 'B' },
          { position: { x: 2, y: 9 }, color: 'C' },
          { position: { x: 2, y: 10 }, color: 'C' },
          { position: { x: 3, y: 10 }, color: 'D' },
          { position: { x: 3, y: 11 }, color: 'D' },
        ],
      },
    ],
    idealField: [
      ['A', 'E', 'C', 'F', null, null], // y=9
      ['A', 'B', 'C', 'D', null, null], // y=10
      [null, 'B', null, 'D', null, null], // y=11
    ],
    evaluationCriteria: {
      foundationWeight: 0.6,
      chainTailWeight: 0.2,
      extensionWeight: 0.1,
      triggerWeight: 0.1,
    },
  },
  [GTRVariant.TSD]: {
    name: 'TSD',
    description: 'T-Spin Double類似の形状。特殊な発火方法',
    chainLength: { min: 3, max: 7 },
    components: [
      {
        name: 'TSD形状',
        importance: 1.0,
        positions: [
          { x: 1, y: 9 },
          { x: 0, y: 10 },
          { x: 1, y: 10 },
          { x: 2, y: 10 },
          { x: 0, y: 11 },
          { x: 1, y: 11 },
          { x: 2, y: 11 },
        ],
        expectedColors: [
          { position: { x: 1, y: 9 }, color: 'A' },
          { position: { x: 0, y: 10 }, color: 'B' },
          { position: { x: 1, y: 10 }, color: 'A' },
          { position: { x: 2, y: 10 }, color: 'C' },
          { position: { x: 0, y: 11 }, color: 'B' },
          { position: { x: 1, y: 11 }, color: 'D' },
          { position: { x: 2, y: 11 }, color: 'C' },
        ],
      },
    ],
    idealField: [
      [null, 'A', null, null, null, null], // y=9
      ['B', 'A', 'C', null, null, null], // y=10
      ['B', 'D', 'C', null, null, null], // y=11
    ],
    evaluationCriteria: {
      foundationWeight: 0.5,
      chainTailWeight: 0.3,
      extensionWeight: 0.1,
      triggerWeight: 0.1,
    },
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
 * 色マッピングを作成
 */
const createColorMapping = (
  field: AIFieldState,
  component: GTRComponent,
): Map<string, PuyoColor> | null => {
  const colorMap = new Map<string, PuyoColor>()

  for (const expectedColor of component.expectedColors) {
    const { x, y } = expectedColor.position
    const fieldColor = getPuyoAt(field, x, y)

    if (!fieldColor) continue // 空の場合はスキップ

    const colorPattern = expectedColor.color

    if (colorMap.has(colorPattern)) {
      // すでにマッピング済みの色パターンと一致するかチェック
      if (colorMap.get(colorPattern) !== fieldColor) {
        return null // 色パターンが一致しない
      }
    } else {
      colorMap.set(colorPattern, fieldColor)
    }
  }

  return colorMap
}

/**
 * GTR構成要素の完成度を評価
 */
const evaluateGTRComponent = (
  field: AIFieldState,
  component: GTRComponent,
): { completeness: number; colorConsistency: number } => {
  const colorMapping = createColorMapping(field, component)

  if (!colorMapping) {
    return { completeness: 0, colorConsistency: 0 }
  }

  let placedPuyos = 0
  let correctPuyos = 0
  const totalPositions = component.expectedColors.length

  for (const expectedColor of component.expectedColors) {
    const { x, y } = expectedColor.position
    const fieldColor = getPuyoAt(field, x, y)

    if (fieldColor) {
      placedPuyos++

      const expectedFieldColor = colorMapping.get(expectedColor.color)
      if (fieldColor === expectedFieldColor) {
        correctPuyos++
      }
    }
  }

  const completeness = totalPositions > 0 ? placedPuyos / totalPositions : 0
  const colorConsistency = placedPuyos > 0 ? correctPuyos / placedPuyos : 0

  return { completeness, colorConsistency }
}

/**
 * GTR土台の安定性を評価
 */
const evaluateGTRFoundation = (
  field: AIFieldState,
  definition: GTRDefinition,
): number => {
  const foundationComponent = definition.components.find((c) =>
    c.name.includes('土台'),
  )
  if (!foundationComponent) return 0

  const evaluation = evaluateGTRComponent(field, foundationComponent)
  return evaluation.completeness * evaluation.colorConsistency
}

/**
 * GTR連鎖尻の評価
 */
const evaluateGTRChainTail = (
  field: AIFieldState,
  definition: GTRDefinition,
): number => {
  const chainTailComponent = definition.components.find((c) =>
    c.name.includes('連鎖尻'),
  )
  if (!chainTailComponent) return 0.5 // 連鎖尻がない場合はデフォルト値

  const evaluation = evaluateGTRComponent(field, chainTailComponent)
  return evaluation.completeness * evaluation.colorConsistency
}

/**
 * GTR拡張可能性の評価
 */
const evaluateGTRExtension = (
  field: AIFieldState,
  definition: GTRDefinition,
): number => {
  // 上部空間の評価
  let upperSpace = 0
  let totalUpperCells = 0

  for (let y = 0; y < field.height / 2; y++) {
    for (let x = 0; x < Math.min(4, field.width); x++) {
      // GTRは通常左4列
      totalUpperCells++
      if (!getPuyoAt(field, x, y)) {
        upperSpace++
      }
    }
  }

  const spaceRatio = totalUpperCells > 0 ? upperSpace / totalUpperCells : 0

  // 伸ばし部分の評価
  let extensionScore = spaceRatio * 0.7

  // 既存の連鎖構造との接続性
  const foundationScore = evaluateGTRFoundation(field, definition)
  extensionScore += foundationScore * 0.3

  return Math.min(1, extensionScore)
}

/**
 * GTR発火可能性の評価
 */
const evaluateGTRTrigger = (
  field: AIFieldState,
  definition: GTRDefinition,
): number => {
  // 発火点（通常は1列目上部）の状況を評価
  let triggerScore = 0.5 // ベーススコア

  // 1列目の高さをチェック
  let columnHeight = 0
  for (let y = field.height - 1; y >= 0; y--) {
    if (getPuyoAt(field, 0, y)) {
      columnHeight = field.height - y
      break
    }
  }

  // 適切な高さ（6-8段）であれば発火しやすい
  if (columnHeight >= 6 && columnHeight <= 8) {
    triggerScore += 0.3
  } else if (columnHeight > 8) {
    triggerScore -= 0.2 // 高すぎると危険
  }

  // 発火色の準備状況
  const foundationScore = evaluateGTRFoundation(field, definition)
  triggerScore += foundationScore * 0.2

  return Math.max(0, Math.min(1, triggerScore))
}

/**
 * セルの一致度をチェック
 */
const checkCellMatch = (
  idealCell: PuyoColor | null,
  fieldCell: PuyoColor | null,
): boolean => {
  if (idealCell === null && fieldCell === null) {
    return true // 両方とも空
  } else if (idealCell !== null && fieldCell !== null) {
    return true // 両方ともぷよがある（色は考慮しない）
  }
  return false
}

/**
 * 行の一致度を計算
 */
const calculateRowMatch = (
  field: AIFieldState,
  row: Array<PuyoColor | null>,
  fieldY: number,
): { matches: number; cells: number } => {
  let matches = 0
  let cells = 0

  for (let x = 0; x < row.length && x < field.width; x++) {
    const idealCell = row[x]
    const fieldCell = getPuyoAt(field, x, fieldY)

    cells++
    if (checkCellMatch(idealCell, fieldCell)) {
      matches++
    }
  }

  return { matches, cells }
}

/**
 * GTR理想形との一致度を計算
 */
const calculateIdealMatch = (
  field: AIFieldState,
  definition: GTRDefinition,
): number => {
  let totalMatches = 0
  let totalCells = 0

  const idealField = definition.idealField
  const startY = field.height - idealField.length

  for (let ry = 0; ry < idealField.length; ry++) {
    const row = idealField[ry] as Array<PuyoColor | null>
    const fieldY = startY + ry
    const { matches, cells } = calculateRowMatch(field, row, fieldY)

    totalMatches += matches
    totalCells += cells
  }

  return totalCells > 0 ? totalMatches / totalCells : 0
}

/**
 * GTRの詳細評価を実行
 */
export const evaluateGTRDetailed = (
  field: AIFieldState,
  variant: GTRVariantValues,
): GTREvaluation => {
  const definition = GTR_DEFINITIONS[variant]
  const criteria = definition.evaluationCriteria

  // 各要素の評価
  const foundationScore = evaluateGTRFoundation(field, definition)
  const chainTailScore = evaluateGTRChainTail(field, definition)
  const extensionScore = evaluateGTRExtension(field, definition)
  const triggerScore = evaluateGTRTrigger(field, definition)

  // 重み付き総合評価
  const completeness =
    foundationScore * criteria.foundationWeight +
    chainTailScore * criteria.chainTailWeight +
    extensionScore * criteria.extensionWeight +
    triggerScore * criteria.triggerWeight

  const idealMatch = calculateIdealMatch(field, definition)
  const triggerability = triggerScore
  const foundationStability = foundationScore
  const extensionPotential = extensionScore

  return {
    variant,
    completeness,
    idealMatch,
    triggerability,
    foundationStability,
    extensionPotential,
    details: {
      foundation: foundationScore,
      chainTail: chainTailScore,
      extension: extensionScore,
      pressure: triggerScore,
    },
  }
}

/**
 * 最適なGTRバリアントを検出
 */
export const detectBestGTRVariant = (
  field: AIFieldState,
): GTREvaluation | null => {
  let bestEvaluation: GTREvaluation | null = null
  let bestScore = 0

  // 全GTRバリアントを評価
  for (const variant of Object.values(GTRVariant)) {
    const evaluation = evaluateGTRDetailed(field, variant)
    const totalScore = evaluation.completeness + evaluation.idealMatch * 0.5

    if (totalScore > bestScore && totalScore > 0.3) {
      // 最低閾値
      bestScore = totalScore
      bestEvaluation = evaluation
    }
  }

  return bestEvaluation
}

/**
 * GTR推奨次手を生成
 */
export const generateGTRRecommendations = (
  field: AIFieldState,
  variant: GTRVariantValues,
): Array<{
  position: { x: number; y: number }
  colors: { primary: string; secondary: string }
  reason: string
  priority: number
}> => {
  const definition = GTR_DEFINITIONS[variant]
  const recommendations: Array<{
    position: { x: number; y: number }
    colors: { primary: string; secondary: string }
    reason: string
    priority: number
  }> = []

  // 土台の不足部分を特定
  const foundationComponent = definition.components.find((c) =>
    c.name.includes('土台'),
  )
  if (foundationComponent) {
    for (const expectedColor of foundationComponent.expectedColors) {
      const { x, y } = expectedColor.position
      const fieldColor = getPuyoAt(field, x, y)

      if (!fieldColor) {
        recommendations.push({
          position: { x, y },
          colors: {
            primary: expectedColor.color,
            secondary: expectedColor.color,
          },
          reason: `GTR土台の${expectedColor.color}色配置`,
          priority: 1.0,
        })
      }
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority)
}

/**
 * GTRシステムのデフォルトエクスポート
 */
export const GTRSystem = {
  evaluateGTRDetailed,
  detectBestGTRVariant,
  generateGTRRecommendations,
  GTR_DEFINITIONS,
}
