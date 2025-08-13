import type { Field } from './Field'

export interface ConnectedGroup {
  size: number
  color: string
  positions: Array<{ x: number; y: number }>
}

export class Chain {
  findConnectedGroups(field: Field): ConnectedGroup[] {
    const visited = new Set<string>()
    const groups: ConnectedGroup[] = []

    for (let y = 0; y < field.getHeight(); y++) {
      for (let x = 0; x < field.getWidth(); x++) {
        const puyo = field.getPuyo(x, y)
        if (puyo && !visited.has(`${x},${y}`)) {
          const group = this.exploreConnectedPuyos(
            field,
            x,
            y,
            puyo.color!,
            visited,
          )
          if (group.size >= 4) {
            groups.push(group)
          }
        }
      }
    }

    return groups
  }

  private exploreConnectedPuyos(
    field: Field,
    startX: number,
    startY: number,
    color: string,
    visited: Set<string>,
  ): ConnectedGroup {
    const positions: Array<{ x: number; y: number }> = []
    const stack = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      
      if (this.shouldSkipPosition(x, y, color, field, visited)) {
        continue
      }

      visited.add(`${x},${y}`)
      positions.push({ x, y })
      this.addAdjacentPositions(field, x, y, stack, visited)
    }

    return {
      size: positions.length,
      color,
      positions,
    }
  }

  private shouldSkipPosition(
    x: number,
    y: number,
    color: string,
    field: Field,
    visited: Set<string>,
  ): boolean {
    const key = `${x},${y}`
    if (visited.has(key)) return true

    const puyo = field.getPuyo(x, y)
    return !puyo || puyo.color !== color
  }

  private addAdjacentPositions(
    field: Field,
    x: number,
    y: number,
    stack: Array<{ x: number; y: number }>,
    visited: Set<string>,
  ): void {
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 }, // 右
    ]

    for (const { dx, dy } of directions) {
      const newX = x + dx
      const newY = y + dy
      const newKey = `${newX},${newY}`

      if (field.isValidPosition(newX, newY) && !visited.has(newKey)) {
        stack.push({ x: newX, y: newY })
      }
    }
  }
}
