export interface Position {
  readonly x: number
  readonly y: number
}

export const createPosition = (x: number, y: number): Position => ({ x, y })

export const positionEquals = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y

export const positionToString = (position: Position): string =>
  `${position.x},${position.y}`

export const getAdjacentPositions = (position: Position): Position[] => [
  createPosition(position.x, position.y - 1), // 上
  createPosition(position.x, position.y + 1), // 下
  createPosition(position.x - 1, position.y), // 左
  createPosition(position.x + 1, position.y), // 右
]
