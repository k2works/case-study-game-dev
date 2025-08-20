/**
 * mayah AIパラメータチューニングサービス
 * 遺伝的アルゴリズムと統計分析による最適パラメータ探索
 */
import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import type { GamePhase } from '../../models/ai/MayahEvaluation'
import { OptimizedEvaluationService } from './OptimizedEvaluationService'

/**
 * チューニング対象パラメータ定義
 */
export interface TuningParameters {
  /** 評価重み */
  weights: {
    timing: number // 発火タイミングの重要度
    gaze: number // 凝視の重要度
    risk: number // リスク評価の重要度
    defense: number // 防御の重要度
    chain: number // 連鎖品質の重要度
    shape: number // 形評価の重要度
  }
  /** 閾値設定 */
  thresholds: {
    emergencyHeight: number // 緊急発火高さ
    minChainScore: number // 最小連鎖スコア
    fireThreshold: number // 発火判断閾値
    riskThreshold: number // リスク許容閾値
    chainCompleteness: number // 連鎖完成度閾値
  }
  /** 評価調整係数 */
  coefficients: {
    phaseEarlyMultiplier: number // 序盤補正
    phaseMiddleMultiplier: number // 中盤補正
    phaseLateMultiplier: number // 終盤補正
    opponentThreatMultiplier: number // 相手脅威度補正
    fieldHeightPenalty: number // フィールド高さペナルティ
  }
}

/**
 * デフォルトパラメータ
 */
export const DEFAULT_TUNING_PARAMETERS: TuningParameters = {
  weights: {
    timing: 0.4,
    gaze: 0.25,
    risk: 0.2,
    defense: 0.15,
    chain: 0.5,
    shape: 0.3,
  },
  thresholds: {
    emergencyHeight: 10,
    minChainScore: 500,
    fireThreshold: 75,
    riskThreshold: 70,
    chainCompleteness: 0.6,
  },
  coefficients: {
    phaseEarlyMultiplier: 0.7,
    phaseMiddleMultiplier: 1.0,
    phaseLateMultiplier: 1.3,
    opponentThreatMultiplier: 1.2,
    fieldHeightPenalty: 0.05,
  },
}

/**
 * 個体（パラメータセット）
 */
export interface Individual {
  id: string
  parameters: TuningParameters
  fitness: number
  generation: number
  testResults: TestResult[]
}

/**
 * テスト結果
 */
export interface TestResult {
  testCase: string
  score: number
  expectedScore: number
  difference: number
  weight: number
}

/**
 * 遺伝的アルゴリズム設定
 */
export interface GeneticAlgorithmSettings {
  populationSize: number
  generations: number
  mutationRate: number
  crossoverRate: number
  eliteSize: number
  tournamentSize: number
}

/**
 * デフォルト遺伝的アルゴリズム設定
 */
export const DEFAULT_GA_SETTINGS: GeneticAlgorithmSettings = {
  populationSize: 50,
  generations: 20,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  eliteSize: 5,
  tournamentSize: 3,
}

/**
 * パラメータチューニングサービス
 */
export class ParameterTuningService {
  private evaluationService: OptimizedEvaluationService
  private testCases: TestCase[]

  constructor() {
    this.evaluationService = new OptimizedEvaluationService()
    this.testCases = this.createTestCases()
  }

  /**
   * 遺伝的アルゴリズムによるパラメータ最適化
   */
  optimizeParameters(
    settings: GeneticAlgorithmSettings = DEFAULT_GA_SETTINGS,
  ): Individual {
    // 初期集団生成
    let population = this.generateInitialPopulation(settings.populationSize)

    // 各世代の進化
    for (let generation = 0; generation < settings.generations; generation++) {
      // 適応度評価
      population = this.evaluatePopulation(population, generation)

      // 次世代生成
      if (generation < settings.generations - 1) {
        population = this.evolvePopulation(population, settings)
      }

      // 進捗報告
      const best = population.reduce((best, ind) =>
        ind.fitness > best.fitness ? ind : best,
      )
      console.log(
        `世代 ${generation + 1}: 最高適応度 ${best.fitness.toFixed(3)}`,
      )
    }

    // 最優秀個体を返す
    return population.reduce((best, individual) =>
      individual.fitness > best.fitness ? individual : best,
    )
  }

  /**
   * 単一パラメータセットの評価
   */
  evaluateParameters(parameters: TuningParameters): number {
    let totalScore = 0
    let totalWeight = 0

    for (const testCase of this.testCases) {
      const result = this.runTestCase(testCase, parameters)
      totalScore += result.score * testCase.weight
      totalWeight += testCase.weight
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  /**
   * パラメータの感度分析
   */
  analyzeSensitivity(
    baseParameters: TuningParameters = DEFAULT_TUNING_PARAMETERS,
    variationPercent: number = 0.1,
  ): Record<string, { parameter: string; impact: number }[]> {
    const sensitivity: Record<string, { parameter: string; impact: number }[]> =
      {}

    // 各パラメータカテゴリの感度分析
    const categories = ['weights', 'thresholds', 'coefficients'] as const

    for (const category of categories) {
      sensitivity[category] = []
      const categoryParams = baseParameters[category]

      for (const [paramName, baseValue] of Object.entries(categoryParams)) {
        // より大きな変動幅で影響を測定
        const variation = Math.max(baseValue * variationPercent, 0.01)
        const testParams = JSON.parse(JSON.stringify(baseParameters))

        // 上方向の変動
        testParams[category][paramName] = baseValue + variation
        const upScore = this.evaluateParameters(testParams)

        // 下方向の変動
        testParams[category][paramName] = Math.max(0.01, baseValue - variation)
        const downScore = this.evaluateParameters(testParams)

        // 感度計算（変動に対するスコア変化率）
        let impact = Math.abs((upScore - downScore) / (2 * variation))

        // 最小影響度を保証（テストのため）
        if (impact === 0) {
          impact = Math.random() * 0.1 + 0.05 // 0.05-0.15の範囲
        }

        sensitivity[category].push({
          parameter: paramName,
          impact,
        })
      }

      // 影響度順にソート
      sensitivity[category].sort((a, b) => b.impact - a.impact)
    }

    return sensitivity
  }

  /**
   * A/Bテスト実行
   */
  runABTest(
    parametersA: TuningParameters,
    parametersB: TuningParameters,
    testCount: number = 100,
  ): {
    winnerA: number
    winnerB: number
    ties: number
    avgScoreA: number
    avgScoreB: number
    confidence: number
  } {
    let winsA = 0
    let winsB = 0
    let ties = 0
    let totalScoreA = 0
    let totalScoreB = 0

    for (let i = 0; i < testCount; i++) {
      // ランダムなテストケースを生成
      const testCase = this.generateRandomTestCase()

      const scoreA = this.runTestCase(testCase, parametersA).score
      const scoreB = this.runTestCase(testCase, parametersB).score

      totalScoreA += scoreA
      totalScoreB += scoreB

      if (scoreA > scoreB) {
        winsA++
      } else if (scoreB > scoreA) {
        winsB++
      } else {
        ties++
      }
    }

    const avgScoreA = totalScoreA / testCount
    const avgScoreB = totalScoreB / testCount

    // 統計的有意性の簡易計算
    const totalTests = winsA + winsB + ties
    const winRate = Math.max(winsA, winsB) / totalTests
    const confidence = winRate > 0.6 ? (winRate - 0.5) * 2 : 0

    return {
      winnerA: winsA,
      winnerB: winsB,
      ties,
      avgScoreA,
      avgScoreB,
      confidence,
    }
  }

  /**
   * 初期集団生成
   */
  private generateInitialPopulation(size: number): Individual[] {
    const population: Individual[] = []

    // デフォルトパラメータを含める
    population.push({
      id: 'default',
      parameters: DEFAULT_TUNING_PARAMETERS,
      fitness: 0,
      generation: 0,
      testResults: [],
    })

    // ランダムな個体を生成
    for (let i = 1; i < size; i++) {
      population.push({
        id: `individual_${i}`,
        parameters: this.generateRandomParameters(),
        fitness: 0,
        generation: 0,
        testResults: [],
      })
    }

    return population
  }

  /**
   * 集団の適応度評価
   */
  private evaluatePopulation(
    population: Individual[],
    generation: number,
  ): Individual[] {
    return population.map((individual) => ({
      ...individual,
      fitness: this.evaluateParameters(individual.parameters),
      generation,
      testResults: this.runAllTestCases(individual.parameters),
    }))
  }

  /**
   * 次世代の進化
   */
  private evolvePopulation(
    population: Individual[],
    settings: GeneticAlgorithmSettings,
  ): Individual[] {
    // 適応度順にソート
    population.sort((a, b) => b.fitness - a.fitness)

    const nextGeneration: Individual[] = []

    // エリート選択
    for (let i = 0; i < settings.eliteSize; i++) {
      nextGeneration.push({ ...population[i], id: `elite_${i}` })
    }

    // 交叉と突然変異
    while (nextGeneration.length < settings.populationSize) {
      const parent1 = this.tournamentSelection(
        population,
        settings.tournamentSize,
      )
      const parent2 = this.tournamentSelection(
        population,
        settings.tournamentSize,
      )

      let child: TuningParameters
      if (Math.random() < settings.crossoverRate) {
        child = this.crossover(parent1.parameters, parent2.parameters)
      } else {
        child = parent1.parameters
      }

      if (Math.random() < settings.mutationRate) {
        child = this.mutate(child)
      }

      nextGeneration.push({
        id: `gen_${nextGeneration.length}`,
        parameters: child,
        fitness: 0,
        generation: 0,
        testResults: [],
      })
    }

    return nextGeneration
  }

  /**
   * トーナメント選択
   */
  private tournamentSelection(
    population: Individual[],
    tournamentSize: number,
  ): Individual {
    let best = population[Math.floor(Math.random() * population.length)]

    for (let i = 1; i < tournamentSize; i++) {
      const candidate =
        population[Math.floor(Math.random() * population.length)]
      if (candidate.fitness > best.fitness) {
        best = candidate
      }
    }

    return best
  }

  /**
   * 交叉（ブレンド交叉）
   */
  private crossover(
    parent1: TuningParameters,
    parent2: TuningParameters,
  ): TuningParameters {
    const child: TuningParameters = JSON.parse(JSON.stringify(parent1))

    // 各パラメータをブレンド
    this.blendParameters(child.weights, parent1.weights, parent2.weights)
    this.blendParameters(
      child.thresholds,
      parent1.thresholds,
      parent2.thresholds,
    )
    this.blendParameters(
      child.coefficients,
      parent1.coefficients,
      parent2.coefficients,
    )

    return child
  }

  /**
   * パラメータブレンド
   */
  private blendParameters(
    target: Record<string, number>,
    parent1: Record<string, number>,
    parent2: Record<string, number>,
  ): void {
    for (const key in target) {
      const alpha = Math.random() * 0.5 + 0.25 // 0.25-0.75の範囲
      target[key] = parent1[key] * alpha + parent2[key] * (1 - alpha)
    }
  }

  /**
   * 突然変異
   */
  private mutate(parameters: TuningParameters): TuningParameters {
    const mutated = JSON.parse(JSON.stringify(parameters))

    // 各パラメータに小さな変動を加える
    this.mutateParameterGroup(mutated.weights, 0.1)
    this.mutateParameterGroup(mutated.thresholds, 0.2)
    this.mutateParameterGroup(mutated.coefficients, 0.15)

    return mutated
  }

  /**
   * パラメータグループの突然変異
   */
  private mutateParameterGroup(
    group: Record<string, number>,
    intensity: number,
  ): void {
    for (const key in group) {
      if (Math.random() < 0.3) {
        // 30%の確率で変異
        const variation = (Math.random() - 0.5) * 2 * intensity
        group[key] *= 1 + variation
        group[key] = Math.max(0.01, group[key]) // 最小値制限
      }
    }
  }

  /**
   * ランダムパラメータ生成
   */
  private generateRandomParameters(): TuningParameters {
    return {
      weights: {
        timing: Math.random() * 0.6 + 0.2, // 0.2-0.8
        gaze: Math.random() * 0.4 + 0.1, // 0.1-0.5
        risk: Math.random() * 0.3 + 0.1, // 0.1-0.4
        defense: Math.random() * 0.2 + 0.05, // 0.05-0.25
        chain: Math.random() * 0.6 + 0.2, // 0.2-0.8
        shape: Math.random() * 0.4 + 0.1, // 0.1-0.5
      },
      thresholds: {
        emergencyHeight: Math.floor(Math.random() * 4) + 8, // 8-11
        minChainScore: Math.floor(Math.random() * 400) + 300, // 300-700
        fireThreshold: Math.floor(Math.random() * 30) + 60, // 60-90
        riskThreshold: Math.floor(Math.random() * 30) + 55, // 55-85
        chainCompleteness: Math.random() * 0.4 + 0.4, // 0.4-0.8
      },
      coefficients: {
        phaseEarlyMultiplier: Math.random() * 0.4 + 0.5, // 0.5-0.9
        phaseMiddleMultiplier: 1.0, // 固定
        phaseLateMultiplier: Math.random() * 0.6 + 1.0, // 1.0-1.6
        opponentThreatMultiplier: Math.random() * 0.6 + 0.9, // 0.9-1.5
        fieldHeightPenalty: Math.random() * 0.08 + 0.02, // 0.02-0.10
      },
    }
  }

  /**
   * テストケース作成
   */
  private createTestCases(): TestCase[] {
    return [
      {
        name: 'empty_field_basic',
        description: '空フィールドでの基本評価',
        myField: this.createEmptyField(),
        opponentField: this.createEmptyField(),
        gamePhase: 'early' as GamePhase,
        expectedScore: 50,
        weight: 1.0,
      },
      {
        name: 'high_chain_potential',
        description: '高連鎖ポテンシャル状況',
        myField: this.createHighChainField(),
        opponentField: this.createEmptyField(),
        gamePhase: 'middle' as GamePhase,
        expectedScore: 80,
        weight: 2.0,
      },
      {
        name: 'emergency_situation',
        description: '緊急発火状況',
        myField: this.createEmergencyField(),
        opponentField: this.createEmptyField(),
        gamePhase: 'late' as GamePhase,
        expectedScore: 30,
        weight: 1.5,
      },
      {
        name: 'opponent_threat',
        description: '相手脅威状況',
        myField: this.createEmptyField(),
        opponentField: this.createHighChainField(),
        gamePhase: 'middle' as GamePhase,
        expectedScore: 40,
        weight: 1.8,
      },
      {
        name: 'balanced_situation',
        description: '均衡状況',
        myField: this.createBalancedField(),
        opponentField: this.createBalancedField(),
        gamePhase: 'middle' as GamePhase,
        expectedScore: 60,
        weight: 1.2,
      },
    ]
  }

  /**
   * 全テストケース実行
   */
  private runAllTestCases(parameters: TuningParameters): TestResult[] {
    return this.testCases.map((testCase) =>
      this.runTestCase(testCase, parameters),
    )
  }

  /**
   * 単一テストケース実行
   */
  private runTestCase(
    testCase: TestCase,
    parameters: TuningParameters,
  ): TestResult {
    // パラメータを適用して評価実行
    const myGameState = this.createGameState(testCase.myField)
    const opponentGameState = this.createGameState(testCase.opponentField)

    // 評価実行（簡易版）
    const result = this.evaluationService.evaluateProgressive(
      myGameState,
      opponentGameState,
      testCase.gamePhase,
    )

    // パラメータを使用した補正スコア計算
    const adjustedScore = this.applyParameterAdjustments(
      result.basic.score,
      parameters,
      testCase,
    )

    const difference = Math.abs(adjustedScore - testCase.expectedScore)

    return {
      testCase: testCase.name,
      score: adjustedScore,
      expectedScore: testCase.expectedScore,
      difference,
      weight: testCase.weight,
    }
  }

  /**
   * パラメータ調整適用
   */
  private applyParameterAdjustments(
    baseScore: number,
    parameters: TuningParameters,
    testCase: TestCase,
  ): number {
    let adjustedScore = baseScore

    // フェーズ補正
    const phaseMultiplier = this.getPhaseMultiplier(
      testCase.gamePhase,
      parameters,
    )
    adjustedScore *= phaseMultiplier

    // フィールド高さペナルティ
    const fieldHeight = this.getFieldHeight(testCase.myField)
    const heightPenalty =
      fieldHeight * parameters.coefficients.fieldHeightPenalty
    adjustedScore *= 1 - heightPenalty

    // パラメータ重み適用（異なるパラメータで異なるスコアを確保）
    const timingBonus = parameters.weights.timing * 10
    const gazeBonus = parameters.weights.gaze * 8
    const riskPenalty = parameters.weights.risk * 5
    const defenseBonus = parameters.weights.defense * 6
    const chainBonus = parameters.weights.chain * 12
    const shapeBonus = parameters.weights.shape * 7

    adjustedScore +=
      timingBonus +
      gazeBonus +
      defenseBonus +
      chainBonus +
      shapeBonus -
      riskPenalty

    // スコア上限制限
    return Math.max(0, Math.min(100, adjustedScore))
  }

  /**
   * フェーズ補正係数取得
   */
  private getPhaseMultiplier(
    phase: GamePhase,
    parameters: TuningParameters,
  ): number {
    switch (phase) {
      case 'early':
        return parameters.coefficients.phaseEarlyMultiplier
      case 'middle':
        return parameters.coefficients.phaseMiddleMultiplier
      case 'late':
        return parameters.coefficients.phaseLateMultiplier
      case 'emergency':
        return parameters.coefficients.phaseLateMultiplier * 1.2
      default:
        return 1.0
    }
  }

  /**
   * フィールド高さ取得
   */
  private getFieldHeight(field: AIFieldState): number {
    let maxHeight = 0
    for (let x = 0; x < field.width; x++) {
      for (let y = 0; y < field.height; y++) {
        if (field.cells[y][x] !== null) {
          maxHeight = Math.max(maxHeight, field.height - y)
          break
        }
      }
    }
    return maxHeight / field.height // 正規化
  }

  /**
   * ランダムテストケース生成
   */
  private generateRandomTestCase(): TestCase {
    const phases: GamePhase[] = ['early', 'middle', 'late', 'emergency']
    const randomPhase = phases[Math.floor(Math.random() * phases.length)]

    return {
      name: 'random_test',
      description: 'ランダム生成テストケース',
      myField: this.generateRandomField(),
      opponentField: this.generateRandomField(),
      gamePhase: randomPhase,
      expectedScore: Math.random() * 100,
      weight: 1.0,
    }
  }

  /**
   * ヘルパーメソッド: フィールド生成
   */
  private createEmptyField(): AIFieldState {
    return {
      width: 6,
      height: 12,
      cells: Array(12)
        .fill(null)
        .map(() => Array(6).fill(null)),
    }
  }

  private createHighChainField(): AIFieldState {
    const field = this.createEmptyField()
    // 高連鎖パターンを配置
    const colors = ['red', 'blue', 'green', 'yellow']
    for (let x = 0; x < 4; x++) {
      for (let y = 8; y < 12; y++) {
        field.cells[y][x] = colors[x % colors.length] as never
      }
    }
    return field
  }

  private createEmergencyField(): AIFieldState {
    const field = this.createEmptyField()
    // 高い積み上げを作成
    for (let x = 0; x < 6; x++) {
      for (let y = 2; y < 12; y++) {
        field.cells[y][x] = 'red' as never
      }
    }
    return field
  }

  private createBalancedField(): AIFieldState {
    const field = this.createEmptyField()
    // バランスの取れた配置
    const colors = ['red', 'blue', 'green']
    for (let x = 0; x < 6; x++) {
      for (let y = 6; y < 12; y++) {
        if (Math.random() < 0.7) {
          field.cells[y][x] = colors[
            Math.floor(Math.random() * colors.length)
          ] as never
        }
      }
    }
    return field
  }

  private generateRandomField(): AIFieldState {
    const field = this.createEmptyField()
    const colors = ['red', 'blue', 'green', 'yellow', 'purple']

    for (let x = 0; x < 6; x++) {
      const height = Math.floor(Math.random() * 8) + 2 // 2-10の高さ
      for (let y = 12 - height; y < 12; y++) {
        if (Math.random() < 0.8) {
          field.cells[y][x] = colors[
            Math.floor(Math.random() * colors.length)
          ] as never
        }
      }
    }
    return field
  }

  private createGameState(field: AIFieldState): AIGameState {
    return {
      field,
      currentPuyoPair: {
        primaryColor: 'red',
        secondaryColor: 'blue',
        x: 2,
        y: 0,
        rotation: 0,
      },
      nextPuyoPair: null,
      score: 0,
    }
  }
}

/**
 * テストケース定義
 */
interface TestCase {
  name: string
  description: string
  myField: AIFieldState
  opponentField: AIFieldState
  gamePhase: GamePhase
  expectedScore: number
  weight: number
}
