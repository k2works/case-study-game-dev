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
  private frame = 0
  private _combinationCount = 0 // 連鎖数（後で使用）
  private config!: Config
  private puyoImage!: PuyoImage
  private stage!: Stage
  private player!: Player
  private _score!: Score // スコア（後で使用）

  constructor() {
    // コンストラクタでは何もしない
  }

  // ゲームの初期化
  initialize(): void {
    // 各コンポーネントの初期化
    this.config = new Config()
    this.puyoImage = new PuyoImage(this.config)
    this.stage = new Stage(this.config, this.puyoImage)
    this.player = new Player(this.config, this.stage, this.puyoImage)
    this._score = new Score()

    // ゲームモードを設定
    this.mode = 'start'

    // 最初のぷよを生成
    this.player.createNewPuyo()
  }

  // ゲームループの開始
  loop(): void {
    // ゲームの更新処理
    this.update()

    // ゲームの描画処理
    this.draw()

    // 次のフレームを予約
    requestAnimationFrame(() => this.loop())
  }

  // ゲームの更新処理
  private update(): void {
    this.frame++

    // ゲームモードに応じた処理
    switch (this.mode) {
      case 'start':
        // ゲーム開始時の処理
        this.mode = 'newPuyo'
        break
      case 'newPuyo':
        // 新しいぷよを生成
        this.player.createNewPuyo()
        this.mode = 'playing'
        break
      case 'playing':
        // プレイ中の処理
        this.player.update()
        break
      // 他のモードは後で実装
    }
  }

  // ゲームの描画処理
  private draw(): void {
    // ステージを描画
    this.stage.draw()

    // 操作中のぷよを描画（ステージの Canvas コンテキストを取得）
    const stageElement = document.getElementById('stage')
    if (stageElement) {
      const canvas = stageElement.querySelector('canvas')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          this.player.draw(ctx)
        }
      }
    }
  }
}
