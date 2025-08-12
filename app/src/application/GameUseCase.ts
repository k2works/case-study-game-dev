import { Game, GameState } from '../domain/Game'
import { PuyoPair } from '../domain/PuyoPair'
import { ChainResult } from '../domain/Chain'
import type { PuyoData, PuyoPairData, GameStateData, ChainData } from '../types'

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

  // ==============================================================================
  // プレゼンテーション層用のメソッド（Clean Architectureに準拠）
  // ==============================================================================

  /**
   * プレゼンテーション層用のゲーム状態データを取得
   */
  public getGameStateData(): GameStateData {
    const fieldData: PuyoData[][] = []
    const field = this.game.field

    for (let y = 0; y < field.height; y++) {
      fieldData[y] = []
      for (let x = 0; x < field.width; x++) {
        const puyo = field.getPuyo(x, y)
        fieldData[y][x] = {
          color: puyo ? puyo.color : 'empty',
        }
      }
    }

    const nextPair = this.game.nextPair
    const nextPairData: PuyoPairData | null = nextPair
      ? {
          main: { color: nextPair.main.color },
          sub: { color: nextPair.sub.color },
        }
      : null

    return {
      isPlaying: this.isPlaying(),
      isPaused: this.isPaused(),
      isGameOver: this.isGameOver(),
      currentScore: this.game.score,
      chainCount: this.game.lastChainResult?.chainCount || 0,
      fieldData,
      nextPair: nextPairData,
    }
  }

  /**
   * プレゼンテーション層用の次のぷよペアデータを取得
   */
  public getNextPairData(): PuyoPairData | null {
    const nextPair = this.game.nextPair
    return nextPair
      ? {
          main: { color: nextPair.main.color },
          sub: { color: nextPair.sub.color },
        }
      : null
  }

  /**
   * プレゼンテーション層用の連鎖データを取得
   */
  public getChainData(): ChainData {
    const chainResult = this.game.lastChainResult
    return {
      count: chainResult?.chainCount || 0,
      score: chainResult?.score || 0,
      isActive: !!chainResult && chainResult.chainCount > 0,
    }
  }

  /**
   * プレゼンテーション層用のフィールドデータを取得
   */
  public getFieldData(): PuyoData[][] {
    const fieldData: PuyoData[][] = []
    const field = this.game.field

    for (let y = 0; y < field.height; y++) {
      fieldData[y] = []
      for (let x = 0; x < field.width; x++) {
        const puyo = field.getPuyo(x, y)
        fieldData[y][x] = {
          color: puyo ? puyo.color : 'empty',
        }
      }
    }

    return fieldData
  }
}
