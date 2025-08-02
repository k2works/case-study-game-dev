import { Game } from '../../domain/model/Game'
import { GameField } from '../../domain/model/GameField'
import { PuyoPair, PuyoColor } from '../../domain/model/Puyo'

export class GameRenderer {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private readonly cellSize = 32
  private readonly fieldOffsetX: number
  private readonly fieldOffsetY = 40

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('2D context not supported')
    }
    this.context = context
    this.setupCanvas()
    
    // ゲームフィールドを中央配置するためのオフセット計算
    // キャンバス幅320px、フィールド幅 6 * 32 = 192px
    this.fieldOffsetX = (this.canvas.width - (6 * this.cellSize)) / 2
  }

  private setupCanvas(): void {
    this.canvas.width = 320
    this.canvas.height = 480
    this.context.font = '16px Arial'
    this.context.textAlign = 'left'
  }

  render(game: Game): void {
    this.clearCanvas()
    this.renderField(game.getField())
    this.renderCurrentPuyo(game.getCurrentPuyo())
    this.renderScore(game.getScore())
    this.renderGameState(game)
  }

  private clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private renderField(field: GameField): void {
    // フィールドの枠線を描画
    this.context.strokeStyle = '#333'
    this.context.lineWidth = 2
    this.context.strokeRect(
      this.fieldOffsetX - 2,
      this.fieldOffsetY - 2,
      field.getWidth() * this.cellSize + 4,
      field.getHeight() * this.cellSize + 4
    )

    // フィールドのセルを描画
    for (let y = 0; y < field.getHeight(); y++) {
      for (let x = 0; x < field.getWidth(); x++) {
        const color = field.getCell(x, y)
        if (color !== null) {
          this.renderPuyo(x, y, color)
        }
      }
    }
  }

  private renderCurrentPuyo(puyoPair: PuyoPair | null): void {
    if (!puyoPair) return

    this.renderPuyo(
      puyoPair.main.position.x,
      puyoPair.main.position.y,
      puyoPair.main.color
    )
    this.renderPuyo(
      puyoPair.sub.position.x,
      puyoPair.sub.position.y,
      puyoPair.sub.color
    )
  }

  private renderPuyo(x: number, y: number, color: PuyoColor): void {
    const pixelX = this.fieldOffsetX + x * this.cellSize
    const pixelY = this.fieldOffsetY + y * this.cellSize

    this.context.fillStyle = this.getPuyoColor(color)
    this.context.fillRect(pixelX, pixelY, this.cellSize, this.cellSize)

    // ぷよの縁を描画
    this.context.strokeStyle = '#000'
    this.context.lineWidth = 1
    this.context.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize)
  }

  private getPuyoColor(color: PuyoColor): string {
    switch (color) {
      case PuyoColor.RED:
        return '#ff4444'
      case PuyoColor.BLUE:
        return '#4444ff'
      case PuyoColor.GREEN:
        return '#44ff44'
      case PuyoColor.YELLOW:
        return '#ffff44'
      case PuyoColor.PURPLE:
        return '#ff44ff'
      default:
        return '#cccccc'
    }
  }

  private renderScore(score: number): void {
    this.context.fillStyle = '#000'
    this.context.fillText(`Score: ${score}`, 10, 30)
  }

  private renderGameState(game: Game): void {
    const state = game.getState()
    this.context.fillStyle = '#000'
    this.context.fillText(`State: ${state}`, 10, this.canvas.height - 20)
  }
}