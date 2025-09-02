import {
  type AIAction,
  type GameState,
  type TrainingData,
  type TrainingMetadata,
  type TrainingStatistics,
  calculateStatistics,
  createTrainingData,
} from '../../../domain/models/training/TrainingData'

/**
 * 学習データ収集のリポジトリポート
 */
export interface TrainingDataRepositoryPort {
  save(data: TrainingData): Promise<void>
  findAll(): Promise<TrainingData[]>
  findByDateRange(start: Date, end: Date): Promise<TrainingData[]>
  count(): Promise<number>
  clear(): Promise<void>
}

/**
 * バッチ収集用のデータ構造
 */
export interface CollectionBatchItem {
  gameState: GameState
  action: AIAction
  reward: number
  metadata: TrainingMetadata
}

/**
 * 収集統計情報
 */
export interface CollectionStatistics extends TrainingStatistics {
  readonly collectionRate: number // データ/分
  readonly lastCollectionTime: Date | null
}

/**
 * データ収集サービスインターフェース
 */
export interface DataCollectionService {
  /**
   * 単一の学習データを収集
   */
  collectTrainingData(
    gameState: GameState,
    action: AIAction,
    reward: number,
    metadata: TrainingMetadata,
  ): Promise<void>

  /**
   * バッチで学習データを収集
   */
  batchCollect(data: CollectionBatchItem[]): Promise<void>

  /**
   * 収集統計情報を取得
   */
  getCollectionStats(): Promise<CollectionStatistics>

  /**
   * 収集データをクリア
   */
  clearCollectedData(): Promise<void>

  /**
   * 日付範囲でデータを取得
   */
  getDataByDateRange(start: Date, end: Date): Promise<TrainingData[]>
}

/**
 * データ収集サービスの実装
 */
export class DataCollectionServiceImpl implements DataCollectionService {
  private lastCollectionTime: Date | null = null
  private collectionCount = 0
  private readonly repository: TrainingDataRepositoryPort

  constructor(repository: TrainingDataRepositoryPort) {
    this.repository = repository
  }

  /**
   * リポジトリの初期化を確認し、必要に応じて初期化を実行
   */
  private async ensureRepositoryInitialized(): Promise<void> {
    // IndexedDBRepositoryの場合、初期化状態を確認
    if ('isInitialized' in this.repository) {
      const repo = this.repository as unknown as {
        isInitialized?: () => boolean
        initialize?: () => Promise<void>
      }
      if (typeof repo.isInitialized === 'function') {
        const isInitialized = repo.isInitialized()
        console.log('Repository initialization status:', isInitialized)

        if (!isInitialized) {
          if (typeof repo.initialize === 'function') {
            console.log('Initializing repository...')
            await repo.initialize()
            console.log('Repository initialization completed')
          } else {
            console.warn('Repository has no initialize method')
          }
        }
      } else {
        console.warn('Repository has no isInitialized method')
      }
    } else {
      console.log('Repository is not IndexedDB repository')
    }
  }

  async collectTrainingData(
    gameState: GameState,
    action: AIAction,
    reward: number,
    metadata: TrainingMetadata,
  ): Promise<void> {
    // リポジトリの初期化確認
    await this.ensureRepositoryInitialized()

    // バリデーション
    this.validateInputs(gameState, action, reward, metadata)

    try {
      const trainingData = createTrainingData(
        gameState,
        action,
        reward,
        metadata,
      )
      await this.repository.save(trainingData)

      // 統計更新
      this.updateCollectionStats()
    } catch (error) {
      throw new Error(
        `Failed to save training data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async batchCollect(data: CollectionBatchItem[]): Promise<void> {
    if (data.length === 0) {
      return
    }

    // リポジトリの初期化確認
    await this.ensureRepositoryInitialized()

    try {
      const promises = data.map(async (item) => {
        this.validateInputs(
          item.gameState,
          item.action,
          item.reward,
          item.metadata,
        )
        const trainingData = createTrainingData(
          item.gameState,
          item.action,
          item.reward,
          item.metadata,
        )
        return this.repository.save(trainingData)
      })

      await Promise.all(promises)

      // 統計更新
      this.collectionCount += data.length
      this.lastCollectionTime = new Date()
    } catch (error) {
      throw new Error(
        `Batch collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getCollectionStats(): Promise<CollectionStatistics> {
    // リポジトリの初期化確認
    await this.ensureRepositoryInitialized()

    try {
      const allData = await this.repository.findAll()
      const count = await this.repository.count()

      if (count === 0) {
        return this.createEmptyStats()
      }

      const baseStats = calculateStatistics(allData)
      const collectionRate = this.calculateCollectionRate()

      return {
        ...baseStats,
        collectionRate,
        lastCollectionTime: this.lastCollectionTime,
      }
    } catch (error) {
      throw new Error(
        `Failed to get collection stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async clearCollectedData(): Promise<void> {
    // リポジトリの初期化確認
    await this.ensureRepositoryInitialized()

    try {
      await this.repository.clear()
      this.resetStats()
    } catch (error) {
      throw new Error(
        `Failed to clear collected data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getDataByDateRange(start: Date, end: Date): Promise<TrainingData[]> {
    if (start > end) {
      throw new Error('Start date must be before end date')
    }

    console.log('DataCollectionService: Getting data by date range', {
      start: start.toISOString(),
      end: end.toISOString(),
    })

    // リポジトリの初期化確認
    await this.ensureRepositoryInitialized()

    try {
      // まず総データ数を確認
      const totalCount = await this.repository.count()
      console.log(
        'DataCollectionService: Total data count in repository:',
        totalCount,
      )

      // 全データのサンプルを確認
      if (totalCount > 0) {
        const allData = await this.repository.findAll()
        console.log('DataCollectionService: Sample of all data', {
          firstItem: allData[0],
          lastItem: allData[allData.length - 1],
          timestampRange: {
            earliest: Math.min(...allData.map((d) => d.timestamp.getTime())),
            latest: Math.max(...allData.map((d) => d.timestamp.getTime())),
          },
        })
      }

      const result = await this.repository.findByDateRange(start, end)
      console.log('DataCollectionService: Found data by date range', {
        count: result.length,
        sampleItem: result.length > 0 ? result[0] : null,
      })

      return result
    } catch (error) {
      console.error('DataCollectionService: Error in getDataByDateRange', error)
      throw new Error(
        `Failed to get data by date range: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * 入力値のバリデーション
   */
  private validateInputs(
    gameState: GameState,
    action: AIAction,
    reward: number,
    metadata: TrainingMetadata,
  ): void {
    this.validateBasicInputs(gameState, action, reward, metadata)
    this.validateGameState(gameState)
    this.validateAction(action, gameState)
  }

  /**
   * 基本的な入力値の存在チェック
   */
  private validateBasicInputs(
    gameState: GameState,
    action: AIAction,
    reward: number,
    metadata: TrainingMetadata,
  ): void {
    if (!gameState) {
      throw new Error('Game state is required')
    }

    if (!action) {
      throw new Error('Action is required')
    }

    if (typeof reward !== 'number' || !Number.isFinite(reward)) {
      throw new Error('Invalid reward value')
    }

    if (!metadata) {
      throw new Error('Metadata is required')
    }
  }

  /**
   * ゲーム状態の詳細検証
   */
  private validateGameState(gameState: GameState): void {
    if (!gameState.field || !Array.isArray(gameState.field)) {
      throw new Error('Invalid game state: field is required')
    }

    if (!gameState.currentPuyo || !gameState.nextPuyo) {
      throw new Error('Invalid game state: puyo information is required')
    }
  }

  /**
   * アクションの詳細検証
   */
  private validateAction(action: AIAction, gameState: GameState): void {
    this.validateActionTypes(action)
    this.validateActionBounds(action, gameState)
  }

  /**
   * アクションの型検証
   */
  private validateActionTypes(action: AIAction): void {
    if (typeof action.x !== 'number' || typeof action.rotation !== 'number') {
      throw new Error('Invalid action: x and rotation are required')
    }
  }

  /**
   * アクションの範囲検証
   */
  private validateActionBounds(action: AIAction, gameState: GameState): void {
    const fieldWidth = gameState.field[0]?.length || 0

    if (action.x < 0 || action.x >= fieldWidth) {
      throw new Error('Invalid action: x is out of bounds')
    }

    if (action.rotation < 0 || action.rotation > 3) {
      throw new Error('Invalid action: rotation must be 0-3')
    }
  }

  /**
   * 統計情報の更新
   */
  private updateCollectionStats(): void {
    this.collectionCount++
    this.lastCollectionTime = new Date()
  }

  /**
   * 収集レートの計算（データ/分）
   */
  private calculateCollectionRate(): number {
    if (!this.lastCollectionTime || this.collectionCount === 0) {
      return 0
    }

    const now = new Date()
    const timeDiffMinutes =
      (now.getTime() - this.lastCollectionTime.getTime()) / (1000 * 60)

    if (timeDiffMinutes === 0) {
      return this.collectionCount
    }

    return Math.round((this.collectionCount / timeDiffMinutes) * 10) / 10
  }

  /**
   * 空の統計情報を作成
   */
  private createEmptyStats(): CollectionStatistics {
    return Object.freeze({
      totalSamples: 0,
      averageReward: 0,
      minReward: 0,
      maxReward: 0,
      standardDeviation: 0,
      timeRange: Object.freeze({
        start: new Date(),
        end: new Date(),
      }),
      collectionRate: 0,
      lastCollectionTime: this.lastCollectionTime,
    })
  }

  /**
   * 統計情報のリセット
   */
  private resetStats(): void {
    this.collectionCount = 0
    this.lastCollectionTime = null
  }
}

/**
 * DataCollectionServiceのファクトリ関数
 */
export const createDataCollectionService = (
  repository: TrainingDataRepositoryPort,
): DataCollectionService => {
  return new DataCollectionServiceImpl(repository)
}

/**
 * 学習データ収集のユーティリティ関数
 */
export const createCollectionBatch = (
  items: CollectionBatchItem[],
): CollectionBatchItem[] => {
  return items.filter((item) => {
    return (
      item.gameState &&
      item.action &&
      typeof item.reward === 'number' &&
      Number.isFinite(item.reward) &&
      item.metadata
    )
  })
}

/**
 * 報酬の正規化ユーティリティ
 */
export const normalizeReward = (
  score: number,
  chainLength: number,
  timeBonus: number,
): number => {
  // 基本報酬計算
  const baseReward = Math.log(score + 1) * 10
  const chainBonus = chainLength * chainLength * 5
  const timePenalty = Math.max(0, timeBonus - 100) * -0.1

  return Math.round((baseReward + chainBonus + timePenalty) * 10) / 10
}
