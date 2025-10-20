import { z } from 'zod'
import { PuyoType } from '@/game/PuyoType'

/**
 * Puyo のバリデーションスキーマ
 */
export const PuyoSchema = z.object({
  x: z.number().int('x must be an integer'),
  y: z.number().int('y must be an integer'),
  type: z.nativeEnum(PuyoType, { errorMap: () => ({ message: 'Invalid PuyoType' }) })
})
