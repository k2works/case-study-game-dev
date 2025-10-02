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
  private frame: number = 0
  private combinationCount: number = 0
  private config!: Config
  private puyoImage!: PuyoImage
  private stage!: Stage
  private player!: Player
  private score!: Score

  constructor() {
    // コンストラクタでは何もしない
  }

  initialize(): void {
    // 各コンポーネントの初期化
    this.config = new Config()
    this.puyoImage = new PuyoImage(this.config)
    this.stage = new Stage(this.config, this.puyoImage)
    this.player = new Player(this.config, this.stage, this.puyoImage)
    this.score = new Score()

    // ゲームモードを設定
    this.mode = 'newPuyo'
  }

  loop(): void {
    // ゲームループの処理
    this.update()
    this.draw()
    requestAnimationFrame(this.loop.bind(this))
  }

  private update(): void {
    this.frame++

    // モードに応じた処理
    switch (this.mode) {
      case 'newPuyo':
        // 新しいぷよを作成
        this.player.createNewPuyo()
        this.mode = 'playing'
        break

      case 'playing':
        // プレイ中の処理（キー入力に応じた移動）
        this.player.update()
        break
    }
  }

  private draw(): void {
    // ステージを描画
    this.stage.draw()

    // プレイヤーのぷよを描画
    if (this.mode === 'playing') {
      this.player.draw()
    }
  }
}
