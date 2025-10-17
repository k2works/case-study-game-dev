import { z } from 'zod'
import { PuyoType } from './Puyo'
import type { Config } from './Config'

/**
 * PuyoImage クラス
 * ぷよの描画を管理
 */
export class PuyoImage {
  private readonly colors: Record<PuyoType, string> = {
    [PuyoType.Empty]: '#888',
    [PuyoType.Red]: '#ff0000',
    [PuyoType.Green]: '#00ff00',
    [PuyoType.Blue]: '#0000ff',
    [PuyoType.Yellow]: '#ffff00'
  }

  constructor(private config: Config) {}

  /**
   * 描画パラメータのバリデーションスキーマを生成
   */
  private getDrawParamsSchema() {
    return z.object({
      type: z.nativeEnum(PuyoType, { errorMap: () => ({ message: 'Invalid PuyoType' }) }),
      x: z.number().int(),
      y: z.number().int()
    })
  }

  draw(context: CanvasRenderingContext2D, type: PuyoType, x: number, y: number): void {
    // Zod バリデーション
    this.getDrawParamsSchema().parse({ type, x, y })

    const size = this.config.cellSize
    const color = this.colors[type] || this.colors[PuyoType.Empty]

    // 円の中心座標と半径を計算
    const centerX = x * size + size / 2
    const centerY = y * size + size / 2
    const radius = size / 2 - 2

    // ぷよを円形で描画
    context.fillStyle = color
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.fill()

    // 枠線を描画
    context.strokeStyle = '#000'
    context.lineWidth = 2
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.stroke()
  }
}
