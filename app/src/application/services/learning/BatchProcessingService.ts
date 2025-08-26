import type { TrainingData } from '../../../domain/models/training/TrainingData'
import type { DataCollectionService } from './DataCollectionService'
import type {
  DataPreprocessingConfig,
  DataPreprocessingService,
  ProcessedDataset,
} from './DataPreprocessingService'

/**
 * バッチ処理設定
 */
export interface BatchProcessingConfig extends DataPreprocessingConfig {
  maxSamples: number
}

/**
 * バッチ処理メタデータ
 */
export interface BatchProcessingMetadata {
  processingTime: number
  originalSamples: number
  processedSamples: number
  samplingApplied: boolean
  config: BatchProcessingConfig
}

/**
 * バッチ処理結果
 */
export interface BatchProcessingResult {
  processedDataset: ProcessedDataset
  metadata: BatchProcessingMetadata
}

/**
 * バッチ処理サービス
 */
export class BatchProcessingService {
  private readonly collectionService: DataCollectionService
  private readonly preprocessingService: DataPreprocessingService

  constructor(
    collectionService: DataCollectionService,
    preprocessingService: DataPreprocessingService,
  ) {
    this.collectionService = collectionService
    this.preprocessingService = preprocessingService
  }

  /**
   * バッチ処理を実行
   */
  async processBatch(
    data: TrainingData[],
    config: BatchProcessingConfig,
  ): Promise<BatchProcessingResult> {
    const startTime = performance.now()

    try {
      this.validateBatchConfig(config, data)

      // データサンプリング
      const sampledData = this.applyDataSampling(data, config.maxSamples)
      const samplingApplied = sampledData.length < data.length

      // 前処理実行
      const processedDataset =
        await this.preprocessingService.preprocessDataset(
          sampledData,
          this.extractPreprocessingConfig(config),
        )

      const processingTime = performance.now() - startTime

      // メタデータ生成
      const metadata: BatchProcessingMetadata = {
        processingTime,
        originalSamples: data.length,
        processedSamples: sampledData.length,
        samplingApplied,
        config: { ...config },
      }

      return Object.freeze({
        processedDataset,
        metadata: Object.freeze(metadata),
      })
    } catch (error) {
      throw new Error(
        `Failed to process batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * 日付範囲からデータを取得して処理
   */
  async processDataFromDateRange(
    startDate: Date,
    endDate: Date,
    config: BatchProcessingConfig,
  ): Promise<BatchProcessingResult> {
    this.validateDateRange(startDate, endDate)

    try {
      // データ取得
      const rawData = await this.collectionService.getDataByDateRange(
        startDate,
        endDate,
      )

      // バッチ処理実行
      return await this.processBatch(rawData, config)
    } catch (error) {
      throw new Error(
        `Failed to process data from date range: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * データサンプリングを適用
   */
  private applyDataSampling(
    data: TrainingData[],
    maxSamples: number,
  ): TrainingData[] {
    if (data.length <= maxSamples) {
      return data
    }

    // ランダムサンプリング
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, maxSamples)
  }

  /**
   * 前処理設定を抽出
   */
  private extractPreprocessingConfig(
    config: BatchProcessingConfig,
  ): DataPreprocessingConfig {
    return {
      batchSize: config.batchSize,
      validationSplit: config.validationSplit,
      shuffle: config.shuffle,
      normalizeRewards: config.normalizeRewards,
    }
  }

  /**
   * バッチ処理設定の検証
   */
  private validateBatchConfig(
    config: BatchProcessingConfig,
    data: TrainingData[],
  ): void {
    if (data.length === 0) {
      throw new Error('No data to process')
    }

    if (config.maxSamples <= 0) {
      throw new Error('Max samples must be greater than 0')
    }

    if (config.batchSize <= 0) {
      throw new Error('Batch size must be greater than 0')
    }

    if (config.validationSplit < 0 || config.validationSplit > 1) {
      throw new Error('Validation split must be between 0 and 1')
    }
  }

  /**
   * 日付範囲の検証
   */
  private validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date')
    }
  }
}

/**
 * BatchProcessingServiceのファクトリ関数
 */
export const createBatchProcessingService = (
  collectionService: DataCollectionService,
  preprocessingService: DataPreprocessingService,
): BatchProcessingService => {
  return new BatchProcessingService(collectionService, preprocessingService)
}
