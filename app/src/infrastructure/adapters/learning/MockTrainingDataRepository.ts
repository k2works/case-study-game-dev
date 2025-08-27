import type { TrainingData } from '../../../domain/models/training/TrainingData'
import type { TrainingDataRepositoryPort } from '../../../application/services/learning/DataCollectionService'

/**
 * テスト環境用のモックTrainingDataRepository
 * IndexedDBが利用できない環境での代替実装
 */
export class MockTrainingDataRepository implements TrainingDataRepositoryPort {
  private data: TrainingData[] = []
  private initialized = false

  async initialize(): Promise<void> {
    this.initialized = true
  }

  async save(data: TrainingData): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }
    this.data.push(data)
  }

  async findAll(): Promise<TrainingData[]> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }
    return [...this.data]
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TrainingData[]> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }

    const startTime = startDate.getTime()
    const endTime = endDate.getTime()

    return this.data.filter((item) => {
      const itemTime = new Date(item.timestamp).getTime()
      return itemTime >= startTime && itemTime <= endTime
    })
  }

  async count(): Promise<number> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }
    return this.data.length
  }

  async clear(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized')
    }
    this.data = []
  }

  isInitialized(): boolean {
    return this.initialized
  }
}
