import { Config } from './Config'
import { PuyoImage } from './PuyoImage'
import { Stage } from './Stage'
import { Player } from './Player'
import { Score } from './Score'

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
  }

  /**
   * ゲームを開始する
   */
  start(): void {
    this.gameLoop()
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
   * ゲーム画面を描画する
   */
  draw(): void {
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // グリッド線を描画
    this.drawGrid(ctx)
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
  private gameLoop = (): void => {
    this.draw()
    this.animationId = requestAnimationFrame(this.gameLoop)
  }
}
