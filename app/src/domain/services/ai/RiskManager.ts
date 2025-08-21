/**
 * リスク管理システム
 * 脅威評価、防御判断、リスク軽減戦略の総合管理
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState, AIGameState, PossibleMove } from '../../models/ai'
import type { GamePhase } from './IntegratedEvaluationService'
import {
  type RiskAssessment,
  type RiskFactor,
  type StareSettings,
  type StrategySettings,
  ThreatLevel,
} from './StrategyTypes'

/**
 * リスク管理器
 */
export class RiskManager {
  private settings: StrategySettings
  private stareSettings: StareSettings

  constructor(
    settings: StrategySettings = {
      aggressiveness: 0.5,
      riskTolerance: 0.5,
      chainPriority: 0.7,
      defensiveWeight: 0.3,
      speedPreference: 0.5,
      thinkingDepth: 3,
    },
    stareSettings: StareSettings = {
      enabled: true,
      intensity: 0.7,
      responseSpeed: 0.8,
      threatThreshold: 0.6,
    },
  ) {
    this.settings = settings
    this.stareSettings = stareSettings
  }

  /**
   * 総合リスク評価を実行
   */
  assessRisk(
    gameState: AIGameState,
    gamePhase: GamePhase,
    opponentState?: AIGameState,
  ): RiskAssessment {
    // 基本的なフィールド危険度
    const fieldDanger = this.evaluateFieldDanger(gameState.field)

    // 相手の脅威評価
    const opponentThreat = opponentState
      ? this.evaluateOpponentThreat(opponentState, gamePhase)
      : 0

    // 時間的切迫度
    const timeUrgency = this.evaluateTimeUrgency(gameState, gamePhase)

    // 防御必要性
    const defensiveNeed = this.evaluateDefensiveNeed(
      fieldDanger,
      opponentThreat,
      timeUrgency,
    )

    // リスク要因の特定
    const riskFactors = this.identifyRiskFactors(gameState, opponentState)

    // 対策案の生成
    const mitigationStrategies = this.generateMitigationStrategies(
      riskFactors,
      gamePhase,
    )

    // 総合リスクレベル判定
    const overallRisk = this.determineOverallRisk(
      fieldDanger,
      opponentThreat,
      timeUrgency,
    )

    return {
      overallRisk,
      fieldDanger,
      opponentThreat,
      timeUrgency,
      defensiveNeed,
      riskFactors,
      mitigationStrategies,
    }
  }

  /**
   * 凝視機能：相手の脅威を監視
   */
  stareFunction(
    opponentState: AIGameState,
    gamePhase: GamePhase,
  ): {
    threatLevel: ThreatLevel
    urgentAction: string | null
    monitoringPoints: string[]
  } {
    if (!this.stareSettings.enabled) {
      return {
        threatLevel: ThreatLevel.SAFE,
        urgentAction: null,
        monitoringPoints: [],
      }
    }

    const threatLevel = this.evaluateOpponentThreatLevel(opponentState)
    const urgentAction = this.determineUrgentAction(threatLevel, gamePhase)
    const monitoringPoints = this.identifyMonitoringPoints(opponentState)

    return { threatLevel, urgentAction, monitoringPoints }
  }

  /**
   * 防御戦略を提案
   */
  proposeDefensiveStrategy(
    gameState: AIGameState,
    riskAssessment: RiskAssessment,
    possibleMoves: PossibleMove[],
  ): {
    strategy: string
    recommendedMoves: PossibleMove[]
    priority: number
  } {
    const { overallRisk, riskFactors } = riskAssessment

    // リスクレベルに応じた戦略
    switch (overallRisk) {
      case ThreatLevel.CRITICAL:
        return this.createEmergencyStrategy(gameState, possibleMoves)

      case ThreatLevel.HIGH:
        return this.createHighRiskStrategy(
          gameState,
          riskFactors,
          possibleMoves,
        )

      case ThreatLevel.MEDIUM:
        return this.createMediumRiskStrategy(
          gameState,
          riskFactors,
          possibleMoves,
        )

      default:
        return this.createLowRiskStrategy(gameState, possibleMoves)
    }
  }

  /**
   * フィールドの危険度を評価
   */
  private evaluateFieldDanger(field: AIFieldState): number {
    let dangerScore = 0

    // 1. 高さによる危険度
    const heights = this.calculateColumnHeights(field)
    const maxHeight = Math.max(...heights)
    const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length

    dangerScore += Math.max(0, (maxHeight - 8) / 4) * 0.4 // 高さ8以上から危険
    dangerScore += Math.max(0, (avgHeight - 6) / 6) * 0.3 // 平均6以上から危険

    // 2. 高さのばらつき
    const heightVariance = this.calculateVariance(heights)
    dangerScore += Math.min(0.2, heightVariance / 10)

    // 3. 空洞の存在
    const cavities = this.countCavities(field)
    dangerScore += Math.min(0.1, cavities * 0.02)

    // 4. 不安定な構造
    const instability = this.evaluateStructuralInstability(field)
    dangerScore += instability * 0.2

    return Math.min(1, dangerScore)
  }

  /**
   * 相手の脅威を評価
   */
  private evaluateOpponentThreat(
    opponentState: AIGameState,
    gamePhase: GamePhase,
  ): number {
    const opponentField = opponentState.field

    // 1. 相手の連鎖可能性
    const chainPotential = this.estimateChainPotential(opponentField)

    // 2. 相手の攻撃準備状況
    const attackReadiness = this.evaluateAttackReadiness(
      opponentField,
      gamePhase,
    )

    // 3. 相手の積み上げ安定性
    const stability = this.evaluateStability(opponentField)

    // 4. フェーズによる重み調整
    const phaseMultiplier = this.getThreatPhaseMultiplier(gamePhase)

    return (
      (chainPotential * 0.5 + attackReadiness * 0.3 + stability * 0.2) *
      phaseMultiplier
    )
  }

  /**
   * 時間的切迫度を評価
   */
  private evaluateTimeUrgency(
    gameState: AIGameState,
    gamePhase: GamePhase,
  ): number {
    const baseUrgency = this.getPhaseBasedUrgency(gamePhase)
    const heightUrgency = this.getHeightBasedUrgency(gameState.field)
    const turnUrgency = this.getTurnBasedUrgency(gameState.turn)

    return Math.min(1, baseUrgency + heightUrgency + turnUrgency)
  }

  private getPhaseBasedUrgency(phase: GamePhase): number {
    switch (phase) {
      case 'early':
        return 0.1
      case 'middle':
        return 0.3
      case 'late':
        return 0.7
      default:
        return 0.1
    }
  }

  private getHeightBasedUrgency(field: AIFieldState): number {
    const heights = this.calculateColumnHeights(field)
    const maxHeight = Math.max(...heights)

    if (maxHeight >= 10) return 0.3
    if (maxHeight >= 8) return 0.2
    if (maxHeight >= 6) return 0.1
    return 0
  }

  private getTurnBasedUrgency(turn?: number): number {
    const currentTurn = turn || 1
    if (currentTurn > 150) return 0.2
    if (currentTurn > 100) return 0.1
    return 0
  }

  /**
   * 防御必要性を評価
   */
  private evaluateDefensiveNeed(
    fieldDanger: number,
    opponentThreat: number,
    timeUrgency: number,
  ): number {
    // 重み付け統合
    const weightedScore =
      fieldDanger * 0.4 + opponentThreat * 0.4 + timeUrgency * 0.2

    // リスク許容度による調整
    return weightedScore * (1 - this.settings.riskTolerance)
  }

  /**
   * リスク要因を特定
   */
  private identifyRiskFactors(
    gameState: AIGameState,
    opponentState?: AIGameState,
  ): RiskFactor[] {
    const factors: RiskFactor[] = []

    // 自分のフィールドのリスク要因
    const myFactors = this.identifyMyFieldRisks(gameState.field)
    factors.push(...myFactors)

    // 相手の脅威要因
    if (opponentState) {
      const opponentFactors = this.identifyOpponentThreats(opponentState)
      factors.push(...opponentFactors)
    }

    // ゲーム進行によるリスク要因
    const gameFactors = this.identifyGameProgressRisks(gameState)
    factors.push(...gameFactors)

    return factors.sort((a, b) => b.severity - a.severity)
  }

  /**
   * 対策案を生成
   */
  private generateMitigationStrategies(
    riskFactors: RiskFactor[],
    gamePhase: GamePhase,
  ): string[] {
    const strategies: string[] = []

    for (const factor of riskFactors.slice(0, 3)) {
      // 上位3つの要因
      const strategy = this.generateStrategyForFactor(factor, gamePhase)
      if (strategy) {
        strategies.push(strategy)
      }
    }

    return strategies
  }

  /**
   * 総合リスクレベルを判定
   */
  private determineOverallRisk(
    fieldDanger: number,
    opponentThreat: number,
    timeUrgency: number,
  ): ThreatLevel {
    const maxRisk = Math.max(fieldDanger, opponentThreat, timeUrgency)
    const avgRisk = (fieldDanger + opponentThreat + timeUrgency) / 3

    return this.mapRiskScoreToThreatLevel(maxRisk, avgRisk)
  }

  private mapRiskScoreToThreatLevel(
    maxRisk: number,
    avgRisk: number,
  ): ThreatLevel {
    const thresholds = [
      { max: 0.8, avg: 0.7, level: ThreatLevel.CRITICAL },
      { max: 0.6, avg: 0.5, level: ThreatLevel.HIGH },
      { max: 0.4, avg: 0.3, level: ThreatLevel.MEDIUM },
      { max: 0.2, avg: 0.1, level: ThreatLevel.LOW },
    ]

    for (const { max, avg, level } of thresholds) {
      if (maxRisk >= max || avgRisk >= avg) return level
    }
    return ThreatLevel.SAFE
  }

  /**
   * ユーティリティメソッド
   */
  private calculateColumnHeights(field: AIFieldState): number[] {
    const heights: number[] = []

    for (let x = 0; x < field.width; x++) {
      let height = 0
      for (let y = 0; y < field.height; y++) {
        if (field.cells[y] && field.cells[y][x]) {
          height = field.height - y
          break
        }
      }
      heights.push(height)
    }

    return heights
  }

  private calculateVariance(values: number[]): number {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length
    return (
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
    )
  }

  private countCavities(field: AIFieldState): number {
    let cavities = 0

    for (let x = 0; x < field.width; x++) {
      let foundPuyo = false

      for (let y = 0; y < field.height; y++) {
        const cell = field.cells[y] && field.cells[y][x]

        if (cell) {
          foundPuyo = true
        } else if (foundPuyo) {
          cavities++
        }
      }
    }

    return cavities
  }

  private evaluateStructuralInstability(field: AIFieldState): number {
    let instability = 0

    // 不安定な積み方をチェック
    for (let x = 0; x < field.width; x++) {
      for (let y = field.height - 2; y >= 0; y--) {
        const current = field.cells[y] && field.cells[y][x]
        const below = field.cells[y + 1] && field.cells[y + 1][x]

        if (current && !below) {
          instability += 0.1 // 浮いているぷよ
        }
      }
    }

    return Math.min(1, instability)
  }

  private estimateChainPotential(field: AIFieldState): number {
    // 簡易的な連鎖可能性評価
    const colorGroups = this.analyzeColorGroups(field)
    let potential = 0

    for (const [, groups] of Object.entries(colorGroups)) {
      for (const group of groups) {
        if (group.length >= 2) {
          potential += group.length * 0.1
        }
      }
    }

    return Math.min(1, potential)
  }

  private evaluateAttackReadiness(
    field: AIFieldState,
    gamePhase: GamePhase,
  ): number {
    const heights = this.calculateColumnHeights(field)
    const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length
    const chainPotential = this.estimateChainPotential(field)

    // フェーズによる攻撃準備度の重み
    const phaseWeight =
      gamePhase === 'late' ? 1.2 : gamePhase === 'middle' ? 1.0 : 0.8

    return Math.min(1, (avgHeight / 8 + chainPotential) * phaseWeight)
  }

  private evaluateStability(field: AIFieldState): number {
    const heights = this.calculateColumnHeights(field)
    const variance = this.calculateVariance(heights)
    const cavities = this.countCavities(field)

    // 安定性 = 1 - (不安定要因)
    return Math.max(0, 1 - variance / 10 - cavities * 0.05)
  }

  private getThreatPhaseMultiplier(gamePhase: GamePhase): number {
    switch (gamePhase) {
      case 'early':
        return 0.7
      case 'middle':
        return 1.0
      case 'late':
        return 1.3
      default:
        return 1.0
    }
  }

  private evaluateOpponentThreatLevel(opponentState: AIGameState): ThreatLevel {
    const threat = this.evaluateOpponentThreat(
      opponentState,
      'middle' as GamePhase,
    ) // 標準評価

    if (threat >= 0.8) return ThreatLevel.CRITICAL
    if (threat >= 0.6) return ThreatLevel.HIGH
    if (threat >= 0.4) return ThreatLevel.MEDIUM
    if (threat >= 0.2) return ThreatLevel.LOW
    return ThreatLevel.SAFE
  }

  private determineUrgentAction(
    threatLevel: ThreatLevel,
    gamePhase: GamePhase,
  ): string | null {
    switch (threatLevel) {
      case ThreatLevel.CRITICAL:
        return '即座の発火または防御が必要'
      case ThreatLevel.HIGH:
        return gamePhase === 'late' ? '先制攻撃を検討' : '防御準備を強化'
      case ThreatLevel.MEDIUM:
        return '警戒を継続、機会を見て対応'
      default:
        return null
    }
  }

  private identifyMonitoringPoints(opponentState: AIGameState): string[] {
    const points: string[] = []

    const heights = this.calculateColumnHeights(opponentState.field)
    const maxHeight = Math.max(...heights)

    if (maxHeight >= 8) {
      points.push('相手の高積み注意')
    }

    const chainPotential = this.estimateChainPotential(opponentState.field)
    if (chainPotential >= 0.6) {
      points.push('相手の連鎖構築進行中')
    }

    return points
  }

  private analyzeColorGroups(
    field: AIFieldState,
  ): Record<string, Array<Array<{ x: number; y: number }>>> {
    const colorGroups: Record<
      string,
      Array<Array<{ x: number; y: number }>>
    > = {}
    const visited = this.createVisitedMatrix(field)

    this.processFieldCells(field, visited, colorGroups)
    return colorGroups
  }

  private createVisitedMatrix(field: AIFieldState): boolean[][] {
    return Array(field.height)
      .fill(null)
      .map(() => Array(field.width).fill(false))
  }

  private processFieldCells(
    field: AIFieldState,
    visited: boolean[][],
    colorGroups: Record<string, Array<Array<{ x: number; y: number }>>>,
  ): void {
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        this.processSingleCell(field, x, y, visited, colorGroups)
      }
    }
  }

  private processSingleCell(
    field: AIFieldState,
    x: number,
    y: number,
    visited: boolean[][],
    colorGroups: Record<string, Array<Array<{ x: number; y: number }>>>,
  ): void {
    if (visited[y][x]) return

    const cellColor = field.cells[y] && field.cells[y][x]
    if (!cellColor) return

    const group = this.findColorGroup(field, x, y, cellColor, visited)
    if (group.length > 1) {
      if (!colorGroups[cellColor]) colorGroups[cellColor] = []
      colorGroups[cellColor].push(group)
    }
  }

  private findColorGroup(
    field: AIFieldState,
    startX: number,
    startY: number,
    color: PuyoColor,
    visited: boolean[][],
  ): Array<{ x: number; y: number }> {
    const group: Array<{ x: number; y: number }> = []
    const stack = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (!this.isValidGroupCell(field, current, color, visited)) continue

      this.processGroupCell(current, visited, group)
      this.addAdjacentCells(field, current, color, visited, stack)
    }

    return group
  }

  private isValidGroupCell(
    field: AIFieldState,
    pos: { x: number; y: number },
    color: PuyoColor,
    visited: boolean[][],
  ): boolean {
    return !visited[pos.y][pos.x] && field.cells[pos.y][pos.x] === color
  }

  private processGroupCell(
    pos: { x: number; y: number },
    visited: boolean[][],
    group: Array<{ x: number; y: number }>,
  ): void {
    visited[pos.y][pos.x] = true
    group.push(pos)
  }

  private addAdjacentCells(
    field: AIFieldState,
    pos: { x: number; y: number },
    color: PuyoColor,
    visited: boolean[][],
    stack: Array<{ x: number; y: number }>,
  ): void {
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]

    for (const dir of directions) {
      const nx = pos.x + dir.x
      const ny = pos.y + dir.y

      if (this.shouldAddToStack(field, nx, ny, color, visited)) {
        stack.push({ x: nx, y: ny })
      }
    }
  }

  private shouldAddToStack(
    field: AIFieldState,
    x: number,
    y: number,
    color: PuyoColor,
    visited: boolean[][],
  ): boolean {
    return (
      x >= 0 &&
      x < field.width &&
      y >= 0 &&
      y < field.height &&
      !visited[y][x] &&
      field.cells[y] &&
      field.cells[y][x] === color
    )
  }

  private identifyMyFieldRisks(field: AIFieldState): RiskFactor[] {
    const factors: RiskFactor[] = []
    const heights = this.calculateColumnHeights(field)
    const maxHeight = Math.max(...heights)

    if (maxHeight >= 10) {
      factors.push({
        factor: '高積みリスク',
        severity: 0.9,
        description: 'フィールドが高すぎて危険',
        probability: 0.8,
      })
    }

    const cavities = this.countCavities(field)
    if (cavities >= 3) {
      factors.push({
        factor: '空洞リスク',
        severity: 0.6,
        description: '空洞が多く構造が不安定',
        probability: 0.7,
      })
    }

    return factors
  }

  private identifyOpponentThreats(opponentState: AIGameState): RiskFactor[] {
    const factors: RiskFactor[] = []
    const threat = this.evaluateOpponentThreat(
      opponentState,
      'middle' as GamePhase,
    )

    if (threat >= 0.7) {
      factors.push({
        factor: '相手の攻撃脅威',
        severity: threat,
        description: '相手が強力な攻撃を準備中',
        probability: 0.8,
      })
    }

    return factors
  }

  private identifyGameProgressRisks(gameState: AIGameState): RiskFactor[] {
    const factors: RiskFactor[] = []
    const turn = gameState.turn || 1

    if (turn > 120) {
      factors.push({
        factor: '時間切迫リスク',
        severity: 0.5,
        description: 'ゲーム終盤で時間が切迫',
        probability: 0.9,
      })
    }

    return factors
  }

  private generateStrategyForFactor(
    factor: RiskFactor,
    gamePhase: GamePhase,
  ): string | null {
    switch (factor.factor) {
      case '高積みリスク':
        return '即座の発火または低い位置への配置優先'
      case '空洞リスク':
        return '空洞埋めを優先した配置'
      case '相手の攻撃脅威':
        return gamePhase === 'late' ? '先制攻撃で対抗' : '防御的な立ち回り'
      case '時間切迫リスク':
        return '迅速な判断と効率的な手の選択'
      default:
        return null
    }
  }

  // 防御戦略メソッド
  private createEmergencyStrategy(
    _gameState: AIGameState,
    possibleMoves: PossibleMove[],
  ): { strategy: string; recommendedMoves: PossibleMove[]; priority: number } {
    const safeMoves = possibleMoves.filter(
      (move) => move.primaryPosition.y >= 10, // 下の方への配置
    )

    return {
      strategy: '緊急避難：即座の発火または安全な配置',
      recommendedMoves: safeMoves.slice(0, 3),
      priority: 1,
    }
  }

  private createHighRiskStrategy(
    _gameState: AIGameState,
    _riskFactors: RiskFactor[],
    possibleMoves: PossibleMove[],
  ): { strategy: string; recommendedMoves: PossibleMove[]; priority: number } {
    return {
      strategy: '高リスク対応：防御重視の立ち回り',
      recommendedMoves: possibleMoves.slice(0, 5),
      priority: 0.8,
    }
  }

  private createMediumRiskStrategy(
    _gameState: AIGameState,
    _riskFactors: RiskFactor[],
    possibleMoves: PossibleMove[],
  ): { strategy: string; recommendedMoves: PossibleMove[]; priority: number } {
    return {
      strategy: '中リスク対応：バランス重視',
      recommendedMoves: possibleMoves,
      priority: 0.6,
    }
  }

  private createLowRiskStrategy(
    _gameState: AIGameState,
    possibleMoves: PossibleMove[],
  ): { strategy: string; recommendedMoves: PossibleMove[]; priority: number } {
    return {
      strategy: '低リスク状況：積極的な展開可能',
      recommendedMoves: possibleMoves,
      priority: 0.3,
    }
  }

  /**
   * 設定を更新
   */
  updateSettings(settings: StrategySettings): void {
    this.settings = settings
  }

  updateStareSettings(stareSettings: StareSettings): void {
    this.stareSettings = stareSettings
  }
}

/**
 * リスク評価を実行（関数型インターフェース）
 */
export const assessRisk = (
  gameState: AIGameState,
  gamePhase: GamePhase,
  settings: StrategySettings,
  stareSettings: StareSettings,
  opponentState?: AIGameState,
): RiskAssessment => {
  const manager = new RiskManager(settings, stareSettings)
  return manager.assessRisk(gameState, gamePhase, opponentState)
}

/**
 * 凝視機能を実行（関数型インターフェース）
 */
export const executeStareFunction = (
  opponentState: AIGameState,
  gamePhase: GamePhase,
  stareSettings: StareSettings,
): {
  threatLevel: ThreatLevel
  urgentAction: string | null
  monitoringPoints: string[]
} => {
  const manager = new RiskManager({} as StrategySettings, stareSettings)
  return manager.stareFunction(opponentState, gamePhase)
}
