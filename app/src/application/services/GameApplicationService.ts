import type { Game } from '../../domain/models/Game'
import {
  createGame,
  dropPuyoFast,
  movePuyoLeft,
  movePuyoRight,
  pauseGame,
  resumeGame,
  rotatePuyo,
  startGame,
} from '../../domain/models/Game'
import type { PuyoPair } from '../../domain/models/PuyoPair'
import type {
  GameAction,
  GamePort,
  GameValidationResult,
} from '../ports/GamePort'
import type { StoragePort } from '../ports/StoragePort'
import type { TimerId, TimerPort } from '../ports/TimerPort'

/**
 * ゲームアプリケーションサービス
 * ゲームのビジネスロジックを調整し、ドメインオブジェクト間の連携を管理
 */
export class GameApplicationService implements GamePort {
  private currentGame: Game | null = null
  private gameTimer: TimerId | null = null

  private readonly storageAdapter: StoragePort
  private readonly timerAdapter: TimerPort

  constructor(storageAdapter: StoragePort, timerAdapter: TimerPort) {
    this.storageAdapter = storageAdapter
    this.timerAdapter = timerAdapter
  }

  createReadyGame(): Game {
    // 準備状態の新しいゲームを作成（開始はしない）
    const newGame = createGame()
    this.currentGame = newGame
    this.saveGameState(newGame)
    return newGame
  }

  startNewGame(): Game {
    // 既存のゲームタイマーを停止
    this.stopGameTimer()

    // 新しいゲームを作成して開始
    const newGame = createGame()
    const startedGame = startGame(newGame)

    this.currentGame = startedGame
    this.startGameTimer()
    this.saveGameState(startedGame)

    return startedGame
  }

  updateGameState(game: Game, action: GameAction): Game {
    // アクションの妥当性を検証
    const validationResult = this.validateGameState(game)
    if (!validationResult.isValid) {
      console.warn('Invalid game state detected:', validationResult.errors)
      return game
    }

    // アクションに応じてゲーム状態を更新
    const updatedGame = this.applyAction(game, action)

    // ゲーム状態をメモリと永続化ストレージに保存
    this.currentGame = updatedGame
    this.saveGameState(updatedGame)

    // ゲーム終了時の処理
    if (updatedGame.state === 'gameOver' && this.gameTimer) {
      this.stopGameTimer()
    }

    return updatedGame
  }

  generateNextPuyoPair(game: Game): PuyoPair {
    // ドメインモデルのspawnNextPuyoPairロジックを使用
    // 実際の実装はドメイン層に移譲
    // TODO: 実装を完了させる
    import('../../domain/models/Game').then(({ spawnNextPuyoPair }) => {
      return spawnNextPuyoPair(game)
    })
    // 一時的にダミーを返す（実装完了まで）
    return null as unknown as PuyoPair
  }

  validateGameState(game: Game): GameValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 基本的な整合性チェック
    this.validateBasicGameProperties(game, errors)
    this.validateGameFieldProperties(game, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private validateBasicGameProperties(game: Game, errors: string[]): void {
    if (!game.id) {
      errors.push('Game ID is missing')
    }

    if (game.state === 'playing' && !game.currentPuyoPair) {
      errors.push('Playing game must have a current puyo pair')
    }

    if (game.score.current < 0) {
      errors.push('Score cannot be negative')
    }

    if (game.level < 1) {
      errors.push('Level must be at least 1')
    }
  }

  private validateGameFieldProperties(
    game: Game,
    errors: string[],
    warnings: string[],
  ): void {
    if (!game.field) {
      errors.push('Game field is missing')
      return
    }

    if (game.field.getWidth() !== 6) {
      warnings.push('Field width is not standard (6)')
    }
    if (game.field.getHeight() !== 12) {
      warnings.push('Field height is not standard (12)')
    }
  }

  /**
   * 現在のゲーム状態を取得
   * @returns 現在のゲーム状態、存在しない場合null
   */
  getCurrentGame(): Game | null {
    return this.currentGame
  }

  /**
   * ゲーム状態を永続化ストレージから復元
   * @returns 復元されたゲーム状態、存在しない場合null
   */
  async restoreGame(): Promise<Game | null> {
    try {
      const savedGame = await this.storageAdapter.load<Game>('current-game')
      if (savedGame) {
        this.currentGame = savedGame
        // 復元されたゲームが実行中の場合、タイマーを再開
        if (savedGame.state === 'playing') {
          this.startGameTimer()
        }
      }
      return savedGame
    } catch (error) {
      console.error('Failed to restore game state:', error)
      return null
    }
  }

  /**
   * アクションをゲーム状態に適用
   * @param game 現在のゲーム状態
   * @param action 実行するアクション
   * @returns 更新されたゲーム状態
   */
  private applyAction(game: Game, action: GameAction): Game {
    // アクションをカテゴリ分けして処理
    return this.processActionByCategory(game, action)
  }

  private processActionByCategory(game: Game, action: GameAction): Game {
    if (this.isMovementAction(action)) {
      return this.applyMovementAction(game, action)
    }

    if (this.isGameStateAction(action)) {
      return this.applyGameStateAction(game, action)
    }

    console.warn('Unknown action type:', action)
    return game
  }

  private isMovementAction(action: GameAction): boolean {
    const movementTypes = [
      'MOVE_LEFT',
      'MOVE_RIGHT',
      'ROTATE',
      'ROTATE_CLOCKWISE',
      'ROTATE_COUNTERCLOCKWISE',
      'DROP',
      'SOFT_DROP',
      'HARD_DROP',
    ]
    return movementTypes.includes(action.type)
  }

  private isGameStateAction(action: GameAction): boolean {
    const stateTypes = ['PAUSE', 'RESUME', 'RESTART', 'QUIT']
    return stateTypes.includes(action.type)
  }

  private applyMovementAction(game: Game, action: GameAction): Game {
    if (this.isMoveAction(action)) {
      return this.handleMoveAction(game, action)
    }

    if (this.isRotateAction(action)) {
      return rotatePuyo(game)
    }

    if (this.isDropAction(action)) {
      return dropPuyoFast(game)
    }

    return game
  }

  private isMoveAction(action: GameAction): boolean {
    return action.type === 'MOVE_LEFT' || action.type === 'MOVE_RIGHT'
  }

  private isRotateAction(action: GameAction): boolean {
    return (
      action.type === 'ROTATE' ||
      action.type === 'ROTATE_CLOCKWISE' ||
      action.type === 'ROTATE_COUNTERCLOCKWISE'
    )
  }

  private isDropAction(action: GameAction): boolean {
    return (
      action.type === 'DROP' ||
      action.type === 'SOFT_DROP' ||
      action.type === 'HARD_DROP'
    )
  }

  private handleMoveAction(game: Game, action: GameAction): Game {
    return action.type === 'MOVE_LEFT'
      ? movePuyoLeft(game)
      : movePuyoRight(game)
  }

  private applyGameStateAction(game: Game, action: GameAction): Game {
    switch (action.type) {
      case 'PAUSE':
        this.stopGameTimer()
        return pauseGame(game)
      case 'RESUME': {
        const resumedGame = resumeGame(game)
        if (resumedGame.state === 'playing') {
          this.startGameTimer()
        }
        return resumedGame
      }
      case 'RESTART':
        this.stopGameTimer()
        return this.createReadyGame()
      case 'QUIT':
        this.stopGameTimer()
        return { ...game, state: 'gameOver' }
      default:
        return game
    }
  }

  /**
   * ゲーム状態を永続化ストレージに保存
   * @param game 保存するゲーム状態
   */
  private async saveGameState(game: Game): Promise<void> {
    try {
      await this.storageAdapter.save('current-game', game)

      // ハイスコア更新の場合は個別に保存
      if (game.state === 'gameOver') {
        const currentHighScore =
          (await this.storageAdapter.load<number>('high-score')) || 0
        if (game.score.current > currentHighScore) {
          await this.storageAdapter.save('high-score', game.score.current)
        }
      }
    } catch (error) {
      console.error('Failed to save game state:', error)
    }
  }

  /**
   * ゲームタイマーを開始（自動落下用）
   */
  private startGameTimer(): void {
    if (this.gameTimer) {
      this.timerAdapter.stopTimer(this.gameTimer)
    }

    this.gameTimer = this.timerAdapter.startInterval(() => {
      if (this.currentGame && this.currentGame.state === 'playing') {
        // 自動落下処理
        const updatedGame = dropPuyoFast(this.currentGame)
        this.currentGame = updatedGame
        this.saveGameState(updatedGame)
      }
    }, 1000) // 1秒間隔
  }

  /**
   * ゲームタイマーを停止
   */
  private stopGameTimer(): void {
    if (this.gameTimer) {
      this.timerAdapter.stopTimer(this.gameTimer)
      this.gameTimer = null
    }
  }

  /**
   * リソースをクリーンアップ
   */
  dispose(): void {
    this.stopGameTimer()
    this.currentGame = null
  }
}
