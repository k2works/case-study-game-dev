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
  private maxChainCount: number = 0
  private config!: Config
  private puyoImage!: PuyoImage
  private stage!: Stage
  private player!: Player
  private score!: Score
  private lastTime: number = 0
  private chainElement!: HTMLElement
  private isRunning: boolean = false
  private animationFrameId: number = 0

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

    // 連鎖表示要素の取得
    const chainElement = document.getElementById('chain')
    if (chainElement) {
      this.chainElement = chainElement
      this.updateChainDisplay()
    }

    // ボタンのイベントリスナーを設定
    this.setupButtons()

    // ゲームモードを設定（開始待ち）
    this.mode = 'start'
    this.isRunning = false
  }

  private setupButtons(): void {
    // スタートボタン
    const startButton = document.getElementById('startButton')
    if (startButton) {
      startButton.addEventListener('click', () => this.start())
    }

    // リセットボタン
    const resetButton = document.getElementById('resetButton')
    if (resetButton) {
      resetButton.addEventListener('click', () => this.reset())
    }
  }

  start(): void {
    if (this.isRunning) return

    // ゲームオーバー表示を非表示
    const gameOverElement = document.getElementById('gameOver')
    if (gameOverElement) {
      gameOverElement.style.display = 'none'
    }

    // ゲーム開始
    this.mode = 'newPuyo'
    this.isRunning = true
    this.lastTime = performance.now()
    this.loop()
  }

  reset(): void {
    // アニメーションフレームをキャンセル
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    // 各コンポーネントをリセット
    this.stage.clear()
    this.score.reset()

    // 連鎖カウントをリセット
    this.combinationCount = 0
    this.maxChainCount = 0
    this.updateChainDisplay()

    // ゲームオーバー表示を非表示
    const gameOverElement = document.getElementById('gameOver')
    if (gameOverElement) {
      gameOverElement.style.display = 'none'
    }

    // 次のぷよ表示をクリア
    const nextElement = document.getElementById('next')
    if (nextElement) {
      const canvas = nextElement.querySelector('canvas')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }

    // ゲーム状態をリセット
    this.mode = 'start'
    this.isRunning = false
    this.frame = 0

    // ステージを再描画（空の状態）
    this.stage.draw()
  }

  loop(currentTime: number = 0): void {
    if (!this.isRunning) return

    // 経過時間を計算（ミリ秒）
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // ゲームループの処理
    this.update(deltaTime)
    this.draw()

    // 次のフレームをリクエスト
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this))
  }

  private handleCheckErase(): void {
    // 消去判定
    const eraseInfo = this.stage.checkErase()
    if (eraseInfo.erasePuyoCount > 0) {
      // 連鎖カウントを増やす
      this.combinationCount++
      if (this.combinationCount > this.maxChainCount) {
        this.maxChainCount = this.combinationCount
      }
      this.updateChainDisplay()

      // 消去対象がある場合、消去処理へ
      this.stage.eraseBoards(eraseInfo.eraseInfo)
      this.mode = 'erasing'
    } else {
      // 連鎖カウントをリセット
      this.combinationCount = 0
      this.updateChainDisplay()

      // 消去対象がない場合、全消し判定
      if (this.stage.checkZenkeshi()) {
        // 全消しボーナスを加算
        this.score.addZenkeshiBonus()
      }
      // 次のぷよを出す
      this.mode = 'newPuyo'
    }
  }

  private handleNewPuyo(): void {
    // 新しいぷよを作成
    this.player.createNewPuyo()

    // ゲームオーバー判定
    if (this.player.checkGameOver()) {
      this.mode = 'gameOver'
      this.isRunning = false // ゲームループを停止
    } else {
      this.mode = 'playing'
    }
  }

  private updateChainDisplay(): void {
    if (!this.chainElement) return

    if (this.combinationCount > 0) {
      this.chainElement.textContent = `${this.combinationCount}連鎖`
    } else {
      this.chainElement.textContent = `最大連鎖: ${this.maxChainCount}`
    }
  }

  private handleCheckFall(): void {
    // 重力を適用
    const hasFallen = this.stage.applyGravity()
    if (hasFallen) {
      // ぷよが落下した場合、falling モードへ
      this.mode = 'falling'
    } else {
      // 落下するぷよがない場合、消去チェックへ
      this.mode = 'checkErase'
    }
  }

  private update(deltaTime: number): void {
    this.frame++

    // モードに応じた処理
    switch (this.mode) {
      case 'newPuyo':
        this.handleNewPuyo()
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
        this.handleCheckFall()
        break

      case 'falling':
        // 落下アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに checkFall に戻る
        this.mode = 'checkFall'
        break

      case 'checkErase':
        this.handleCheckErase()
        break

      case 'erasing':
        // 消去アニメーション用（一定フレーム待機）
        // 簡略化のため、すぐに checkFall に戻る（消去後の重力適用）
        this.mode = 'checkFall'
        break

      case 'gameOver':
        // ゲームオーバー演出
        this.drawGameOver()
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

    // 次のぷよを描画
    this.drawNextPuyo()
  }

  private drawNextPuyo(): void {
    // 次のぷよ表示エリアを取得
    const nextElement = document.getElementById('next')
    if (!nextElement) return

    // キャンバスがなければ作成
    let canvas = nextElement.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = this.config.puyoSize * 2
      canvas.height = this.config.puyoSize * 2
      nextElement.appendChild(canvas)
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 次のぷよのペアを取得
    const nextPuyoPair = this.player.getNextPuyoPair()
    if (nextPuyoPair.axis > 0 && nextPuyoPair.sub > 0) {
      // 軸ぷよ（下）を描画
      this.puyoImage.draw(ctx, nextPuyoPair.axis, 0.5, 1)
      // 連結ぷよ（上）を描画
      this.puyoImage.draw(ctx, nextPuyoPair.sub, 0.5, 0)
    }
  }

  private drawGameOver(): void {
    // ゲームオーバー表示
    const gameOverElement = document.getElementById('gameOver')
    if (!gameOverElement) return

    // ゲームオーバー要素を表示
    gameOverElement.style.display = 'block'
  }
}
