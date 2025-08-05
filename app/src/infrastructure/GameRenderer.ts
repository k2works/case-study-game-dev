import { Game } from '../domain/entities/Game'

export class GameRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private readonly CELL_SIZE = 40
  private readonly colors = ['', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7']

  constructor(canvasId: string) {
    this.canvas = document.querySelector<HTMLCanvasElement>(canvasId)!
    this.ctx = this.canvas.getContext('2d')!
  }

  public render(game: Game): void {
    this.drawField(game)
    this.drawCurrentPuyo(game)
  }

  private drawField(game: Game): void {
    const field = game.getField()

    // フィールドの背景を描画
    this.ctx.fillStyle = '#f0f0f0'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // グリッドラインを描画
    this.drawGridLines(field)

    // フィールドの各セルを描画
    this.drawFieldCells(field)
  }

  private drawGridLines(field: number[][]): void {
    this.ctx.strokeStyle = '#ddd'
    this.ctx.lineWidth = 1

    // 横のグリッドライン
    for (let y = 0; y <= field.length; y++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y * this.CELL_SIZE)
      this.ctx.lineTo(this.canvas.width, y * this.CELL_SIZE)
      this.ctx.stroke()
    }

    // 縦のグリッドライン
    for (let x = 0; x <= field[0].length; x++) {
      this.ctx.beginPath()
      this.ctx.moveTo(x * this.CELL_SIZE, 0)
      this.ctx.lineTo(x * this.CELL_SIZE, this.canvas.height)
      this.ctx.stroke()
    }
  }

  private drawFieldCells(field: number[][]): void {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        if (field[y][x] !== 0) {
          this.drawPuyoCell(x, y, field[y][x])
        }
      }
    }
  }

  private drawCurrentPuyo(game: Game): void {
    const puyoPair = game.getCurrentPuyoPair()
    if (puyoPair) {
      const positions = puyoPair.getPositions()
      positions.forEach((pos) => {
        this.drawPuyoCell(pos.x, pos.y, pos.color)
      })
    }
  }

  private drawPuyoCell(x: number, y: number, color: number): void {
    // 円の中心座標と半径を計算
    const centerX = x * this.CELL_SIZE + this.CELL_SIZE / 2
    const centerY = y * this.CELL_SIZE + this.CELL_SIZE / 2
    const radius = (this.CELL_SIZE - 6) / 2 // 少し小さくしてマージンを確保

    this.ctx.fillStyle = this.colors[color] || '#999'

    // 円を描画
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    this.ctx.fill()

    // ぷよの境界線を描画
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    this.ctx.stroke()
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx
  }
}
