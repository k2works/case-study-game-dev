export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | null

export interface PuyoPosition {
  readonly x: number
  readonly y: number
}

export interface Puyo {
  readonly color: PuyoColor
  readonly position: PuyoPosition
}

export const createPuyo = (color: PuyoColor, position: PuyoPosition): Puyo => ({
  color,
  position,
})

export const movePuyo = (puyo: Puyo, newPosition: PuyoPosition): Puyo => ({
  ...puyo,
  position: newPosition,
})
