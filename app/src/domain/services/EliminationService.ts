import type { Field } from '../models/Field'
import {
  createPosition,
  getAdjacentPositions,
  positionToString,
} from '../models/Position'
import type { PuyoColor } from '../models/Puyo'
import type { PuyoGroup } from '../models/PuyoGroup'
import { createPuyoGroup, isEliminable } from '../models/PuyoGroup'

export interface EliminationResult {
  eliminatedCount: number
  groups: PuyoGroup[]
  totalScore: number
}

export class EliminationService {
  findEliminableGroups(field: Field): PuyoGroup[] {
    const visited = new Set<string>()
    const groups: PuyoGroup[] = []

    for (let y = 0; y < field.getHeight(); y++) {
      for (let x = 0; x < field.getWidth(); x++) {
        const position = createPosition(x, y)
        const positionKey = positionToString(position)

        if (!visited.has(positionKey)) {
          const puyo = field.getPuyo(x, y)
          if (puyo) {
            const group = this.exploreConnectedGroup(
              field,
              position,
              puyo.color!,
              visited,
            )
            if (isEliminable(group)) {
              groups.push(group)
            }
          }
        }
      }
    }

    return groups
  }

  eliminateGroups(field: Field, groups: PuyoGroup[]): EliminationResult {
    let eliminatedCount = 0
    let totalScore = 0

    for (const group of groups) {
      for (const position of group.positions) {
        field.removePuyo(position.x, position.y)
        eliminatedCount++
      }
      // 基本スコア計算（後で連鎖ボーナスが追加される）
      totalScore += group.size * 10
    }

    return {
      eliminatedCount,
      groups,
      totalScore,
    }
  }

  private exploreConnectedGroup(
    field: Field,
    startPosition: { x: number; y: number },
    color: string,
    visited: Set<string>,
  ): PuyoGroup {
    const positions: { x: number; y: number }[] = []
    const stack = [startPosition]

    while (stack.length > 0) {
      const position = stack.pop()!
      
      if (this.shouldSkipPosition(position, color, field, visited)) {
        continue
      }

      visited.add(positionToString(position))
      positions.push(position)
      this.addAdjacentPositionsToStack(position, stack, visited)
    }

    return createPuyoGroup(color as PuyoColor, positions)
  }

  private shouldSkipPosition(
    position: { x: number; y: number },
    color: string,
    field: Field,
    visited: Set<string>,
  ): boolean {
    const positionKey = positionToString(position)
    if (visited.has(positionKey)) return true
    if (!field.isValidPosition(position.x, position.y)) return true
    
    const puyo = field.getPuyo(position.x, position.y)
    return !puyo || puyo.color !== color
  }

  private addAdjacentPositionsToStack(
    position: { x: number; y: number },
    stack: Array<{ x: number; y: number }>,
    visited: Set<string>,
  ): void {
    const adjacentPositions = getAdjacentPositions(position)
    for (const adjPos of adjacentPositions) {
      const adjKey = positionToString(adjPos)
      if (!visited.has(adjKey)) {
        stack.push(adjPos)
      }
    }
  }
}
