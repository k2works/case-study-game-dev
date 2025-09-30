import { Config } from './config'
import { PuyoImage } from './puyoimage'

// ゲームのステージ（盤面）を管理するクラス
export class Stage {
  private _config: Config
  private _puyoImage: PuyoImage
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private stageData: string[][] = []

  constructor(config: Config, puyoImage: PuyoImage) {
    this._config = config
    this._puyoImage = puyoImage
  }

  // ステージを初期化する
  initialize(): void {
    const canvas = document.getElementById('stage') as HTMLCanvasElement
    if (!canvas) {
      console.error('Canvas element not found')
      return
    }
    this.canvas = canvas
    this.context = canvas.getContext('2d')

    // ステージデータを初期化（全て空）
    this.stageData = []
    for (let row = 0; row < this._config.stageRows; row++) {
      this.stageData[row] = []
      for (let col = 0; col < this._config.stageCols; col++) {
        this.stageData[row][col] = ''
      }
    }
  }

  // ステージをクリア（背景を描画）
  clear(): void {
    if (!this.context || !this.canvas) return

    // 背景を白で塗りつぶす
    this.context.fillStyle = '#ffffff'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // グリッド線を描画
    this.context.strokeStyle = '#e0e0e0'
    this.context.lineWidth = 1

    // 縦線
    for (let col = 0; col <= this._config.stageCols; col++) {
      const x = col * this._config.puyoSize
      this.context.beginPath()
      this.context.moveTo(x, 0)
      this.context.lineTo(x, this.canvas.height)
      this.context.stroke()
    }

    // 横線
    for (let row = 0; row <= this._config.stageRows; row++) {
      const y = row * this._config.puyoSize
      this.context.beginPath()
      this.context.moveTo(0, y)
      this.context.lineTo(this.canvas.width, y)
      this.context.stroke()
    }
  }

  // ぷよを描画
  drawPuyo(x: number, y: number, color: string): void {
    if (!this.context) return

    const px = x * this._config.puyoSize
    const py = y * this._config.puyoSize
    const size = this._config.puyoSize

    // ぷよを円で描画
    this.context.fillStyle = color
    this.context.beginPath()
    this.context.arc(px + size / 2, py + size / 2, size / 2 - 4, 0, Math.PI * 2)
    this.context.fill()

    // 枠線
    this.context.strokeStyle = '#333'
    this.context.lineWidth = 2
    this.context.stroke()

    // ハイライト
    this.context.fillStyle = 'rgba(255, 255, 255, 0.3)'
    this.context.beginPath()
    this.context.arc(px + size / 3, py + size / 3, size / 6, 0, Math.PI * 2)
    this.context.fill()
  }

  // ステージデータからぷよを取得
  getPuyo(x: number, y: number): string {
    if (y < 0 || y >= this._config.stageRows || x < 0 || x >= this._config.stageCols) {
      return ''
    }
    return this.stageData[y][x]
  }

  // ステージデータにぷよを配置
  setPuyo(x: number, y: number, color: string): void {
    if (y < 0 || y >= this._config.stageRows || x < 0 || x >= this._config.stageCols) {
      return
    }
    this.stageData[y][x] = color
  }

  // ステージに配置された全てのぷよを描画
  drawStagePuyos(): void {
    for (let row = 0; row < this._config.stageRows; row++) {
      for (let col = 0; col < this._config.stageCols; col++) {
        const color = this.stageData[row][col]
        if (color !== '') {
          this.drawPuyo(col, row, color)
        }
      }
    }
  }
}
