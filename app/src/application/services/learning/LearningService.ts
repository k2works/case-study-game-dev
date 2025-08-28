import { TensorFlowTrainer } from '../../../domain/services/learning/TensorFlowTrainer'
import type {
  ModelArchitecture,
  TrainingConfig,
  TrainingData,
} from '../../../domain/services/learning/TensorFlowTrainer'
import type {
  BatchProcessingResult,
  BatchProcessingService,
} from './BatchProcessingService'
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
  private readonly tensorFlowTrainer: TensorFlowTrainer

  constructor(
    dataCollectionService: DataCollectionService,
    batchProcessingService: BatchProcessingService,
  ) {
    this.dataCollectionService = dataCollectionService
    this.batchProcessingService = batchProcessingService
    this.tensorFlowTrainer = new TensorFlowTrainer()
    // dataCollectionServiceは将来の直接データ収集機能で使用予定
    void this.dataCollectionService
  }

  /**
   * 学習を開始
   */
  async startLearning(config: LearningConfig): Promise<LearningResult> {
    const startTime = performance.now()

    try {
      console.log('LearningService: Step 1 - Validating config')
      this.validateLearningConfig(config)

      const processedResult = await this.processLearningData(config)
      const trainingDataSet = await this.prepareTrainingDataSet(processedResult)
      const modelResult = await this.executeModelTraining(
        config,
        trainingDataSet,
      )

      return this.generateLearningResult(
        processedResult,
        modelResult,
        performance.now() - startTime,
      )
    } catch (error) {
      return this.handleLearningError(error)
    }
  }

  /**
   * データ処理を実行
   */
  private async processLearningData(config: LearningConfig) {
    console.log(
      'LearningService: Step 2 - Starting data processing for learning...',
      {
        startDate: config.dataRange.startDate,
        endDate: config.dataRange.endDate,
      },
    )

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

    console.log(
      'LearningService: Step 3 - Data processing completed successfully',
    )

    console.log('LearningService: Step 4 - Checking data sufficiency')
    if (processedResult.processedDataset.training.totalSamples === 0) {
      throw new Error('Insufficient training data')
    }

    return processedResult
  }

  /**
   * 学習データセットを準備
   */
  private async prepareTrainingDataSet(processedResult: BatchProcessingResult) {
    console.log(
      'LearningService: Step 5 - Converting processed result to training data...',
    )

    this.logProcessedResultStructure(processedResult)
    const trainingDataSet = this.convertToTrainingData(processedResult)
    this.logConvertedDataStructure(trainingDataSet)

    return trainingDataSet
  }

  // eslint-disable-next-line complexity
  private logProcessedResultStructure(
    processedResult: BatchProcessingResult,
  ): void {
    const dataset = processedResult?.processedDataset
    console.log('ProcessedResult structure:', {
      hasDataset: !!dataset,
      hasTraining: !!dataset?.training,
      hasValidation: !!dataset?.validation,
      trainingBatches: dataset?.training?.batches?.length || 0,
      validationBatches: dataset?.validation?.batches?.length || 0,
    })
  }

  // eslint-disable-next-line complexity
  private logConvertedDataStructure(trainingDataSet: {
    trainingData: TrainingData
    validationData: TrainingData
  }): void {
    const { trainingData, validationData } = trainingDataSet
    console.log('LearningService: Step 6 - Training data converted:', {
      trainingFeatures: trainingData.features?.length || 0,
      trainingRewards: trainingData.rewards?.length || 0,
      validationFeatures: validationData.features?.length || 0,
      validationRewards: validationData.rewards?.length || 0,
    })
  }

  /**
   * モデル学習を実行
   */
  private async executeModelTraining(
    config: LearningConfig,
    trainingDataSet: {
      trainingData: TrainingData
      validationData: TrainingData
    },
  ) {
    console.log('LearningService: Step 7 - Starting TensorFlow model training')
    return await this.trainModel(config, trainingDataSet)
  }

  /**
   * 学習結果を生成
   */
  private generateLearningResult(
    processedResult: BatchProcessingResult,
    modelResult: {
      trainingAccuracy: number
      validationAccuracy: number
      modelSize: number
      modelPath: string
    },
    trainingTime: number,
  ): LearningResult {
    console.log('LearningService: Step 8 - Generating learning statistics')
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
  }

  /**
   * 学習エラーを処理
   */
  private handleLearningError(error: unknown): never {
    console.error('LearningService: Error occurred during learning:', error)
    console.error('LearningService: Error stack:', (error as Error).stack)

    if (error instanceof Error) {
      if (error.message.includes('Invalid learning configuration')) {
        console.error('LearningService: Configuration validation failed')
        throw error
      }
      if (error.message.includes('Insufficient training data')) {
        console.error('LearningService: Insufficient training data')
        throw error
      }
    }
    console.error('LearningService: Unknown error occurred')
    throw new Error(`Learning failed: ${(error as Error).message}`)
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
   * 実際のTensorFlow.js学習実行
   */
  private async trainModel(
    config: LearningConfig,
    processedResult: {
      trainingData: TrainingData
      validationData: TrainingData
    },
  ): Promise<{
    trainingAccuracy: number
    validationAccuracy: number
    modelSize: number
    modelPath: string
  }> {
    const { trainingData, validationData } = processedResult

    // TensorFlow.jsモデルアーキテクチャを構築
    // FeatureEngineeringServiceが生成する8次元特徴量に合わせる
    const architecture: ModelArchitecture = {
      type: config.modelArchitecture === 'dense' ? 'dense' : 'cnn',
      inputShape: [8], // FeatureEngineeringServiceの8次元特徴量
      layers: this.createModelLayers(config.modelArchitecture),
    }

    // モデル作成
    const model = this.tensorFlowTrainer.createModel(architecture)

    // 学習設定
    const trainingConfig: TrainingConfig = {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationSplit: config.validationSplit,
      learningRate: config.learningRate,
      verbose: 1,
    }

    try {
      // 学習実行
      const trainingResult = await this.tensorFlowTrainer.trainModel(
        model,
        trainingData,
        validationData,
        trainingConfig,
      )

      // モデル保存
      const modelPath = `indexeddb://puyo-ai-model-${Date.now()}`
      await this.tensorFlowTrainer.saveModel(model, modelPath)

      // メインモデルとしても保存
      await this.tensorFlowTrainer.saveModel(model, 'indexeddb://puyo-ai-model')

      return {
        trainingAccuracy: trainingResult.trainAccuracy,
        validationAccuracy: trainingResult.validationAccuracy,
        modelSize: this.calculateModelSize(model),
        modelPath,
      }
    } finally {
      // リソースクリーンアップ
      model.dispose()
    }
  }

  /**
   * BatchProcessingServiceの結果をTensorFlow用のTrainingDataに変換
   */
  private convertToTrainingData(batchResult: BatchProcessingResult): {
    trainingData: TrainingData
    validationData: TrainingData
  } {
    this.validateBatchResult(batchResult)

    const trainingData = this.extractDatasetPart(
      batchResult.processedDataset.training.batches,
      'Training',
    )
    const validationData = this.extractDatasetPart(
      batchResult.processedDataset.validation.batches,
      'Validation',
    )

    return { trainingData, validationData }
  }

  private validateBatchResult(batchResult: BatchProcessingResult): void {
    if (!batchResult?.processedDataset) {
      throw new Error('No processed dataset available')
    }

    if (!batchResult.processedDataset.training?.batches) {
      throw new Error('No training batches available')
    }

    if (!batchResult.processedDataset.validation?.batches) {
      throw new Error('No validation batches available')
    }
  }

  private extractDatasetPart(
    batches: readonly {
      features: readonly (readonly number[])[]
      rewards: readonly number[]
    }[],
    dataType: string,
  ): TrainingData {
    const features = this.extractFeaturesFromBatches(batches)
    const rewards = this.extractRewardsFromBatches(batches)

    if (features.length === 0 || rewards.length === 0) {
      throw new Error(`${dataType} data cannot be empty after extraction`)
    }

    return { features, rewards }
  }

  /**
   * バッチからフィーチャーを抽出
   */
  private extractFeaturesFromBatches(
    batches: readonly {
      features: readonly (readonly number[])[]
      rewards: readonly number[]
    }[],
  ): number[][] {
    if (!batches || batches.length === 0) {
      console.warn('No batches available for feature extraction')
      return []
    }

    this.logBatchStructure(batches, 'features')

    const allFeatures: number[][] = []
    for (const batch of batches) {
      if (!batch?.features) {
        console.warn('Batch has no features:', batch)
        continue
      }

      this.extractFeaturesFromBatch(batch, allFeatures)
    }

    console.log('extractFeaturesFromBatches: Extracted features', {
      totalFeatures: allFeatures.length,
      firstFeatureLength: allFeatures[0]?.length,
    })

    return allFeatures
  }

  private extractFeaturesFromBatch(
    batch: { features: readonly (readonly number[])[] },
    allFeatures: number[][],
  ): void {
    for (let i = 0; i < batch.features.length; i++) {
      const feature = batch.features[i]
      if (!feature) {
        console.warn(`Feature at index ${i} is undefined/null:`, feature)
        continue
      }

      if (typeof feature.length === 'undefined') {
        console.error('Feature has no length property:', {
          feature,
          type: typeof feature,
          index: i,
        })
        throw new Error(`Feature at index ${i} has no length property`)
      }

      allFeatures.push([...feature])
    }
  }

  private logBatchStructure(
    batches: readonly {
      features?: readonly (readonly number[])[]
      rewards?: readonly number[]
    }[],
    type: 'features' | 'rewards',
  ): void {
    console.log(
      `extract${type === 'features' ? 'Features' : 'Rewards'}FromBatches: Processing batches`,
      {
        batchCount: batches.length,
        firstBatch: batches[0]
          ? {
              hasProperty: type in batches[0],
              propertyType: typeof batches[0][type],
              propertyLength: batches[0][type]?.length,
              firstItem: batches[0][type]?.[0],
            }
          : null,
      },
    )
  }

  /**
   * バッチから報酬を抽出
   */
  private extractRewardsFromBatches(
    batches: readonly {
      features: readonly (readonly number[])[]
      rewards: readonly number[]
    }[],
  ): number[] {
    if (!batches || batches.length === 0) {
      console.warn('No batches available for reward extraction')
      return []
    }

    this.logBatchStructure(batches, 'rewards')

    const allRewards: number[] = []
    for (const batch of batches) {
      if (!batch?.rewards) {
        console.warn('Batch has no rewards:', batch)
        continue
      }

      this.validateRewardsBatch(batch)
      allRewards.push(...batch.rewards)
    }

    console.log('extractRewardsFromBatches: Extracted rewards', {
      totalRewards: allRewards.length,
    })

    return allRewards
  }

  private validateRewardsBatch(batch: { rewards: readonly number[] }): void {
    if (typeof batch.rewards.length === 'undefined') {
      console.error('Batch rewards has no length property:', {
        rewards: batch.rewards,
        type: typeof batch.rewards,
      })
      throw new Error('Batch rewards has no length property')
    }
  }

  /**
   * モデルレイヤー設定を作成
   */
  private createModelLayers(modelArchitecture: 'dense' | 'cnn') {
    if (modelArchitecture === 'dense') {
      return [
        { type: 'dense' as const, units: 128, activation: 'relu' },
        { type: 'dropout' as const, rate: 0.2 },
        { type: 'dense' as const, units: 64, activation: 'relu' },
        { type: 'dropout' as const, rate: 0.2 },
        { type: 'dense' as const, units: 32, activation: 'relu' },
        { type: 'dense' as const, units: 1, activation: 'linear' },
      ]
    } else {
      // CNN用の設定（将来の実装）
      return [
        { type: 'dense' as const, units: 64, activation: 'relu' },
        { type: 'dense' as const, units: 1, activation: 'linear' },
      ]
    }
  }

  /**
   * モデルサイズを計算
   */
  private calculateModelSize(model: { countParams(): number }) {
    const params = model.countParams()
    return Math.floor(params * 4) // 32bit float = 4bytes per parameter
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
