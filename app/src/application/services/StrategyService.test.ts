/**
 * StrategyServiceのテスト
 */
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DEFAULT_STRATEGIES, type StrategyConfig } from '../../domain/models/ai/StrategyConfig'
import type { StrategyPort } from '../ports/StrategyPort'
import { StrategyService, type CreateStrategyRequest, type UpdateStrategyRequest } from './StrategyService'

// モックアダプター
class MockStrategyAdapter implements StrategyPort {
  private strategies: Map<string, StrategyConfig> = new Map()
  private activeStrategyId: string | null = null

  async getAllStrategies(): Promise<StrategyConfig[]> {
    return Array.from(this.strategies.values())
  }

  async getStrategyById(id: string): Promise<StrategyConfig | null> {
    return this.strategies.get(id) || null
  }

  async saveStrategy(strategy: StrategyConfig): Promise<void> {
    this.strategies.set(strategy.id, strategy)
  }

  async deleteStrategy(id: string): Promise<void> {
    this.strategies.delete(id)
  }

  async getActiveStrategy(): Promise<StrategyConfig | null> {
    if (!this.activeStrategyId) return null
    return this.strategies.get(this.activeStrategyId) || null
  }

  async setActiveStrategy(strategyId: string): Promise<void> {
    this.activeStrategyId = strategyId
  }

  getDefaultStrategies(): StrategyConfig[] {
    return Object.values(DEFAULT_STRATEGIES)
  }

  async clearAllStrategies(): Promise<void> {
    this.strategies.clear()
    this.activeStrategyId = null
  }

  // テスト用のヘルパーメソッド
  addStrategy(strategy: StrategyConfig): void {
    this.strategies.set(strategy.id, strategy)
  }
}

describe('StrategyService', () => {
  let mockAdapter: MockStrategyAdapter
  let strategyService: StrategyService

  beforeEach(() => {
    mockAdapter = new MockStrategyAdapter()
    strategyService = new StrategyService(mockAdapter)
  })

  describe('getAllStrategies', () => {
    test('戦略が存在しない場合はデフォルト戦略を初期化する', async () => {
      // Arrange
      // 空の状態

      // Act
      const result = await strategyService.getAllStrategies()

      // Assert
      expect(result).toHaveLength(3) // 3つのデフォルト戦略
      expect(result.every(s => s.isDefault)).toBe(true)
    })

    test('既存の戦略がある場合はそれらを返す', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.balanced
      mockAdapter.addStrategy(testStrategy)

      // Act
      const result = await strategyService.getAllStrategies()

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(testStrategy)
    })
  })

  describe('getStrategyById', () => {
    test('有効なIDで戦略を取得できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.aggressive
      mockAdapter.addStrategy(testStrategy)

      // Act
      const result = await strategyService.getStrategyById(testStrategy.id)

      // Assert
      expect(result).toEqual(testStrategy)
    })

    test('存在しないIDの場合はnullを返す', async () => {
      // Act
      const result = await strategyService.getStrategyById('non-existent-id')

      // Assert
      expect(result).toBeNull()
    })

    test('無効なIDの場合はnullを返す', async () => {
      // Act
      const result1 = await strategyService.getStrategyById('')
      const result2 = await strategyService.getStrategyById(null as any)

      // Assert
      expect(result1).toBeNull()
      expect(result2).toBeNull()
    })
  })

  describe('createCustomStrategy', () => {
    test('有効なリクエストでカスタム戦略を作成できる', async () => {
      // Arrange
      const request: CreateStrategyRequest = {
        name: 'カスタム戦略',
        description: 'テスト用のカスタム戦略',
        parameters: {
          chainPriority: 70,
          speedPriority: 50,
          defensePriority: 80,
          riskTolerance: 40,
          heightControl: 60,
          centerPriority: 55,
        },
      }

      // Act
      const result = await strategyService.createCustomStrategy(request)

      // Assert
      expect(result.name).toBe(request.name)
      expect(result.description).toBe(request.description)
      expect(result.parameters).toEqual(request.parameters)
      expect(result.type).toBe('custom')
      expect(result.isDefault).toBe(false)
    })

    test('名前が空の場合はエラーを投げる', async () => {
      // Arrange
      const request: CreateStrategyRequest = {
        name: '',
        description: 'テスト',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
      }

      // Act & Assert
      await expect(strategyService.createCustomStrategy(request)).rejects.toThrow('Strategy name is required')
    })

    test('説明が空の場合はエラーを投げる', async () => {
      // Arrange
      const request: CreateStrategyRequest = {
        name: 'テスト戦略',
        description: '',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
      }

      // Act & Assert
      await expect(strategyService.createCustomStrategy(request)).rejects.toThrow('Strategy description is required')
    })
  })

  describe('updateStrategy', () => {
    test('カスタム戦略を更新できる', async () => {
      // Arrange
      const originalStrategy: StrategyConfig = {
        id: 'custom-strategy-1',
        name: '元の戦略',
        type: 'custom',
        description: '元の説明',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
        isDefault: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      }
      mockAdapter.addStrategy(originalStrategy)

      const updateRequest: UpdateStrategyRequest = {
        name: '更新された戦略',
        parameters: {
          chainPriority: 80,
          speedPriority: 40,
          defensePriority: 60,
          riskTolerance: 70,
          heightControl: 30,
          centerPriority: 90,
        },
      }

      // Act
      const result = await strategyService.updateStrategy(originalStrategy.id, updateRequest)

      // Assert
      expect(result.name).toBe(updateRequest.name)
      expect(result.parameters).toEqual(updateRequest.parameters)
      expect(result.description).toBe(originalStrategy.description) // 未更新
    })

    test('存在しない戦略の更新はエラーを投げる', async () => {
      // Arrange
      const updateRequest: UpdateStrategyRequest = {
        name: '更新された戦略',
      }

      // Act & Assert
      await expect(strategyService.updateStrategy('non-existent-id', updateRequest)).rejects.toThrow('not found')
    })

    test('デフォルト戦略の更新はエラーを投げる', async () => {
      // Arrange
      const defaultStrategy = DEFAULT_STRATEGIES.balanced
      mockAdapter.addStrategy(defaultStrategy)

      const updateRequest: UpdateStrategyRequest = {
        name: '更新しようとした名前',
      }

      // Act & Assert
      await expect(strategyService.updateStrategy(defaultStrategy.id, updateRequest)).rejects.toThrow('Cannot update default strategy')
    })
  })

  describe('deleteStrategy', () => {
    test('カスタム戦略を削除できる', async () => {
      // Arrange
      const customStrategy: StrategyConfig = {
        id: 'custom-strategy-1',
        name: 'カスタム戦略',
        type: 'custom',
        description: 'テスト用',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockAdapter.addStrategy(customStrategy)

      // Act
      await strategyService.deleteStrategy(customStrategy.id)

      // Assert
      const result = await mockAdapter.getStrategyById(customStrategy.id)
      expect(result).toBeNull()
    })

    test('存在しない戦略の削除はエラーを投げる', async () => {
      // Act & Assert
      await expect(strategyService.deleteStrategy('non-existent-id')).rejects.toThrow('not found')
    })

    test('デフォルト戦略の削除はエラーを投げる', async () => {
      // Arrange
      const defaultStrategy = DEFAULT_STRATEGIES.aggressive
      mockAdapter.addStrategy(defaultStrategy)

      // Act & Assert
      await expect(strategyService.deleteStrategy(defaultStrategy.id)).rejects.toThrow('Cannot delete default strategy')
    })

    test('アクティブ戦略が削除される場合はバランス型に戻る', async () => {
      // Arrange
      const customStrategy: StrategyConfig = {
        id: 'custom-strategy-active',
        name: 'アクティブなカスタム戦略',
        type: 'custom',
        description: 'テスト用',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockAdapter.addStrategy(customStrategy)
      mockAdapter.addStrategy(DEFAULT_STRATEGIES.balanced)
      await mockAdapter.setActiveStrategy(customStrategy.id)

      // Act
      await strategyService.deleteStrategy(customStrategy.id)

      // Assert
      const activeStrategy = await mockAdapter.getActiveStrategy()
      expect(activeStrategy?.id).toBe(DEFAULT_STRATEGIES.balanced.id)
    })
  })

  describe('getActiveStrategy', () => {
    test('設定されたアクティブ戦略を取得できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.aggressive
      mockAdapter.addStrategy(testStrategy)
      await mockAdapter.setActiveStrategy(testStrategy.id)

      // Act
      const result = await strategyService.getActiveStrategy()

      // Assert
      expect(result).toEqual(testStrategy)
    })

    test('アクティブ戦略が設定されていない場合はバランス型を返す', async () => {
      // Act
      const result = await strategyService.getActiveStrategy()

      // Assert
      expect(result.id).toBe(DEFAULT_STRATEGIES.balanced.id)
    })
  })

  describe('setActiveStrategy', () => {
    test('有効な戦略をアクティブに設定できる', async () => {
      // Arrange
      const testStrategy = DEFAULT_STRATEGIES.defensive
      mockAdapter.addStrategy(testStrategy)

      // Act
      await strategyService.setActiveStrategy(testStrategy.id)

      // Assert
      const activeStrategy = await mockAdapter.getActiveStrategy()
      expect(activeStrategy).toEqual(testStrategy)
    })

    test('存在しない戦略をアクティブに設定しようとするとエラーを投げる', async () => {
      // Act & Assert
      await expect(strategyService.setActiveStrategy('non-existent-id')).rejects.toThrow('not found')
    })
  })

  describe('getStrategyStatistics', () => {
    test('戦略統計を正しく計算する', async () => {
      // Arrange
      const customStrategy: StrategyConfig = {
        id: 'custom-1',
        name: 'カスタム',
        type: 'custom',
        description: 'テスト',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockAdapter.addStrategy(DEFAULT_STRATEGIES.balanced)
      mockAdapter.addStrategy(DEFAULT_STRATEGIES.aggressive)
      mockAdapter.addStrategy(customStrategy)
      await mockAdapter.setActiveStrategy(DEFAULT_STRATEGIES.balanced.id)

      // Act
      const result = await strategyService.getStrategyStatistics()

      // Assert
      expect(result.totalStrategies).toBe(3)
      expect(result.customStrategies).toBe(1)
      expect(result.defaultStrategies).toBe(2)
      expect(result.activeStrategy?.id).toBe(DEFAULT_STRATEGIES.balanced.id)
      expect(result.lastUsedStrategies).toHaveLength(3)
    })
  })

  describe('clearAllStrategies', () => {
    test('すべての戦略をクリアしてデフォルト戦略を再初期化する', async () => {
      // Arrange
      const customStrategy: StrategyConfig = {
        id: 'custom-1',
        name: 'カスタム',
        type: 'custom',
        description: 'テスト',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockAdapter.addStrategy(customStrategy)

      // Act
      await strategyService.clearAllStrategies()

      // Assert
      const allStrategies = await mockAdapter.getAllStrategies()
      expect(allStrategies).toHaveLength(3) // デフォルト戦略のみ
      expect(allStrategies.every(s => s.isDefault)).toBe(true)
      
      const activeStrategy = await mockAdapter.getActiveStrategy()
      expect(activeStrategy?.id).toBe(DEFAULT_STRATEGIES.balanced.id)
    })
  })
})