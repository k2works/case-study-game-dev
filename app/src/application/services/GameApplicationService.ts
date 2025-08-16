import type { Game } from '../../domain/models/Game'
import {
  createGame,
  dropPuyoFast,
  movePuyoLeft,
  movePuyoRight,
  pauseGame,
  placePuyoPair,
  resumeGame,
  rotatePuyo,
  spawnNextPuyoPair,
  startGame,
} from '../../domain/models/Game'
import type {
  GameAction,
  GamePort,
  GameValidationResult,
} from '../ports/GamePort'
import type { StoragePort } from '../ports/StoragePort'
import type { TimerId, TimerPort } from '../ports/TimerPort'
import type { GameViewModel } from '../viewmodels/GameViewModel'
import { GameViewModelMapper } from '../viewmodels/GameViewModelMapper'

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

  createReadyGame(): GameViewModel {
    // 準備状態の新しいゲームを作成（開始はしない）
    const newGame = createGame()
    this.currentGame = newGame
    this.saveGameState(newGame)
    return GameViewModelMapper.toGameViewModel(newGame)
  }

  startNewGame(): GameViewModel {
    // 既存のゲームタイマーを停止
    this.stopGameTimer()

    // 新しいゲームを作成して開始
    const newGame = createGame()
    const startedGame = startGame(newGame)

    this.currentGame = startedGame
    this.startGameTimer()
    this.saveGameState(startedGame)

    return GameViewModelMapper.toGameViewModel(startedGame)
  }

  updateGameState(
    gameViewModel: GameViewModel,
    action: GameAction,
  ): GameViewModel {
    // ViewModelから内部Gameエンティティを再構築
    const game = this.reconstructGameFromViewModel(gameViewModel)

    // アクションの妥当性を検証
    const validationResult = this.validateGameState(gameViewModel)
    if (!validationResult.isValid) {
      console.warn('Invalid game state detected:', validationResult.errors)
      return gameViewModel
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

    return GameViewModelMapper.toGameViewModel(updatedGame)
  }

  validateGameState(gameViewModel: GameViewModel): GameValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 基本的な整合性チェック
    this.validateBasicGameViewModelProperties(gameViewModel, errors)
    this.validateGameFieldViewModelProperties(gameViewModel, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private validateBasicGameViewModelProperties(
    gameViewModel: GameViewModel,
    errors: string[],
  ): void {
    if (!gameViewModel.id) {
      errors.push('Game ID is missing')
    }

    if (gameViewModel.state === 'playing' && !gameViewModel.currentPuyoPair) {
      errors.push('Playing game must have a current puyo pair')
    }

    if (gameViewModel.score.current < 0) {
      errors.push('Score cannot be negative')
    }

    if (gameViewModel.level < 1) {
      errors.push('Level must be at least 1')
    }
  }

  private validateGameFieldViewModelProperties(
    gameViewModel: GameViewModel,
    errors: string[],
    warnings: string[],
  ): void {
    if (!gameViewModel.field) {
      errors.push('Game field is missing')
      return
    }

    if (gameViewModel.field.width !== 6) {
      warnings.push('Field width is not standard (6)')
    }
    if (gameViewModel.field.height !== 12) {
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
   * ViewModelから内部のGameエンティティを再構築
   * @param _gameViewModel ViewModelとしてのゲーム状態（現在未使用）
   * @returns 再構築されたGameエンティティ
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private reconstructGameFromViewModel(_gameViewModel: GameViewModel): Game {
    // 現在保持している内部Game状態を返す
    // （実際の実装では、ViewModelからGameエンティティを完全に再構築する必要があるが、
    //  現在のアーキテクチャでは内部状態を維持している）
    if (this.currentGame) {
      return this.currentGame
    }
    // フォールバック（通常は到達しない）
    return createGame()
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
      case 'RESTART': {
        this.stopGameTimer()
        const newGame = createGame()
        this.currentGame = newGame
        this.saveGameState(newGame)
        return newGame
      }
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
   * 自動落下処理を実行する
   */
  processAutoFall(gameViewModel: GameViewModel): GameViewModel {
    const game = this.reconstructGameFromViewModel(gameViewModel)

    if (game.state !== 'playing' || !game.currentPuyoPair) {
      return gameViewModel
    }

    // 下に移動を試行
    const fallenGame = dropPuyoFast(game)

    // 移動できた場合（位置が変わった場合）
    if (
      fallenGame.currentPuyoPair &&
      game.currentPuyoPair &&
      fallenGame.currentPuyoPair.main.position.y >
        game.currentPuyoPair.main.position.y
    ) {
      this.currentGame = fallenGame
      this.saveGameState(fallenGame)
      return GameViewModelMapper.toGameViewModel(fallenGame)
    }

    // 移動できなかった場合（着地した場合）
    // 現在のぷよペアをフィールドに固定し、次のペアを生成
    const placedGame = placePuyoPair(game)
    this.currentGame = placedGame
    this.saveGameState(placedGame)
    return GameViewModelMapper.toGameViewModel(placedGame)
  }

  /**
   * 新しいぷよペアを生成する
   */
  spawnNewPuyoPair(gameViewModel: GameViewModel): GameViewModel {
    const game = this.reconstructGameFromViewModel(gameViewModel)

    if (!game.currentPuyoPair) {
      const gameWithPair = spawnNextPuyoPair(game)
      this.currentGame = gameWithPair
      this.saveGameState(gameWithPair)
      return GameViewModelMapper.toGameViewModel(gameWithPair)
    }

    return gameViewModel
  }

  /**
   * リソースをクリーンアップ
   */
  dispose(): void {
    this.stopGameTimer()
    this.currentGame = null
  }
}
