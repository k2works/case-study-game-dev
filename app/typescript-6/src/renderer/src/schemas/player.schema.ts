import { z } from 'zod'

/**
 * 回転状態のバリデーションスキーマ
 */
export const RotationSchema = z.number().int().min(0).max(3)
