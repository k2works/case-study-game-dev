/**
 * 戦略設定アプリケーションサービス
 * 戦略の管理、保存、読み込み機能を提供
 */
import {
  DEFAULT_STRATEGIES,
  createStrategyConfig,
  isValidStrategyConfig,
  updateStrategyConfig,
} from '../../domain/models/ai/StrategyConfig'
import type {
  StrategyConfig,
  StrategyParameters,
} from '../../domain/models/ai/StrategyConfig'
import type { StrategyPort } from '../ports/StrategyPort'

/**
 * 戦略統計情報
 */
export interface StrategyStatistics {
  totalStrategies: number
  customStrategies: number
  defaultStrategies: number
  activeStrategy: StrategyConfig | null
  lastUsedStrategies: StrategyConfig[]
}

/**
 * 戦略作成リクエスト
 */
export interface CreateStrategyRequest {
  name: string
  description: string
  parameters: StrategyParameters
}

/**
 * 戦略更新リクエスト
 */
export interface UpdateStrategyRequest {
  name?: string
  description?: string
  parameters?: StrategyParameters
}

class StrategyService {
  private readonly strategyAdapter: StrategyPort

  constructor(strategyAdapter: StrategyPort) {
    this.strategyAdapter = strategyAdapter
  }

  /**
   * すべての戦略を取得する
   */
  async getAllStrategies(): Promise<StrategyConfig[]> {
    try {
      const strategies = await this.strategyAdapter.getAllStrategies()

      // デフォルト戦略がない場合は追加
      if (strategies.length === 0) {
        await this.initializeDefaultStrategies()
        return await this.strategyAdapter.getAllStrategies()
      }

      return strategies
    } catch (error) {
      console.error('Failed to get all strategies:', error)
      // エラー時はデフォルト戦略を返す
      return Object.values(DEFAULT_STRATEGIES)
    }
  }

  /**
   * IDで戦略を取得する
   */
  async getStrategyById(id: string): Promise<StrategyConfig | null> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid strategy ID')
      }

      return await this.strategyAdapter.getStrategyById(id)
    } catch (error) {
      console.error(`Failed to get strategy by ID ${id}:`, error)
      return null
    }
  }

  /**
   * カスタム戦略を作成する
   */
  async createCustomStrategy(
    request: CreateStrategyRequest,
  ): Promise<StrategyConfig> {
    try {
      if (!request.name || request.name.trim().length === 0) {
        throw new Error('Strategy name is required')
      }

      if (!request.description || request.description.trim().length === 0) {
        throw new Error('Strategy description is required')
      }

      const strategy = createStrategyConfig(
        request.name.trim(),
        'custom',
        request.description.trim(),
        request.parameters,
      )

      if (!isValidStrategyConfig(strategy)) {
        throw new Error('Invalid strategy configuration')
      }

      await this.strategyAdapter.saveStrategy(strategy)
      return strategy
    } catch (error) {
      console.error('Failed to create custom strategy:', error)
      throw error
    }
  }

  /**
   * 戦略を更新する
   */
  async updateStrategy(
    id: string,
    request: UpdateStrategyRequest,
  ): Promise<StrategyConfig> {
    try {
      const existingStrategy = await this.strategyAdapter.getStrategyById(id)
      if (!existingStrategy) {
        throw new Error(`Strategy with ID ${id} not found`)
      }

      if (existingStrategy.isDefault) {
        throw new Error('Cannot update default strategy')
      }

      const updatedStrategy = updateStrategyConfig(existingStrategy, request)

      if (!isValidStrategyConfig(updatedStrategy)) {
        throw new Error('Invalid strategy configuration')
      }

      await this.strategyAdapter.saveStrategy(updatedStrategy)
      return updatedStrategy
    } catch (error) {
      console.error(`Failed to update strategy ${id}:`, error)
      throw error
    }
  }

  /**
   * 戦略を削除する
   */
  async deleteStrategy(id: string): Promise<void> {
    try {
      const strategy = await this.strategyAdapter.getStrategyById(id)
      if (!strategy) {
        throw new Error(`Strategy with ID ${id} not found`)
      }

      if (strategy.isDefault) {
        throw new Error('Cannot delete default strategy')
      }

      // アクティブ戦略が削除される場合はデフォルトに戻す
      const activeStrategy = await this.strategyAdapter.getActiveStrategy()
      if (activeStrategy && activeStrategy.id === id) {
        await this.strategyAdapter.setActiveStrategy(
          DEFAULT_STRATEGIES.balanced.id,
        )
      }

      await this.strategyAdapter.deleteStrategy(id)
    } catch (error) {
      console.error(`Failed to delete strategy ${id}:`, error)
      throw error
    }
  }

  /**
   * アクティブな戦略を取得する
   */
  async getActiveStrategy(): Promise<StrategyConfig> {
    try {
      const activeStrategy = await this.strategyAdapter.getActiveStrategy()
      if (activeStrategy && isValidStrategyConfig(activeStrategy)) {
        return activeStrategy
      }

      // アクティブ戦略がない場合はバランス型をデフォルトとする
      await this.strategyAdapter.setActiveStrategy(
        DEFAULT_STRATEGIES.balanced.id,
      )
      return DEFAULT_STRATEGIES.balanced
    } catch (error) {
      console.error('Failed to get active strategy:', error)
      return DEFAULT_STRATEGIES.balanced
    }
  }

  /**
   * アクティブな戦略を設定する
   */
  async setActiveStrategy(strategyId: string): Promise<void> {
    try {
      const strategy = await this.strategyAdapter.getStrategyById(strategyId)
      if (!strategy) {
        throw new Error(`Strategy with ID ${strategyId} not found`)
      }

      await this.strategyAdapter.setActiveStrategy(strategyId)
    } catch (error) {
      console.error(`Failed to set active strategy ${strategyId}:`, error)
      throw error
    }
  }

  /**
   * デフォルト戦略を取得する
   */
  getDefaultStrategies(): StrategyConfig[] {
    return this.strategyAdapter.getDefaultStrategies()
  }

  /**
   * 戦略統計を取得する
   */
  async getStrategyStatistics(): Promise<StrategyStatistics> {
    try {
      const allStrategies = await this.getAllStrategies()
      const activeStrategy = await this.getActiveStrategy()

      const customStrategies = allStrategies.filter((s) => !s.isDefault)
      const defaultStrategies = allStrategies.filter((s) => s.isDefault)

      // 最近使用された戦略（上位5件）
      const lastUsedStrategies = allStrategies
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5)

      return {
        totalStrategies: allStrategies.length,
        customStrategies: customStrategies.length,
        defaultStrategies: defaultStrategies.length,
        activeStrategy,
        lastUsedStrategies,
      }
    } catch (error) {
      console.error('Failed to get strategy statistics:', error)
      return {
        totalStrategies: 0,
        customStrategies: 0,
        defaultStrategies: 0,
        activeStrategy: null,
        lastUsedStrategies: [],
      }
    }
  }

  /**
   * すべての戦略データをクリアする
   */
  async clearAllStrategies(): Promise<void> {
    try {
      await this.strategyAdapter.clearAllStrategies()
      await this.initializeDefaultStrategies()
    } catch (error) {
      console.error('Failed to clear all strategies:', error)
      throw error
    }
  }

  /**
   * デフォルト戦略を初期化する
   */
  private async initializeDefaultStrategies(): Promise<void> {
    try {
      const defaultStrategies = Object.values(DEFAULT_STRATEGIES)

      for (const strategy of defaultStrategies) {
        await this.strategyAdapter.saveStrategy(strategy)
      }

      // バランス型をデフォルトのアクティブ戦略として設定
      await this.strategyAdapter.setActiveStrategy(
        DEFAULT_STRATEGIES.balanced.id,
      )
    } catch (error) {
      console.error('Failed to initialize default strategies:', error)
      throw error
    }
  }
}

export { StrategyService }
