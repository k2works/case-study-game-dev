import type { Position } from './Position'
import type { PuyoColor } from './Puyo'

export interface PuyoGroup {
  readonly color: PuyoColor
  readonly positions: readonly Position[]
  readonly size: number
}

export const createPuyoGroup = (
  color: PuyoColor,
  positions: Position[],
): PuyoGroup => ({
  color,
  positions: [...positions],
  size: positions.length,
})

export const isEliminable = (group: PuyoGroup): boolean => group.size >= 4

export const calculateBaseScore = (group: PuyoGroup): number => {
  // 基本スコア = 消去ぷよ数 × 10
  return group.size * 10
}
