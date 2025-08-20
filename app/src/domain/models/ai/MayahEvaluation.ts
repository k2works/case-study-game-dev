/**
 * mayah型評価システムの型定義
 * mayah AIの4要素評価システムを参考にした高度な評価関数
 */

/**
 * 操作評価 - フレーム数、ちぎり、効率性の評価
 */
export interface OperationEvaluation {
  /** フレーム数（設置までの時間） */
  frameCount: number
  /** ちぎり数（分離して置いたぷよ数） */
  chigiriCount: number
  /** 操作効率性スコア（0-100） */
  efficiencyScore: number
  /** 総合操作スコア */
  totalScore: number
}

/**
 * 形評価 - フィールド形状の評価
 */
export interface ShapeEvaluation {
  /** U字型形状スコア（理想的な連鎖形状） */
  uShapeScore: number
  /** 連結性スコア（ぷよの繋がりやすさ） */
  connectivityScore: number
  /** 山谷バランススコア（高低差の適切さ） */
  valleyScore: number
  /** 左右バランススコア */
  balanceScore: number
  /** 総合形状スコア */
  totalScore: number
}

/**
 * 連鎖評価 - 連鎖構築の評価
 */
export interface ChainEvaluation {
  /** 本線連鎖スコア（メインの連鎖） */
  mainChainScore: number
  /** 副砲連鎖スコア（サブの連鎖） */
  subChainScore: number
  /** パターンマッチングスコア（GTRなど定跡パターン） */
  patternScore: number
  /** 必要ぷよ数（連鎖発火に必要な数） */
  requiredPuyoCount: number
  /** 連鎖発火確率（50%基準） */
  chainProbability: number
  /** 総合連鎖スコア */
  totalScore: number
}

/**
 * 戦略評価 - ゲーム戦略の評価
 */
export interface StrategyEvaluation {
  /** 発火タイミングスコア */
  timingScore: number
  /** 凝視スコア（相手への脅威） */
  gazeScore: number
  /** リスク評価スコア */
  riskScore: number
  /** 防御必要性スコア */
  defenseScore: number
  /** 総合戦略スコア */
  totalScore: number
}

/**
 * ゲームフェーズ
 */
export const GamePhase = {
  /** 序盤（0-30手） */
  EARLY: 'early',
  /** 中盤（31-60手） */
  MIDDLE: 'middle',
  /** 終盤（61手以降） */
  LATE: 'late',
  /** 緊急（相手の攻撃時など） */
  EMERGENCY: 'emergency',
} as const

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase]

/**
 * フェーズ別重み設定
 */
export interface PhaseWeights {
  /** 操作評価の重み */
  operationWeight: number
  /** 形評価の重み */
  shapeWeight: number
  /** 連鎖評価の重み */
  chainWeight: number
  /** 戦略評価の重み */
  strategyWeight: number
  /** スキ許容度（リスクを取る度合い） */
  riskTolerance: number
}

/**
 * mayah型総合評価
 */
export interface MayahEvaluation {
  /** 操作評価 */
  operation: OperationEvaluation
  /** 形評価 */
  shape: ShapeEvaluation
  /** 連鎖評価 */
  chain: ChainEvaluation
  /** 戦略評価 */
  strategy: StrategyEvaluation
  /** 現在のゲームフェーズ */
  phase: GamePhase
  /** フェーズ別重み */
  weights: PhaseWeights
  /** 総合スコア */
  totalScore: number
  /** 評価理由の説明 */
  reason: string
}

/**
 * パターンタイプ（定跡パターン）
 */
export const PatternType = {
  /** GTR（グレートタナカ連鎖） */
  GTR: 'GTR',
  /** 新GTR */
  NEW_GTR: 'NEW_GTR',
  /** だぁ積み */
  DAAZUMI: 'DAAZUMI',
  /** 弥生時代 */
  YAYOI: 'YAYOI',
  /** サブマリン */
  SUBMARINE: 'SUBMARINE',
  /** フキゲンGTR */
  FUKIGEN_GTR: 'FUKIGEN_GTR',
  /** なし */
  NONE: 'NONE',
} as const

export type PatternType = (typeof PatternType)[keyof typeof PatternType]

/**
 * 連鎖木ノード（RensaHandTree用）
 */
export interface RensaNode {
  /** 連鎖数 */
  chainCount: number
  /** 得点 */
  score: number
  /** 必要フレーム数 */
  frameCount: number
  /** 必要ぷよ数 */
  requiredPuyos: number
  /** 発火確率 */
  probability: number
  /** 子ノード（次の連鎖） */
  children: RensaNode[]
}

/**
 * 連鎖木（RensaHandTree）
 */
export interface RensaHandTree {
  /** 自分の連鎖木 */
  myTree: RensaNode
  /** 相手の連鎖木 */
  opponentTree: RensaNode
  /** 最適な発火タイミング */
  optimalTiming: number
  /** 打ち合い評価 */
  battleEvaluation: number
}

/**
 * デフォルトフェーズ別重み
 */
export const DEFAULT_PHASE_WEIGHTS: Record<GamePhase, PhaseWeights> = {
  [GamePhase.EARLY]: {
    operationWeight: 0.1,
    shapeWeight: 0.4,
    chainWeight: 0.4,
    strategyWeight: 0.1,
    riskTolerance: 0.7,
  },
  [GamePhase.MIDDLE]: {
    operationWeight: 0.15,
    shapeWeight: 0.25,
    chainWeight: 0.35,
    strategyWeight: 0.25,
    riskTolerance: 0.5,
  },
  [GamePhase.LATE]: {
    operationWeight: 0.25,
    shapeWeight: 0.15,
    chainWeight: 0.25,
    strategyWeight: 0.35,
    riskTolerance: 0.3,
  },
  [GamePhase.EMERGENCY]: {
    operationWeight: 0.4,
    shapeWeight: 0.1,
    chainWeight: 0.2,
    strategyWeight: 0.3,
    riskTolerance: 0.1,
  },
}

/**
 * 評価パラメータ設定
 */
export interface MayahEvaluationSettings {
  /** U字型形状の理想的な深さ */
  idealUShapeDepth: number
  /** 理想的な連結数 */
  idealConnectivity: number
  /** 理想的な山谷バランス */
  idealValleyBalance: number
  /** GTRパターンボーナス */
  gtrBonus: number
  /** 最大許容ちぎり数 */
  maxChigiri: number
  /** 連鎖発火確率の閾値 */
  chainProbabilityThreshold: number
  /** 緊急モード判定の高さ */
  emergencyHeight: number
}

/**
 * デフォルト評価パラメータ
 */
export const DEFAULT_MAYAH_SETTINGS: MayahEvaluationSettings = {
  idealUShapeDepth: 3,
  idealConnectivity: 4,
  idealValleyBalance: 2,
  gtrBonus: 100,
  maxChigiri: 2,
  chainProbabilityThreshold: 0.5,
  emergencyHeight: 10,
}
