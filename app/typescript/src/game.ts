import { Config } from './config'
import { PuyoImage } from './puyoimage'
import { Stage } from './stage'
import { Player } from './player'
import { Score } from './score'

export type GameMode =
  | 'start'
  | 'checkFall'
  | 'fall'
  | 'checkErase'
  | 'erasing'
  | 'newPuyo'
  | 'playing'
  | 'gameOver'

export class Game {
  private mode: GameMode = 'start'
  private _frame: number = 0
  private _combinationCount: number = 0
  private config!: Config
  private puyoImage!: PuyoImage
  private stage!: Stage
  private _player!: Player
  private _score!: Score
  private isRunning: boolean = false
  private fallSpeed: number = 30 // 30フレームごとに1マス落下

  constructor() {
    // コンストラクタでは何もしない
  }

  initialize(): void {
    // 各コンポーネントの初期化
    this.config = new Config()
    this.puyoImage = new PuyoImage(this.config)
    this.stage = new Stage(this.config, this.puyoImage)
    this.stage.initialize()
    this._player = new Player(this.config, this.stage, this.puyoImage)
    this._player.createNewPuyo()
    this._score = new Score()

    // ゲームモードを設定
    this.mode = 'playing'
    this.isRunning = false
  }

  // ゲームを開始する
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true
      this.loop()
    }
  }

  loop(): void {
    if (!this.isRunning) return

    // 更新
    this.update()

    // 描画
    this.draw()

    // ゲームループの処理
    requestAnimationFrame(this.loop.bind(this))
  }

  // ゲームの状態を更新
  private update(): void {
    if (this.mode === 'playing') {
      this._player.update()

      // 下キーが押されている場合は高速落下
      if (this._player.isDownKeyPressed()) {
        this._player.moveDown()
      } else {
        // 自由落下処理
        this._frame++
        if (this._frame >= this.fallSpeed) {
          this._frame = 0
          this._player.moveDown()
        }
      }
    }
  }

  // 画面を描画
  private draw(): void {
    // ステージをクリア
    this.stage.clear()

    // ぷよを描画
    if (this.mode === 'playing') {
      this._player.draw()
    }
  }
}
