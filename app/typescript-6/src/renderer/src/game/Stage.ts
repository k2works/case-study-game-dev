import { z } from 'zod'

/**
 * Stage のバリデーションスキーマ
 */
const StageSchema = z.object({
  cols: z.number().int().positive('cols must be a positive integer'),
  rows: z.number().int().positive('rows must be a positive integer')
})

/**
 * Stage クラス
 * ゲームのステージ（フィールド）を管理
 */
export class Stage {
  private cols: number
  private rows: number

  constructor(cols: number, rows: number) {
    // バリデーション実行
    const validated = StageSchema.parse({ cols, rows })

    this.cols = validated.cols
    this.rows = validated.rows
  }
}
