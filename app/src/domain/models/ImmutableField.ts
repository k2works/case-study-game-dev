import type { Position } from './Position'
import type { Puyo } from './Puyo'

/**
 * 不変フィールドインターフェース
 * フィールドの状態を変更する際は新しいインスタンスを返す
 */
export interface ImmutableField {
  readonly width: number
  readonly height: number
  readonly grid: ReadonlyArray<ReadonlyArray<Puyo | null>>
}

/**
 * 不変フィールドを作成する
 */
export const createField = (width = 6, height = 12): ImmutableField => ({
  width,
  height,
  grid: Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null),
  ),
})

/**
 * 既存のグリッドから不変フィールドを作成する
 */
export const createFieldFromGrid = (
  grid: ReadonlyArray<ReadonlyArray<Puyo | null>>,
): ImmutableField => ({
  width: grid[0]?.length ?? 0,
  height: grid.length,
  grid,
})

/**
 * フィールドの指定位置のぷよを取得する
 */
export const getPuyo = (
  field: ImmutableField,
  position: Position,
): Puyo | null => {
  if (!isValidPosition(field, position)) {
    return null
  }
  return field.grid[position.y][position.x]
}

/**
 * フィールドの指定位置にぷよを配置した新しいフィールドを返す
 */
export const setPuyo = (
  field: ImmutableField,
  position: Position,
  puyo: Puyo,
): ImmutableField => {
  if (!isValidPosition(field, position)) {
    throw new Error(`Invalid position: (${position.x}, ${position.y})`)
  }

  if (!isEmpty(field, position)) {
    throw new Error(`Position already occupied: (${position.x}, ${position.y})`)
  }

  const newGrid = field.grid.map((row, y) =>
    row.map((cell, x) => (x === position.x && y === position.y ? puyo : cell)),
  )

  return createFieldFromGrid(newGrid)
}

/**
 * フィールドの指定位置からぷよを削除した新しいフィールドを返す
 */
export const removePuyo = (
  field: ImmutableField,
  position: Position,
): ImmutableField => {
  if (!isValidPosition(field, position)) {
    return field
  }

  const newGrid = field.grid.map((row, y) =>
    row.map((cell, x) => (x === position.x && y === position.y ? null : cell)),
  )

  return createFieldFromGrid(newGrid)
}

/**
 * 指定位置が空かどうかを判定する
 */
export const isEmpty = (field: ImmutableField, position: Position): boolean => {
  if (!isValidPosition(field, position)) {
    return false
  }
  return field.grid[position.y][position.x] === null
}

/**
 * 指定位置が有効かどうかを判定する
 */
export const isValidPosition = (
  field: ImmutableField,
  position: Position,
): boolean => {
  return (
    position.x >= 0 &&
    position.x < field.width &&
    position.y >= 0 &&
    position.y < field.height
  )
}

/**
 * フィールドの全ての位置を取得する
 */
export const getAllPositions = (field: ImmutableField): Position[] => {
  const positions: Position[] = []
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      positions.push({ x, y })
    }
  }
  return positions
}

/**
 * フィールドの全てのぷよとその位置を取得する
 */
export const getAllPuyos = (
  field: ImmutableField,
): Array<{ puyo: Puyo; position: Position }> => {
  const puyos: Array<{ puyo: Puyo; position: Position }> = []
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const puyo = field.grid[y][x]
      if (puyo) {
        puyos.push({ puyo, position: { x, y } })
      }
    }
  }
  return puyos
}

/**
 * 複数のぷよを一度に削除した新しいフィールドを返す
 */
export const removePuyos = (
  field: ImmutableField,
  positions: Position[],
): ImmutableField => {
  const positionSet = new Set(positions.map((pos) => `${pos.x},${pos.y}`))

  const newGrid = field.grid.map((row, y) =>
    row.map((cell, x) => (positionSet.has(`${x},${y}`) ? null : cell)),
  )

  return createFieldFromGrid(newGrid)
}

/**
 * フィールドをクローンする
 */
export const cloneField = (field: ImmutableField): ImmutableField => ({
  ...field,
  grid: field.grid.map((row) => [...row]),
})
