import type { GameViewModel } from '../viewmodels/GameViewModel'

/**
 * ゲーム状態管理のためのポートインターフェース
 * ヘキサゴナルアーキテクチャにおける内向きのポート
 */
export interface GamePort {
  /**
   * 準備状態の新しいゲームを作成する（まだ開始はしない）
   * @returns 準備状態のゲーム状態
   */
  createReadyGame(): GameViewModel

  /**
   * 新しいゲームを開始する
   * @returns 初期化されたゲーム状態
   */
  startNewGame(): GameViewModel

  /**
   * ゲーム状態を更新する
   * @param gameViewModel 現在のゲーム状態のViewModel
   * @param action 実行するアクション
   * @returns 更新されたゲーム状態
   */
  updateGameState(
    gameViewModel: GameViewModel,
    action: GameAction,
  ): GameViewModel

  /**
   * ゲーム状態を検証する
   * @param gameViewModel 検証対象のゲーム状態
   * @returns 検証結果
   */
  validateGameState(gameViewModel: GameViewModel): GameValidationResult

  /**
   * 自動落下処理を実行する
   * @param gameViewModel 現在のゲーム状態
   * @returns 更新されたゲーム状態
   */
  processAutoFall(gameViewModel: GameViewModel): GameViewModel

  /**
   * 新しいぷよペアを生成する
   * @param gameViewModel 現在のゲーム状態
   * @returns 新しいぷよペアが生成されたゲーム状態
   */
  spawnNewPuyoPair(gameViewModel: GameViewModel): GameViewModel
}

/**
 * ゲームに対するアクションタイプ
 */
export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE' }
  | { type: 'ROTATE_CLOCKWISE' }
  | { type: 'ROTATE_COUNTERCLOCKWISE' }
  | { type: 'DROP' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'QUIT' }

/**
 * ゲーム状態検証結果
 */
export interface GameValidationResult {
  readonly isValid: boolean
  readonly errors: string[]
  readonly warnings: string[]
}
