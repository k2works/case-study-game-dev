/**
 * 戦略評価サービス
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
 * 戦略評価設定
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
 * 戦略評価サービス
 */
export class StrategyEvaluationService {
  private firingSystem: FiringDecisionSystem
  private situationAnalyzer: SituationAnalyzer
  private riskManager: RiskManager
  private settings: StrategyEvaluationSettings

  constructor(settings: StrategyEvaluationSettings) {
    this.settings = settings
    this.firingSystem = new FiringDecisionSystem()
    this.situationAnalyzer = new SituationAnalyzer()
    this.riskManager = new RiskManager()
  }

  /**
   * 総合戦略評価を実行
   */
  evaluateStrategy(
    gameState: AIGameState,
    possibleMoves: PossibleMove[],
    _patterns: ChainPattern[],
    opponentState?: AIGameState,
  ): StrategyEvaluationResult {
    // 各システムで分析実行
    const situationDetails = this.situationAnalyzer.analyzeSituation(
      gameState,
      opponentState,
    )
    const gamePhase = situationDetails.gamePhase

    const firingDetails = this.firingSystem.decideFiring(gameState, gamePhase)
    const riskDetails = this.riskManager.assessRisk(
      gameState,
      gamePhase,
      opponentState,
    )

    // 凝視機能の実行
    const stareResult = opponentState
      ? this.riskManager.stareFunction(opponentState, gamePhase)
      : {
          threatLevel: ThreatLevel.SAFE,
          urgentAction: null,
          monitoringPoints: [],
        }

    // 総合評価の計算
    const strategyEvaluation = this.calculateStrategyEvaluation(
      firingDetails,
      situationDetails,
      riskDetails,
      stareResult,
    )

    // 手の推奨評価
    const moveRecommendations = this.evaluateMoves(
      possibleMoves,
      gameState,
      strategyEvaluation,
      gamePhase,
    )

    // 実行指針の生成
    const actionPlan = this.generateActionPlan(
      strategyEvaluation,
      firingDetails,
      situationDetails,
      riskDetails,
    )

    // 総合スコアと信頼度の計算
    const totalScore = this.calculateTotalScore(strategyEvaluation)
    const confidence = this.calculateConfidence(
      firingDetails,
      situationDetails,
      riskDetails,
    )

    return {
      ...strategyEvaluation,
      firingDetails,
      situationDetails,
      riskDetails,
      moveRecommendations,
      actionPlan,
      totalScore,
      confidence,
      recommendedPriority: strategyEvaluation.strategyPriority,
    }
  }

  /**
   * 戦略評価を計算
   */
  private calculateStrategyEvaluation(
    firing: FiringDecision,
    situation: SituationAnalysis,
    risk: RiskAssessment,
    stare: {
      threatLevel: ThreatLevel
      urgentAction: string | null
      monitoringPoints: string[]
    },
  ): StrategyEvaluation {
    const weights = this.settings.weights

    // 各要素のスコア化
    const firingScore = this.scoreFiringDecision(firing) * weights.firing
    const situationScore = this.scoreSituation(situation) * weights.situation
    const riskScore = this.scoreRisk(risk) * weights.risk
    const stareScore = this.scoreStareFunction(stare) * 0.2 // 固定重み

    // 戦略優先度の決定
    const strategyPriority = this.determineStrategyPriority(
      firing,
      situation,
      risk,
    )

    // 総合評価の詳細
    const details = {
      gamePhase: situation.gamePhase,
      myThreatLevel: this.fieldSituationToThreat(situation.fieldSituation),
      opponentThreatLevel: stare.threatLevel,
      availableChains: firing.alternatives.map((chain) => chain.chainCount),
      recommendedAction: this.generateRecommendedAction(
        strategyPriority,
        firing,
      ),
      reasoning: this.generateReasoning(firing, situation, risk, stare),
    }

    return {
      firingDecision: firingScore + situationScore * 0.1,
      riskAssessment: riskScore,
      stareFunction: stareScore,
      defensiveNeed: risk.defensiveNeed,
      offensiveOpportunity: this.calculateOffensiveOpportunity(
        firing,
        situation,
      ),
      strategyPriority,
      details,
    }
  }

  /**
   * 手の評価
   */
  private evaluateMoves(
    moves: PossibleMove[],
    gameState: AIGameState,
    strategy: StrategyEvaluation,
    gamePhase: GamePhase,
  ): MoveRecommendation[] {
    const recommendations: MoveRecommendation[] = []

    for (const move of moves) {
      const strategicValue = this.calculateMoveStrategicValue(
        move,
        gameState,
        strategy,
        gamePhase,
      )
      const reason = this.generateMoveReason(move, strategy, gamePhase)
      const priority = this.calculateMovePriority(move, strategy)
      const riskLevel = this.assessMoveRisk(move, gameState)

      recommendations.push({
        move,
        strategicValue,
        reason,
        priority,
        riskLevel,
      })
    }

    return recommendations.sort((a, b) => b.strategicValue - a.strategicValue)
  }

  /**
   * 実行指針を生成
   */
  private generateActionPlan(
    strategy: StrategyEvaluation,
    firing: FiringDecision,
    situation: SituationAnalysis,
    risk: RiskAssessment,
  ): string {
    const lines: string[] = []

    this.addBasicStrategy(lines, strategy, firing)
    this.addRiskResponse(lines, risk)
    this.addNextAction(lines, situation)

    return lines.join('\n')
  }

  private addBasicStrategy(
    lines: string[],
    strategy: StrategyEvaluation,
    firing: FiringDecision,
  ): void {
    const strategyActions: Record<StrategyPriority, () => void> = {
      [StrategyPriority.FIRE_IMMEDIATELY]: () => {
        lines.push('【即座発火】')
        lines.push(`- ${firing.targetChain?.chainCount}連鎖で発火`)
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

  private addRiskResponse(lines: string[], risk: RiskAssessment): void {
    if (risk.overallRisk >= ThreatLevel.HIGH) {
      lines.push('')
      lines.push('【リスク対応】')
      for (const strategy of risk.mitigationStrategies.slice(0, 2)) {
        lines.push(`- ${strategy}`)
      }
    }
  }

  private addNextAction(lines: string[], situation: SituationAnalysis): void {
    lines.push('')
    lines.push('【次の行動】')
    lines.push(`- ${situation.nextActionGuidance}`)
  }

  /**
   * スコア計算メソッド
   */
  private scoreFiringDecision(firing: FiringDecision): number {
    if (!firing.shouldFire) return 0

    const baseScore = firing.confidence * 0.5
    const chainBonus = firing.targetChain
      ? Math.min(0.3, firing.targetChain.chainCount / 20)
      : 0
    const timingBonus = firing.timing === 'immediate' ? 0.2 : 0.1

    return Math.min(1, baseScore + chainBonus + timingBonus)
  }

  private scoreSituation(situation: SituationAnalysis): number {
    let score = 0.5 // ベース

    // 盤面優劣
    score += situation.boardAdvantage * 0.3

    // 時間的優位性
    score += situation.timeAdvantage * 0.2

    // フィールド状況
    const fieldScore =
      situation.fieldSituation.chainPotential * 0.4 +
      situation.fieldSituation.spaceEfficiency * 0.3 +
      situation.fieldSituation.heightBalance * 0.3
    score += fieldScore * 0.5

    return Math.max(0, Math.min(1, score))
  }

  private scoreRisk(risk: RiskAssessment): number {
    // リスクが低いほど高スコア
    const riskValue = this.threatLevelToNumber(risk.overallRisk) / 4
    return Math.max(0, 1 - riskValue - risk.defensiveNeed * 0.3)
  }

  private scoreStareFunction(stare: {
    threatLevel: ThreatLevel
    urgentAction: string | null
  }): number {
    const threatValue = this.threatLevelToNumber(stare.threatLevel) / 4
    const urgencyPenalty = stare.urgentAction ? 0.3 : 0

    return Math.max(0, 1 - threatValue - urgencyPenalty)
  }

  /**
   * 戦略優先度を決定
   */
  private determineStrategyPriority(
    firing: FiringDecision,
    situation: SituationAnalysis,
    risk: RiskAssessment,
  ): StrategyPriority {
    return this.evaluateStrategicPriorities(firing, situation, risk)
  }

  private evaluateStrategicPriorities(
    firing: FiringDecision,
    situation: SituationAnalysis,
    risk: RiskAssessment,
  ): StrategyPriority {
    // 緊急状況の優先判定
    const criticalStrategy = this.handleCriticalSituation(firing, risk)
    if (criticalStrategy) return criticalStrategy

    // 発火機会の判定
    const firingStrategy = this.evaluateFiringOpportunity(firing)
    if (firingStrategy) return firingStrategy

    // その他の戦略判定
    return this.evaluateOtherStrategies(situation, risk)
  }

  private handleCriticalSituation(
    firing: FiringDecision,
    risk: RiskAssessment,
  ): StrategyPriority | null {
    if (risk.overallRisk === ThreatLevel.CRITICAL) {
      return firing.shouldFire
        ? StrategyPriority.FIRE_IMMEDIATELY
        : StrategyPriority.DEFEND
    }
    return null
  }

  private evaluateFiringOpportunity(
    firing: FiringDecision,
  ): StrategyPriority | null {
    if (firing.shouldFire && firing.confidence >= 0.8) {
      return StrategyPriority.FIRE_IMMEDIATELY
    }
    return null
  }

  private evaluateOtherStrategies(
    situation: SituationAnalysis,
    risk: RiskAssessment,
  ): StrategyPriority {
    if (risk.opponentThreat >= 0.7) {
      return StrategyPriority.WATCH_OPPONENT
    }

    if (risk.defensiveNeed >= 0.6) {
      return StrategyPriority.DEFEND
    }

    if (this.isChainBuildingViable(situation, risk)) {
      return StrategyPriority.BUILD_CHAIN
    }

    return StrategyPriority.BALANCED
  }

  private isChainBuildingViable(
    situation: SituationAnalysis,
    risk: RiskAssessment,
  ): boolean {
    // 空のフィールドや安全な状況では連鎖構築を推奨
    return (
      (situation.fieldSituation.chainPotential >= 0.1 ||
        situation.fieldSituation.averageHeight < 5) &&
      risk.overallRisk !== ThreatLevel.CRITICAL &&
      risk.overallRisk !== ThreatLevel.HIGH
    )
  }

  /**
   * ユーティリティメソッド
   */
  private fieldSituationToThreat(field: {
    dangerLevel: ThreatLevel
  }): ThreatLevel {
    return field.dangerLevel
  }

  private calculateOffensiveOpportunity(
    firing: FiringDecision,
    situation: SituationAnalysis,
  ): number {
    let opportunity = 0

    if (firing.shouldFire) {
      opportunity += firing.confidence * 0.5
    }

    if (situation.strategicPosition === 'advantageous') {
      opportunity += 0.3
    }

    if (situation.fieldSituation.chainPotential >= 0.7) {
      opportunity += 0.2
    }

    return Math.min(1, opportunity)
  }

  private generateRecommendedAction(
    priority: StrategyPriority,
    firing: FiringDecision,
  ): string {
    switch (priority) {
      case StrategyPriority.FIRE_IMMEDIATELY:
        return `${firing.targetChain?.chainCount}連鎖で即座発火`
      case StrategyPriority.BUILD_CHAIN:
        return '連鎖構築を継続'
      case StrategyPriority.DEFEND:
        return '安全な配置で防御'
      case StrategyPriority.WATCH_OPPONENT:
        return '相手の動向を監視'
      default:
        return 'バランス良く対応'
    }
  }

  private generateReasoning(
    firing: FiringDecision,
    situation: SituationAnalysis,
    risk: RiskAssessment,
    stare: { threatLevel: ThreatLevel; urgentAction: string | null },
  ): string {
    const reasons: string[] = []

    if (firing.shouldFire) {
      reasons.push(`発火判断: ${firing.reason}`)
    }

    if (risk.overallRisk >= ThreatLevel.HIGH) {
      reasons.push(
        `高リスク: ${risk.riskFactors[0]?.description || 'リスク要因あり'}`,
      )
    }

    if (stare.urgentAction) {
      reasons.push(`相手脅威: ${stare.urgentAction}`)
    }

    reasons.push(`戦略的位置: ${situation.strategicPosition}`)

    return reasons.join(', ')
  }

  private calculateMoveStrategicValue(
    move: PossibleMove,
    gameState: AIGameState,
    strategy: StrategyEvaluation,
    gamePhase: GamePhase,
  ): number {
    let value = 0.5 // ベース値

    // 戦略優先度による調整
    switch (strategy.strategyPriority) {
      case StrategyPriority.FIRE_IMMEDIATELY:
        // 発火に繋がりやすい手を高評価
        value += this.evaluateFirePotential(move, gameState) * 0.4
        break

      case StrategyPriority.BUILD_CHAIN:
        // 連鎖構築に有効な手を高評価
        value += this.evaluateChainBuildingPotential() * 0.4
        break

      case StrategyPriority.DEFEND:
        // 安全な手を高評価
        value += this.evaluateMoveSafety(move, gameState) * 0.4
        break
    }

    // ゲームフェーズによる調整
    value += this.getPhaseAdjustment(gamePhase) * 0.2

    return Math.max(0, Math.min(1, value))
  }

  private generateMoveReason(
    _move: PossibleMove,
    strategy: StrategyEvaluation,
    gamePhase: GamePhase,
  ): string {
    const reasons: string[] = []

    switch (strategy.strategyPriority) {
      case StrategyPriority.FIRE_IMMEDIATELY:
        reasons.push('発火準備')
        break
      case StrategyPriority.BUILD_CHAIN:
        reasons.push('連鎖構築')
        break
      case StrategyPriority.DEFEND:
        reasons.push('安全配置')
        break
    }

    reasons.push(`${gamePhase}フェーズ対応`)

    return reasons.join(', ')
  }

  private calculateMovePriority(
    _move: PossibleMove,
    strategy: StrategyEvaluation,
  ): number {
    // 戦略優先度に基づく基本優先度
    switch (strategy.strategyPriority) {
      case StrategyPriority.FIRE_IMMEDIATELY:
        return 1.0
      case StrategyPriority.DEFEND:
        return 0.8
      case StrategyPriority.BUILD_CHAIN:
        return 0.7
      default:
        return 0.5
    }
  }

  private assessMoveRisk(
    move: PossibleMove,
    gameState: AIGameState,
  ): ThreatLevel {
    // 手の危険度を評価
    const height = gameState.field.height - move.primaryPosition.y

    if (height <= 2) return ThreatLevel.CRITICAL
    if (height <= 4) return ThreatLevel.HIGH
    if (height <= 6) return ThreatLevel.MEDIUM
    if (height <= 8) return ThreatLevel.LOW
    return ThreatLevel.SAFE
  }

  private evaluateFirePotential(
    move: PossibleMove,
    gameState: AIGameState,
  ): number {
    // 発火可能性を簡易評価
    const position = move.primaryPosition
    return Math.max(0, 1 - position.y / gameState.field.height)
  }

  private evaluateChainBuildingPotential(): number {
    // 連鎖構築可能性を簡易評価
    return 0.5 // 簡略化
  }

  private evaluateMoveSafety(
    move: PossibleMove,
    gameState: AIGameState,
  ): number {
    // 手の安全性を評価
    const height = gameState.field.height - move.primaryPosition.y
    return Math.min(1, height / 8)
  }

  private getPhaseAdjustment(gamePhase: GamePhase): number {
    // フェーズによる手の調整
    switch (gamePhase) {
      case 'early':
        return 0.1 // 序盤は控えめ
      case 'middle':
        return 0.0 // 中盤は標準
      case 'late':
        return -0.1 // 終盤は慎重
      default:
        return 0.0
    }
  }

  private threatLevelToNumber(level: ThreatLevel): number {
    switch (level) {
      case ThreatLevel.SAFE:
        return 0
      case ThreatLevel.LOW:
        return 1
      case ThreatLevel.MEDIUM:
        return 2
      case ThreatLevel.HIGH:
        return 3
      case ThreatLevel.CRITICAL:
        return 4
      default:
        return 0
    }
  }

  /**
   * 設定を更新
   */
  updateSettings(settings: StrategyEvaluationSettings): void {
    this.settings = settings
    // FiringDecisionSystem と RiskManager は現在設定更新メソッドがないため省略
  }

  /**
   * 総合スコアを計算
   */
  private calculateTotalScore(evaluation: StrategyEvaluation): number {
    const weights = this.settings.weights
    return (
      evaluation.firingDecision * weights.firing +
      evaluation.riskAssessment * weights.risk +
      evaluation.stareFunction * 0.2 +
      evaluation.defensiveNeed * 0.1 +
      evaluation.offensiveOpportunity * 0.1
    )
  }

  /**
   * 信頼度を計算
   */
  private calculateConfidence(
    firing: FiringDecision,
    situation: SituationAnalysis,
    risk: RiskAssessment,
  ): number {
    // 各要素の信頼度を統合
    let confidence = firing.confidence * 0.4

    // 状況分析の明確さ
    const situationClarity =
      Math.abs(situation.fieldSituation.chainPotential - 0.5) * 2
    confidence += situationClarity * 0.3

    // リスク評価の確実性
    const riskCertainty =
      risk.overallRisk === ThreatLevel.CRITICAL ||
      risk.overallRisk === ThreatLevel.SAFE
        ? 1.0
        : 0.6
    confidence += riskCertainty * 0.3

    return Math.max(0.0, Math.min(1.0, confidence))
  }
}

/**
 * 戦略評価を実行（関数型インターフェース）
 */
export const evaluateStrategy = (
  gameState: AIGameState,
  possibleMoves: PossibleMove[],
  patterns: ChainPattern[],
  settings: StrategyEvaluationSettings,
  opponentState?: AIGameState,
): StrategyEvaluationResult => {
  const service = new StrategyEvaluationService(settings)
  return service.evaluateStrategy(
    gameState,
    possibleMoves,
    patterns,
    opponentState,
  )
}

/**
 * デフォルト設定
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
