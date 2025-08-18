/**
 * useStrategyフックのテスト
 */
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DEFAULT_STRATEGIES } from '../../domain/models/ai/StrategyConfig'
import type { StrategyService } from '../../application/services/StrategyService'
import { useStrategy } from './useStrategy'

// モックStrategyService
class MockStrategyService {
  private strategies = Object.values(DEFAULT_STRATEGIES)
  private activeStrategy = DEFAULT_STRATEGIES.balanced

  async getAllStrategies() {
    return this.strategies
  }

  async getActiveStrategy() {
    return this.activeStrategy
  }

  async setActiveStrategy(strategyId: string) {
    const strategy = this.strategies.find(s => s.id === strategyId)
    if (strategy) {
      this.activeStrategy = strategy
    }
  }

  async createCustomStrategy(request: any) {
    const newStrategy = {
      id: `custom-${Date.now()}`,
      name: request.name,
      type: 'custom' as const,
      description: request.description,
      parameters: request.parameters,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.strategies.push(newStrategy)
    return newStrategy
  }

  async updateStrategy(id: string, request: any) {
    const index = this.strategies.findIndex(s => s.id === id)
    if (index >= 0) {
      this.strategies[index] = { ...this.strategies[index], ...request, updatedAt: new Date() }
      return this.strategies[index]
    }
    throw new Error('Strategy not found')
  }

  async deleteStrategy(id: string) {
    const index = this.strategies.findIndex(s => s.id === id)
    if (index >= 0) {
      this.strategies.splice(index, 1)
    }
  }
}

describe('useStrategy', () => {
  let mockStrategyService: MockStrategyService

  beforeEach(() => {
    mockStrategyService = new MockStrategyService()
  })

  test('初期状態で戦略一覧とアクティブ戦略を取得する', async () => {
    // Arrange
    const { result } = renderHook(() => useStrategy(mockStrategyService as unknown as StrategyService))

    // Act
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Assert
    expect(result.current.strategies).toHaveLength(3)
    expect(result.current.activeStrategy?.id).toBe(DEFAULT_STRATEGIES.balanced.id)
    expect(result.current.error).toBeNull()
  })

  test('アクティブ戦略を変更できる', async () => {
    // Arrange
    const { result } = renderHook(() => useStrategy(mockStrategyService as unknown as StrategyService))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Act
    await act(async () => {
      await result.current.setActiveStrategy(DEFAULT_STRATEGIES.aggressive.id)
    })

    // Assert
    expect(result.current.activeStrategy?.id).toBe(DEFAULT_STRATEGIES.aggressive.id)
  })

  test('カスタム戦略を作成できる', async () => {
    // Arrange
    const { result } = renderHook(() => useStrategy(mockStrategyService as unknown as StrategyService))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const request = {
      name: 'テスト戦略',
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
    await act(async () => {
      await result.current.createCustomStrategy(request)
    })

    // Assert
    expect(result.current.strategies).toHaveLength(4)
    expect(result.current.strategies.some(s => s.name === 'テスト戦略')).toBe(true)
  })

  test('戦略を更新できる', async () => {
    // Arrange
    const { result } = renderHook(() => useStrategy(mockStrategyService as unknown as StrategyService))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // 先にカスタム戦略を作成
    const createRequest = {
      name: 'テスト戦略',
      description: 'テスト用',
      parameters: {
        chainPriority: 50,
        speedPriority: 50,
        defensePriority: 50,
        riskTolerance: 50,
        heightControl: 50,
        centerPriority: 50,
      },
    }

    await act(async () => {
      await result.current.createCustomStrategy(createRequest)
    })

    const customStrategy = result.current.strategies.find(s => s.name === 'テスト戦略')!
    const updateRequest = {
      name: '更新されたテスト戦略',
    }

    // Act
    await act(async () => {
      await result.current.updateStrategy(customStrategy.id, updateRequest)
    })

    // Assert
    const updatedStrategy = result.current.strategies.find(s => s.id === customStrategy.id)
    expect(updatedStrategy?.name).toBe('更新されたテスト戦略')
  })

  test('戦略を削除できる', async () => {
    // Arrange
    const { result } = renderHook(() => useStrategy(mockStrategyService as unknown as StrategyService))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // 先にカスタム戦略を作成
    const createRequest = {
      name: 'テスト戦略',
      description: 'テスト用',
      parameters: {
        chainPriority: 50,
        speedPriority: 50,
        defensePriority: 50,
        riskTolerance: 50,
        heightControl: 50,
        centerPriority: 50,
      },
    }

    await act(async () => {
      await result.current.createCustomStrategy(createRequest)
    })

    const customStrategy = result.current.strategies.find(s => s.name === 'テスト戦略')!

    // Act
    await act(async () => {
      await result.current.deleteStrategy(customStrategy.id)
    })

    // Assert
    expect(result.current.strategies.find(s => s.id === customStrategy.id)).toBeUndefined()
  })

  test('エラー処理が正しく動作する', async () => {
    // Arrange
    const errorService = {
      ...mockStrategyService,
      getAllStrategies: vi.fn().mockRejectedValue(new Error('Network error')),
    } as unknown as StrategyService

    const { result } = renderHook(() => useStrategy(errorService))

    // Act & Assert
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.isLoading).toBe(false)
    })
  })

  test('ローディング状態が正しく管理される', () => {
    // Arrange & Act
    const { result } = renderHook(() => useStrategy(mockStrategyService as unknown as StrategyService))

    // Assert
    expect(result.current.isLoading).toBe(true)
  })
})