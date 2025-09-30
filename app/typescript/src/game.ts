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
    this._combinationCount = 0 // 連鎖カウントを初期化

    // スコア表示を初期化
    this.updateScoreDisplay()

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
    // 重なり判定（移動前にチェック）
    if (this._player.isOverlapping()) {
      // 重なっている場合は即座に着地処理
      this._player.placePuyoOnStage()
      this._frame = 0
      this.mode = 'checkErase'
      return
    }

    // 着地判定
    if (this._player.checkLanded()) {
      this._player.placePuyoOnStage()
      this._frame = 0
      this.mode = 'checkErase'
      return
    }

    // プレイヤー操作を更新（移動処理）
    this._player.update()

    // 移動後に再度重なり判定
    if (this._player.isOverlapping()) {
      // 移動後に重なった場合も即座に着地処理
      this._player.placePuyoOnStage()
      this._frame = 0
      this.mode = 'checkErase'
      return
    }

    // 自動落下処理
    this.handleFalling()
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
      // 消去対象がある場合は連鎖カウントを増やす
      this._combinationCount++
      this.mode = 'erasing'
    } else {
      // 消去対象がない場合は落下判定へ
      this.mode = 'checkFall'
    }
  }

  // 消去実行モードの更新処理
  private updateErasing(): void {
    // 連鎖ボーナス倍率を取得
    const chainMultiplier = this.getChainMultiplier(this._combinationCount)

    for (const group of this.erasableGroups) {
      this.stage.erasePuyos(group)
      // スコアを計算（1個につき10点 × 連鎖ボーナス）
      const points = group.length * 10 * chainMultiplier
      this._score.addScore(points)
    }
    this.erasableGroups = []

    // スコア表示を更新
    this.updateScoreDisplay()

    // 消去後は落下判定へ
    this.mode = 'checkFall'
  }

  // 連鎖ボーナスの倍率を取得
  private getChainMultiplier(chainCount: number): number {
    // 連鎖倍率テーブル
    const multipliers = [0, 1, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256]

    if (chainCount <= 0) {
      return 1
    }

    if (chainCount >= multipliers.length) {
      return multipliers[multipliers.length - 1]
    }

    return multipliers[chainCount]
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
    // 新しいぷよの生成位置を確認
    const centerCol = Math.floor(this.config.stageCols / 2)
    if (this.stage.getPuyo(centerCol, 0) !== '') {
      // 生成位置が埋まっている場合はゲームオーバー
      this.mode = 'gameOver'
      return
    }

    this._player.createNewPuyo()
    this._frame = 0
    this._combinationCount = 0 // 連鎖カウントをリセット
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

    // ゲームオーバー表示の制御
    this.updateGameOverDisplay()
  }

  // ゲームオーバー表示を更新
  private updateGameOverDisplay(): void {
    const gameOverElement = document.getElementById('gameOver')
    if (gameOverElement) {
      gameOverElement.style.display = this.mode === 'gameOver' ? 'block' : 'none'
    }
  }

  // スコア表示を更新
  private updateScoreDisplay(): void {
    const scoreElement = document.getElementById('score')
    if (scoreElement) {
      scoreElement.textContent = this._score.getScore().toString()
    }
  }
}
