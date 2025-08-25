/**
 * 戦略評価関連の型定義
 * mayah AI参考の戦略評価システム
 */
import type { PuyoColor } from '../../models/Puyo'
import type { GamePhase } from './IntegratedEvaluationService'

/**
 * 戦略評価結果
 */
export interface StrategyEvaluation {
  /** 発火判断スコア */
  firingDecision: number
  /** リスク評価 */
  riskAssessment: number
  /** 凝視機能（相手の脅威監視） */
  stareFunction: number
  /** 防御必要性 */
  defensiveNeed: number
  /** 攻撃機会 */
  offensiveOpportunity: number
  /** 戦略優先度 */
  strategyPriority: StrategyPriority
  /** 評価詳細 */
  details: StrategyDetails
}

/**
 * 戦略優先度
 */
export const StrategyPriority = {
  /** 連鎖構築優先 */
  BUILD_CHAIN: 'build_chain',
  /** 即座発火 */
  FIRE_IMMEDIATELY: 'fire_immediately',
  /** 防御優先 */
  DEFEND: 'defend',
  /** 相手を見る（凝視） */
  WATCH_OPPONENT: 'watch_opponent',
  /** バランス型 */
  BALANCED: 'balanced',
} as const

export type StrategyPriority =
  (typeof StrategyPriority)[keyof typeof StrategyPriority]

/**
 * 戦略評価詳細
 */
export interface StrategyDetails {
  /** ゲームフェーズ */
  gamePhase: GamePhase
  /** 自分の脅威レベル */
  myThreatLevel: ThreatLevel
  /** 相手の脅威レベル */
  opponentThreatLevel: ThreatLevel
  /** 発火可能な連鎖数 */
  availableChains: number[]
  /** 推奨行動 */
  recommendedAction: string
  /** 戦略説明 */
  reasoning: string
}

/**
 * 脅威レベル
 */
export const ThreatLevel = {
  /** 安全 */
  SAFE: 'safe',
  /** 軽微な脅威 */
  LOW: 'low',
  /** 中程度の脅威 */
  MEDIUM: 'medium',
  /** 高い脅威 */
  HIGH: 'high',
  /** 危険 */
  CRITICAL: 'critical',
} as const

export type ThreatLevel = (typeof ThreatLevel)[keyof typeof ThreatLevel]

/**
 * 発火判断結果
 */
export interface FiringDecision {
  /** 発火すべきか */
  shouldFire: boolean
  /** 発火信頼度 (0-1) */
  confidence: number
  /** 発火連鎖情報 */
  targetChain: ChainInfo | null
  /** 発火理由 */
  reason: string
  /** 発火タイミング */
  timing: FiringTiming
  /** 代替選択肢 */
  alternatives: ChainInfo[]
}

/**
 * 発火タイミング
 */
export const FiringTiming = {
  /** 即座に */
  IMMEDIATE: 'immediate',
  /** 1-2手後 */
  SOON: 'soon',
  /** 機会を待つ */
  WAIT: 'wait',
  /** 発火すべきでない */
  NO_FIRE: 'no_fire',
} as const

export type FiringTiming = (typeof FiringTiming)[keyof typeof FiringTiming]

/**
 * 連鎖情報
 */
export interface ChainInfo {
  /** 連鎖数 */
  chainCount: number
  /** 予想スコア */
  expectedScore: number
  /** 発火までの手数 */
  turnsToFire: number
  /** 発火成功確率 */
  successProbability: number
  /** 連鎖の種類 */
  chainType: ChainType
  /** 威力 */
  power: number
  /** 必要なぷよ数 */
  requiredPuyos: number
}

/**
 * 連鎖の種類
 */
export const ChainType = {
  /** 本線連鎖 */
  MAIN: 'main',
  /** 副砲連鎖 */
  SUB: 'sub',
  /** 速攻連鎖 */
  QUICK: 'quick',
  /** カウンター連鎖 */
  COUNTER: 'counter',
} as const

export type ChainType = (typeof ChainType)[keyof typeof ChainType]

/**
 * リスク評価結果
 */
export interface RiskAssessment {
  /** 総合リスクレベル */
  overallRisk: ThreatLevel
  /** フィールドの危険度 */
  fieldDanger: number
  /** 相手の攻撃脅威 */
  opponentThreat: number
  /** 時間的切迫度 */
  timeUrgency: number
  /** 防御の必要性 */
  defensiveNeed: number
  /** リスク要因 */
  riskFactors: RiskFactor[]
  /** 対策案 */
  mitigationStrategies: string[]
}

/**
 * リスク要因
 */
export interface RiskFactor {
  /** 要因名 */
  factor: string
  /** 重要度 */
  severity: number
  /** 説明 */
  description: string
  /** 発生確率 */
  probability: number
}

/**
 * 状況分析結果
 */
export interface SituationAnalysis {
  /** ゲームフェーズ */
  gamePhase: GamePhase
  /** フィールド状況 */
  fieldSituation: FieldSituation
  /** 盤面優劣 */
  boardAdvantage: number
  /** 時間的優位性 */
  timeAdvantage: number
  /** 戦略的位置 */
  strategicPosition: StrategicPosition
  /** 次の行動指針 */
  nextActionGuidance: string
}

/**
 * フィールド状況
 */
export interface FieldSituation {
  /** 積み上げ高さ */
  averageHeight: number
  /** 最大高さ */
  maxHeight: number
  /** 高さのバランス */
  heightBalance: number
  /** 連鎖可能性 */
  chainPotential: number
  /** 空間効率 */
  spaceEfficiency: number
  /** 危険度 */
  dangerLevel: ThreatLevel
}

/**
 * 戦略的位置
 */
export const StrategicPosition = {
  /** 優勢 */
  ADVANTAGEOUS: 'advantageous',
  /** 互角 */
  EVEN: 'even',
  /** 劣勢 */
  DISADVANTAGEOUS: 'disadvantageous',
  /** 危機 */
  CRISIS: 'crisis',
} as const

export type StrategicPosition =
  (typeof StrategicPosition)[keyof typeof StrategicPosition]

/**
 * 連鎖手木（RensaHandTree）ノード
 */
export interface RensaHandNode {
  /** 連鎖数 */
  chainCount: number
  /** 開始フレーム */
  startFrame: number
  /** 終了フレーム */
  endFrame: number
  /** 連鎖スコア */
  score: number
  /** 威力 */
  power: number
  /** 発火位置 */
  triggerPosition: { x: number; y: number }
  /** 発火色 */
  triggerColor: PuyoColor
  /** 後続連鎖 */
  children: RensaHandNode[]
  /** 連鎖経路 */
  chainPath: ChainStep[]
}

/**
 * 連鎖ステップ
 */
export interface ChainStep {
  /** ステップ番号 */
  step: number
  /** 消去位置 */
  erasePositions: Array<{ x: number; y: number }>
  /** 消去色 */
  eraseColor: PuyoColor
  /** 消去数 */
  eraseCount: number
  /** 落下パターン */
  fallPattern: Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
  }>
}

/**
 * 連鎖木評価結果
 */
export interface RensaTreeEvaluation {
  /** 最強連鎖 */
  bestChain: RensaHandNode | null
  /** 全連鎖候補 */
  allChains: RensaHandNode[]
  /** 発火推奨度 */
  fireRecommendation: number
  /** 平均連鎖長 */
  averageChainLength: number
  /** 最大期待値 */
  maxExpectedValue: number
}

/**
 * 打ち合い評価結果
 */
export interface BattleEvaluation {
  /** 勝利確率 */
  winProbability: number
  /** 推奨戦術 */
  recommendedTactic: BattleTactic
  /** 予想結果 */
  expectedOutcome: string
  /** 優劣評価 */
  advantage: number
}

/**
 * 戦闘戦術
 */
export const BattleTactic = {
  /** 先手必勝 */
  FIRST_STRIKE: 'first_strike',
  /** 後手カウンター */
  COUNTER_ATTACK: 'counter_attack',
  /** 積み合い */
  BUILD_OFF: 'build_off',
  /** 防御重視 */
  DEFENSIVE: 'defensive',
} as const

export type BattleTactic = (typeof BattleTactic)[keyof typeof BattleTactic]

/**
 * 戦略設定
 */
export interface StrategySettings {
  /** 攻撃性レベル (0-1) */
  aggressiveness: number
  /** リスク許容度 (0-1) */
  riskTolerance: number
  /** 連鎖優先度 */
  chainPriority: number
  /** 防御重要度 */
  defensiveWeight: number
  /** 速攻偏重度 */
  speedPreference: number
  /** 思考深度 */
  thinkingDepth: number
}

/**
 * 凝視機能設定
 */
export interface StareSettings {
  /** 相手監視の有効性 */
  enabled: boolean
  /** 監視強度 */
  intensity: number
  /** 反応速度 */
  responseSpeed: number
  /** 脅威閾値 */
  threatThreshold: number
}
