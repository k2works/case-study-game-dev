import { curry, pipe } from 'lodash/fp'

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

export const changeColor = curry(
  (newColor: PuyoColor, puyo: Puyo): Puyo => ({
    ...puyo,
    color: newColor,
  }),
)

export const getPuyoColor = (puyo: Puyo): PuyoColor => puyo.color

export const getPuyoPosition = (puyo: Puyo): PuyoPosition => puyo.position

export const isValidPuyo = (puyo: Puyo): boolean => puyo.color !== null

export const isColor = curry(
  (color: PuyoColor, puyo: Puyo): boolean => puyo.color === color,
)

export const isSameColor = (puyo1: Puyo, puyo2: Puyo): boolean =>
  puyo1.color === puyo2.color && puyo1.color !== null

export const movePuyoBy = curry(
  (deltaX: number, deltaY: number, puyo: Puyo): Puyo =>
    movePuyo(
      {
        x: puyo.position.x + deltaX,
        y: puyo.position.y + deltaY,
      },
      puyo,
    ),
)

export const transformPuyo = curry(
  (transformFn: (puyo: Puyo) => Puyo, puyo: Puyo): Puyo => transformFn(puyo),
)

export const combinePuyoTransforms = (
  ...transforms: Array<(puyo: Puyo) => Puyo>
) => pipe(...transforms)
