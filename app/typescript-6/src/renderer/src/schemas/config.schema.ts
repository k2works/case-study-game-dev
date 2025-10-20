import { z } from 'zod'

/**
 * Config のバリデーションスキーマ
 */
export const ConfigSchema = z.object({
  cellSize: z.number().int().positive('cellSize must be a positive integer'),
  cols: z.number().int().positive('cols must be a positive integer'),
  rows: z.number().int().positive('rows must be a positive integer')
})
