import type { StoragePort } from '../../application/ports/StoragePort'

/**
 * ブラウザのLocalStorageを使用したストレージアダプター
 * StoragePortインターフェースの具体実装
 */
export class LocalStorageAdapter implements StoragePort {
  private readonly keyPrefix = 'puyo-game:'

  async save<T>(key: string, data: T): Promise<boolean> {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0.0',
      })
      localStorage.setItem(this.keyPrefix + key, serializedData)
      return true
    } catch (error) {
      console.warn(`Failed to save data for key: ${key}`, error)
      return false
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.keyPrefix + key)
      if (!item) {
        return null
      }

      const parsed = JSON.parse(item)

      // バージョン互換性チェック（将来の拡張用）
      if (!this.isCompatibleVersion(parsed.version)) {
        console.warn(`Incompatible data version for key: ${key}`)
        return null
      }

      return parsed.data as T
    } catch (error) {
      console.warn(`Failed to load data for key: ${key}`, error)
      return null
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.keyPrefix + key)
      return true
    } catch (error) {
      console.warn(`Failed to remove data for key: ${key}`, error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return localStorage.getItem(this.keyPrefix + key) !== null
    } catch (error) {
      console.warn(`Failed to check existence for key: ${key}`, error)
      return false
    }
  }

  async clear(): Promise<boolean> {
    try {
      const keysToRemove: string[] = []

      // プレフィックスに一致するキーのみを削除
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.keyPrefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.warn('Failed to clear storage', error)
      return false
    }
  }

  async getUsage(): Promise<number | null> {
    try {
      let totalSize = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.keyPrefix)) {
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += key.length + value.length
          }
        }
      }

      // 文字列サイズをバイト単位に変換（UTF-16では1文字2バイト）
      return totalSize * 2
    } catch (error) {
      console.warn('Failed to calculate storage usage', error)
      return null
    }
  }

  /**
   * データバージョンの互換性チェック
   * @param version チェック対象のバージョン
   * @returns 互換性がある場合true
   */
  private isCompatibleVersion(version: string): boolean {
    // 現在は1.0.0のみサポート
    // 将来的にはバージョン互換性ロジックを実装
    return version === '1.0.0'
  }

  /**
   * ストレージの可用性をチェック
   * @returns LocalStorageが利用可能な場合true
   */
  static isAvailable(): boolean {
    try {
      const testKey = 'localStorage-test'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }
}
