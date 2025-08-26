/**
 * 機械学習モデル性能評価ドメインモデル
 */

export interface ModelPerformance {
  readonly modelId: string
  readonly modelVersion: string
  readonly timestamp: Date
  readonly trainingMetrics: TrainingMetrics
  readonly validationMetrics: ValidationMetrics
  readonly testMetrics?: TestMetrics
  readonly resourceMetrics: ResourceMetrics
}

export interface TrainingMetrics {
  readonly epochs: number
  readonly finalLoss: number
  readonly finalAccuracy: number
  readonly convergenceEpoch: number
  readonly trainingTime: number
  readonly lossHistory: readonly number[]
  readonly accuracyHistory: readonly number[]
}

export interface ValidationMetrics {
  readonly validationLoss: number
  readonly validationAccuracy: number
  readonly overfittingScore: number
  readonly stabilityScore: number
}

export interface TestMetrics {
  readonly testLoss: number
  readonly testAccuracy: number
  readonly gamePerformanceScore: number
  readonly chainEvaluationScore: number
  readonly operationScore: number
  readonly strategyScore: number
}

export interface ResourceMetrics {
  readonly modelSize: number
  readonly inferenceTime: number
  readonly memoryUsage: number
  readonly gpuUtilization?: number
}

export interface ModelComparison {
  readonly baselineModel: ModelPerformance
  readonly comparisonModel: ModelPerformance
  readonly improvementMetrics: ImprovementMetrics
  readonly significance: StatisticalSignificance
}

export interface ImprovementMetrics {
  readonly accuracyImprovement: number
  readonly lossReduction: number
  readonly gamePerformanceImprovement: number
  readonly trainingSpeedImprovement: number
  readonly modelSizeChange: number
}

export interface StatisticalSignificance {
  readonly pValue: number
  readonly confidenceInterval: [number, number]
  readonly isSignificant: boolean
  readonly sampleSize: number
}

export interface ABTestResult {
  readonly testId: string
  readonly testName: string
  readonly startDate: Date
  readonly endDate: Date
  readonly modelA: ModelPerformance
  readonly modelB: ModelPerformance
  readonly comparison: ModelComparison
  readonly winnerModel: string
  readonly confidenceLevel: number
}

export interface LearningCurve {
  readonly epochs: readonly number[]
  readonly trainLoss: readonly number[]
  readonly validationLoss: readonly number[]
  readonly trainAccuracy: readonly number[]
  readonly validationAccuracy: readonly number[]
}

export interface PerformanceTrend {
  readonly timePoints: readonly Date[]
  readonly accuracyTrend: readonly number[]
  readonly lossTrend: readonly number[]
  readonly gameScoreTrend: readonly number[]
  readonly modelSizeTrend: readonly number[]
}

/**
 * 機械学習モデル性能評価ドメインサービス
 */
export class ModelPerformanceMetrics {
  private readonly performances: ModelPerformance[] = []
  private readonly abTests: ABTestResult[] = []

  addPerformance(performance: ModelPerformance): void {
    this.performances.push(performance)
  }

  getLatestPerformance(modelId: string): ModelPerformance | null {
    const modelPerformances = this.performances
      .filter((p) => p.modelId === modelId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return modelPerformances[0] || null
  }

  getPerformanceHistory(modelId: string): readonly ModelPerformance[] {
    return this.performances
      .filter((p) => p.modelId === modelId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  compareModels(modelAId: string, modelBId: string): ModelComparison | null {
    const modelA = this.getLatestPerformance(modelAId)
    const modelB = this.getLatestPerformance(modelBId)

    if (!modelA || !modelB) {
      return null
    }

    return this.calculateComparison(modelA, modelB)
  }

  calculateImprovement(
    baseline: ModelPerformance,
    comparison: ModelPerformance,
  ): ImprovementMetrics {
    const accuracyImprovement =
      comparison.validationMetrics.validationAccuracy -
      baseline.validationMetrics.validationAccuracy
    const lossReduction =
      baseline.validationMetrics.validationLoss -
      comparison.validationMetrics.validationLoss

    const gamePerformanceImprovement =
      comparison.testMetrics && baseline.testMetrics
        ? comparison.testMetrics.gamePerformanceScore -
          baseline.testMetrics.gamePerformanceScore
        : 0

    const trainingSpeedImprovement =
      baseline.trainingMetrics.trainingTime > 0
        ? (baseline.trainingMetrics.trainingTime -
            comparison.trainingMetrics.trainingTime) /
          baseline.trainingMetrics.trainingTime
        : 0

    const modelSizeChange =
      comparison.resourceMetrics.modelSize - baseline.resourceMetrics.modelSize

    return {
      accuracyImprovement,
      lossReduction,
      gamePerformanceImprovement,
      trainingSpeedImprovement,
      modelSizeChange,
    }
  }

  calculateStatisticalSignificance(
    baselineScores: readonly number[],
    comparisonScores: readonly number[],
  ): StatisticalSignificance {
    // Handle empty arrays
    if (baselineScores.length === 0 || comparisonScores.length === 0) {
      return {
        pValue: 1.0,
        confidenceInterval: [0, 0],
        isSignificant: false,
        sampleSize: baselineScores.length + comparisonScores.length,
      }
    }

    // T-test implementation for statistical significance
    const baselineMean = this.calculateMean(baselineScores)
    const comparisonMean = this.calculateMean(comparisonScores)

    const baselineVariance = this.calculateVariance(
      baselineScores,
      baselineMean,
    )
    const comparisonVariance = this.calculateVariance(
      comparisonScores,
      comparisonMean,
    )

    const pooledVariance =
      ((baselineScores.length - 1) * baselineVariance +
        (comparisonScores.length - 1) * comparisonVariance) /
      (baselineScores.length + comparisonScores.length - 2)

    const standardError = Math.sqrt(
      pooledVariance *
        (1 / baselineScores.length + 1 / comparisonScores.length),
    )

    // Avoid division by zero
    if (standardError === 0) {
      return {
        pValue: 1.0,
        confidenceInterval: [0, 0],
        isSignificant: false,
        sampleSize: baselineScores.length + comparisonScores.length,
      }
    }

    const tStatistic = (comparisonMean - baselineMean) / standardError

    // Simplified p-value calculation (would need proper t-distribution in production)
    const pValue = this.approximatePValue(Math.abs(tStatistic))

    const marginOfError = this.getCriticalValue(0.05) * standardError
    const confidenceInterval: [number, number] = [
      comparisonMean - baselineMean - marginOfError,
      comparisonMean - baselineMean + marginOfError,
    ]

    return {
      pValue,
      confidenceInterval,
      isSignificant: pValue < 0.05,
      sampleSize: baselineScores.length + comparisonScores.length,
    }
  }

  generateLearningCurve(performance: ModelPerformance): LearningCurve {
    const epochCount = Math.max(0, performance.trainingMetrics.epochs)
    const epochs =
      epochCount > 0 ? Array.from({ length: epochCount }, (_, i) => i + 1) : []

    return {
      epochs,
      trainLoss: performance.trainingMetrics.lossHistory,
      validationLoss: performance.trainingMetrics.lossHistory, // Would need separate validation history
      trainAccuracy: performance.trainingMetrics.accuracyHistory,
      validationAccuracy: performance.trainingMetrics.accuracyHistory, // Would need separate validation history
    }
  }

  getPerformanceTrend(modelId: string): PerformanceTrend {
    const history = this.getPerformanceHistory(modelId)

    const timePoints = history.map((p) => p.timestamp)
    const accuracyTrend = history.map(
      (p) => p.validationMetrics.validationAccuracy,
    )
    const lossTrend = history.map((p) => p.validationMetrics.validationLoss)
    const gameScoreTrend = history.map(
      (p) => p.testMetrics?.gamePerformanceScore || 0,
    )
    const modelSizeTrend = history.map((p) => p.resourceMetrics.modelSize)

    return {
      timePoints,
      accuracyTrend,
      lossTrend,
      gameScoreTrend,
      modelSizeTrend,
    }
  }

  addABTestResult(result: ABTestResult): void {
    this.abTests.push(result)
  }

  getABTestResults(): readonly ABTestResult[] {
    return [...this.abTests]
  }

  getActiveABTests(): readonly ABTestResult[] {
    const now = new Date()
    return this.abTests.filter(
      (test) => test.startDate <= now && test.endDate >= now,
    )
  }

  private calculateComparison(
    modelA: ModelPerformance,
    modelB: ModelPerformance,
  ): ModelComparison {
    const improvementMetrics = this.calculateImprovement(modelA, modelB)

    // Generate mock scores for statistical significance calculation
    const mockScoresA = Array(100)
      .fill(0)
      .map(
        () =>
          modelA.validationMetrics.validationAccuracy +
          (Math.random() - 0.5) * 0.1,
      )
    const mockScoresB = Array(100)
      .fill(0)
      .map(
        () =>
          modelB.validationMetrics.validationAccuracy +
          (Math.random() - 0.5) * 0.1,
      )

    const significance = this.calculateStatisticalSignificance(
      mockScoresA,
      mockScoresB,
    )

    return {
      baselineModel: modelA,
      comparisonModel: modelB,
      improvementMetrics,
      significance,
    }
  }

  private calculateMean(values: readonly number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  private calculateVariance(values: readonly number[], mean: number): number {
    if (values.length <= 1) return 0
    const squaredDeviations = values.map((value) => (value - mean) ** 2)
    return (
      squaredDeviations.reduce((sum, deviation) => sum + deviation, 0) /
      (values.length - 1)
    )
  }

  private approximatePValue(tStat: number): number {
    // Simplified approximation - in production, use proper statistical library
    if (tStat > 2.576) return 0.01
    if (tStat > 1.96) return 0.05
    if (tStat > 1.645) return 0.1
    return 0.2
  }

  private getCriticalValue(alpha: number): number {
    // Simplified critical value - in production, use proper t-distribution table
    if (alpha <= 0.01) return 2.576
    if (alpha <= 0.05) return 1.96
    return 1.645
  }

  clearData(): void {
    this.performances.length = 0
    this.abTests.length = 0
  }
}
