import type { FieldAdapter } from './FieldAdapter'
import type { Position } from './Position'
import { createPosition } from './Position'
import type { PuyoColor, PuyoData } from './Puyo'
import { createPuyo, movePuyo } from './Puyo'

export interface PuyoPair {
  readonly main: PuyoData
  readonly sub: PuyoData
}

export const createPuyoPair = (
  mainColor: PuyoColor,
  subColor: PuyoColor,
  centerX: number,
  centerY: number,
): PuyoPair => ({
  main: createPuyo(mainColor, createPosition(centerX, centerY)),
  sub: createPuyo(subColor, createPosition(centerX, centerY - 1)),
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
    sub: movePuyo(newSubPosition, pair.sub),
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
    main: movePuyo(newMainPosition, pair.main),
    sub: movePuyo(newSubPosition, pair.sub),
  }
}

export const getOccupiedPositions = (pair: PuyoPair): Position[] => [
  pair.main.position,
  pair.sub.position,
]

export const canPlaceOn = (pair: PuyoPair, field: FieldAdapter): boolean => {
  const positions = getOccupiedPositions(pair)

  return positions.every(
    (pos) => field.isValidPosition(pos.x, pos.y) && field.isEmpty(pos.x, pos.y),
  )
}

// 壁蹴り（Wall Kick）機能付き回転
export const rotatePuyoPairWithWallKick = (
  pair: PuyoPair,
  direction: 'clockwise' | 'counterclockwise',
  field: FieldAdapter,
): PuyoPair => {
  // まず通常の回転を試みる
  const rotatedPair = rotatePuyoPair(pair, direction)

  if (canPlaceOn(rotatedPair, field)) {
    return rotatedPair
  }

  // 壁蹴りパターンを定義（優先順位順）
  // 1. 左右に1マスずらす
  // 2. 上下に1マスずらす
  // 3. 斜めにずらす（角の場合）
  const wallKickOffsets = [
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 }, // 右
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 }, // 下
    { x: -1, y: -1 }, // 左上
    { x: 1, y: -1 }, // 右上
    { x: -1, y: 1 }, // 左下
    { x: 1, y: 1 }, // 右下
  ]

  // 各オフセットを試す
  for (const offset of wallKickOffsets) {
    const kickedPair = movePuyoPair(rotatedPair, offset.x, offset.y)

    if (canPlaceOn(kickedPair, field)) {
      return kickedPair
    }
  }

  // 壁蹴りできない場合は元の位置を返す（回転しない）
  return pair
}
