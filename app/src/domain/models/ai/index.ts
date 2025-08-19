/**
 * AI関連型定義の統合エクスポート
 *
 * 元のtypes.tsの内容を論理的に分割した各ファイルから
 * 型定義をre-exportして後方互換性を維持
 */

// AI設定関連
export type { AISettings } from './AISettings'

// ゲーム状態関連
export type { AIFieldState, AIPuyoPairState, AIGameState } from './GameState'

// 移動と評価関連
export type {
  AIMove,
  PossibleMove,
  EvaluationResult,
  MoveEvaluation,
} from './MoveTypes'

// パフォーマンス関連
export type {
  GameSession,
  PerformanceData,
  PerformanceReport,
} from './PerformanceTypes'

// 戦略関連（既存のStrategyConfig.tsからの型も含める）
export type {
  StrategyConfig,
  StrategyParameters,
  StrategyType,
} from './StrategyConfig'

// AI戦略パラメータ（元のtypes.tsにあったもの）
export interface AIStrategy {
  /** 戦略ID */
  id: string
  /** 戦略名 */
  name: string
  /** 戦略説明 */
  description: string
  /** パラメータ */
  parameters: AIStrategyParameters
}

export interface AIStrategyParameters {
  /** 攻撃性 (0-100) */
  aggressiveness: number
  /** 防御性 (0-100) */
  defensiveness: number
  /** 連鎖重視度 (0-100) */
  chainFocus: number
  /** 高さ制御重要度 (0-100) */
  heightControl: number
  /** 中央配置重要度 (0-100) */
  centerPriority: number
}
