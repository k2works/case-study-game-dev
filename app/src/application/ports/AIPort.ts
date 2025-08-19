import type {
  AIGameState,
  AIMove,
  AISettings,
} from '../../domain/models/ai/index'

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
