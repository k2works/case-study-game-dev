import { curry } from 'lodash/fp'

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

export const movePuyo = curry(
  (newPosition: PuyoPosition, puyo: Puyo): Puyo => ({
    ...puyo,
    position: newPosition,
  }),
)
