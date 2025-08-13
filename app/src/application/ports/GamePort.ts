import type { Game } from '../../domain/models/Game'
import type { PuyoPair } from '../../domain/models/PuyoPair'

/**
 * ゲーム状態管理のためのポートインターフェース
 * ヘキサゴナルアーキテクチャにおける内向きのポート
 */
export interface GamePort {
  /**
   * 新しいゲームを開始する
   * @returns 初期化されたゲーム状態
   */
  startNewGame(): Game

  /**
   * ゲーム状態を更新する
   * @param game 現在のゲーム状態
   * @param action 実行するアクション
   * @returns 更新されたゲーム状態
   */
  updateGameState(game: Game, action: GameAction): Game

  /**
   * 次のぷよペアを生成する
   * @param game 現在のゲーム状態
   * @returns 次のぷよペア
   */
  generateNextPuyoPair(game: Game): PuyoPair

  /**
   * ゲーム状態を検証する
   * @param game 検証対象のゲーム状態
   * @returns 検証結果
   */
  validateGameState(game: Game): GameValidationResult
}

/**
 * ゲームに対するアクションタイプ
 */
export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE' }
  | { type: 'DROP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }

/**
 * ゲーム状態検証結果
 */
export interface GameValidationResult {
  readonly isValid: boolean
  readonly errors: string[]
  readonly warnings: string[]
}
