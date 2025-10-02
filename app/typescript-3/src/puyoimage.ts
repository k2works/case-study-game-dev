import { Config } from './config'

export class PuyoImage {
  private readonly colors: string[] = [
    '#888', // 0: 空
    '#ff0000', // 1: 赤
    '#00ff00', // 2: 緑
    '#0000ff', // 3: 青
    '#ffff00', // 4: 黄色
  ]

  constructor(private config: Config) {}

  draw(
    ctx: CanvasRenderingContext2D,
    type: number,
    x: number,
    y: number
  ): void {
    const size = this.config.puyoSize
    const color = this.colors[type] || this.colors[0]

    // 円の中心座標と半径を計算
    const centerX = x * size + size / 2
    const centerY = y * size + size / 2
    const radius = size / 2 - 2 // 少し小さめにして余白を作る

    // ぷよを円形で描画
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // 枠線を描画
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
}
