/**
 * 戦略設定ポート
 * 戦略の保存・読み込み・管理を行うためのインターフェース
 */
import type { StrategyConfig } from '../../domain/models/ai/StrategyConfig'

export interface StrategyPort {
  /**
   * すべての戦略設定を取得する
   */
  getAllStrategies(): Promise<StrategyConfig[]>

  /**
   * IDで戦略設定を取得する
   */
  getStrategyById(id: string): Promise<StrategyConfig | null>

  /**
   * 戦略設定を保存する
   */
  saveStrategy(strategy: StrategyConfig): Promise<void>

  /**
   * 戦略設定を削除する
   */
  deleteStrategy(id: string): Promise<void>

  /**
   * 現在のアクティブな戦略を取得する
   */
  getActiveStrategy(): Promise<StrategyConfig | null>

  /**
   * アクティブな戦略を設定する
   */
  setActiveStrategy(strategyId: string): Promise<void>

  /**
   * デフォルト戦略を取得する
   */
  getDefaultStrategies(): StrategyConfig[]

  /**
   * ストレージをクリアする
   */
  clearAllStrategies(): Promise<void>
}
