import { z } from 'zod'

/**
 * Config のバリデーションスキーマ
 */
const ConfigSchema = z.object({
  cellSize: z.number().int().positive('cellSize must be a positive integer'),
  cols: z.number().int().positive('cols must be a positive integer'),
  rows: z.number().int().positive('rows must be a positive integer')
})

/**
 * Config クラス
 * ゲームの設定を管理
 */
export class Config {
  /** セルのサイズ（ピクセル） */
  cellSize: number

  /** 列数 */
  cols: number

  /** 行数 */
  rows: number

  constructor(cellSize: number = 32, cols: number = 6, rows: number = 12) {
    // バリデーション実行
    const validated = ConfigSchema.parse({ cellSize, cols, rows })

    this.cellSize = validated.cellSize
    this.cols = validated.cols
    this.rows = validated.rows
  }
}
