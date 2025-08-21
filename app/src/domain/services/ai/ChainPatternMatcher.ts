/**
 * 連鎖パターンマッチャー
 * 詳細なパターンマッチング機能を提供
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState } from '../../models/ai'
import { type ChainPattern, ChainPatternType, GTRVariant } from './ChainTypes'
import type {
  ChainPatternType as ChainPatternTypeValues,
  GTRVariant as GTRVariantValues,
} from './ChainTypes'

/**
 * パターンテンプレート
 */
interface PatternTemplate {
  /** パターン名 */
  name: string
  /** パターンの説明 */
  description: string
  /** パターンマトリックス (相対位置での色パターン) */
  template: Array<Array<string | null>>
  /** 最小サイズ */
  minSize: { width: number; height: number }
  /** 推定連鎖長 */
  estimatedChainLength: number
  /** 重要度（スコア係数） */
  importance: number
}

/**
 * GTRテンプレート定義
 */
const GTR_TEMPLATES: Record<GTRVariantValues, PatternTemplate[]> = {
  [GTRVariant.STANDARD]: [
    {
      name: '標準GTR土台',
      description: '最も基本的なGTR土台形状',
      template: [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        ['A', 'A', 'B', 'B', null, null],
        ['A', 'C', 'B', 'D', null, null],
      ],
      minSize: { width: 4, height: 2 },
      estimatedChainLength: 6,
      importance: 1.0,
    },
    {
      name: '標準GTR連鎖尻',
      description: 'GTRの連鎖尻部分',
      template: [
        ['A', 'B'],
        ['A', 'B'],
        ['C', 'B'],
      ],
      minSize: { width: 2, height: 3 },
      estimatedChainLength: 3,
      importance: 0.8,
    },
  ],
  [GTRVariant.NEW]: [
    {
      name: '新GTR土台',
      description: '改良されたGTR土台',
      template: [
        [null, null, null, null, null, null],
        ['A', 'B', 'C', 'C', null, null],
        ['A', 'B', 'C', 'D', null, null],
        ['A', 'E', 'F', 'D', null, null],
      ],
      minSize: { width: 4, height: 3 },
      estimatedChainLength: 8,
      importance: 1.2,
    },
  ],
  [GTRVariant.LST]: [
    {
      name: 'L字積み',
      description: 'L字型の積み方',
      template: [
        ['A', 'A'],
        ['A', 'B'],
        ['C', 'B'],
      ],
      minSize: { width: 2, height: 3 },
      estimatedChainLength: 3,
      importance: 0.7,
    },
    {
      name: 'S字積み',
      description: 'S字型の積み方',
      template: [
        [null, 'A', 'A'],
        ['B', 'A', null],
        ['B', 'C', null],
      ],
      minSize: { width: 3, height: 3 },
      estimatedChainLength: 3,
      importance: 0.7,
    },
    {
      name: 'T字積み',
      description: 'T字型の積み方',
      template: [
        ['A', 'A', 'A'],
        [null, 'A', null],
        [null, 'B', null],
      ],
      minSize: { width: 3, height: 3 },
      estimatedChainLength: 2,
      importance: 0.6,
    },
  ],
  [GTRVariant.DT]: [
    {
      name: 'DT砲台',
      description: 'ダブルトリプル砲台',
      template: [
        ['A', 'A', 'B', 'B'],
        ['A', 'C', 'B', 'D'],
        ['E', 'C', 'F', 'D'],
      ],
      minSize: { width: 4, height: 3 },
      estimatedChainLength: 6,
      importance: 1.1,
    },
  ],
  [GTRVariant.TSD]: [
    {
      name: 'TSD形',
      description: 'T-Spin Double類似形',
      template: [
        [null, 'A', null],
        ['B', 'A', 'C'],
        ['B', 'D', 'C'],
      ],
      minSize: { width: 3, height: 3 },
      estimatedChainLength: 4,
      importance: 0.9,
    },
  ],
}

/**
 * 階段パターンテンプレート
 */
const STAIRS_PATTERNS: PatternTemplate[] = [
  {
    name: '基本階段',
    description: '基本的な階段積み',
    template: [
      ['A', 'B', 'C'],
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
    ],
    minSize: { width: 3, height: 2 },
    estimatedChainLength: 3,
    importance: 0.8,
  },
  {
    name: '拡張階段',
    description: '拡張された階段積み',
    template: [
      ['A', 'B', 'C', 'D'],
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['E', 'F', 'G', 'H'],
    ],
    minSize: { width: 4, height: 2 },
    estimatedChainLength: 4,
    importance: 1.0,
  },
]

/**
 * 挟み込みパターンテンプレート
 */
const SANDWICH_PATTERNS: PatternTemplate[] = [
  {
    name: '基本挟み込み',
    description: '基本的な挟み込み',
    template: [
      ['A', 'B', 'A'],
      ['C', 'B', 'C'],
    ],
    minSize: { width: 3, height: 2 },
    estimatedChainLength: 2,
    importance: 0.6,
  },
  {
    name: '縦挟み込み',
    description: '縦方向の挟み込み',
    template: [['A'], ['B'], ['A'], ['C']],
    minSize: { width: 1, height: 4 },
    estimatedChainLength: 2,
    importance: 0.5,
  },
]

/**
 * 鶴亀パターンテンプレート
 */
const TSURUKAME_PATTERNS: PatternTemplate[] = [
  {
    name: '鶴亀土台',
    description: '鶴亀連鎖の基本形',
    template: [
      ['A', 'A', 'B', 'B'],
      ['C', 'A', 'B', 'D'],
      ['C', 'E', 'F', 'D'],
    ],
    minSize: { width: 4, height: 3 },
    estimatedChainLength: 5,
    importance: 1.0,
  },
]

/**
 * その他のパターンテンプレート
 */
const OTHER_PATTERNS = {
  [ChainPatternType.BOTTOM_UP]: [
    {
      name: '底上げ',
      description: '底上げ連鎖',
      template: [
        [null, null, null, null],
        ['A', 'A', 'B', 'B'],
        ['A', 'C', 'B', 'D'],
      ],
      minSize: { width: 4, height: 2 },
      estimatedChainLength: 3,
      importance: 0.7,
    },
  ] as PatternTemplate[],
  [ChainPatternType.COUNTER]: [
    {
      name: 'カウンター',
      description: 'カウンター攻撃形',
      template: [
        ['A', 'A'],
        ['A', 'B'],
        ['C', 'B'],
        ['C', 'D'],
      ],
      minSize: { width: 2, height: 4 },
      estimatedChainLength: 4,
      importance: 0.9,
    },
  ] as PatternTemplate[],
  [ChainPatternType.SUB_TOWER]: [
    {
      name: '副砲台',
      description: '副砲台連鎖',
      template: [
        [null, 'A', 'A'],
        ['B', 'A', 'C'],
        ['B', 'D', 'C'],
      ],
      minSize: { width: 3, height: 3 },
      estimatedChainLength: 3,
      importance: 0.8,
    },
  ] as PatternTemplate[],
}

/**
 * 一般的な連鎖パターンテンプレート
 */
const GENERAL_PATTERNS: Record<ChainPatternTypeValues, PatternTemplate[]> = {
  [ChainPatternType.STAIRS]: STAIRS_PATTERNS,
  [ChainPatternType.SANDWICH]: SANDWICH_PATTERNS,
  [ChainPatternType.TSURUKAME]: TSURUKAME_PATTERNS,
  ...OTHER_PATTERNS,
  [ChainPatternType.GTR]: [],
  [ChainPatternType.UNKNOWN]: [],
}

/**
 * フィールドの有効性をチェック
 */
const isValidField = (field: AIFieldState): boolean => {
  return !!(field?.cells && Array.isArray(field.cells))
}

/**
 * 座標の有効性をチェック
 */
const isValidCoordinate = (
  field: AIFieldState,
  x: number,
  y: number,
): boolean => {
  return y >= 0 && y < field.height && x >= 0 && x < field.width
}

/**
 * 安全性チェックを実行
 */
const isValidFieldAccess = (
  field: AIFieldState,
  x: number,
  y: number,
): boolean => {
  return isValidField(field) && isValidCoordinate(field, x, y)
}

/**
 * フィールドの指定位置のぷよ色を安全に取得
 */
const getPuyoColorAt = (
  field: AIFieldState,
  x: number,
  y: number,
): PuyoColor | null => {
  if (!isValidFieldAccess(field, x, y)) return null

  const row = field.cells[y]
  if (!row || !Array.isArray(row)) return null

  return row[x] || null
}

/**
 * テンプレートセルを処理
 */
const processTemplateCell = (
  field: AIFieldState,
  startX: number,
  startY: number,
  templateCell: string,
  tx: number,
  ty: number,
  colorMap: Map<string, PuyoColor>,
): boolean => {
  const fieldX = startX + tx
  const fieldY = startY + ty
  const fieldColor = getPuyoColorAt(field, fieldX, fieldY)

  if (!fieldColor) return false // 空の場所があると不一致

  if (colorMap.has(templateCell)) {
    // すでにマッピング済みの色パターンと一致するかチェック
    return colorMap.get(templateCell) === fieldColor
  } else {
    colorMap.set(templateCell, fieldColor)
    return true
  }
}

/**
 * パターンマッチング用の色マッピングを作成
 */
const createColorMapping = (
  field: AIFieldState,
  startX: number,
  startY: number,
  template: Array<Array<string | null>>,
): Map<string, PuyoColor> | null => {
  const colorMap = new Map<string, PuyoColor>()

  for (let ty = 0; ty < template.length; ty++) {
    for (let tx = 0; tx < template[ty].length; tx++) {
      const templateCell = template[ty][tx]
      if (!templateCell) continue

      if (
        !processTemplateCell(
          field,
          startX,
          startY,
          templateCell,
          tx,
          ty,
          colorMap,
        )
      ) {
        return null
      }
    }
  }

  return colorMap
}

/**
 * テンプレートがフィールドにマッチするかチェック
 */
const matchTemplate = (
  field: AIFieldState,
  startX: number,
  startY: number,
  template: PatternTemplate,
): {
  match: boolean
  confidence: number
  colorMapping: Map<string, PuyoColor> | null
} => {
  const colorMapping = createColorMapping(
    field,
    startX,
    startY,
    template.template,
  )

  if (!colorMapping) {
    return { match: false, confidence: 0, colorMapping: null }
  }

  // パターンの完成度を計算
  let matchedCells = 0
  let totalCells = 0

  for (let ty = 0; ty < template.template.length; ty++) {
    for (let tx = 0; tx < template.template[ty].length; tx++) {
      const templateCell = template.template[ty][tx]
      if (templateCell) {
        totalCells++
        matchedCells++
      }
    }
  }

  const confidence = totalCells > 0 ? matchedCells / totalCells : 0

  return {
    match: confidence > 0.8, // 80%以上一致でマッチとする
    confidence,
    colorMapping,
  }
}

/**
 * パターンオブジェクトを作成
 */
const createPatternObject = (
  template: PatternTemplate,
  patternType: ChainPatternTypeValues,
  startX: number,
  startY: number,
  result: { confidence: number; colorMapping: Map<string, PuyoColor> | null },
): ChainPattern => ({
  type: patternType,
  confidence: result.confidence * template.importance,
  position: { x: startX, y: startY },
  size: {
    width: template.template[0]?.length || 0,
    height: template.template.length,
  },
  estimatedChainLength: template.estimatedChainLength,
  details: {
    templateName: template.name,
    description: template.description,
    colorMapping: result.colorMapping
      ? Object.fromEntries(result.colorMapping)
      : {},
  },
})

/**
 * フィールド内でパターンを検索
 */
const searchPattern = (
  field: AIFieldState,
  template: PatternTemplate,
  patternType: ChainPatternTypeValues,
): ChainPattern[] => {
  const patterns: ChainPattern[] = []

  // フィールド全体をスキャン
  for (
    let startY = 0;
    startY <= field.height - template.minSize.height;
    startY++
  ) {
    for (
      let startX = 0;
      startX <= field.width - template.minSize.width;
      startX++
    ) {
      const result = matchTemplate(field, startX, startY, template)

      if (result.match && result.confidence > 0.7) {
        patterns.push(
          createPatternObject(template, patternType, startX, startY, result),
        )
      }
    }
  }

  return patterns
}

/**
 * バリアントのパターンを処理
 */
const processVariantPatterns = (
  field: AIFieldState,
  templates: PatternTemplate[],
  allPatterns: ChainPattern[],
): { variantConfidence: number; variantPatterns: number } => {
  let variantConfidence = 0
  let variantPatterns = 0

  for (const template of templates) {
    const patterns = searchPattern(field, template, ChainPatternType.GTR)
    allPatterns.push(...patterns)

    for (const pattern of patterns) {
      variantConfidence += pattern.confidence
      variantPatterns++
    }
  }

  return { variantConfidence, variantPatterns }
}

/**
 * ベストGTRを更新
 */
const updateBestGTR = (
  bestGTR: { variant: GTRVariant; confidence: number } | null,
  variant: string,
  avgConfidence: number,
): { variant: GTRVariant; confidence: number } => {
  if (!bestGTR || avgConfidence > bestGTR.confidence) {
    return {
      variant: variant as GTRVariant,
      confidence: avgConfidence,
    }
  }
  return bestGTR
}

/**
 * GTRパターンを検索
 */
export const searchGTRPatterns = (
  field: AIFieldState,
): {
  patterns: ChainPattern[]
  bestGTR: { variant: GTRVariant; confidence: number } | null
} => {
  const allPatterns: ChainPattern[] = []
  let bestGTR: { variant: GTRVariant; confidence: number } | null = null

  // 各GTRバリアントをチェック
  for (const [variant, templates] of Object.entries(GTR_TEMPLATES)) {
    const { variantConfidence, variantPatterns } = processVariantPatterns(
      field,
      templates,
      allPatterns,
    )

    if (variantPatterns > 0) {
      const avgConfidence = variantConfidence / variantPatterns
      bestGTR = updateBestGTR(bestGTR, variant, avgConfidence)
    }
  }

  return { patterns: allPatterns, bestGTR }
}

/**
 * 一般的な連鎖パターンを検索
 */
export const searchGeneralPatterns = (field: AIFieldState): ChainPattern[] => {
  const allPatterns: ChainPattern[] = []

  // 各パターンタイプをチェック
  for (const [patternType, templates] of Object.entries(GENERAL_PATTERNS)) {
    if (templates.length === 0) continue

    for (const template of templates) {
      const patterns = searchPattern(
        field,
        template,
        patternType as ChainPatternType,
      )
      allPatterns.push(...patterns)
    }
  }

  return allPatterns
}

/**
 * パターンの重複をチェック
 */
const isPatternOverlapping = (
  pattern1: ChainPattern,
  pattern2: ChainPattern,
): boolean => {
  const dx = Math.abs(pattern1.position.x - pattern2.position.x)
  const dy = Math.abs(pattern1.position.y - pattern2.position.y)

  return pattern1.type === pattern2.type && dx < 2 && dy < 2
}

/**
 * 重複パターンのインデックスを検索
 */
const findOverlappingIndex = (
  deduplicated: ChainPattern[],
  pattern: ChainPattern,
): number => {
  return deduplicated.findIndex((existing) =>
    isPatternOverlapping(existing, pattern),
  )
}

/**
 * より信頼度の高いパターンで置き換え
 */
const replaceIfBetter = (
  deduplicated: ChainPattern[],
  pattern: ChainPattern,
  existingIndex: number,
): void => {
  if (
    existingIndex !== -1 &&
    pattern.confidence > deduplicated[existingIndex].confidence
  ) {
    deduplicated[existingIndex] = pattern
  }
}

/**
 * パターンの重複を除去
 */
export const deduplicatePatterns = (
  patterns: ChainPattern[],
): ChainPattern[] => {
  const deduplicated: ChainPattern[] = []

  for (const pattern of patterns) {
    const isOverlapping = deduplicated.some((existing) =>
      isPatternOverlapping(existing, pattern),
    )

    if (!isOverlapping) {
      deduplicated.push(pattern)
    } else {
      const existingIndex = findOverlappingIndex(deduplicated, pattern)
      replaceIfBetter(deduplicated, pattern, existingIndex)
    }
  }

  return deduplicated
}

/**
 * 全パターンマッチングを実行
 */
export const matchAllPatterns = (
  field: AIFieldState,
): {
  patterns: ChainPattern[]
  gtrResult: { variant: GTRVariant; confidence: number } | null
} => {
  // GTRパターン検索
  const gtrResult = searchGTRPatterns(field)

  // 一般パターン検索
  const generalPatterns = searchGeneralPatterns(field)

  // 全パターンを統合
  const allPatterns = [...gtrResult.patterns, ...generalPatterns]

  // 重複除去
  const uniquePatterns = deduplicatePatterns(allPatterns)

  // 信頼度順にソート
  uniquePatterns.sort((a, b) => b.confidence - a.confidence)

  return {
    patterns: uniquePatterns,
    gtrResult: gtrResult.bestGTR,
  }
}

/**
 * チェインパターンマッチャーのデフォルトエクスポート
 */
export const ChainPatternMatcher = {
  matchAllPatterns,
  searchGTRPatterns,
  searchGeneralPatterns,
  deduplicatePatterns,
}
