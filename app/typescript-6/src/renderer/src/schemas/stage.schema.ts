import { z } from 'zod'
import { PuyoType } from '@/game/PuyoType'

/**
 * 消去情報のバリデーションスキーマ
 */
export const EraseInfoItemSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
  type: z.nativeEnum(PuyoType)
})

export const EraseInfoSchema = z.object({
  erasePuyoCount: z.number().int().nonnegative(),
  eraseInfo: z.array(EraseInfoItemSchema)
})

/**
 * 消去情報を表す型
 */
export type EraseInfo = z.infer<typeof EraseInfoSchema>
