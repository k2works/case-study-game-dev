import { z } from 'zod'
import { Config } from './Config'
import { PuyoImage } from './PuyoImage'
import { Stage } from './Stage'
import { Player } from './Player'
import { Score } from './Score'

/**
 * ゲームモードのバリデーションスキーマ
 */
export const GameModeSchema = z.enum([
  'newPuyo',
  'playing',
  'checkFall',
  'falling',
  'checkErase',
  'erasing',
  'gameOver'
])

/**
 * ゲームモード
 */
export type GameMode = z.infer<typeof GameModeSchema>

/**
 * Game クラス
 * ぷよぷよゲームのメインクラス
 */
export class Game {
  private canvas: HTMLCanvasElement
  private config: Config
  private puyoImage: PuyoImage
  private stage: Stage
  private player: Player
  private score: Score
  private animationId: number | null = null
  private lastTime: number = 0
  private isDownKeyPressed: boolean = false
  private mode: GameMode = 'newPuyo'
  private modeHandlers: Map<GameMode, (deltaTime: number) => void>

  constructor(
    canvas: HTMLCanvasElement,
    config: Config,
    puyoImage: PuyoImage,
    stage: Stage,
    player: Player,
    score: Score
  ) {
    this.canvas = canvas
    this.config = config
    this.puyoImage = puyoImage
    this.stage = stage
    this.player = player
    this.score = score

    // モードハンドラーの初期化
    this.modeHandlers = new Map([
      ['newPuyo', () => this.updateNewPuyo()],
      ['playing', (deltaTime) => this.updatePlaying(deltaTime)],
      ['checkFall', () => this.updateCheckFall()],
      ['falling', () => this.updateFalling()],
      ['checkErase', () => this.updateCheckErase()],
      ['erasing', () => this.updateErasing()],
      ['gameOver', () => this.updateGameOver()]
    ])
  }

  /**
   * ゲームを開始する
   */
  start(): void {
    // モードを初期化
    this.mode = 'newPuyo'
    // 開始時刻を記録
    this.lastTime = window.performance.now()
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }

  /**
   * ゲームを停止する
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * 下キーの状態を設定する
   * @param isPressed 下キーが押されているか
   */
  setDownKeyPressed(isPressed: boolean): void {
    this.isDownKeyPressed = isPressed
  }

  /**
   * ゲーム画面を描画する
   */
  draw(): void {
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // グリッド線を描画
    this.drawGrid(ctx)

    // ステージ（配置済みのぷよ）を描画
    this.stage.draw(ctx, this.puyoImage)

    // プレイヤー（落下中のぷよ）を描画
    this.player.draw(ctx)

    // ゲームオーバー画面を描画
    if (this.mode === 'gameOver') {
      this.drawGameOver(ctx)
    }
  }

  /**
   * グリッド線を描画する
   */
  private drawGrid(ctx: CanvasRenderingContext2D): void {
    const { cellSize, cols, rows } = this.config

    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.beginPath()

    // 縦線を描画
    for (let x = 0; x <= cols; x++) {
      const xPos = x * cellSize
      ctx.moveTo(xPos, 0)
      ctx.lineTo(xPos, rows * cellSize)
    }

    // 横線を描画
    for (let y = 0; y <= rows; y++) {
      const yPos = y * cellSize
      ctx.moveTo(0, yPos)
      ctx.lineTo(cols * cellSize, yPos)
    }

    ctx.stroke()
  }

  /**
   * ゲームループ
   */
  private gameLoop(currentTime: number): void {
    // 経過時間を計算（ミリ秒）
    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // ゲーム状態を更新
    this.update(deltaTime)

    // 描画
    this.draw()

    // 次のフレームをリクエスト
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time))
  }

  /**
   * ゲーム状態を更新する
   */
  private update(deltaTime: number): void {
    const handler = this.modeHandlers.get(this.mode)
    if (handler) {
      handler(deltaTime)
    }
  }

  /**
   * newPuyo モードの更新
   */
  private updateNewPuyo(): void {
    this.player.createNewPuyoPair()

    // ゲームオーバー判定
    if (this.player.checkGameOver()) {
      this.mode = 'gameOver'
    } else {
      this.mode = 'playing'
    }
  }

  /**
   * playing モードの更新
   */
  private updatePlaying(deltaTime: number): void {
    this.player.update(deltaTime, this.isDownKeyPressed)

    if (this.player.hasLanded()) {
      // ぷよをフィールドに配置
      this.player.placePuyos()
      this.mode = 'checkFall'
    }
  }

  /**
   * checkFall モードの更新
   */
  private updateCheckFall(): void {
    const hasFallen = this.stage.applyGravity()
    if (hasFallen) {
      this.mode = 'falling'
    } else {
      this.mode = 'checkErase'
    }
  }

  /**
   * falling モードの更新
   */
  private updateFalling(): void {
    this.mode = 'checkFall'
  }

  /**
   * checkErase モードの更新
   */
  private updateCheckErase(): void {
    const eraseInfo = this.stage.checkErase()
    if (eraseInfo.erasePuyoCount > 0) {
      this.stage.eraseBoards(eraseInfo.eraseInfo)
      this.mode = 'erasing'
    } else {
      // 消去対象がない場合、全消し判定
      if (this.stage.checkZenkeshi()) {
        // 全消しボーナスを加算
        this.score.addZenkeshiBonus()
      }
      this.mode = 'newPuyo'
    }
  }

  /**
   * erasing モードの更新
   */
  private updateErasing(): void {
    this.mode = 'checkFall'
  }

  /**
   * gameOver モードの更新
   */
  private updateGameOver(): void {
    // ゲームオーバー演出
    // アニメーションループは継続するが、更新は停止
  }

  /**
   * ゲームオーバー画面を描画する
   */
  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    // 半透明の黒い背景を描画
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // ゲームオーバーテキストを描画
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30)

    // リスタート案内テキストを描画
    ctx.font = '14px Arial'
    ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 30)
  }

  /**
   * ゲームをリスタートする
   */
  restart(): void {
    // ステージとスコアをリセット
    this.stage.reset()
    this.score.reset()

    // ゲーム状態をリセット
    this.mode = 'newPuyo'
    this.isDownKeyPressed = false
    this.lastTime = window.performance.now()
  }
}
