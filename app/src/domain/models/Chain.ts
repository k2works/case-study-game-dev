import type { Field } from './Field'
import { createPuyo, type PuyoColor } from './Puyo'

export interface ConnectedGroup {
  size: number
  color: string
  positions: Array<{ x: number; y: number }>
}

export interface EliminationResult {
  eliminatedCount: number
  groups: ConnectedGroup[]
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

  eliminateConnectedGroups(field: Field): EliminationResult {
    const groupsToEliminate = this.findConnectedGroups(field)
    let eliminatedCount = 0

    for (const group of groupsToEliminate) {
      for (const position of group.positions) {
        field.removePuyo(position.x, position.y)
        eliminatedCount++
      }
    }

    return {
      eliminatedCount,
      groups: groupsToEliminate,
    }
  }

  applyGravity(field: Field): void {
    for (let x = 0; x < field.getWidth(); x++) {
      this.applyGravityToColumn(field, x)
    }
  }

  private applyGravityToColumn(field: Field, x: number): void {
    const puyos: Array<{ color: string; originalY: number }> = []

    // 列からすべてのぷよを収集
    for (let y = 0; y < field.getHeight(); y++) {
      const puyo = field.getPuyo(x, y)
      if (puyo) {
        puyos.push({ color: puyo.color!, originalY: y })
        field.removePuyo(x, y)
      }
    }

    // Y座標でソート（下にあるものが先に配置される）
    puyos.sort((a, b) => b.originalY - a.originalY)

    // 底から順に再配置
    for (let i = 0; i < puyos.length; i++) {
      const newY = field.getHeight() - 1 - i
      const newPuyo = createPuyo(puyos[i].color as PuyoColor, { x, y: newY })
      field.setPuyo(x, newY, newPuyo)
    }
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
