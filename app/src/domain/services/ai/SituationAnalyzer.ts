/**
 * 状況判断システム
 * ゲームフェーズ、フィールド状況、盤面優劣の総合分析
 */
import type { AIFieldState, AIGameState } from '../../models/ai'
import type { GamePhase } from './IntegratedEvaluationService'
import {
  type FieldSituation,
  StrategicPosition as SP,
  type SituationAnalysis,
  type StrategicPosition,
  ThreatLevel,
} from './StrategyTypes'

/**
 * 状況分析器
 */
export class SituationAnalyzer {
  /**
   * 総合状況分析を実行
   */
  analyzeSituation(
    gameState: AIGameState,
    opponentState?: AIGameState,
  ): SituationAnalysis {
    const gamePhase = this.determineGamePhase(gameState)
    const fieldSituation = this.analyzeFieldSituation(gameState.field)

    // 相手状況がある場合の優劣評価
    const boardAdvantage = opponentState
      ? this.evaluateBoardAdvantage(gameState, opponentState)
      : 0

    const timeAdvantage = this.evaluateTimeAdvantage(gameState, gamePhase)
    const strategicPosition = this.determineStrategicPosition(
      fieldSituation,
      boardAdvantage,
      timeAdvantage,
    )

    const nextActionGuidance = this.generateActionGuidance(
      gamePhase,
      fieldSituation,
      strategicPosition,
    )

    return {
      gamePhase,
      fieldSituation,
      boardAdvantage,
      timeAdvantage,
      strategicPosition,
      nextActionGuidance,
    }
  }

  /**
   * ゲームフェーズを判定
   */
  private determineGamePhase(gameState: AIGameState): GamePhase {
    const metrics = this.getGameMetrics(gameState)
    return this.classifyPhase(metrics)
  }

  private getGameMetrics(gameState: AIGameState) {
    return {
      totalPuyos: this.countTotalPuyos(gameState.field),
      averageHeight: this.calculateAverageHeight(gameState.field),
      turn: gameState.turn || 1,
    }
  }

  private classifyPhase(metrics: {
    totalPuyos: number
    averageHeight: number
    turn: number
  }): GamePhase {
    const phases = [
      {
        condition: (m: typeof metrics) =>
          m.totalPuyos < 30 && m.averageHeight < 4 && m.turn < 50,
        phase: 'early' as GamePhase,
      },
      {
        condition: (m: typeof metrics) =>
          m.totalPuyos < 60 && m.averageHeight < 8 && m.turn <= 120,
        phase: 'middle' as GamePhase,
      },
    ]

    for (const { condition, phase } of phases) {
      if (condition(metrics)) return phase
    }
    return 'late' as GamePhase
  }

  /**
   * フィールド状況を分析
   */
  private analyzeFieldSituation(field: AIFieldState): FieldSituation {
    const heights = this.calculateColumnHeights(field)
    const averageHeight =
      heights.reduce((sum, h) => sum + h, 0) / heights.length
    const maxHeight = Math.max(...heights)

    const heightBalance = this.calculateHeightBalance(heights)
    const chainPotential = this.evaluateChainPotential(field)
    const spaceEfficiency = this.evaluateSpaceEfficiency(field)
    const dangerLevel = this.evaluateDangerLevel(
      field,
      maxHeight,
      averageHeight,
    )

    return {
      averageHeight,
      maxHeight,
      heightBalance,
      chainPotential,
      spaceEfficiency,
      dangerLevel,
    }
  }

  /**
   * 盤面優劣を評価
   */
  private evaluateBoardAdvantage(
    myState: AIGameState,
    opponentState: AIGameState,
  ): number {
    const myField = this.analyzeFieldSituation(myState.field)
    const opponentField = this.analyzeFieldSituation(opponentState.field)

    // 各要素での比較
    const heightAdvantage = this.compareHeights(myField, opponentField)
    const chainAdvantage = myField.chainPotential - opponentField.chainPotential
    const safetyAdvantage = this.compareSafety(myField, opponentField)
    const efficiencyAdvantage =
      myField.spaceEfficiency - opponentField.spaceEfficiency

    // 重み付け統合
    return (
      heightAdvantage * 0.3 +
      chainAdvantage * 0.4 +
      safetyAdvantage * 0.2 +
      efficiencyAdvantage * 0.1
    )
  }

  /**
   * 時間的優位性を評価
   */
  private evaluateTimeAdvantage(
    gameState: AIGameState,
    phase: GamePhase,
  ): number {
    const fieldSituation = this.analyzeFieldSituation(gameState.field)
    return this.calculatePhaseAdvantage(phase, fieldSituation)
  }

  private calculatePhaseAdvantage(
    phase: GamePhase,
    fieldSituation: FieldSituation,
  ): number {
    const phaseStrategies = {
      early: () => (fieldSituation.spaceEfficiency > 0.7 ? 0.3 : -0.3),
      middle: () => (fieldSituation.chainPotential > 0.6 ? 0.5 : -0.2),
      late: () => {
        const readyToFire =
          fieldSituation.chainPotential > 0.8 &&
          fieldSituation.dangerLevel !== ThreatLevel.CRITICAL
        return readyToFire ? 0.8 : -0.5
      },
    }

    const strategy = phaseStrategies[phase]
    return strategy ? strategy() : 0
  }

  /**
   * 戦略的位置を判定
   */
  private determineStrategicPosition(
    field: FieldSituation,
    boardAdv: number,
    timeAdv: number,
  ): StrategicPosition {
    const totalAdvantage = boardAdv + timeAdv
    const isCritical = field.dangerLevel === ThreatLevel.CRITICAL

    if (isCritical) {
      return SP.CRISIS
    } else if (totalAdvantage > 0.5) {
      return SP.ADVANTAGEOUS
    } else if (totalAdvantage < -0.5) {
      return SP.DISADVANTAGEOUS
    } else {
      return SP.EVEN
    }
  }

  /**
   * 行動指針を生成
   */
  private generateActionGuidance(
    phase: GamePhase,
    field: FieldSituation,
    position: StrategicPosition,
  ): string {
    if (field.dangerLevel === ThreatLevel.CRITICAL) {
      return '緊急発火または防御が必要'
    }

    return this.getPositionBasedGuidance(phase, field, position)
  }

  private getPositionBasedGuidance(
    phase: GamePhase,
    field: FieldSituation,
    position: StrategicPosition,
  ): string {
    const positionStrategies = {
      [SP.ADVANTAGEOUS]: () =>
        phase === 'late' ? '積極的な攻撃を推奨' : '優位を維持しつつ連鎖強化',
      [SP.DISADVANTAGEOUS]: () =>
        field.chainPotential > 0.7
          ? '逆転の発火チャンスを狙う'
          : '守備的な立て直しが必要',
      [SP.CRISIS]: () => '即座の対応が必要：発火またはカウンター',
      [SP.EVEN]: () => this.getPhaseBasedGuidance(phase),
    }

    const strategy = positionStrategies[position]
    return strategy ? strategy() : this.getPhaseBasedGuidance(phase)
  }

  private getPhaseBasedGuidance(phase: GamePhase): string {
    const phaseGuidance = {
      early: '安定した土台作りを重視',
      middle: '連鎖構築に集中',
      late: '発火機会を慎重に狙う',
    }

    return phaseGuidance[phase] || '状況に応じた柔軟な対応'
  }

  /**
   * ユーティリティメソッド
   */
  private countTotalPuyos(field: AIFieldState): number {
    let count = 0
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        if (field.cells[y] && field.cells[y][x]) {
          count++
        }
      }
    }
    return count
  }

  private calculateAverageHeight(field: AIFieldState): number {
    const heights = this.calculateColumnHeights(field)
    return heights.reduce((sum, h) => sum + h, 0) / heights.length
  }

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

  private calculateHeightBalance(heights: number[]): number {
    const average = heights.reduce((sum, h) => sum + h, 0) / heights.length
    const variance =
      heights.reduce((sum, h) => sum + Math.pow(h - average, 2), 0) /
      heights.length

    // 分散が小さいほど良いバランス（0-1で正規化）
    return Math.max(0, 1 - variance / 16) // 分散16を最大として正規化
  }

  private evaluateChainPotential(field: AIFieldState): number {
    // 簡易的な連鎖可能性評価
    let potential = 0
    const colorCounts = this.countColors(field)

    // 色の多様性と配置を評価
    const totalPuyos = Object.values(colorCounts).reduce(
      (sum, count) => sum + count,
      0,
    )

    if (totalPuyos === 0) return 0.1 // 空のフィールドでも最小値を設定

    // 3個以上の同色グループがあるかチェック（より高いポテンシャル）
    for (const [, count] of Object.entries(colorCounts)) {
      if (count >= 3) {
        potential += 0.3 // 3個以上のグループには高評価
      } else if (count >= 2) {
        potential += 0.1
      }
    }

    // 色の多様性ボーナス（複数色があると連鎖しやすい）
    if (Object.keys(colorCounts).length >= 2) {
      potential += 0.2
    }

    // 連結可能性を簡易評価
    potential += this.evaluateConnectivity(field) * 0.4

    return Math.min(1, potential)
  }

  private evaluateSpaceEfficiency(field: AIFieldState): number {
    const totalCells = field.width * field.height
    const usedCells = this.countTotalPuyos(field)
    const heights = this.calculateColumnHeights(field)

    // 基本的な使用率
    const utilizationRate = usedCells / totalCells

    // 高さのばらつきペナルティ
    const heightPenalty = this.calculateHeightVariance(heights) / 10

    // 空洞ペナルティ
    const cavityPenalty = this.countCavities(field) * 0.1

    return Math.max(0, utilizationRate - heightPenalty - cavityPenalty)
  }

  private evaluateDangerLevel(
    field: AIFieldState,
    maxHeight: number,
    averageHeight: number,
  ): ThreatLevel {
    const heightRatio = maxHeight / field.height
    const avgRatio = averageHeight / field.height

    return this.classifyThreatLevel(heightRatio, avgRatio)
  }

  private classifyThreatLevel(
    heightRatio: number,
    avgRatio: number,
  ): ThreatLevel {
    const thresholds = [
      { height: 0.9, avg: 0.8, level: ThreatLevel.CRITICAL },
      { height: 0.8, avg: 0.7, level: ThreatLevel.HIGH },
      { height: 0.6, avg: 0.5, level: ThreatLevel.MEDIUM },
      { height: 0.4, avg: 0.3, level: ThreatLevel.LOW },
    ]

    for (const { height, avg, level } of thresholds) {
      if (heightRatio >= height || avgRatio >= avg) {
        return level
      }
    }

    return ThreatLevel.SAFE
  }

  private compareHeights(my: FieldSituation, opponent: FieldSituation): number {
    // 高さが低い方が有利（負の値で表現）
    const heightDiff = opponent.averageHeight - my.averageHeight
    const maxHeightDiff = opponent.maxHeight - my.maxHeight

    return (heightDiff + maxHeightDiff * 0.5) / 12 // 正規化
  }

  private compareSafety(my: FieldSituation, opponent: FieldSituation): number {
    const myDangerValue = this.threatLevelToNumber(my.dangerLevel)
    const opponentDangerValue = this.threatLevelToNumber(opponent.dangerLevel)

    // 相手の方が危険な方が自分に有利
    return (opponentDangerValue - myDangerValue) / 4 // 正規化
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

  private countColors(field: AIFieldState): Record<string, number> {
    const counts: Record<string, number> = {}

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const puyo = field.cells[y] && field.cells[y][x]
        if (puyo) {
          counts[puyo] = (counts[puyo] || 0) + 1
        }
      }
    }

    return counts
  }

  private evaluateConnectivity(field: AIFieldState): number {
    const { connectionScore, totalChecked } = this.calculateConnections(field)
    return totalChecked > 0 ? connectionScore / (totalChecked * 4) : 0
  }

  private calculateConnections(field: AIFieldState): {
    connectionScore: number
    totalChecked: number
  } {
    let connectionScore = 0
    let totalChecked = 0

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const currentPuyo = field.cells[y] && field.cells[y][x]
        if (!currentPuyo) continue

        totalChecked++
        const connections = this.countAdjacentConnections(
          field,
          x,
          y,
          currentPuyo,
        )
        connectionScore += connections
      }
    }

    return { connectionScore, totalChecked }
  }

  private countAdjacentConnections(
    field: AIFieldState,
    x: number,
    y: number,
    currentPuyo: string,
  ): number {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ]

    let connections = 0
    for (const { dx, dy } of directions) {
      const ny = y + dy
      const nx = x + dx

      if (
        this.isValidPosition(field, nx, ny) &&
        field.cells[ny] &&
        field.cells[ny][nx] === currentPuyo
      ) {
        connections++
      }
    }

    return connections
  }

  private isValidPosition(field: AIFieldState, x: number, y: number): boolean {
    return y >= 0 && y < field.height && x >= 0 && x < field.width
  }

  private calculateHeightVariance(heights: number[]): number {
    const average = heights.reduce((sum, h) => sum + h, 0) / heights.length
    return (
      heights.reduce((sum, h) => sum + Math.pow(h - average, 2), 0) /
      heights.length
    )
  }

  private countCavities(field: AIFieldState): number {
    let cavities = 0

    for (let x = 0; x < field.width; x++) {
      let foundPuyo = false

      for (let y = 0; y < field.height; y++) {
        const currentCell = field.cells[y] && field.cells[y][x]

        if (currentCell) {
          foundPuyo = true
        } else if (foundPuyo) {
          // ぷよが見つかった後の空セルは空洞
          cavities++
        }
      }
    }

    return cavities
  }
}

/**
 * 状況分析を実行（関数型インターフェース）
 */
export const analyzeSituation = (
  gameState: AIGameState,
  opponentState?: AIGameState,
): SituationAnalysis => {
  const analyzer = new SituationAnalyzer()
  return analyzer.analyzeSituation(gameState, opponentState)
}

/**
 * ゲームフェーズを判定（関数型インターフェース）
 */
export const determineGamePhase = (gameState: AIGameState): GamePhase => {
  const analyzer = new SituationAnalyzer()
  return analyzer['determineGamePhase'](gameState)
}

/**
 * フィールド状況を分析（関数型インターフェース）
 */
export const analyzeFieldSituation = (field: AIFieldState): FieldSituation => {
  const analyzer = new SituationAnalyzer()
  return analyzer['analyzeFieldSituation'](field)
}
