import type { BatchProcessingService } from './BatchProcessingService'
import type { DataCollectionService } from './DataCollectionService'

/**
 * 学習設定
 */
export interface LearningConfig {
  epochs: number
  learningRate: number
  batchSize: number
  validationSplit: number
  modelArchitecture: 'dense' | 'cnn'
  dataRange: {
    startDate: Date
    endDate: Date
  }
  maxSamples: number
  shuffle: boolean
  normalizeRewards: boolean
  crossValidation?: boolean
  kFolds?: number
}

/**
 * 学習統計
 */
export interface LearningStatistics {
  totalSamples: number
  trainingAccuracy: number
  validationAccuracy: number
  trainingTime: number
  modelSize: number
}

/**
 * 学習結果
 */
export interface LearningResult {
  success: boolean
  modelPath: string
  statistics: LearningStatistics
}

/**
 * 学習評価結果
 */
export interface LearningEvaluation {
  accuracy: number
  loss: number
  precision: number
  recall: number
  f1Score: number
  crossValidationResults?: CrossValidationResult[]
  meanAccuracy?: number
  stdAccuracy?: number
}

/**
 * クロスバリデーション結果
 */
export interface CrossValidationResult {
  fold: number
  accuracy: number
  loss: number
}

/**
 * 学習サービス
 */
export class LearningService {
  private readonly dataCollectionService: DataCollectionService
  private readonly batchProcessingService: BatchProcessingService

  constructor(
    dataCollectionService: DataCollectionService,
    batchProcessingService: BatchProcessingService,
  ) {
    this.dataCollectionService = dataCollectionService
    this.batchProcessingService = batchProcessingService
    // dataCollectionServiceは将来の直接データ収集機能で使用予定
    void this.dataCollectionService
  }

  /**
   * 学習を開始
   */
  async startLearning(config: LearningConfig): Promise<LearningResult> {
    const startTime = performance.now()

    try {
      // 設定検証
      this.validateLearningConfig(config)

      // データ処理
      const processedResult =
        await this.batchProcessingService.processDataFromDateRange(
          config.dataRange.startDate,
          config.dataRange.endDate,
          {
            batchSize: config.batchSize,
            validationSplit: config.validationSplit,
            shuffle: config.shuffle,
            normalizeRewards: config.normalizeRewards,
            maxSamples: config.maxSamples,
          },
        )

      // データ不足チェック
      if (processedResult.processedDataset.training.totalSamples === 0) {
        throw new Error('Insufficient training data')
      }

      // モデル学習実行（スタブ実装）
      const modelResult = await this.trainModel(config, processedResult)

      const endTime = performance.now()
      const trainingTime = endTime - startTime

      // 学習統計生成
      const statistics: LearningStatistics = {
        totalSamples: processedResult.processedDataset.statistics.totalSamples,
        trainingAccuracy: modelResult.trainingAccuracy,
        validationAccuracy: modelResult.validationAccuracy,
        trainingTime,
        modelSize: modelResult.modelSize,
      }

      return Object.freeze({
        success: true,
        modelPath: modelResult.modelPath,
        statistics: Object.freeze(statistics),
      }) as LearningResult
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid learning configuration')) {
          throw error
        }
        if (error.message.includes('Insufficient training data')) {
          throw error
        }
      }
      throw new Error(`Learning failed: ${(error as Error).message}`)
    }
  }

  /**
   * 学習評価を実行
   */
  async evaluateLearning(config: LearningConfig): Promise<LearningEvaluation> {
    try {
      // 設定検証
      this.validateLearningConfig(config)

      // データ処理
      const processedResult =
        await this.batchProcessingService.processDataFromDateRange(
          config.dataRange.startDate,
          config.dataRange.endDate,
          {
            batchSize: config.batchSize,
            validationSplit: config.validationSplit,
            shuffle: config.shuffle,
            normalizeRewards: config.normalizeRewards,
            maxSamples: config.maxSamples,
          },
        )

      // 基本評価実行（スタブ実装）
      const basicEvaluation = await this.performBasicEvaluation(
        config,
        processedResult,
      )

      // クロスバリデーション実行
      if (config.crossValidation && config.kFolds) {
        const crossValidationResults = await this.performCrossValidation(
          config,
          processedResult,
        )

        const accuracies = crossValidationResults.map((r) => r.accuracy)
        const meanAccuracy =
          accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
        const variance =
          accuracies.reduce((sum, acc) => sum + (acc - meanAccuracy) ** 2, 0) /
          accuracies.length
        const stdAccuracy = Math.sqrt(variance)

        return Object.freeze({
          ...basicEvaluation,
          crossValidationResults: Object.freeze(
            crossValidationResults,
          ) as readonly CrossValidationResult[],
          meanAccuracy,
          stdAccuracy,
        }) as LearningEvaluation
      }

      return Object.freeze(basicEvaluation) as LearningEvaluation
    } catch (error) {
      throw new Error(`Learning evaluation failed: ${(error as Error).message}`)
    }
  }

  /**
   * 学習設定を検証
   */
  private validateLearningConfig(config: LearningConfig): void {
    this.validateBasicConfig(config)
    this.validateDateRange(config)
    this.validateSamples(config)
  }

  /**
   * 基本設定を検証
   */
  private validateBasicConfig(config: LearningConfig): void {
    if (config.epochs <= 0) {
      throw new Error('Invalid learning configuration: epochs must be positive')
    }

    if (config.learningRate <= 0 || config.learningRate > 1) {
      throw new Error(
        'Invalid learning configuration: learning rate must be between 0 and 1',
      )
    }

    if (config.batchSize <= 0) {
      throw new Error(
        'Invalid learning configuration: batch size must be positive',
      )
    }

    if (config.validationSplit < 0 || config.validationSplit >= 1) {
      throw new Error(
        'Invalid learning configuration: validation split must be between 0 and 1',
      )
    }
  }

  /**
   * 日付範囲を検証
   */
  private validateDateRange(config: LearningConfig): void {
    if (config.dataRange.startDate >= config.dataRange.endDate) {
      throw new Error(
        'Invalid learning configuration: start date must be before end date',
      )
    }
  }

  /**
   * サンプル数を検証
   */
  private validateSamples(config: LearningConfig): void {
    if (config.maxSamples <= 0) {
      throw new Error(
        'Invalid learning configuration: max samples must be positive',
      )
    }
  }

  /**
   * モデル学習実行（スタブ実装）
   */
  private async trainModel(
    config: LearningConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processedResult: any,
  ): Promise<{
    trainingAccuracy: number
    validationAccuracy: number
    modelSize: number
    modelPath: string
  }> {
    // 実際のTensorFlow.js学習処理はTODO-6で実装
    // ここではスタブとして固定値を返す
    void processedResult // 将来のTensorFlow.js統合で使用予定
    await new Promise((resolve) => setTimeout(resolve, 100)) // 学習時間シミュレーション

    const trainingAccuracy = 0.85 + Math.random() * 0.1 // 0.85-0.95の範囲
    const validationAccuracy = 0.8 + Math.random() * 0.1 // 0.8-0.9の範囲
    const modelSize = Math.floor(1000 + Math.random() * 9000) // 1KB-10KB
    const modelPath = `models/${config.modelArchitecture}_${Date.now()}.json`

    return {
      trainingAccuracy,
      validationAccuracy,
      modelSize,
      modelPath,
    }
  }

  /**
   * 基本評価実行（スタブ実装）
   */
  private async performBasicEvaluation(
    config: LearningConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processedResult: any,
  ): Promise<LearningEvaluation> {
    // 実際の評価処理はTODO-6で実装
    void config // 将来の評価設定で使用予定
    void processedResult // 将来のデータ評価で使用予定
    await new Promise((resolve) => setTimeout(resolve, 50))

    const accuracy = 0.8 + Math.random() * 0.15 // 0.8-0.95の範囲
    const loss = Math.random() * 0.5 // 0-0.5の範囲
    const precision = 0.75 + Math.random() * 0.2 // 0.75-0.95の範囲
    const recall = 0.7 + Math.random() * 0.25 // 0.7-0.95の範囲
    const f1Score = (2 * precision * recall) / (precision + recall)

    return {
      accuracy,
      loss,
      precision,
      recall,
      f1Score,
    }
  }

  /**
   * クロスバリデーション実行（スタブ実装）
   */
  private async performCrossValidation(
    config: LearningConfig,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    processedResult: any,
  ): Promise<CrossValidationResult[]> {
    // 実際のクロスバリデーション処理はTODO-6で実装
    void processedResult // 将来のデータ分割で使用予定
    const kFolds = config.kFolds || 5
    const results: CrossValidationResult[] = []

    for (let fold = 1; fold <= kFolds; fold++) {
      await new Promise((resolve) => setTimeout(resolve, 30))

      const accuracy = 0.75 + Math.random() * 0.2 // 0.75-0.95の範囲
      const loss = Math.random() * 0.6 // 0-0.6の範囲

      results.push({
        fold,
        accuracy,
        loss,
      })
    }

    return results
  }
}

/**
 * LearningServiceのファクトリ関数
 */
export const createLearningService = (
  dataCollectionService: DataCollectionService,
  batchProcessingService: BatchProcessingService,
): LearningService => {
  return new LearningService(dataCollectionService, batchProcessingService)
}
