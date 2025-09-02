import type { TrainingData } from '../../../domain/models/training/TrainingData'
import type {
  FeatureEngineeringService,
  ProcessedTrainingData,
} from '../../../domain/services/learning/FeatureEngineeringService'

/**
 * データ前処理設定
 */
export interface DataPreprocessingConfig {
  batchSize: number
  validationSplit: number
  shuffle: boolean
  normalizeRewards: boolean
}

/**
 * バッチデータ
 */
export interface DataBatch {
  readonly features: readonly (readonly number[])[]
  readonly rewards: readonly number[]
  readonly size: number
  readonly metadata: {
    readonly ids: readonly string[]
    readonly timestamps: readonly Date[]
  }
}

/**
 * データセット
 */
export interface DatasetPart {
  readonly batches: readonly DataBatch[]
  readonly totalSamples: number
}

/**
 * データセット統計
 */
export interface DatasetStatistics {
  totalSamples: number
  trainingSamples: number
  validationSamples: number
  rewardStatistics: {
    mean: number
    std: number
    min: number
    max: number
  }
}

/**
 * 前処理済みデータセット
 */
export interface ProcessedDataset {
  training: DatasetPart
  validation: DatasetPart
  statistics: DatasetStatistics
}

/**
 * データ分割結果
 */
export interface DataSplit<T> {
  training: T[]
  validation: T[]
}

/**
 * データ前処理サービス
 */
export class DataPreprocessingService {
  private readonly featureService: FeatureEngineeringService

  constructor(featureService: FeatureEngineeringService) {
    this.featureService = featureService
  }

  /**
   * データセットを前処理
   */
  async preprocessDataset(
    rawData: TrainingData[],
    config: DataPreprocessingConfig,
  ): Promise<ProcessedDataset> {
    this.validateConfig(config, rawData)

    // 特徴量抽出
    const processedData = this.featureService.processBatch(rawData)

    // データシャッフル
    const shuffledData = config.shuffle
      ? this.shuffleArray(processedData.slice())
      : processedData

    // 訓練/検証データ分割
    const split = this.createDataSplit(shuffledData, config.validationSplit)

    // 報酬正規化
    const normalizedTraining = config.normalizeRewards
      ? this.normalizeRewards(split.training)
      : split.training

    const normalizedValidation = config.normalizeRewards
      ? this.normalizeRewards(split.validation)
      : split.validation

    // バッチ作成
    const trainingBatches = this.createBatches(
      normalizedTraining,
      config.batchSize,
    )
    const validationBatches = this.createBatches(
      normalizedValidation,
      config.batchSize,
    )

    // 統計計算
    const statistics = this.calculateStatistics(
      normalizedTraining,
      normalizedValidation,
    )

    return Object.freeze({
      training: Object.freeze({
        batches: Object.freeze(trainingBatches) as readonly DataBatch[],
        totalSamples: normalizedTraining.length,
      }),
      validation: Object.freeze({
        batches: Object.freeze(validationBatches) as readonly DataBatch[],
        totalSamples: normalizedValidation.length,
      }),
      statistics: Object.freeze(statistics),
    }) as ProcessedDataset
  }

  /**
   * データを訓練用と検証用に分割
   */
  createDataSplit<T>(data: T[], validationSplit: number): DataSplit<T> {
    const splitIndex = Math.floor(data.length * (1 - validationSplit))

    return {
      training: data.slice(0, splitIndex),
      validation: data.slice(splitIndex),
    }
  }

  /**
   * 配列をシャッフル（Fisher-Yates algorithm）
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  /**
   * 報酬を正規化（0-1範囲）
   */
  private normalizeRewards(
    data: ProcessedTrainingData[],
  ): ProcessedTrainingData[] {
    if (data.length === 0) return data

    const rewards = data.map((item) => item.reward)
    const minReward = Math.min(...rewards)
    const maxReward = Math.max(...rewards)
    const range = maxReward - minReward

    if (range === 0) return data

    return data.map((item) => ({
      ...item,
      reward: (item.reward - minReward) / range,
    }))
  }

  /**
   * データをバッチに分割
   */
  private createBatches(
    data: ProcessedTrainingData[],
    batchSize: number,
  ): DataBatch[] {
    const batches: DataBatch[] = []

    for (let i = 0; i < data.length; i += batchSize) {
      const batchData = data.slice(i, i + batchSize)

      const features = batchData.map((item) => item.normalizedFeatures.vector)
      const rewards = batchData.map((item) => item.reward)
      const ids = batchData.map((item) => item.id)
      const timestamps = batchData.map((item) => item.timestamp)

      batches.push(
        Object.freeze({
          features: Object.freeze(features) as readonly (readonly number[])[],
          rewards: Object.freeze(rewards.slice()) as readonly number[],
          size: batchData.length,
          metadata: Object.freeze({
            ids: Object.freeze(ids.slice()) as readonly string[],
            timestamps: Object.freeze(timestamps.slice()) as readonly Date[],
          }),
        }) as DataBatch,
      )
    }

    return batches
  }

  /**
   * データセット統計を計算
   */
  private calculateStatistics(
    trainingData: ProcessedTrainingData[],
    validationData: ProcessedTrainingData[],
  ): DatasetStatistics {
    const allData = trainingData.concat(validationData)
    const rewards = allData.map((item) => item.reward)

    const mean = rewards.reduce((sum, r) => sum + r, 0) / rewards.length
    const variance =
      rewards.reduce((sum, r) => sum + (r - mean) ** 2, 0) / rewards.length
    const std = Math.sqrt(variance)

    return {
      totalSamples: allData.length,
      trainingSamples: trainingData.length,
      validationSamples: validationData.length,
      rewardStatistics: {
        mean,
        std,
        min: Math.min(...rewards),
        max: Math.max(...rewards),
      },
    }
  }

  /**
   * 設定とデータの検証
   */
  private validateConfig(
    config: DataPreprocessingConfig,
    data: TrainingData[],
  ): void {
    if (data.length === 0) {
      throw new Error('Dataset cannot be empty')
    }

    if (config.validationSplit < 0 || config.validationSplit > 1) {
      throw new Error('Validation split must be between 0 and 1')
    }

    if (config.batchSize <= 0) {
      throw new Error('Batch size must be greater than 0')
    }

    if (config.batchSize > data.length) {
      throw new Error('Batch size cannot be larger than dataset size')
    }
  }
}

/**
 * DataPreprocessingServiceのファクトリ関数
 */
export const createDataPreprocessingService = (
  featureService: FeatureEngineeringService,
): DataPreprocessingService => {
  return new DataPreprocessingService(featureService)
}
