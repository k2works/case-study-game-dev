/**
 * 戦略評価サービス（関数型リファクタリング版）
 * 発火判断、状況分析、リスク管理を統合した総合戦略評価システム
 */
import type { AIGameState, PossibleMove } from '../../models/ai'
import type { ChainPattern } from './ChainTypes'
import { FiringDecisionSystem } from './FiringDecisionSystem'
import type { GamePhase } from './IntegratedEvaluationService'
import { RiskManager } from './RiskManager'
import { SituationAnalyzer } from './SituationAnalyzer'
import {
  type FiringDecision,
  type RiskAssessment,
  type SituationAnalysis,
  type StareSettings,
  type StrategyEvaluation,
  StrategyPriority,
  type StrategySettings,
  ThreatLevel,
} from './StrategyTypes'

/**
 * 戦略評価結果の詳細
 */
export interface StrategyEvaluationResult extends StrategyEvaluation {
  /** 発火判断詳細 */
  firingDetails: FiringDecision
  /** 状況分析詳細 */
  situationDetails: SituationAnalysis
  /** リスク評価詳細 */
  riskDetails: RiskAssessment
  /** 推奨手の評価 */
  moveRecommendations: MoveRecommendation[]
  /** 実行指針 */
  actionPlan: string
  /** 総合スコア */
  totalScore: number
  /** 信頼度 */
  confidence: number
  /** 推奨戦略優先度 */
  recommendedPriority: StrategyPriority
}

/**
 * 手の推奨情報
 */
export interface MoveRecommendation {
  /** 推奨手 */
  move: PossibleMove
  /** 戦略的価値 */
  strategicValue: number
  /** 推奨理由 */
  reason: string
  /** 優先度 */
  priority: number
  /** リスク評価 */
  riskLevel: ThreatLevel
}

/**
 * 戦略評価設定 (既存の型を使用)
 */
export interface StrategyEvaluationSettings {
  /** 基本戦略設定 */
  strategy: StrategySettings
  /** 凝視機能設定 */
  stare: StareSettings
  /** 評価の重み設定 */
  weights: {
    firing: number
    situation: number
    risk: number
    pattern: number
  }
}

/**
 * 評価コンテキスト（関数間で共有される文脈情報）
 */
interface EvaluationContext {
  readonly gameState: AIGameState
  readonly possibleMoves: readonly PossibleMove[]
  readonly patterns: readonly ChainPattern[]
  readonly opponentState?: AIGameState
  readonly settings: StrategyEvaluationSettings
}

/**
 * 分析結果構成要素
 */
interface AnalysisComponents {
  readonly situationDetails: SituationAnalysis
  readonly firingDetails: FiringDecision
  readonly riskDetails: RiskAssessment
  readonly stareResult: {
    readonly threatLevel: ThreatLevel
    readonly urgentAction: string | null
    readonly monitoringPoints: readonly string[]
  }
}

/**
 * スコア構成要素
 */
interface ScoreComponents {
  readonly strategyEvaluation: StrategyEvaluation
  readonly totalScore: number
  readonly confidence: number
}

// モジュールレベル キャッシュ
const analysisCache = new Map<string, AnalysisComponents>()

/**
 * 評価コンテキストを生成
 */
const createEvaluationContext = (
  gameState: AIGameState,
  possibleMoves: PossibleMove[],
  patterns: ChainPattern[],
  opponentState: AIGameState | undefined,
  settings: StrategyEvaluationSettings,
): EvaluationContext => ({
  gameState,
  possibleMoves: Object.freeze(possibleMoves),
  patterns: Object.freeze(patterns),
  opponentState,
  settings,
})

/**
 * ゲーム状態のキーを生成（キャッシュ用）
 */
const generateStateKey = (context: EvaluationContext): string => {
  const { gameState, opponentState } = context
  const playerKey = gameState.field.cells.flat().join('')
  const opponentKey = opponentState?.field.cells.flat().join('') ?? 'none'
  return `${playerKey}-${opponentKey}`
}

/**
 * 分析コンポーネントを計算（純粋関数 + キャッシュ）
 */
const calculateAnalysisComponents = (
  context: EvaluationContext,
): AnalysisComponents => {
  const stateKey = generateStateKey(context)

  // キャッシュヒット確認
  const cached = analysisCache.get(stateKey)
  if (cached) return cached

  const { gameState, opponentState } = context

  // 各システムで分析実行（純粋関数として）
  const situationAnalyzer = new SituationAnalyzer()
  const firingSystem = new FiringDecisionSystem()
  const riskManager = new RiskManager()

  const situationDetails = situationAnalyzer.analyzeSituation(
    gameState,
    opponentState,
  )
  const gamePhase = situationDetails.gamePhase

  const firingDetails = firingSystem.decideFiring(gameState, gamePhase)
  const riskDetails = riskManager.assessRisk(
    gameState,
    gamePhase,
    opponentState,
  )

  // 凝視機能の実行
  const stareResult = opponentState
    ? riskManager.stareFunction(opponentState, gamePhase)
    : {
        threatLevel: ThreatLevel.SAFE,
        urgentAction: null,
        monitoringPoints: [],
      }

  const result: AnalysisComponents = {
    situationDetails,
    firingDetails,
    riskDetails,
    stareResult: {
      ...stareResult,
      monitoringPoints: Object.freeze(stareResult.monitoringPoints),
    },
  }

  // キャッシュに保存
  analysisCache.set(stateKey, result)

  return result
}

/**
 * 戦略評価を計算（純粋関数）
 */
const calculateStrategyEvaluation = (
  components: AnalysisComponents,
  settings: StrategyEvaluationSettings,
): StrategyEvaluation => {
  const { situationDetails, firingDetails, riskDetails, stareResult } =
    components
  const { weights } = settings

  // 各要素のスコア化（純粋関数として）
  const firingScore = scoreFiringDecision(firingDetails) * weights.firing
  const situationScore = scoreSituation(situationDetails) * weights.situation
  const riskScore = scoreRisk(riskDetails) * weights.risk
  const stareScore = scoreStareFunction(stareResult) * 0.2 // 固定重み

  // 戦略優先度の決定（純粋関数として）
  const strategyPriority = determineStrategyPriority(
    firingDetails,
    situationDetails,
    riskDetails,
  )

  // 総合評価の詳細
  const details = {
    gamePhase: situationDetails.gamePhase,
    myThreatLevel: fieldSituationToThreat(situationDetails.fieldSituation),
    opponentThreatLevel: stareResult.threatLevel,
    availableChains: firingDetails.alternatives.map(
      (chain) => chain.chainCount,
    ),
    recommendedAction: generateRecommendedAction(
      strategyPriority,
      firingDetails,
    ),
    reasoning: generateReasoning(
      firingDetails,
      situationDetails,
      riskDetails,
      stareResult,
    ),
  }

  return {
    firingDecision: firingScore + situationScore * 0.1,
    riskAssessment: riskScore,
    stareFunction: stareScore,
    defensiveNeed: riskDetails.defensiveNeed,
    offensiveOpportunity: calculateOffensiveOpportunity(
      firingDetails,
      situationDetails,
    ),
    strategyPriority,
    details,
  }
}

/**
 * スコア構成要素を計算（純粋関数）
 */
const calculateScoreComponents = (
  components: AnalysisComponents,
  strategyEvaluation: StrategyEvaluation,
): ScoreComponents => {
  const { situationDetails, firingDetails, riskDetails } = components

  const totalScore = calculateTotalScore(strategyEvaluation)
  const confidence = calculateConfidence(
    firingDetails,
    situationDetails,
    riskDetails,
  )

  return {
    strategyEvaluation,
    totalScore,
    confidence,
  }
}

/**
 * 手の推奨評価（純粋関数）
 */
const evaluateMoves = (
  context: EvaluationContext,
  strategyEvaluation: StrategyEvaluation,
  gamePhase: GamePhase,
): readonly MoveRecommendation[] => {
  const { possibleMoves, gameState } = context

  const recommendations = possibleMoves.map((move): MoveRecommendation => {
    const strategicValue = calculateMoveStrategicValue(
      move,
      gameState,
      strategyEvaluation,
      gamePhase,
    )
    const reason = generateMoveReason(move, strategyEvaluation, gamePhase)
    const priority = calculateMovePriority(move, strategyEvaluation)
    const riskLevel = assessMoveRisk(move, gameState)

    return {
      move,
      strategicValue,
      reason,
      priority,
      riskLevel,
    }
  })

  return Object.freeze(
    recommendations.sort((a, b) => b.strategicValue - a.strategicValue),
  )
}

/**
 * 実行指針を生成（純粋関数）
 */
const generateActionPlan = (
  strategyEvaluation: StrategyEvaluation,
  components: AnalysisComponents,
): string => {
  const { situationDetails, firingDetails, riskDetails } = components
  const lines: string[] = []

  addBasicStrategy(lines, strategyEvaluation, firingDetails)
  addRiskResponse(lines, riskDetails)
  addNextAction(lines, situationDetails)

  return lines.join('\n')
}

/**
 * デフォルト戦略設定を作成
 */
export const createDefaultStrategySettings =
  (): StrategyEvaluationSettings => ({
    strategy: {
      aggressiveness: 0.7,
      riskTolerance: 0.5,
      chainPriority: 0.8,
      defensiveWeight: 0.6,
      speedPreference: 0.5,
      thinkingDepth: 3,
    },
    stare: {
      enabled: true,
      intensity: 0.7,
      responseSpeed: 0.8,
      threatThreshold: 0.6,
    },
    weights: {
      firing: 0.3,
      situation: 0.3,
      risk: 0.3,
      pattern: 0.1,
    },
  })

/**
 * メイン評価関数（関数型エントリーポイント）
 */
export const evaluateStrategy = (
  gameState: AIGameState,
  possibleMoves: PossibleMove[],
  patterns: ChainPattern[],
  settings: StrategyEvaluationSettings,
  opponentState?: AIGameState,
): StrategyEvaluationResult => {
  // 評価コンテキストを生成
  const context = createEvaluationContext(
    gameState,
    possibleMoves,
    patterns,
    opponentState,
    settings,
  )

  // 各分析コンポーネントを関数合成で計算
  const analysisComponents = calculateAnalysisComponents(context)

  // 戦略評価を計算
  const strategyEvaluation = calculateStrategyEvaluation(
    analysisComponents,
    settings,
  )

  // スコア構成要素を計算
  const scoreComponents = calculateScoreComponents(
    analysisComponents,
    strategyEvaluation,
  )

  // 手の推奨評価
  const moveRecommendations = evaluateMoves(
    context,
    strategyEvaluation,
    analysisComponents.situationDetails.gamePhase,
  )

  // 実行指針を生成
  const actionPlan = generateActionPlan(strategyEvaluation, analysisComponents)

  // 結果を合成して返す
  return {
    ...strategyEvaluation,
    firingDetails: analysisComponents.firingDetails,
    situationDetails: analysisComponents.situationDetails,
    riskDetails: analysisComponents.riskDetails,
    moveRecommendations: [...moveRecommendations],
    actionPlan,
    totalScore: scoreComponents.totalScore,
    confidence: scoreComponents.confidence,
    recommendedPriority: strategyEvaluation.strategyPriority,
  }
}

// ==== 純粋関数ヘルパー群 ====

/**
 * 発火判断をスコア化（純粋関数）
 */
const scoreFiringDecision = (firing: FiringDecision): number => {
  if (!firing.shouldFire) return 0

  const confidence = Number(firing.confidence) || 0
  const baseScore = confidence * 0.5
  const chainBonus = firing.targetChain
    ? Math.min(0.3, (Number(firing.targetChain.chainCount) || 0) / 20)
    : 0
  const timingBonus = firing.timing === 'immediate' ? 0.2 : 0.1

  return Math.min(1, Math.max(0, baseScore + chainBonus + timingBonus))
}

/**
 * 状況分析をスコア化（純粋関数）
 */
const scoreSituation = (situation: SituationAnalysis): number => {
  let score = 0.5 // ベース

  // 安全な数値チェック
  const boardAdvantage = Number(situation.boardAdvantage) || 0
  const chainPotential = Number(situation.fieldSituation?.chainPotential) || 0

  // 盤面優劣
  if (boardAdvantage > 0) {
    score += Math.min(0.3, boardAdvantage * 0.1)
  }

  // チェインポテンシャル
  score += Math.min(0.2, chainPotential / 10)

  return Math.min(1, Math.max(0, score))
}

/**
 * リスク評価をスコア化（純粋関数）
 */
const scoreRisk = (risk: RiskAssessment): number => {
  // リスクは低いほど高スコア
  const riskPenalty = {
    [ThreatLevel.SAFE]: 0,
    [ThreatLevel.LOW]: 0.1,
    [ThreatLevel.MEDIUM]: 0.3,
    [ThreatLevel.HIGH]: 0.6,
    [ThreatLevel.CRITICAL]: 1.0,
  }

  return 1 - (riskPenalty[risk.overallRisk] ?? 0.5)
}

/**
 * 凝視機能をスコア化（純粋関数）
 */
const scoreStareFunction = (stare: {
  readonly threatLevel: ThreatLevel
  readonly urgentAction: string | null
  readonly monitoringPoints: readonly string[]
}): number => {
  // 脅威レベルに基づく監視スコア
  const vigilanceScore = {
    [ThreatLevel.SAFE]: 0.2,
    [ThreatLevel.LOW]: 0.4,
    [ThreatLevel.MEDIUM]: 0.6,
    [ThreatLevel.HIGH]: 0.8,
    [ThreatLevel.CRITICAL]: 1.0,
  }

  const baseScore = vigilanceScore[stare.threatLevel] ?? 0.5
  const urgencyBonus = stare.urgentAction ? 0.2 : 0
  const monitoringBonus = Math.min(0.3, stare.monitoringPoints.length * 0.1)

  return Math.min(1, baseScore + urgencyBonus + monitoringBonus)
}

/**
 * 戦略優先度を決定（純粋関数）
 */
const shouldDefend = (risk: RiskAssessment): boolean =>
  risk.overallRisk >= ThreatLevel.HIGH

const shouldFireImmediately = (firing: FiringDecision): boolean =>
  firing.shouldFire && firing.confidence > 0.8

const shouldBuildChain = (
  situation: SituationAnalysis,
  risk: RiskAssessment,
): boolean => {
  const chainPotential = situation.fieldSituation?.chainPotential || 0
  return chainPotential > 8 && risk.overallRisk <= ThreatLevel.LOW
}

const shouldWatchOpponent = (situation: SituationAnalysis): boolean =>
  situation.boardAdvantage < -0.5

const determineStrategyPriority = (
  firing: FiringDecision,
  situation: SituationAnalysis,
  risk: RiskAssessment,
): StrategyPriority => {
  if (shouldDefend(risk)) return StrategyPriority.DEFEND
  if (shouldFireImmediately(firing)) return StrategyPriority.FIRE_IMMEDIATELY
  if (shouldBuildChain(situation, risk)) return StrategyPriority.BUILD_CHAIN
  if (shouldWatchOpponent(situation)) return StrategyPriority.WATCH_OPPONENT
  return StrategyPriority.BALANCED
}

// ==== その他のヘルパー関数群（純粋関数として実装） ====

const evaluateHeightThreat = (maxHeight: number): ThreatLevel => {
  if (maxHeight >= 11) return ThreatLevel.CRITICAL
  if (maxHeight >= 9) return ThreatLevel.HIGH
  if (maxHeight >= 7) return ThreatLevel.MEDIUM
  if (maxHeight >= 5) return ThreatLevel.LOW
  return ThreatLevel.SAFE
}

const evaluateEfficiencyThreat = (spaceEfficiency: number): ThreatLevel => {
  if (spaceEfficiency < 0.3) return ThreatLevel.HIGH
  if (spaceEfficiency < 0.5) return ThreatLevel.MEDIUM
  return ThreatLevel.SAFE
}

const evaluateStringThreat = (fieldSituation: string): ThreatLevel => {
  if (fieldSituation.includes('危険')) return ThreatLevel.HIGH
  if (fieldSituation.includes('注意')) return ThreatLevel.MEDIUM
  if (fieldSituation.includes('やや')) return ThreatLevel.LOW
  return ThreatLevel.SAFE
}

const fieldSituationToThreat = (fieldSituation: unknown): ThreatLevel => {
  // FieldSituationオブジェクトから脅威レベルを判定
  if (typeof fieldSituation === 'object' && fieldSituation) {
    const { maxHeight, spaceEfficiency } = fieldSituation as {
      maxHeight?: number
      spaceEfficiency?: number
    }

    const heightThreat = maxHeight
      ? evaluateHeightThreat(maxHeight)
      : ThreatLevel.SAFE
    const efficiencyThreat = spaceEfficiency
      ? evaluateEfficiencyThreat(spaceEfficiency)
      : ThreatLevel.SAFE

    // より高い脅威レベルを返す
    return heightThreat >= efficiencyThreat ? heightThreat : efficiencyThreat
  }

  // 文字列での判定（後方互換性）
  if (typeof fieldSituation === 'string') {
    return evaluateStringThreat(fieldSituation)
  }

  return ThreatLevel.SAFE
}

const calculateOffensiveOpportunity = (
  firing: FiringDecision,
  situation: SituationAnalysis,
): number => {
  let opportunity = 0.5

  if (firing.shouldFire) {
    opportunity += 0.3
  }

  const fieldChainPotential =
    Number(situation.fieldSituation?.chainPotential) || 0
  if (fieldChainPotential > 6) {
    opportunity += 0.2
  }

  return Math.max(0, Math.min(1, opportunity))
}

const generateRecommendedAction = (
  priority: StrategyPriority,
  firing: FiringDecision,
): string => {
  const actions: Record<StrategyPriority, string> = {
    [StrategyPriority.FIRE_IMMEDIATELY]: `${firing.targetChain?.chainCount ?? 0}連鎖で即座発火`,
    [StrategyPriority.BUILD_CHAIN]: '連鎖を強化',
    [StrategyPriority.DEFEND]: '防御的配置',
    [StrategyPriority.WATCH_OPPONENT]: '相手監視',
    [StrategyPriority.BALANCED]: '状況判断',
  }

  return actions[priority] ?? '状況判断'
}

const addFiringReason = (reasons: string[], firing: FiringDecision): void => {
  if (firing.shouldFire) {
    reasons.push(`発火可能（信頼度${Math.round(firing.confidence * 100)}%）`)
  }
}

const addChainReason = (
  reasons: string[],
  situation: SituationAnalysis,
): void => {
  const chainPotential = situation.fieldSituation?.chainPotential || 0
  if (chainPotential > 6) {
    reasons.push(`連鎖ポテンシャル${chainPotential}`)
  }
}

const addRiskReason = (reasons: string[], risk: RiskAssessment): void => {
  if (risk.overallRisk >= ThreatLevel.MEDIUM) {
    reasons.push(`リスクレベル${risk.overallRisk}`)
  }
}

const addStareReason = (
  reasons: string[],
  stare: { readonly threatLevel: ThreatLevel },
): void => {
  if (stare.threatLevel >= ThreatLevel.MEDIUM) {
    reasons.push(`相手脅威${stare.threatLevel}`)
  }
}

const generateReasoning = (
  firing: FiringDecision,
  situation: SituationAnalysis,
  risk: RiskAssessment,
  stare: { readonly threatLevel: ThreatLevel },
): string => {
  const reasons: string[] = []

  addFiringReason(reasons, firing)
  addChainReason(reasons, situation)
  addRiskReason(reasons, risk)
  addStareReason(reasons, stare)

  return reasons.join('、') || '通常状況'
}

const calculateTotalScore = (strategy: StrategyEvaluation): number => {
  const firingDecision = Number(strategy.firingDecision) || 0
  const riskAssessment = Number(strategy.riskAssessment) || 0
  const stareFunction = Number(strategy.stareFunction) || 0
  const offensiveOpportunity = Number(strategy.offensiveOpportunity) || 0

  const total =
    firingDecision * 0.4 +
    riskAssessment * 0.3 +
    stareFunction * 0.2 +
    offensiveOpportunity * 0.1

  return Math.max(0, Math.min(1, total))
}

const calculateConfidence = (
  firing: FiringDecision,
  situation: SituationAnalysis,
  risk: RiskAssessment,
): number => {
  let confidence = 0.5

  const firingConfidence = Number(firing.confidence) || 0
  const chainPotential = Number(situation.fieldSituation?.chainPotential) || 0

  confidence += firingConfidence * 0.3
  confidence += Math.min(0.2, chainPotential / 10)

  // リスクが高いほど信頼度を下げる
  const riskPenalty = {
    [ThreatLevel.SAFE]: 0,
    [ThreatLevel.LOW]: 0.05,
    [ThreatLevel.MEDIUM]: 0.15,
    [ThreatLevel.HIGH]: 0.3,
    [ThreatLevel.CRITICAL]: 0.5,
  }
  confidence -= riskPenalty[risk.overallRisk] ?? 0.2

  return Math.max(0, Math.min(1, confidence))
}

const calculateMoveStrategicValue = (
  _move: PossibleMove,
  _gameState: AIGameState,
  strategy: StrategyEvaluation,
  gamePhase: GamePhase,
): number => {
  let value = 0.5

  // 戦略に基づく評価
  if (strategy.strategyPriority === StrategyPriority.BUILD_CHAIN) {
    value += 0.3 // 連鎖構築価値
  }

  if (strategy.strategyPriority === StrategyPriority.DEFEND) {
    value += 0.2 // 安全価値
  }

  // ゲームフェーズに基づく調整
  if (gamePhase === 'early') {
    value += 0.1 // 序盤ボーナス
  }

  return Math.min(1, value)
}

const generateMoveReason = (
  _move: PossibleMove,
  strategy: StrategyEvaluation,
  gamePhase: GamePhase,
): string => {
  const reasons: string[] = []

  if (strategy.strategyPriority === StrategyPriority.BUILD_CHAIN) {
    reasons.push('連鎖構築に有効')
  }

  if (strategy.defensiveNeed > 0.5) {
    reasons.push('安全な配置')
  }

  reasons.push(`${gamePhase}フェーズ適合`)

  return reasons.join('、')
}

const calculateMovePriority = (
  _move: PossibleMove,
  strategy: StrategyEvaluation,
): number => {
  let priority = 0.5

  if (strategy.strategyPriority === StrategyPriority.FIRE_IMMEDIATELY) {
    priority += 0.5
  }

  if (strategy.defensiveNeed > 0.7) {
    priority += 0.3
  }

  return Math.min(1, priority)
}

const assessMoveRisk = (
  move: PossibleMove,
  gameState: AIGameState,
): ThreatLevel => {
  // 簡易リスク評価
  const column = move.x
  const heights = Array.from({ length: 6 }, (_, col) => {
    return gameState.field.cells.findIndex((row) => row[col] === null)
  })

  const currentHeight = heights[column] ?? 0

  if (currentHeight <= 2) return ThreatLevel.CRITICAL
  if (currentHeight <= 4) return ThreatLevel.HIGH
  if (currentHeight <= 6) return ThreatLevel.MEDIUM
  if (currentHeight <= 8) return ThreatLevel.LOW
  return ThreatLevel.SAFE
}

// 基本戦略追加関数群
const addBasicStrategy = (
  lines: string[],
  strategy: StrategyEvaluation,
  firing: FiringDecision,
): void => {
  const strategyActions: Record<StrategyPriority, () => void> = {
    [StrategyPriority.FIRE_IMMEDIATELY]: () => {
      lines.push('【即座発火】')
      lines.push(`- ${firing.targetChain?.chainCount ?? 0}連鎖で発火`)
    },
    [StrategyPriority.BUILD_CHAIN]: () => {
      lines.push('【連鎖構築】')
      lines.push('- 連鎖強化を優先')
    },
    [StrategyPriority.DEFEND]: () => {
      lines.push('【防御重視】')
      lines.push('- 安全な配置を優先')
    },
    [StrategyPriority.WATCH_OPPONENT]: () => {
      lines.push('【相手監視】')
      lines.push('- 相手の動向に注意して対応')
    },
    [StrategyPriority.BALANCED]: () => {
      lines.push('【バランス型】')
      lines.push('- 状況に応じた柔軟な対応')
    },
  }

  const action = strategyActions[strategy.strategyPriority]
  if (action) {
    action()
  } else {
    lines.push('【バランス型】')
    lines.push('- 状況に応じた柔軟な対応')
  }
}

const addRiskResponse = (lines: string[], risk: RiskAssessment): void => {
  if (risk.overallRisk >= ThreatLevel.HIGH) {
    lines.push('')
    lines.push('【リスク対応】')
    for (const strategy of risk.mitigationStrategies.slice(0, 2)) {
      lines.push(`- ${strategy}`)
    }
  }
}

const addNextAction = (lines: string[], situation: SituationAnalysis): void => {
  lines.push('')
  lines.push('【次の行動】')
  lines.push(`- ${situation.nextActionGuidance}`)
}
