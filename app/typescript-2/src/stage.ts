import { Config } from './config'
import { PuyoImage } from './puyoimage'

// ゲームステージ（盤面）を管理するクラス
export class Stage {
  private config: Config
  private puyoImage: PuyoImage
  private field: number[][] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor(config: Config, puyoImage: PuyoImage) {
    this.config = config
    this.puyoImage = puyoImage
    this.initializeField()
    this.initializeCanvas()
  }

  // フィールドの初期化（全て0で埋める）
  private initializeField(): void {
    this.field = Array.from({ length: this.config.stageRows }, () =>
      Array(this.config.stageCols).fill(0)
    )
  }

  // Canvasの初期化
  private initializeCanvas(): void {
    const stageElement = document.getElementById('stage')
    if (stageElement) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.config.stageCols * this.config.puyoSize
      this.canvas.height = this.config.stageRows * this.config.puyoSize
      this.ctx = this.canvas.getContext('2d')
      stageElement.appendChild(this.canvas)
    }
  }

  // フィールドの取得
  getField(): number[][] {
    return this.field
  }

  // 指定位置のぷよの色を取得
  getPuyo(x: number, y: number): number {
    if (this.isValidPosition(x, y)) {
      return this.field[y][x]
    }
    return -1 // 範囲外
  }

  // 指定位置にぷよを設置
  setPuyo(x: number, y: number, color: number): void {
    if (this.isValidPosition(x, y)) {
      this.field[y][x] = color
    }
  }

  // 位置が有効範囲内かチェック
  private isValidPosition(x: number, y: number): boolean {
    return (
      x >= 0 && x < this.config.stageCols && y >= 0 && y < this.config.stageRows
    )
  }

  // ステージを描画
  draw(): void {
    if (!this.ctx || !this.canvas) return

    this.drawBackground()
    this.drawGrid()
    this.drawPuyos()
  }

  // 背景を描画
  private drawBackground(): void {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = '#333333'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // グリッド線を描画
  private drawGrid(): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = '#666666'
    this.ctx.lineWidth = 1

    // 横線
    for (let y = 0; y <= this.config.stageRows; y++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y * this.config.puyoSize)
      this.ctx.lineTo(
        this.config.stageCols * this.config.puyoSize,
        y * this.config.puyoSize
      )
      this.ctx.stroke()
    }

    // 縦線
    for (let x = 0; x <= this.config.stageCols; x++) {
      this.ctx.beginPath()
      this.ctx.moveTo(x * this.config.puyoSize, 0)
      this.ctx.lineTo(
        x * this.config.puyoSize,
        this.config.stageRows * this.config.puyoSize
      )
      this.ctx.stroke()
    }
  }

  // ぷよを描画
  private drawPuyos(): void {
    if (!this.ctx) return

    for (let y = 0; y < this.config.stageRows; y++) {
      for (let x = 0; x < this.config.stageCols; x++) {
        const color = this.field[y][x]
        if (color > 0) {
          this.puyoImage.draw(
            this.ctx,
            x * this.config.puyoSize,
            y * this.config.puyoSize,
            color
          )
        }
      }
    }
  }

  // ステージ上のぷよに重力を適用（1マスずつ落とす）
  // 戻り値: 落下したぷよがあれば true
  applyGravity(): boolean {
    // フィールドのコピーを作成（移動前の状態を保存）
    const originalField: number[][] = this.field.map((row) => [...row])

    let hasFallen = false

    // 下から上に向かって各列をスキャン（列ごとに処理）
    for (let x = 0; x < this.config.stageCols; x++) {
      for (let y = this.config.stageRows - 2; y >= 0; y--) {
        const color = originalField[y][x]
        if (color > 0) {
          // 元のフィールドで下に空きがあるかチェック
          if (originalField[y + 1][x] === 0) {
            // 1マス下に移動
            this.field[y + 1][x] = color
            this.field[y][x] = 0
            hasFallen = true
          }
        }
      }
    }

    return hasFallen
  }
}
