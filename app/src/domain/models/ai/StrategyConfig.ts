/**
 * AI戦略設定ドメインモデル
 * 戦略の設定、保存、管理を行う
 */

/**
 * 戦略の種類
 */
export type StrategyType = 'aggressive' | 'defensive' | 'balanced' | 'custom'

/**
 * AI戦略設定
 */
export interface StrategyConfig {
  readonly id: string
  readonly name: string
  readonly type: StrategyType
  readonly description: string
  readonly parameters: StrategyParameters
  readonly isDefault: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * 戦略パラメータ
 */
export interface StrategyParameters {
  /** 連鎖優先度 (0-100) */
  readonly chainPriority: number
  /** 速度優先度 (0-100) */
  readonly speedPriority: number
  /** 防御優先度 (0-100) */
  readonly defensePriority: number
  /** リスク許容度 (0-100) */
  readonly riskTolerance: number
  /** 高さ制御重要度 (0-100) */
  readonly heightControl: number
  /** 中央配置重要度 (0-100) */
  readonly centerPriority: number
}

/**
 * デフォルト戦略設定の定義
 */
export const DEFAULT_STRATEGIES: Record<Exclude<StrategyType, 'custom'>, StrategyConfig> = {
  aggressive: {
    id: 'strategy-aggressive',
    name: '攻撃型',
    type: 'aggressive',
    description: '高い連鎖を狙い、リスクを取って大きなスコアを目指す戦略',
    parameters: {
      chainPriority: 90,
      speedPriority: 30,
      defensePriority: 20,
      riskTolerance: 80,
      heightControl: 40,
      centerPriority: 70,
    },
    isDefault: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  defensive: {
    id: 'strategy-defensive',
    name: '守備型',
    description: '安全性を重視し、フィールドの高さを低く保つ戦略',
    type: 'defensive',
    parameters: {
      chainPriority: 40,
      speedPriority: 70,
      defensePriority: 90,
      riskTolerance: 20,
      heightControl: 90,
      centerPriority: 50,
    },
    isDefault: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  balanced: {
    id: 'strategy-balanced',
    name: 'バランス型',
    type: 'balanced',
    description: '連鎖と安全性のバランスを取った万能戦略',
    parameters: {
      chainPriority: 60,
      speedPriority: 60,
      defensePriority: 60,
      riskTolerance: 50,
      heightControl: 60,
      centerPriority: 60,
    },
    isDefault: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
}

/**
 * 戦略設定を作成する
 */
export const createStrategyConfig = (
  name: string,
  type: StrategyType,
  description: string,
  parameters: StrategyParameters
): StrategyConfig => ({
  id: `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  type,
  description,
  parameters,
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
})

/**
 * 戦略設定を更新する
 */
export const updateStrategyConfig = (
  config: StrategyConfig,
  updates: Partial<Pick<StrategyConfig, 'name' | 'description' | 'parameters'>>
): StrategyConfig => ({
  ...config,
  ...updates,
  updatedAt: new Date(),
})

/**
 * パラメータの妥当性を検証する
 */
export const validateStrategyParameters = (parameters: StrategyParameters): boolean => {
  const { chainPriority, speedPriority, defensePriority, riskTolerance, heightControl, centerPriority } = parameters

  // すべてのパラメータが0-100の範囲内であることを確認
  const allParams = [chainPriority, speedPriority, defensePriority, riskTolerance, heightControl, centerPriority]
  
  return allParams.every(param => 
    typeof param === 'number' && 
    param >= 0 && 
    param <= 100 && 
    Number.isInteger(param)
  )
}

/**
 * 戦略設定が有効かどうかを判定する
 */
export const isValidStrategyConfig = (config: StrategyConfig): boolean => {
  return (
    typeof config.id === 'string' &&
    config.id.length > 0 &&
    typeof config.name === 'string' &&
    config.name.length > 0 &&
    typeof config.description === 'string' &&
    config.description.length > 0 &&
    ['aggressive', 'defensive', 'balanced', 'custom'].includes(config.type) &&
    validateStrategyParameters(config.parameters) &&
    config.createdAt instanceof Date &&
    config.updatedAt instanceof Date
  )
}