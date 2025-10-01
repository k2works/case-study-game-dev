import { Config } from './config'

// ぷよの画像を管理するクラス
export class PuyoImage {
  private config: Config
  private images: Map<number, HTMLCanvasElement> = new Map()

  constructor(config: Config) {
    this.config = config
    this.initialize()
  }

  // 画像の初期化（各色のぷよ画像を生成）
  private initialize(): void {
    // 色ごとにCanvas要素を作成してぷよを描画
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'] // 赤、緑、青、黄

    colors.forEach((color, index) => {
      const canvas = document.createElement('canvas')
      canvas.width = this.config.puyoSize
      canvas.height = this.config.puyoSize
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // 円を描画
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(
          this.config.puyoSize / 2,
          this.config.puyoSize / 2,
          this.config.puyoSize / 2 - 2,
          0,
          Math.PI * 2
        )
        ctx.fill()

        // 外枠を描画
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 色番号は1から始まる（0は空）
      this.images.set(index + 1, canvas)
    })
  }

  // 指定した色のぷよ画像を取得
  getImage(color: number): HTMLCanvasElement | undefined {
    return this.images.get(color)
  }

  // ぷよを描画
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: number
  ): void {
    const image = this.getImage(color)
    if (image) {
      ctx.drawImage(image, x, y)
    }
  }
}
