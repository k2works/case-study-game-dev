import { Config } from './config'
import { PuyoImage } from './puyoimage'
import { Stage } from './stage'
import { Player } from './player'
import { Score } from './score'

export type GameMode =
  | 'start'
  | 'checkFall'
  | 'falling'
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
  private lastTime: number = 0

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

  loop(currentTime: number = 0): void {
    // 経過時間を計算（ミリ秒）
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // ゲームループの処理
    this.update(deltaTime)
    this.draw()
    requestAnimationFrame(this.loop.bind(this))
  }

  private update(deltaTime: number): void {
    this.frame++

    // モードに応じた処理
    switch (this.mode) {
      case 'newPuyo':
        // 新しいぷよを作成
        this.player.createNewPuyo()
        this.mode = 'playing'
        break

      case 'playing':
        // プレイ中の処理（キー入力と自由落下）
        this.player.updateWithDelta(deltaTime)

        // 着地したら重力チェックに移行
        if (this.player.hasLanded()) {
          this.mode = 'checkFall'
        }
        break

      case 'checkFall':
        // 重力を適用
        const hasFallen = this.stage.applyGravity()
        if (hasFallen) {
          // ぷよが落下した場合、falling モードへ
          this.mode = 'falling'
        } else {
          // 落下するぷよがない場合、次のぷよを出す
          this.mode = 'newPuyo'
        }
        break

      case 'falling':
        // 落下アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに checkFall に戻る
        this.mode = 'checkFall'
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
