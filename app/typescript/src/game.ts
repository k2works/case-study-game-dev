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

  constructor() {
    // コンストラクタでは何もしない
  }

  initialize(): void {
    // 各コンポーネントの初期化
    this.config = new Config()
    this.puyoImage = new PuyoImage(this.config)
    this.stage = new Stage(this.config, this.puyoImage)
    this._player = new Player(this.config, this.stage, this.puyoImage)
    this._score = new Score()

    // ゲームモードを設定
    this.mode = 'start'
  }

  loop(): void {
    // ゲームループの処理
    requestAnimationFrame(this.loop.bind(this))
  }
}
