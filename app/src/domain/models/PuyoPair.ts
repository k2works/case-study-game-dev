import type { Field } from './Field'
import type { Position } from './Position'
import { createPosition } from './Position'
import type { Puyo, PuyoColor } from './Puyo'
import { createPuyo, movePuyo } from './Puyo'

export interface PuyoPair {
  readonly main: Puyo
  readonly sub: Puyo
}

export const createPuyoPair = (
  mainColor: string,
  subColor: string,
  centerX: number,
  centerY: number,
): PuyoPair => ({
  main: createPuyo(mainColor as PuyoColor, createPosition(centerX, centerY)),
  sub: createPuyo(subColor as PuyoColor, createPosition(centerX, centerY - 1)),
})

export const rotatePuyoPair = (
  pair: PuyoPair,
  direction: 'clockwise' | 'counterclockwise',
): PuyoPair => {
  const mainPos = pair.main.position
  const subPos = pair.sub.position

  const deltaX = subPos.x - mainPos.x
  const deltaY = subPos.y - mainPos.y

  let newDeltaX: number
  let newDeltaY: number

  if (direction === 'clockwise') {
    newDeltaX = -deltaY
    newDeltaY = deltaX
  } else {
    newDeltaX = deltaY
    newDeltaY = -deltaX
  }

  const newSubPosition = createPosition(
    mainPos.x + newDeltaX,
    mainPos.y + newDeltaY,
  )

  return {
    main: pair.main,
    sub: movePuyo(pair.sub, newSubPosition),
  }
}

export const movePuyoPair = (
  pair: PuyoPair,
  deltaX: number,
  deltaY: number,
): PuyoPair => {
  const newMainPosition = createPosition(
    pair.main.position.x + deltaX,
    pair.main.position.y + deltaY,
  )
  const newSubPosition = createPosition(
    pair.sub.position.x + deltaX,
    pair.sub.position.y + deltaY,
  )

  return {
    main: movePuyo(pair.main, newMainPosition),
    sub: movePuyo(pair.sub, newSubPosition),
  }
}

export const getOccupiedPositions = (pair: PuyoPair): Position[] => [
  pair.main.position,
  pair.sub.position,
]

export const canPlaceOn = (pair: PuyoPair, field: Field): boolean => {
  const positions = getOccupiedPositions(pair)

  return positions.every(
    (pos) => field.isValidPosition(pos.x, pos.y) && field.isEmpty(pos.x, pos.y),
  )
}
