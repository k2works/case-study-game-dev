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
  private erasableGroups: { x: number; y: number }[][] = [] // 消去対象のぷよグループ

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
    const handlers: Record<GameMode, () => void> = {
      start: () => {},
      playing: () => this.updatePlaying(),
      checkErase: () => this.updateCheckErase(),
      erasing: () => this.updateErasing(),
      checkFall: () => this.updateCheckFall(),
      fall: () => this.updateFall(),
      newPuyo: () => this.updateNewPuyo(),
      gameOver: () => {},
    }

    const handler = handlers[this.mode]
    if (handler) {
      handler()
    }
  }

  // プレイ中の更新処理
  private updatePlaying(): void {
    this._player.update()

    if (this._player.checkLanded()) {
      this._player.placePuyoOnStage()
      this._frame = 0
      this.mode = 'checkErase'
    } else {
      this.handleFalling()
    }
  }

  // 落下処理
  private handleFalling(): void {
    if (this._player.isDownKeyPressed()) {
      this._player.moveDown()
    } else {
      this._frame++
      if (this._frame >= this.fallSpeed) {
        this._frame = 0
        this._player.moveDown()
      }
    }
  }

  // 消去判定モードの更新処理
  private updateCheckErase(): void {
    this.erasableGroups = this.stage.checkErasablePuyos()

    if (this.erasableGroups.length > 0) {
      this.mode = 'erasing'
    } else {
      this.mode = 'newPuyo'
    }
  }

  // 消去実行モードの更新処理
  private updateErasing(): void {
    for (const group of this.erasableGroups) {
      this.stage.erasePuyos(group)
    }
    this.erasableGroups = []
    // 消去後は落下判定へ
    this.mode = 'checkFall'
  }

  // 落下判定モードの更新処理
  private updateCheckFall(): void {
    if (this.stage.checkFall()) {
      this.mode = 'fall'
    } else {
      this.mode = 'newPuyo'
    }
  }

  // 落下実行モードの更新処理
  private updateFall(): void {
    this.stage.applyGravity()
    // 落下後は消去判定へ（連鎖処理）
    this.mode = 'checkErase'
  }

  // 新ぷよ生成モードの更新処理
  private updateNewPuyo(): void {
    this._player.createNewPuyo()
    this._frame = 0
    this.mode = 'playing'
  }

  // 画面を描画
  private draw(): void {
    // ステージをクリア
    this.stage.clear()

    // ステージに配置されたぷよを描画
    this.stage.drawStagePuyos()

    // 落下中のぷよを描画
    if (this.mode === 'playing') {
      this._player.draw()
    }
  }
}
