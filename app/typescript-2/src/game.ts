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
  private _combinationCount = 0 // 現在の連鎖数
  private _maxChainCount = 0 // 最大連鎖数（表示用）
  private config!: Config
  private puyoImage!: PuyoImage
  private stage!: Stage
  private player!: Player
  private _score!: Score
  private lastTime = 0
  private chainElement: HTMLElement | null = null

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

    // 連鎖カウント表示要素を取得
    this.chainElement = document.getElementById('chain')
    this.updateChainDisplay()

    // ゲームモードを設定
    this.mode = 'start'

    // 最初のぷよを生成
    this.player.createNewPuyo()
  }

  // ゲームループの開始
  loop(currentTime = 0): void {
    // 前回のフレームからの経過時間を計算
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // ゲームの更新処理
    this.update(deltaTime)

    // ゲームの描画処理
    this.draw()

    // 次のフレームを予約
    requestAnimationFrame((time) => this.loop(time))
  }

  // ゲームの更新処理
  // eslint-disable-next-line complexity
  private update(deltaTime: number): void {
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
        this.player.update(deltaTime)

        // ぷよが着地したら落下チェックへ
        if (this.player.isLanded()) {
          this.mode = 'checkFall'
        }
        break
      case 'checkFall': {
        // 落下チェック（すべてのぷよが落下し終わるまで繰り返す）
        let hasFallen = true
        while (hasFallen) {
          hasFallen = this.stage.applyGravity()
        }
        // 落下完了後、消去チェックへ
        this.mode = 'checkErase'
        break
      }
      case 'checkErase': {
        // 消去判定
        const eraseInfo = this.stage.checkErase()

        if (eraseInfo.erasePuyoCount > 0) {
          // 連鎖カウントを増やす
          this._combinationCount++

          // 最大連鎖数を更新
          if (this._combinationCount > this._maxChainCount) {
            this._maxChainCount = this._combinationCount
          }
          this.updateChainDisplay()

          // スコアを加算
          this._score.addScore(eraseInfo.erasePuyoCount, this._combinationCount)

          // 消去するぷよがある場合は消去モードへ
          this.stage.eraseBoards(eraseInfo.eraseInfo)
          this.mode = 'erasing'
        } else {
          // 消去するぷよがない場合は連鎖カウントをリセット
          this._combinationCount = 0
          // 次のぷよ生成へ
          this.mode = 'newPuyo'
        }
        break
      }
      case 'erasing': {
        // 消去後、再度落下チェック（連鎖のため）
        this.mode = 'checkFall'
        break
      }
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

  // 連鎖カウント表示を更新
  private updateChainDisplay(): void {
    if (this.chainElement) {
      if (this._combinationCount > 0) {
        // 連鎖中は現在の連鎖数を表示
        this.chainElement.textContent = `Chain: ${this._combinationCount}`
      } else if (this._maxChainCount > 0) {
        // 連鎖終了後は最大連鎖数を表示
        this.chainElement.textContent = `Max Chain: ${this._maxChainCount}`
      } else {
        // 連鎖未発生
        this.chainElement.textContent = `Chain: 0`
      }
    }
  }
}
