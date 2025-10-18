import { z } from 'zod'

/**
 * ゲームモードのバリデーションスキーマ
 */
export const GameModeSchema = z.enum([
  'newPuyo',
  'playing',
  'checkFall',
  'falling',
  'checkErase',
  'erasing',
  'gameOver'
])

/**
 * ゲームモード
 */
export type GameMode = z.infer<typeof GameModeSchema>
