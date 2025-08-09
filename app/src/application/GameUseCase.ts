import { Game, GameState } from '../domain/Game'
import { PuyoPair } from '../domain/PuyoPair'
import { ChainResult } from '../domain/Chain'

/**
 * ゲームのユースケースを管理するクラス
 * アプリケーション層の中核となり、ドメインモデルを使用してビジネスロジックを実装
 */
export class GameUseCase {
  private game: Game

  constructor() {
    this.game = new Game()
  }

  /**
   * 新しいゲームを開始
   */
  public startNewGame(): void {
    this.game = new Game()
    this.game.start()
  }

  /**
   * ゲームをリスタート
   */
  public restartGame(): void {
    this.startNewGame()
  }

  /**
   * ゲームを一時停止/再開
   */
  public togglePause(): void {
    if (this.game.state === GameState.PLAYING) {
      this.game.pause()
    } else if (this.game.state === GameState.PAUSED) {
      this.game.resume()
    }
  }

  /**
   * ゲームをポーズ
   */
  public pauseGame(): void {
    if (this.game.state === GameState.PLAYING) {
      this.game.pause()
    }
  }

  /**
   * ゲームを再開
   */
  public resumeGame(): void {
    if (this.game.state === GameState.PAUSED) {
      this.game.resume()
    }
  }

  /**
   * 現在のぷよを左に移動
   */
  public moveLeft(): boolean {
    return this.game.moveLeft()
  }

  /**
   * 現在のぷよを右に移動
   */
  public moveRight(): boolean {
    return this.game.moveRight()
  }

  /**
   * 現在のぷよを回転
   */
  public rotate(): boolean {
    return this.game.rotate()
  }

  /**
   * 現在のぷよを下に移動
   */
  public moveDown(): boolean {
    return this.game.drop()
  }

  /**
   * 現在のぷよをハードドロップ
   */
  public hardDrop(): void {
    // ハードドロップ実装：最下段まで落下させる
    while (this.game.drop()) {
      // 落下可能な限り落下
    }
    this.game.fixCurrentPair()
  }

  /**
   * ゲーム更新処理
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_deltaTime: number): void {
    // 自動落下処理などはここで実装
    // 現状のGameクラスにはupdateメソッドがないため、必要に応じて実装
  }

  /**
   * フィールドの状態を取得
   */
  public getFieldGrid(): (string | null)[][] {
    // Fieldクラスのgridをcolor文字列の配列に変換
    const grid: (string | null)[][] = []
    for (let y = 0; y < this.game.field.height; y++) {
      const row: (string | null)[] = []
      for (let x = 0; x < this.game.field.width; x++) {
        const puyo = this.game.field.getPuyo(x, y)
        row.push(puyo ? puyo.color : null)
      }
      grid.push(row)
    }
    return grid
  }

  /**
   * 現在のぷよペアを取得
   */
  public getCurrentPair(): PuyoPair | null {
    return this.game.currentPair
  }

  /**
   * 次のぷよペアを取得
   */
  public getNextPairs(): PuyoPair[] {
    return this.game.nextPair ? [this.game.nextPair] : []
  }

  /**
   * ゲームの状態を取得
   */
  public getGameState(): GameState {
    return this.game.state
  }

  /**
   * スコアを取得
   */
  public getScore(): { current: number; chains: number } {
    return {
      current: this.game.score,
      chains: this.game.lastChainResult?.chainCount || 0,
    }
  }

  /**
   * 現在の連鎖結果を取得
   */
  public getCurrentChainResult(): ChainResult | null {
    return this.game.lastChainResult
  }

  /**
   * ゲームがプレイ中かどうか
   */
  public isPlaying(): boolean {
    return this.game.state === GameState.PLAYING
  }

  /**
   * ゲームが一時停止中かどうか
   */
  public isPaused(): boolean {
    return this.game.state === GameState.PAUSED
  }

  /**
   * ゲームが終了しているかどうか
   */
  public isGameOver(): boolean {
    return this.game.state === GameState.GAME_OVER
  }

  /**
   * ゲーム設定を取得
   */
  public getConfig(): { width: number; height: number } {
    // デフォルト設定を返す
    return { width: 6, height: 13 }
  }

  /**
   * ゲームインスタンスを取得（テスト用）
   */
  public getGameInstance(): Game {
    return this.game
  }
}
