/**
 * AI関連のポート定義
 */
import type { AIGameState, AIMove, AISettings, PossibleMove } from './types'

/**
 * AIポート
 * アプリケーション層からAIエンジンへのインターフェース
 */
export interface AIPort {
  /** 次の手を決定 */
  decideMove(gameState: AIGameState): Promise<AIMove>

  /** AI設定を更新 */
  updateSettings(settings: AISettings): void

  /** AIが動作中かどうか */
  isEnabled(): boolean

  /** AIを有効化/無効化 */
  setEnabled(enabled: boolean): void
}

/**
 * 手生成ポート
 * 可能な手を生成するインターフェース
 */
export interface MoveGeneratorPort {
  /** 可能な手を生成 */
  generateMoves(gameState: AIGameState): PossibleMove[]
}
