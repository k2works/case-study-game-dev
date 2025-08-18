/**
 * StrategyAdapterのテスト
 */
import { beforeEach, describe, expect, test } from 'vitest'

import type { StoragePort } from '../../application/ports/StoragePort'
import {
  DEFAULT_STRATEGIES,
  type StrategyConfig,
} from '../../domain/models/ai/StrategyConfig'
import { StrategyAdapter } from './StrategyAdapter'

// モックストレージアダプター
class MockStorageAdapter implements StoragePort {
  private storage: Map<string, unknown> = new Map()

  async save<T>(key: string, value: T): Promise<boolean> {
    this.storage.set(key, value)
    return true
  }

  async load<T>(key: string): Promise<T | null> {
    const value = this.storage.get(key)
    return value ? (value as T) : null
  }

  async remove(key: string): Promise<boolean> {
    return this.storage.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key)
  }

  async getUsage(): Promise<number | null> {
    return 0
  }

  async clear(): Promise<boolean> {
    this.storage.clear()
    return true
  }

  // テスト用のヘルパーメソッド
  clearSync(): void {
    this.storage.clear()
  }

  has(key: string): boolean {
    return this.storage.has(key)
  }
}

describe('StrategyAdapter', () => {
  let mockStorage: MockStorageAdapter
  let strategyAdapter: StrategyAdapter

  beforeEach(() => {
    mockStorage = new MockStorageAdapter()
    strategyAdapter = new StrategyAdapter(mockStorage)
  })

  describe('getAllStrategies', () => {
    test('ストレージが空の場合は空の配列を返す', async () => {
      // Act
      const result = await strategyAdapter.getAllStrategies()

      // Assert
      expect(result).toEqual([])
    })

    test('保存された戦略を正しく読み込む', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.balanced
      const serialized = [
        {
          ...testStrategy,
          createdAt: testStrategy.createdAt.toISOString(),
          updatedAt: testStrategy.updatedAt.toISOString(),
        },
      ]
      mockStorage.save('ai-strategies', serialized)

      // Act
      const result = await strategyAdapter.getAllStrategies()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(testStrategy.id)
      expect(result[0].name).toBe(testStrategy.name)
      expect(result[0].createdAt).toBeInstanceOf(Date)
      expect(result[0].updatedAt).toBeInstanceOf(Date)
    })

    test('無効なデータが保存されている場合は空の配列を返す', async () => {
      // Arrange
      mockStorage.save('ai-strategies', 'invalid-data')

      // Act
      const result = await strategyAdapter.getAllStrategies()

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('getStrategyById', () => {
    test('存在する戦略を取得できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.aggressive
      await strategyAdapter.saveStrategy(testStrategy)

      // Act
      const result = await strategyAdapter.getStrategyById(testStrategy.id)

      // Assert
      expect(result).toEqual(testStrategy)
    })

    test('存在しない戦略の場合はnullを返す', async () => {
      // Act
      const result = await strategyAdapter.getStrategyById('non-existent-id')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('saveStrategy', () => {
    test('新しい戦略を保存できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.defensive

      // Act
      await strategyAdapter.saveStrategy(testStrategy)

      // Assert
      const saved = await strategyAdapter.getStrategyById(testStrategy.id)
      expect(saved).toEqual(testStrategy)
    })

    test('既存の戦略を更新できる', async () => {
      // Arrange
      const originalStrategy = DEFAULT_STRATEGIES.balanced
      await strategyAdapter.saveStrategy(originalStrategy)

      const updatedStrategy: StrategyConfig = {
        ...originalStrategy,
        name: '更新されたバランス型',
        updatedAt: new Date(),
      }

      // Act
      await strategyAdapter.saveStrategy(updatedStrategy)

      // Assert
      const strategies = await strategyAdapter.getAllStrategies()
      expect(strategies).toHaveLength(1)
      expect(strategies[0].name).toBe('更新されたバランス型')
    })

    test('複数の戦略を保存できる', async () => {
      // Arrange
      const strategy1 = DEFAULT_STRATEGIES.aggressive
      const strategy2 = DEFAULT_STRATEGIES.defensive

      // Act
      await strategyAdapter.saveStrategy(strategy1)
      await strategyAdapter.saveStrategy(strategy2)

      // Assert
      const strategies = await strategyAdapter.getAllStrategies()
      expect(strategies).toHaveLength(2)
      expect(strategies.map((s) => s.id)).toContain(strategy1.id)
      expect(strategies.map((s) => s.id)).toContain(strategy2.id)
    })
  })

  describe('deleteStrategy', () => {
    test('存在する戦略を削除できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.balanced
      await strategyAdapter.saveStrategy(testStrategy)

      // Act
      await strategyAdapter.deleteStrategy(testStrategy.id)

      // Assert
      const result = await strategyAdapter.getStrategyById(testStrategy.id)
      expect(result).toBeNull()
    })

    test('存在しない戦略を削除しようとしてもエラーにならない', async () => {
      // Act & Assert
      await expect(
        strategyAdapter.deleteStrategy('non-existent-id'),
      ).resolves.not.toThrow()
    })

    test('複数の戦略から特定の戦略のみを削除できる', async () => {
      // Arrange
      const strategy1 = DEFAULT_STRATEGIES.aggressive
      const strategy2 = DEFAULT_STRATEGIES.defensive
      await strategyAdapter.saveStrategy(strategy1)
      await strategyAdapter.saveStrategy(strategy2)

      // Act
      await strategyAdapter.deleteStrategy(strategy1.id)

      // Assert
      const remaining = await strategyAdapter.getAllStrategies()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(strategy2.id)
    })
  })

  describe('getActiveStrategy', () => {
    test('設定されたアクティブ戦略を取得できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.balanced
      await strategyAdapter.saveStrategy(testStrategy)
      await strategyAdapter.setActiveStrategy(testStrategy.id)

      // Act
      const result = await strategyAdapter.getActiveStrategy()

      // Assert
      expect(result).toEqual(testStrategy)
    })

    test('アクティブ戦略が設定されていない場合はnullを返す', async () => {
      // Act
      const result = await strategyAdapter.getActiveStrategy()

      // Assert
      expect(result).toBeNull()
    })

    test('存在しない戦略がアクティブに設定されている場合はnullを返す', async () => {
      // Arrange
      await strategyAdapter.setActiveStrategy('non-existent-id')

      // Act
      const result = await strategyAdapter.getActiveStrategy()

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('setActiveStrategy', () => {
    test('アクティブ戦略を設定できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.aggressive
      await strategyAdapter.saveStrategy(testStrategy)

      // Act
      await strategyAdapter.setActiveStrategy(testStrategy.id)

      // Assert
      const activeStrategy = await strategyAdapter.getActiveStrategy()
      expect(activeStrategy?.id).toBe(testStrategy.id)
    })

    test('アクティブ戦略を変更できる', async () => {
      // Arrange
      const strategy1 = DEFAULT_STRATEGIES.aggressive
      const strategy2 = DEFAULT_STRATEGIES.defensive
      await strategyAdapter.saveStrategy(strategy1)
      await strategyAdapter.saveStrategy(strategy2)
      await strategyAdapter.setActiveStrategy(strategy1.id)

      // Act
      await strategyAdapter.setActiveStrategy(strategy2.id)

      // Assert
      const activeStrategy = await strategyAdapter.getActiveStrategy()
      expect(activeStrategy?.id).toBe(strategy2.id)
    })
  })

  describe('getDefaultStrategies', () => {
    test('すべてのデフォルト戦略を返す', () => {
      // Act
      const result = strategyAdapter.getDefaultStrategies()

      // Assert
      expect(result).toHaveLength(3)
      expect(result.map((s) => s.type)).toEqual([
        'aggressive',
        'defensive',
        'balanced',
      ])
      expect(result.every((s) => s.isDefault)).toBe(true)
    })
  })

  describe('clearAllStrategies', () => {
    test('すべての戦略とアクティブ設定をクリアする', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.balanced
      await strategyAdapter.saveStrategy(testStrategy)
      await strategyAdapter.setActiveStrategy(testStrategy.id)

      // Act
      await strategyAdapter.clearAllStrategies()

      // Assert
      const strategies = await strategyAdapter.getAllStrategies()
      const activeStrategy = await strategyAdapter.getActiveStrategy()
      expect(strategies).toHaveLength(0)
      expect(activeStrategy).toBeNull()
    })
  })

  describe('シリアライゼーション', () => {
    test('日付オブジェクトが正しくシリアライズ・デシリアライズされる', async () => {
      // Arrange
      const originalDate = new Date('2025-01-15T10:30:00Z')
      const testStrategy: StrategyConfig = {
        ...DEFAULT_STRATEGIES.balanced,
        id: 'test-serialize',
        createdAt: originalDate,
        updatedAt: originalDate,
      }

      // Act
      await strategyAdapter.saveStrategy(testStrategy)
      const retrieved = await strategyAdapter.getStrategyById(testStrategy.id)

      // Assert
      expect(retrieved).not.toBeNull()
      expect(retrieved!.createdAt).toBeInstanceOf(Date)
      expect(retrieved!.updatedAt).toBeInstanceOf(Date)
      expect(retrieved!.createdAt.toISOString()).toBe(
        originalDate.toISOString(),
      )
      expect(retrieved!.updatedAt.toISOString()).toBe(
        originalDate.toISOString(),
      )
    })
  })
})
