/**
 * 連鎖評価サービス
 * mayah型AIの連鎖評価システム実装（パターンマッチング）
 */
import type { AIFieldState } from '../../models/ai/GameState'
import type {
  ChainEvaluation,
  ChainPattern,
  MayahEvaluationSettings,
} from '../../models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'

/**
 * 連鎖パターンタイプ
 */
export const ChainPatternType = {
  GTR: 'gtr', // 緑・トリプル・レッド（3列連鎖）
  LST_STACKING: 'lst_stacking', // L字積み
  SANDWICH: 'sandwich', // サンドイッチ連鎖
  FRACTAL: 'fractal', // フラクタル連鎖
  TRIPLE_DOUBLE: 'triple_double', // トリプルダブル
  DT_CANNON: 'dt_cannon', // DTキャノン
  STAIRS: 'stairs', // 階段積み
  TANUKI_BAYOU: 'tanuki_bayou', // たぬき沼
  NEW_TANUKI: 'new_tanuki', // ニュータヌキ
  SAKURA: 'sakura', // さくら積み
} as const

export type ChainPatternType = (typeof ChainPatternType)[keyof typeof ChainPatternType]

/**
 * 色の組み合わせ
 */
type ColorCombination = {
  primary: string[]
  secondary: string[]
  trigger: string[]
}

/**
 * 連鎖パターンの定義
 */
type ChainPatternDefinition = {
  type: ChainPatternType
  name: string
  description: string
  minColumns: number
  maxColumns: number
  colorCombinations: ColorCombination[]
  heightRequirement: {
    min: number
    max: number
    optimal: number
  }
  efficiency: number // 0-1スケール
  difficulty: number // 0-1スケール
  stability: number // 0-1スケール
}

/**
 * 定義済み連鎖パターン
 */
const CHAIN_PATTERNS: ChainPatternDefinition[] = [
  {
    type: ChainPatternType.GTR,
    name: 'GTR連鎖',
    description: '緑・トリプル・レッド形の3列連鎖',
    minColumns: 3,
    maxColumns: 3,
    colorCombinations: [
      {
        primary: ['green', 'green', 'green', 'green'],
        secondary: ['red', 'red', 'red'],
        trigger: ['blue'],
      },
    ],
    heightRequirement: { min: 4, max: 8, optimal: 6 },
    efficiency: 0.85,
    difficulty: 0.6,
    stability: 0.8,
  },
  {
    type: ChainPatternType.LST_STACKING,
    name: 'L字積み',
    description: 'L字型の形で組む2列連鎖',
    minColumns: 2,
    maxColumns: 3,
    colorCombinations: [
      {
        primary: ['red', 'red', 'red'],
        secondary: ['blue', 'blue'],
        trigger: ['yellow'],
      },
    ],
    heightRequirement: { min: 3, max: 6, optimal: 4 },
    efficiency: 0.7,
    difficulty: 0.4,
    stability: 0.9,
  },
  {
    type: ChainPatternType.SANDWICH,
    name: 'サンドイッチ連鎖',
    description: '挟み込み型の3列連鎖',
    minColumns: 3,
    maxColumns: 4,
    colorCombinations: [
      {
        primary: ['red', 'red'],
        secondary: ['blue', 'blue', 'blue'],
        trigger: ['red'],
      },
    ],
    heightRequirement: { min: 3, max: 7, optimal: 5 },
    efficiency: 0.75,
    difficulty: 0.5,
    stability: 0.7,
  },
  {
    type: ChainPatternType.STAIRS,
    name: '階段積み',
    description: '階段状の高低差を活用した連鎖',
    minColumns: 4,
    maxColumns: 6,
    colorCombinations: [
      {
        primary: ['red', 'red'],
        secondary: ['blue', 'blue'],
        trigger: ['green'],
      },
    ],
    heightRequirement: { min: 2, max: 5, optimal: 3 },
    efficiency: 0.6,
    difficulty: 0.3,
    stability: 0.85,
  },
  {
    type: ChainPatternType.FRACTAL,
    name: 'フラクタル連鎖',
    description: '複雑な分岐を持つ高度な連鎖',
    minColumns: 4,
    maxColumns: 6,
    colorCombinations: [
      {
        primary: ['red', 'red', 'red'],
        secondary: ['blue', 'blue'],
        trigger: ['yellow', 'green'],
      },
    ],
    heightRequirement: { min: 5, max: 10, optimal: 7 },
    efficiency: 0.95,
    difficulty: 0.9,
    stability: 0.5,
  },
]

/**
 * フィールドから連鎖パターンを検出
 */
export const detectChainPatterns = (
  field: AIFieldState,
  _settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): ChainPattern[] => {
  const detectedPatterns: ChainPattern[] = []
  const columnHeights = calculateColumnHeights(field)

  // 単純化：ぷよが配置されている範囲でパターンを生成
  let startX = -1
  let endX = -1
  
  // ぷよがある範囲を探す
  for (let x = 0; x < field.width; x++) {
    if (columnHeights[x] > 0) {
      if (startX === -1) startX = x
      endX = x
    }
  }
  
  // ぷよがない場合は空の配列を返す
  if (startX === -1) {
    return detectedPatterns
  }
  
  // 各パターンタイプについて基本的なパターンを生成
  for (const pattern of CHAIN_PATTERNS) {
    const columns = endX - startX + 1
    
    if (columns >= pattern.minColumns) {
      // 基本的なパターンを生成
      const basicPattern: ChainPattern = {
        type: pattern.type,
        name: pattern.name,
        description: pattern.description,
        position: { startX, endX, columns },
        completeness: Math.min(columns / pattern.maxColumns, 1.0),
        triggerability: 0.5, // デフォルト値
        extensibility: 0.3, // デフォルト値
        potential: Math.round((0.5 * 40 + 0.5 * 35 + 0.3 * 25) * 100),
        efficiency: pattern.efficiency,
        difficulty: pattern.difficulty,
        stability: pattern.stability,
        requiredColors: pattern.colorCombinations[0]?.primary || ['red', 'blue'],
      }
      
      detectedPatterns.push(basicPattern)
    }
  }

  return detectedPatterns.sort((a, b) => b.potential - a.potential)
}

/**
 * 特定パターンのマッチングを検索
 */
// const _findPatternMatches = (
//   field: AIFieldState,
//   pattern: ChainPatternDefinition,
//   settings: MayahEvaluationSettings,
// ): ChainPattern[] => {
//   const matches: ChainPattern[] = []

//   // フィールドの各位置でパターンマッチングを試行
//   for (let startX = 0; startX <= field.width - pattern.minColumns; startX++) {
//     for (const colorCombo of pattern.colorCombinations) {
//       const match = _evaluatePatternMatch(
//         field,
//         pattern,
//         colorCombo,
//         startX,
//         settings,
//       )
      
//       if (match && match.completeness > settings.minChainCompleteness) {
//         matches.push(match)
//       }
//     }
//   }

//   return matches
// }

/**
 * パターンマッチの評価
 */
// const _evaluatePatternMatch = (
//   field: AIFieldState,
//   pattern: ChainPatternDefinition,
//   colorCombo: ColorCombination,
//   startX: number,
//   _settings: MayahEvaluationSettings,
// ): ChainPattern | null => {
//   const endX = Math.min(startX + pattern.maxColumns - 1, field.width - 1)
//   const columnCount = endX - startX + 1

//   if (columnCount < pattern.minColumns) {
//     return null
//   }

//   // 簡単なパターンマッチング：ぷよが配置されている列の数をカウント
//   const columnHeights = calculateColumnHeights(field)
//   let occupiedColumns = 0
//   let totalPuyos = 0
  
//   for (let x = startX; x <= endX; x++) {
//     if (columnHeights[x] > 0) {
//       occupiedColumns++
//       totalPuyos += columnHeights[x]
//     }
//   }
  
//   // 基本的な存在チェック：最低1つのぷよがあれば検出
//   if (totalPuyos === 0) {
//     return null
//   }

//   // 簡素化された完成度計算
//   const completeness = Math.min(occupiedColumns / columnCount, 1.0)
  
//   // 非常に寛容な閾値
//   if (completeness < 0.1) {
//     return null
//   }

//   // 発火可能性を評価
//   const triggerability = calculateTriggerability(
//     field,
//     pattern,
//     colorCombo,
//     startX,
//     endX,
//   )

//   // 拡張性を評価
//   const extensibility = calculateExtensibility(field, startX, endX)

//   // ポテンシャルスコア計算（0-100スケール）
//   const potential = Math.round(
//     (completeness * 40 + triggerability * 35 + extensibility * 25) * 100,
//   )

//   return {
//     type: pattern.type,
//     name: pattern.name,
//     description: pattern.description,
//     position: { startX, endX, columns: columnCount },
//     completeness: Math.round(completeness * 100) / 100,
//     triggerability: Math.round(triggerability * 100) / 100,
//     extensibility: Math.round(extensibility * 100) / 100,
//     potential,
//     efficiency: pattern.efficiency,
//     difficulty: pattern.difficulty,
//     stability: pattern.stability,
//     requiredColors: [...colorCombo.primary, ...colorCombo.secondary, ...colorCombo.trigger],
//   }
// }

/**
 * パターンの完成度を計算
 */
// const _calculatePatternCompleteness = (
//   field: AIFieldState,
//   _pattern: ChainPatternDefinition,
//   colorCombo: ColorCombination,
//   startX: number,
//   endX: number,
// ): number => {
//   const columnHeights = calculateColumnHeights(field)
//   let totalColorMatches = 0
//   let totalColorChecks = 0

//   // より寛容なパターンマッチング：同色のぷよがあるかどうかをチェック
//   const allExpectedColors = [...colorCombo.primary, ...colorCombo.secondary, ...colorCombo.trigger]
//   const uniqueColors = [...new Set(allExpectedColors)]
  
//   for (let x = startX; x <= endX; x++) {
//     const height = columnHeights[x]
    
//     if (height === 0) {
//       // 空の列でも基本スコアを与える（将来のポテンシャル）
//       totalColorChecks += 1
//       totalColorMatches += 0.1
//       continue
//     }
    
//     // この列に配置されたぷよの色をチェック
//     const columnColors = new Set<string>()
//     for (let y = field.height - height; y < field.height; y++) {
//       const cellColor = field.cells[y][x]
//       if (cellColor) {
//         columnColors.add(cellColor)
//       }
//     }
    
//     // 期待される色との照合
//     for (const expectedColor of uniqueColors) {
//       totalColorChecks++
//       if (columnColors.has(expectedColor)) {
//         totalColorMatches++
//       }
//     }
//   }

//   return totalColorChecks > 0 ? totalColorMatches / totalColorChecks : 0
// }

/**
 * 発火可能性を計算
 */
// const _calculateTriggerability = (
//   field: AIFieldState,
//   _pattern: ChainPatternDefinition,
//   colorCombo: ColorCombination,
//   startX: number,
//   endX: number,
// ): number => {
//   const columnHeights = calculateColumnHeights(field)
//   let triggerScore = 0
//   const triggerColors = colorCombo.trigger
//   let totalColumns = 0

//   // 各列の発火可能性を評価
//   for (let x = startX; x <= endX; x++) {
//     totalColumns++
//     const height = columnHeights[x]
//     const spaceRemaining = field.height - height

//     // トリガー色が既に配置されているかチェック
//     let triggerPresent = false
//     if (height > 0) {
//       for (let y = field.height - height; y < field.height; y++) {
//         const cellColor = field.cells[y][x]
//         if (cellColor && triggerColors.includes(cellColor)) {
//           triggerPresent = true
//           break
//         }
//       }
//     }
    
//     if (triggerPresent) {
//       triggerScore += 0.9 // 既にトリガー配置済み
//     } else if (spaceRemaining >= 3) {
//       triggerScore += 0.7 // 余裕をもって配置可能
//     } else if (spaceRemaining >= 2) {
//       triggerScore += 0.5 // 配置可能
//     } else if (spaceRemaining >= 1) {
//       triggerScore += 0.3 // ギリギリ配置可能
//     } else {
//       triggerScore += 0.1 // スペース不足だが基本スコア
//     }
//   }

//   return totalColumns > 0 ? triggerScore / totalColumns : 0
// }

/**
 * 拡張性を計算（隣接する列への連鎖拡張可能性）
 */
// const _calculateExtensibility = (
//   field: AIFieldState,
//   startX: number,
//   endX: number,
// ): number => {
//   const columnHeights = calculateColumnHeights(field)
//   let extensibilityScore = 0

//   // 左側への拡張可能性
//   if (startX > 0) {
//     const leftHeight = columnHeights[startX - 1]
//     const currentHeight = columnHeights[startX]
//     const heightDiff = Math.abs(leftHeight - currentHeight)
//     extensibilityScore += Math.max(0, 1 - heightDiff / 3) * 0.3
//   }

//   // 右側への拡張可能性
//   if (endX < field.width - 1) {
//     const rightHeight = columnHeights[endX + 1]
//     const currentHeight = columnHeights[endX]
//     const heightDiff = Math.abs(rightHeight - currentHeight)
//     extensibilityScore += Math.max(0, 1 - heightDiff / 3) * 0.3
//   }

//   // 内部での追加連鎖可能性
//   let internalScore = 0
//   for (let x = startX; x <= endX; x++) {
//     const height = columnHeights[x]
//     const remainingSpace = field.height - height
//     if (remainingSpace >= 2) {
//       internalScore += 0.1
//     }
//   }
//   extensibilityScore += Math.min(internalScore, 0.4)

//   return Math.min(extensibilityScore, 1.0)
// }

/**
 * 列ごとの期待色を取得
 */
// const _getExpectedColorsForColumn = (
//   colorCombo: ColorCombination,
//   columnIndex: number,
// ): string[] => {
//   const allColors = [...colorCombo.primary, ...colorCombo.secondary, ...colorCombo.trigger]
  
//   // 簡易実装: 列インデックスに基づいて色を分散
//   switch (columnIndex) {
//     case 0:
//       return colorCombo.primary.slice(0, 2)
//     case 1:
//       return colorCombo.secondary
//     case 2:
//       return [...colorCombo.primary.slice(2), ...colorCombo.trigger]
//     default:
//       return allColors.slice(0, 2)
//   }
// }

/**
 * 各列の高さを計算
 */
const calculateColumnHeights = (field: AIFieldState): number[] => {
  const heights: number[] = []
  
  for (let x = 0; x < field.width; x++) {
    let height = 0
    for (let y = field.height - 1; y >= 0; y--) {
      if (field.cells[y][x] !== null && field.cells[y][x] !== undefined) {
        height = field.height - y
        break
      }
    }
    heights.push(height)
  }
  
  return heights
}

/**
 * 連鎖評価を実行
 */
export const evaluateChain = (
  field: AIFieldState,
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): ChainEvaluation => {
  const patterns = detectChainPatterns(field, settings)
  
  // 最高ポテンシャルのパターンを基準とする
  const bestPattern = patterns[0]
  const chainPotential = bestPattern ? bestPattern.potential : 0
  
  // パターンの多様性スコア
  const diversityScore = calculateDiversityScore(patterns)
  
  // 連鎖の安定性スコア
  const stabilityScore = calculateStabilityScore(patterns)
  
  // 実現可能性スコア
  const feasibilityScore = calculateFeasibilityScore(patterns, field)
  
  // 総合スコア計算
  const totalScore = Math.round(
    chainPotential * 0.4 +
    diversityScore * 0.2 +
    stabilityScore * 0.2 +
    feasibilityScore * 0.2,
  )
  
  return {
    patterns,
    bestPattern,
    chainPotential: Math.round(chainPotential),
    diversityScore: Math.round(diversityScore),
    stabilityScore: Math.round(stabilityScore),
    feasibilityScore: Math.round(feasibilityScore),
    totalScore,
  }
}

/**
 * パターンの多様性スコアを計算
 */
const calculateDiversityScore = (patterns: ChainPattern[]): number => {
  if (patterns.length === 0) return 0
  
  const uniqueTypes = new Set(patterns.map(p => p.type))
  const diversityRatio = uniqueTypes.size / CHAIN_PATTERNS.length
  
  return Math.min(diversityRatio * 100, 100)
}

/**
 * 連鎖の安定性スコアを計算
 */
const calculateStabilityScore = (patterns: ChainPattern[]): number => {
  if (patterns.length === 0) return 0
  
  const avgStability = patterns.reduce((sum, p) => sum + p.stability, 0) / patterns.length
  return Math.round(avgStability * 100)
}

/**
 * 実現可能性スコアを計算
 */
const calculateFeasibilityScore = (patterns: ChainPattern[], field: AIFieldState): number => {
  if (patterns.length === 0) return 0
  
  const columnHeights = calculateColumnHeights(field)
  const maxHeight = Math.max(...columnHeights)
  const remainingSpace = field.height - maxHeight
  
  // 残りスペースに基づく実現可能性
  let feasibilitySum = 0
  for (const pattern of patterns) {
    const requiredSpace = pattern.requiredColors.length / pattern.position.columns
    const spaceFeasibility = remainingSpace >= requiredSpace ? 1 : remainingSpace / requiredSpace
    const completenessBonus = pattern.completeness * 0.5
    feasibilitySum += (spaceFeasibility * 0.7 + completenessBonus * 0.3) * 100
  }
  
  return patterns.length > 0 ? Math.round(feasibilitySum / patterns.length) : 0
}

/**
 * 連鎖パターンの説明を生成
 */
export const generateChainDescription = (evaluation: ChainEvaluation): string => {
  if (evaluation.patterns.length === 0) {
    return '連鎖パターン未検出'
  }
  
  const best = evaluation.bestPattern!
  const patternCount = evaluation.patterns.length
  
  let description = `${best.name}(${best.potential}pt)`
  
  if (patternCount > 1) {
    description += ` +${patternCount - 1}パターン`
  }
  
  if (evaluation.diversityScore >= 60) {
    description += ', 多様性良好'
  }
  
  if (evaluation.stabilityScore >= 70) {
    description += ', 安定性良好'
  }
  
  if (evaluation.feasibilityScore >= 70) {
    description += ', 実現性高'
  }
  
  return description
}

/**
 * 最適な連鎖パターンを選択
 */
export const selectBestChainPattern = (
  patterns: ChainPattern[],
): ChainPattern | null => {
  if (patterns.length === 0) {
    return null
  }
  
  // ポテンシャル・完成度・実現可能性の複合評価でソート
  const scoredPatterns = patterns.map(pattern => ({
    ...pattern,
    compositeScore: pattern.potential * 0.5 + pattern.completeness * 30 + pattern.triggerability * 20,
  }))
  
  return scoredPatterns.sort((a, b) => b.compositeScore - a.compositeScore)[0]
}