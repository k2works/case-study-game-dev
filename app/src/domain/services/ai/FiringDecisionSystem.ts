/**
 * 発火判断システム
 * RensaHandTreeを使用した高度な発火タイミング判断
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState, AIGameState } from '../../models/ai'
import type { GamePhase } from './IntegratedEvaluationService'
import {
  type BattleEvaluation,
  BattleTactic,
  type ChainInfo,
  type ChainStep,
  ChainType,
  type FiringDecision,
  FiringTiming,
  type RensaHandNode,
  type RensaTreeEvaluation,
} from './StrategyTypes'

/**
 * 連鎖手木（RensaHandTree）
 * mayah AI参考の発火判断システム
 */
export class RensaHandTree {
  private myTree: RensaHandNode[] = []
  private opponentTree: RensaHandNode[] = []
  private readonly maxDepth: number = 3
  private readonly maxBranches: number = 5

  /**
   * 連鎖木を構築
   */
  buildTree(
    field: AIFieldState,
    depth: number = this.maxDepth,
  ): RensaHandNode[] {
    if (depth <= 0) return []

    const chains = this.enumerateAllChains(field)
    const sortedChains = chains
      .sort((a, b) => b.score - a.score) // スコア順でソート
      .slice(0, this.maxBranches) // 上位のみ

    for (const chain of sortedChains) {
      // 再帰的に次段を構築
      if (depth > 1) {
        const afterField = this.simulateChain(field)
        chain.children = this.buildTree(afterField, depth - 1)
      }
    }

    return sortedChains
  }

  /**
   * 自分の連鎖木を設定
   */
  setMyTree(field: AIFieldState): void {
    this.myTree = this.buildTree(field)
  }

  /**
   * 相手の連鎖木を設定（想定）
   */
  setOpponentTree(field: AIFieldState): void {
    this.opponentTree = this.buildTree(field)
  }

  /**
   * 連鎖木評価
   */
  evaluateTree(): RensaTreeEvaluation {
    if (this.myTree.length === 0) {
      return {
        bestChain: null,
        allChains: [],
        fireRecommendation: 0,
        averageChainLength: 0,
        maxExpectedValue: 0,
      }
    }

    const bestChain = this.findBestChain(this.myTree)
    const averageChainLength = this.calculateAverageChainLength(this.myTree)
    const maxExpectedValue = bestChain?.score || 0

    return {
      bestChain,
      allChains: this.myTree,
      fireRecommendation: this.calculateFireRecommendation(bestChain),
      averageChainLength,
      maxExpectedValue,
    }
  }

  /**
   * 打ち合い評価
   */
  evaluateBattle(): BattleEvaluation {
    const myBest = this.findBestChain(this.myTree)
    const opponentBest = this.findBestChain(this.opponentTree)

    if (!myBest && !opponentBest) {
      return {
        winProbability: 0.5,
        recommendedTactic: BattleTactic.BUILD_OFF,
        expectedOutcome: '積み合い継続',
        advantage: 0,
      }
    }

    if (!myBest) {
      return {
        winProbability: 0.1,
        recommendedTactic: BattleTactic.DEFENSIVE,
        expectedOutcome: '相手有利、防御必要',
        advantage: -1,
      }
    }

    if (!opponentBest) {
      return {
        winProbability: 0.9,
        recommendedTactic: BattleTactic.FIRST_STRIKE,
        expectedOutcome: '発火チャンス',
        advantage: 1,
      }
    }

    // 両者に連鎖がある場合の詳細評価
    return this.evaluateChainBattle(myBest, opponentBest)
  }

  /**
   * 全ての可能な連鎖を列挙
   */
  private enumerateAllChains(field: AIFieldState): RensaHandNode[] {
    const chains: RensaHandNode[] = []
    const visitedStates = new Set<string>()

    // 各位置・各色で発火可能性をチェック
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < field.height; y++) {
        const colors: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple']

        for (const color of colors) {
          const chain = this.tryFireFromPosition(field, x, y, color)
          if (chain && chain.chainCount > 0) {
            const stateKey = this.generateStateKey(chain)
            if (!visitedStates.has(stateKey)) {
              visitedStates.add(stateKey)
              chains.push(chain)
            }
          }
        }
      }
    }

    return chains.sort((a, b) => b.score - a.score)
  }

  /**
   * 指定位置からの発火を試行
   */
  private tryFireFromPosition(
    field: AIFieldState,
    x: number,
    y: number,
    color: PuyoColor,
  ): RensaHandNode | null {
    // 実際の連鎖シミュレーション
    const simulatedChain = this.simulateChainFromPosition(field, x, y, color)

    if (simulatedChain.chainCount === 0) return null

    return {
      chainCount: simulatedChain.chainCount,
      startFrame: 0,
      endFrame: simulatedChain.chainCount * 60, // 1連鎖約60フレーム
      score: this.calculateChainScore(simulatedChain),
      power: simulatedChain.totalErased,
      triggerPosition: { x, y },
      triggerColor: color,
      children: [],
      chainPath: simulatedChain.steps,
    }
  }

  /**
   * 連鎖シミュレーション
   */
  private simulateChainFromPosition(
    field: AIFieldState,
    x: number,
    y: number,
    triggerColor: PuyoColor,
  ): {
    chainCount: number
    totalErased: number
    steps: ChainStep[]
  } {
    const fieldCopy = this.copyField(field)
    const steps: ChainStep[] = []
    let chainCount = 0
    let totalErased = 0

    this.placeTriggerPuyo(fieldCopy, x, y, triggerColor)

    while (true) {
      const erasableGroups = this.findErasableGroups(fieldCopy)
      if (erasableGroups.length === 0) break

      const { stepErased, chainSteps } = this.processErasableGroups(
        erasableGroups,
        fieldCopy,
        chainCount + 1,
      )

      chainCount++
      totalErased += stepErased
      steps.push(...chainSteps)

      this.applyGravity(fieldCopy)

      if (chainCount > 19) break
    }

    return { chainCount, totalErased, steps }
  }

  private placeTriggerPuyo(
    field: AIFieldState,
    x: number,
    y: number,
    color: PuyoColor,
  ): void {
    if (field.cells[y]) {
      field.cells[y][x] = color
    }
  }

  private processErasableGroups(
    groups: Array<{
      color: PuyoColor
      positions: Array<{ x: number; y: number }>
    }>,
    field: AIFieldState,
    step: number,
  ): { stepErased: number; chainSteps: ChainStep[] } {
    let stepErased = 0
    const chainSteps: ChainStep[] = []

    for (const group of groups) {
      stepErased += group.positions.length

      for (const pos of group.positions) {
        if (field.cells[pos.y]) {
          field.cells[pos.y][pos.x] = null
        }
      }

      chainSteps.push({
        step,
        erasePositions: group.positions,
        eraseColor: group.color,
        eraseCount: group.positions.length,
        fallPattern: [],
      })
    }

    return { stepErased, chainSteps }
  }

  /**
   * 消去可能なグループを検索
   */
  private findErasableGroups(
    field: AIFieldState,
  ): Array<{ color: PuyoColor; positions: Array<{ x: number; y: number }> }> {
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

        const color = this.getPuyoAt(field, x, y)
        if (!color) continue

        const group = this.findConnectedGroup(field, x, y, color, visited)
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
   * 連結グループを検索
   */
  private findConnectedGroup(
    field: AIFieldState,
    startX: number,
    startY: number,
    targetColor: PuyoColor,
    visited: boolean[][],
  ): Array<{ x: number; y: number }> {
    const group: Array<{ x: number; y: number }> = []
    const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const current = stack.pop()!
      const { x, y } = current

      if (!this.isValidGroupPosition(field, x, y, targetColor, visited)) {
        continue
      }

      visited[y][x] = true
      group.push({ x, y })

      this.addAdjacentCells(field, x, y, targetColor, visited, stack)
    }

    return group
  }

  private isValidGroupPosition(
    field: AIFieldState,
    x: number,
    y: number,
    targetColor: PuyoColor,
    visited: boolean[][],
  ): boolean {
    return !visited[y][x] && this.getPuyoAt(field, x, y) === targetColor
  }

  private addAdjacentCells(
    field: AIFieldState,
    x: number,
    y: number,
    targetColor: PuyoColor,
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
      const nx = x + dir.x
      const ny = y + dir.y

      if (this.isValidAdjacentCell(field, nx, ny, targetColor, visited)) {
        stack.push({ x: nx, y: ny })
      }
    }
  }

  private isValidAdjacentCell(
    field: AIFieldState,
    x: number,
    y: number,
    targetColor: PuyoColor,
    visited: boolean[][],
  ): boolean {
    return (
      x >= 0 &&
      x < field.width &&
      y >= 0 &&
      y < field.height &&
      !visited[y][x] &&
      this.getPuyoAt(field, x, y) === targetColor
    )
  }

  /**
   * ユーティリティメソッド
   */
  private getPuyoAt(
    field: AIFieldState,
    x: number,
    y: number,
  ): PuyoColor | null {
    if (!this.isValidPosition(field, x, y)) return null
    const row = field.cells[y]
    if (!this.isValidRow(row)) return null
    return row[x] || null
  }

  private isValidPosition(field: AIFieldState, x: number, y: number): boolean {
    return y >= 0 && y < field.height && x >= 0 && x < field.width
  }

  private isValidRow(row: unknown): row is Array<PuyoColor | null> {
    return row !== null && Array.isArray(row)
  }

  private applyGravity(field: AIFieldState): void {
    for (let x = 0; x < field.width; x++) {
      let writeIndex = field.height - 1

      for (let y = field.height - 1; y >= 0; y--) {
        const puyo = this.getPuyoAt(field, x, y)
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

  private copyField(field: AIFieldState): AIFieldState {
    return {
      ...field,
      cells: field.cells.map((row) => (row ? [...row] : [])),
    }
  }

  private simulateChain(field: AIFieldState): AIFieldState {
    // 連鎖実行後のフィールド状態を返す（簡略化）
    return this.copyField(field)
  }

  private calculateChainScore(simulation: {
    chainCount: number
    totalErased: number
    steps: ChainStep[]
  }): number {
    // ぷよぷよのスコア計算式
    let score = 0
    for (let i = 0; i < simulation.chainCount; i++) {
      const chainBonus = Math.min(999, Math.pow(2, i) * 8)
      const step = simulation.steps[i]
      if (step) {
        score += step.eraseCount * 10 * chainBonus
      }
    }
    return score
  }

  private findBestChain(tree: RensaHandNode[]): RensaHandNode | null {
    if (tree.length === 0) return null
    return tree.reduce((best, current) =>
      current.score > best.score ? current : best,
    )
  }

  private calculateAverageChainLength(tree: RensaHandNode[]): number {
    if (tree.length === 0) return 0
    const total = tree.reduce((sum, node) => sum + node.chainCount, 0)
    return total / tree.length
  }

  private calculateFireRecommendation(bestChain: RensaHandNode | null): number {
    if (!bestChain) return 0

    // 連鎖数とスコアに基づく発火推奨度
    const chainScore = Math.min(1, bestChain.chainCount / 10)
    const scoreRatio = Math.min(1, bestChain.score / 10000)

    return (chainScore + scoreRatio) / 2
  }

  private evaluateChainBattle(
    my: RensaHandNode,
    opponent: RensaHandNode,
  ): BattleEvaluation {
    // フレーム差による勝敗判定
    const frameDifference = my.endFrame - opponent.endFrame
    const scoreDifference = my.score - opponent.score

    let winProbability = 0.5
    let tactic: BattleTactic = BattleTactic.BUILD_OFF
    let outcome = '互角'
    let advantage = 0

    if (frameDifference < -30) {
      // 自分が30フレーム以上早い
      winProbability = 0.9
      tactic = BattleTactic.FIRST_STRIKE
      outcome = '先手勝利'
      advantage = 1
    } else if (frameDifference > 30) {
      // 相手が30フレーム以上早い
      winProbability = 0.1
      tactic = BattleTactic.COUNTER_ATTACK
      outcome = '後手カウンター狙い'
      advantage = -1
    } else if (scoreDifference > 5000) {
      // スコア差で優位
      winProbability = 0.7
      tactic = BattleTactic.FIRST_STRIKE
      outcome = 'スコア優位'
      advantage = 0.5
    } else if (scoreDifference < -5000) {
      // スコア差で劣位
      winProbability = 0.3
      tactic = BattleTactic.DEFENSIVE
      outcome = 'スコア劣位'
      advantage = -0.5
    }

    return {
      winProbability,
      recommendedTactic: tactic,
      expectedOutcome: outcome,
      advantage,
    }
  }

  private generateStateKey(chain: RensaHandNode): string {
    return `${chain.triggerPosition.x}-${chain.triggerPosition.y}-${chain.triggerColor}-${chain.chainCount}`
  }
}

/**
 * 発火判断システム
 */
export class FiringDecisionSystem {
  private rensaTree: RensaHandTree
  constructor() {
    this.rensaTree = new RensaHandTree()
  }

  /**
   * 発火判断を実行
   */
  decideFiring(gameState: AIGameState, gamePhase: GamePhase): FiringDecision {
    // 連鎖木を構築
    this.rensaTree.setMyTree(gameState.field)

    // 木を評価
    const treeEvaluation = this.rensaTree.evaluateTree()

    if (!treeEvaluation.bestChain) {
      // 基本的な連鎖可能性をチェック
      const hasBasicChain = this.checkBasicChainPotential(gameState.field)
      if (hasBasicChain) {
        return {
          shouldFire: true,
          confidence: 0.4,
          targetChain: {
            chainCount: 2,
            expectedScore: 1000,
            turnsToFire: 1,
            successProbability: 0.8,
            chainType: 'quick',
            power: 2,
            requiredPuyos: 4,
          },
          reason: '基本連鎖可能',
          timing: FiringTiming.SOON,
          alternatives: [],
        }
      }

      return {
        shouldFire: false,
        confidence: 0,
        targetChain: null,
        reason: '発火可能な連鎖なし',
        timing: FiringTiming.NO_FIRE,
        alternatives: [],
      }
    }

    // 発火判断ロジック
    const firingEvaluation = this.evaluateFiringConditions(
      treeEvaluation,
      gameState,
      gamePhase,
    )

    return firingEvaluation
  }

  /**
   * 基本的な連鎖可能性をチェック
   */
  private checkBasicChainPotential(field: AIFieldState): boolean {
    const colorCounts = this.countFieldColors(field)
    return this.hasViableChainCombination(colorCounts)
  }

  private countFieldColors(field: AIFieldState): Record<string, number> {
    const colorCounts: Record<string, number> = {}

    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const cellColor = field.cells[y] && field.cells[y][x]
        if (cellColor) {
          colorCounts[cellColor] = (colorCounts[cellColor] || 0) + 1
        }
      }
    }

    return colorCounts
  }

  private hasViableChainCombination(
    colorCounts: Record<string, number>,
  ): boolean {
    // 3個以上の同色ぷよがある場合は連鎖可能性あり
    if (this.hasSingleColorChain(colorCounts)) {
      return true
    }

    // 複数色で2個以上ずつある場合も連鎖可能性あり
    return this.hasMultiColorChain(colorCounts)
  }

  private hasSingleColorChain(colorCounts: Record<string, number>): boolean {
    return Object.values(colorCounts).some((count) => count >= 3)
  }

  private hasMultiColorChain(colorCounts: Record<string, number>): boolean {
    const colorsWith2Plus = Object.values(colorCounts).filter(
      (count) => count >= 2,
    )
    return colorsWith2Plus.length >= 2
  }

  /**
   * 発火条件を評価
   */
  private evaluateFiringConditions(
    treeEval: RensaTreeEvaluation,
    gameState: AIGameState,
    gamePhase: GamePhase,
  ): FiringDecision {
    const bestChain = treeEval.bestChain!
    const chainInfo = this.convertToChainInfo(bestChain)

    // 基本的な発火条件チェック
    const hasGoodScore = bestChain.score >= 3000
    const isFieldSafe = this.evaluateFieldSafety(gameState.field) > 0.3

    // ゲームフェーズによる調整
    const phaseMultiplier = this.getPhaseMultiplier(gamePhase)
    const adjustedThreshold = 4 * phaseMultiplier

    let shouldFire = false
    let confidence = 0
    let timing: FiringTiming = FiringTiming.WAIT
    let reason = ''

    if (bestChain.chainCount >= adjustedThreshold && hasGoodScore) {
      shouldFire = true
      confidence = Math.min(1, bestChain.chainCount / 10)
      timing = FiringTiming.IMMEDIATE
      reason = `${bestChain.chainCount}連鎖で発火条件満足`
    } else if (bestChain.chainCount >= 3 && !isFieldSafe) {
      shouldFire = true
      confidence = 0.6
      timing = FiringTiming.SOON
      reason = 'フィールド危険のため早期発火'
    } else if (bestChain.chainCount >= 6) {
      shouldFire = true
      confidence = 0.8
      timing = FiringTiming.IMMEDIATE
      reason = '長連鎖構築完了'
    }

    // 代替選択肢
    const alternatives = treeEval.allChains
      .slice(1, 4)
      .map((node) => this.convertToChainInfo(node))

    return {
      shouldFire,
      confidence,
      targetChain: chainInfo,
      reason,
      timing,
      alternatives,
    }
  }

  /**
   * フィールドの安全性評価
   */
  private evaluateFieldSafety(field: AIFieldState): number {
    let totalHeight = 0
    let maxHeight = 0

    for (let x = 0; x < field.width; x++) {
      let height = 0
      for (let y = 0; y < field.height; y++) {
        if (field.cells[y] && field.cells[y][x]) {
          height = field.height - y
          break
        }
      }
      totalHeight += height
      maxHeight = Math.max(maxHeight, height)
    }

    const averageHeight = totalHeight / field.width
    const heightRatio = averageHeight / field.height
    const maxHeightRatio = maxHeight / field.height

    // 高さが低いほど安全
    return Math.max(0, 1 - heightRatio - maxHeightRatio * 0.5)
  }

  /**
   * ゲームフェーズによる調整係数
   */
  private getPhaseMultiplier(phase: GamePhase): number {
    switch (phase) {
      case 'early':
        return 1.2 // 序盤は高連鎖を狙う
      case 'middle':
        return 1.0 // 中盤は標準
      case 'late':
        return 0.8 // 終盤は早期発火
      default:
        return 1.0
    }
  }

  /**
   * RensaHandNodeをChainInfoに変換
   */
  private convertToChainInfo(node: RensaHandNode): ChainInfo {
    return {
      chainCount: node.chainCount,
      expectedScore: node.score,
      turnsToFire: Math.ceil(node.endFrame / 60), // フレームを手数に変換
      successProbability: Math.min(1, node.chainCount / 10),
      chainType: this.determineChainType(node),
      power: node.power,
      requiredPuyos: node.chainCount * 2, // 概算
    }
  }

  /**
   * 連鎖タイプを判定
   */
  private determineChainType(node: RensaHandNode): ChainType {
    if (node.chainCount >= 8) return ChainType.MAIN
    if (node.chainCount >= 4) return ChainType.SUB
    if (node.endFrame <= 120) return ChainType.QUICK
    return ChainType.MAIN
  }

  /**
   * 設定を更新
   */
  updateSettings(): void {
    // 設定更新の処理（将来用）
  }
}

/**
 * 発火判断を実行（関数型インターフェース）
 */
export const decideFiring = (
  gameState: AIGameState,
  gamePhase: GamePhase,
): FiringDecision => {
  const system = new FiringDecisionSystem()
  return system.decideFiring(gameState, gamePhase)
}
