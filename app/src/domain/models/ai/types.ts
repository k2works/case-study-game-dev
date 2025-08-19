/**
 * AI関連の型定義（後方互換性維持のためのre-export）
 *
 * @deprecated 新しいコードでは個別のファイルから直接importしてください
 * - AISettings: './AISettings'
 * - GameState関連: './GameState'
 * - Move関連: './MoveTypes'
 * - Performance関連: './PerformanceTypes'
 */

// 後方互換性のために個別ファイルからre-export
export type {
  AISettings,
  AIFieldState,
  AIPuyoPairState,
  AIGameState,
  AIMove,
  PossibleMove,
  EvaluationResult,
  MoveEvaluation,
  GameSession,
  PerformanceData,
  PerformanceReport,
  AIStrategy,
  AIStrategyParameters,
} from './index'
