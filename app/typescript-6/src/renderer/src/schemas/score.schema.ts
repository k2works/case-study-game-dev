import { z } from 'zod'

/**
 * スコア値のバリデーションスキーマ
 */
export const ScoreValueSchema = z.number().int().nonnegative()
