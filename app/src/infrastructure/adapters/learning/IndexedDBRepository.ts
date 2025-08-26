import type { TrainingDataRepositoryPort } from '../../../application/services/learning/DataCollectionService'
import type { TrainingData } from '../../../domain/models/training/TrainingData'

/**
 * IndexedDBを使用したTrainingDataリポジトリの実装
 */
export class IndexedDBTrainingDataRepository
  implements TrainingDataRepositoryPort
{
  private db: IDBDatabase | null = null
  private readonly dbName = 'PuyoTrainingData'
  private readonly dbVersion = 1
  private readonly storeName = 'training_data'

  /**
   * データベースを初期化
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment'))
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // オブジェクトストアが存在しない場合は作成
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: false,
          })

          // タイムスタンプでのインデックスを作成（日付範囲検索用）
          store.createIndex('timestamp', 'timestamp', { unique: false })

          // ゲームIDでのインデックスを作成（ゲーム別検索用）
          store.createIndex('gameId', 'metadata.gameId', { unique: false })

          // プレイヤーIDでのインデックスを作成（プレイヤー別検索用）
          store.createIndex('playerId', 'metadata.playerId', { unique: false })
        }
      }
    })
  }

  /**
   * 学習データを保存
   */
  async save(data: TrainingData): Promise<void> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)

        // タイムスタンプを数値として保存（検索効率向上のため）
        const dataToStore = {
          ...data,
          timestampNumber: data.timestamp.getTime(),
        }

        const request = store.add(dataToStore)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error('Failed to save training data'))
        }
      } catch (error) {
        reject(
          new Error(
            `Failed to save training data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ),
        )
      }
    })
  }

  /**
   * 全ての学習データを取得
   */
  async findAll(): Promise<TrainingData[]> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          const results = request.result.map(this.convertFromStorage)
          resolve(results)
        }

        request.onerror = () => {
          reject(new Error('Failed to retrieve training data'))
        }
      } catch {
        reject(new Error('Failed to retrieve training data'))
      }
    })
  }

  /**
   * 日付範囲で学習データを取得
   */
  async findByDateRange(start: Date, end: Date): Promise<TrainingData[]> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const index = store.index('timestamp')

        const range = IDBKeyRange.bound(
          start.getTime(),
          end.getTime(),
          false,
          false,
        )

        const request = index.getAll(range)

        request.onsuccess = () => {
          const results = request.result.map(this.convertFromStorage)
          resolve(results)
        }

        request.onerror = () => {
          reject(new Error('Failed to retrieve training data by date range'))
        }
      } catch {
        reject(new Error('Failed to retrieve training data by date range'))
      }
    })
  }

  /**
   * 学習データの件数を取得
   */
  async count(): Promise<number> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const request = store.count()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(new Error('Failed to count training data'))
        }
      } catch {
        reject(new Error('Failed to count training data'))
      }
    })
  }

  /**
   * 全ての学習データを削除
   */
  async clear(): Promise<void> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.clear()

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(new Error('Failed to clear training data'))
        }
      } catch {
        reject(new Error('Failed to clear training data'))
      }
    })
  }

  /**
   * 特定のゲームIDに関連するデータを取得
   */
  async findByGameId(gameId: string): Promise<TrainingData[]> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const index = store.index('gameId')
        const request = index.getAll(gameId)

        request.onsuccess = () => {
          const results = request.result.map(this.convertFromStorage)
          resolve(results)
        }

        request.onerror = () => {
          reject(new Error('Failed to retrieve training data by game ID'))
        }
      } catch {
        reject(new Error('Failed to retrieve training data by game ID'))
      }
    })
  }

  /**
   * 特定のプレイヤーIDに関連するデータを取得
   */
  async findByPlayerId(playerId: string): Promise<TrainingData[]> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const index = store.index('playerId')
        const request = index.getAll(playerId)

        request.onsuccess = () => {
          const results = request.result.map(this.convertFromStorage)
          resolve(results)
        }

        request.onerror = () => {
          reject(new Error('Failed to retrieve training data by player ID'))
        }
      } catch {
        reject(new Error('Failed to retrieve training data by player ID'))
      }
    })
  }

  /**
   * 古いデータを削除（ストレージクリーンアップ用）
   */
  async deleteOldData(cutoffDate: Date): Promise<number> {
    this.ensureInitialized()

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const index = store.index('timestamp')

        const range = IDBKeyRange.upperBound(cutoffDate.getTime(), false)
        let deletedCount = 0

        const request = index.openCursor(range)

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            deletedCount++
            cursor.continue()
          } else {
            resolve(deletedCount)
          }
        }

        request.onerror = () => {
          reject(new Error('Failed to delete old training data'))
        }
      } catch (error) {
        reject(
          new Error(
            `Failed to delete old training data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ),
        )
      }
    })
  }

  /**
   * データベースが初期化されているかチェック
   */
  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
  }

  /**
   * ストレージからTrainingDataオブジェクトに変換
   */
  private convertFromStorage(stored: {
    id: string
    timestamp: string | Date
    gameState: unknown
    action: unknown
    reward: number
    metadata: unknown
  }): TrainingData {
    return {
      id: stored.id,
      timestamp: new Date(stored.timestamp),
      gameState: stored.gameState as TrainingData['gameState'],
      action: stored.action as TrainingData['action'],
      reward: stored.reward,
      metadata: stored.metadata as TrainingData['metadata'],
    }
  }

  /**
   * データベース接続を閉じる
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * データベースの統計情報を取得
   */
  async getStorageStats(): Promise<{
    totalRecords: number
    storageUsed: number // 推定値（バイト単位）
    oldestRecord: Date | null
    newestRecord: Date | null
  }> {
    this.ensureInitialized()

    const totalRecords = await this.count()
    const allData = await this.findAll()

    if (allData.length === 0) {
      return {
        totalRecords: 0,
        storageUsed: 0,
        oldestRecord: null,
        newestRecord: null,
      }
    }

    // ストレージ使用量の推定（JSON文字列化したサイズ）
    const sampleSize = Math.min(100, allData.length)
    const sampleData = allData.slice(0, sampleSize)
    const averageRecordSize =
      sampleData.reduce(
        (sum, record) => sum + JSON.stringify(record).length,
        0,
      ) / sampleSize
    const estimatedStorageUsed = Math.round(totalRecords * averageRecordSize)

    // 最古・最新レコードの日付
    const timestamps = allData.map((record) => record.timestamp.getTime())
    const oldestRecord = new Date(Math.min(...timestamps))
    const newestRecord = new Date(Math.max(...timestamps))

    return {
      totalRecords,
      storageUsed: estimatedStorageUsed,
      oldestRecord,
      newestRecord,
    }
  }
}
