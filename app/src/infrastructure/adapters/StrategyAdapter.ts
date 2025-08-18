/**
 * 戦略設定インフラストラクチャアダプター
 * ローカルストレージを使用して戦略設定の永続化を行う
 */
import type { StoragePort } from '../../application/ports/StoragePort'
import type { StrategyPort } from '../../application/ports/StrategyPort'
import { DEFAULT_STRATEGIES } from '../../domain/models/ai/StrategyConfig'
import type { StrategyConfig, StrategyParameters, StrategyType } from '../../domain/models/ai/StrategyConfig'

/**
 * シリアライズされた戦略設定の型
 */
interface StrategyConfigSerialized {
  id: string
  name: string
  type: StrategyType
  description: string
  parameters: StrategyParameters
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 戦略設定アダプター
 */
class StrategyAdapter implements StrategyPort {
  private static readonly STRATEGIES_KEY = 'ai-strategies'
  private static readonly ACTIVE_STRATEGY_KEY = 'active-ai-strategy'
  private readonly storageAdapter: StoragePort

  constructor(storageAdapter: StoragePort) {
    this.storageAdapter = storageAdapter
  }

  /**
   * すべての戦略設定を取得する
   */
  async getAllStrategies(): Promise<StrategyConfig[]> {
    try {
      const stored = await this.storageAdapter.load<StrategyConfig[]>(
        StrategyAdapter.STRATEGIES_KEY,
      )

      if (!stored || !Array.isArray(stored)) {
        return []
      }

      // 日付文字列をDateオブジェクトに変換
      return stored.map((item) => this.deserializeStrategy(item as unknown as StrategyConfigSerialized))
    } catch (error) {
      console.error('Failed to load strategies from storage:', error)
      return []
    }
  }

  /**
   * IDで戦略設定を取得する
   */
  async getStrategyById(id: string): Promise<StrategyConfig | null> {
    try {
      const strategies = await this.getAllStrategies()
      return strategies.find((strategy) => strategy.id === id) || null
    } catch (error) {
      console.error(`Failed to get strategy by ID ${id}:`, error)
      return null
    }
  }

  /**
   * 戦略設定を保存する
   */
  async saveStrategy(strategy: StrategyConfig): Promise<void> {
    try {
      const strategies = await this.getAllStrategies()
      const existingIndex = strategies.findIndex((s) => s.id === strategy.id)

      if (existingIndex >= 0) {
        // 既存の戦略を更新
        strategies[existingIndex] = strategy
      } else {
        // 新しい戦略を追加
        strategies.push(strategy)
      }

      // シリアライズして保存
      const serialized = strategies.map(this.serializeStrategy)
      await this.storageAdapter.save(StrategyAdapter.STRATEGIES_KEY, serialized)
    } catch (error) {
      console.error('Failed to save strategy:', error)
      throw error
    }
  }

  /**
   * 戦略設定を削除する
   */
  async deleteStrategy(id: string): Promise<void> {
    try {
      const strategies = await this.getAllStrategies()
      const filteredStrategies = strategies.filter(
        (strategy) => strategy.id !== id,
      )

      // シリアライズして保存
      const serialized = filteredStrategies.map(this.serializeStrategy)
      await this.storageAdapter.save(StrategyAdapter.STRATEGIES_KEY, serialized)
    } catch (error) {
      console.error(`Failed to delete strategy ${id}:`, error)
      throw error
    }
  }

  /**
   * 現在のアクティブな戦略を取得する
   */
  async getActiveStrategy(): Promise<StrategyConfig | null> {
    try {
      const activeStrategyId = await this.storageAdapter.load<string>(
        StrategyAdapter.ACTIVE_STRATEGY_KEY,
      )

      if (!activeStrategyId) {
        return null
      }

      return await this.getStrategyById(activeStrategyId)
    } catch (error) {
      console.error('Failed to get active strategy:', error)
      return null
    }
  }

  /**
   * アクティブな戦略を設定する
   */
  async setActiveStrategy(strategyId: string): Promise<void> {
    try {
      await this.storageAdapter.save(
        StrategyAdapter.ACTIVE_STRATEGY_KEY,
        strategyId,
      )
    } catch (error) {
      console.error(`Failed to set active strategy ${strategyId}:`, error)
      throw error
    }
  }

  /**
   * デフォルト戦略を取得する
   */
  getDefaultStrategies(): StrategyConfig[] {
    return Object.values(DEFAULT_STRATEGIES)
  }

  /**
   * ストレージをクリアする
   */
  async clearAllStrategies(): Promise<void> {
    try {
      await this.storageAdapter.save(StrategyAdapter.STRATEGIES_KEY, [])
      await this.storageAdapter.save(StrategyAdapter.ACTIVE_STRATEGY_KEY, null)
    } catch (error) {
      console.error('Failed to clear all strategies:', error)
      throw error
    }
  }

  /**
   * 戦略をシリアライズする（日付をISO文字列に変換）
   */
  private serializeStrategy(strategy: StrategyConfig): StrategyConfigSerialized {
    return {
      ...strategy,
      createdAt: strategy.createdAt.toISOString(),
      updatedAt: strategy.updatedAt.toISOString(),
    }
  }

  /**
   * 戦略をデシリアライズする（ISO文字列を日付に変換）
   */
  private deserializeStrategy(serialized: StrategyConfigSerialized): StrategyConfig {
    return {
      ...serialized,
      createdAt: new Date(serialized.createdAt),
      updatedAt: new Date(serialized.updatedAt),
    }
  }
}

export { StrategyAdapter }
