import { curry, filter, flatMap, flow, map, sumBy } from 'lodash/fp'

import type { ImmutableField } from '../models/ImmutableField'
import {
  getAllPositions,
  getPuyo,
  isValidPosition,
  removePuyos,
} from '../models/ImmutableField'
import { getAdjacentPositions, positionToString } from '../models/Position'
import type { PuyoColor } from '../models/Puyo'
import type { PuyoGroup } from '../models/PuyoGroup'
import { createPuyoGroup, isEliminable } from '../models/PuyoGroup'

export interface ImmutableEliminationResult {
  readonly eliminatedCount: number
  readonly groups: readonly PuyoGroup[]
  readonly totalScore: number
  readonly field: ImmutableField
}

/**
 * 消去可能なグループを見つける（純粋関数）
 */
export const findEliminableGroups = (
  field: ImmutableField,
): readonly PuyoGroup[] => {
  const visited = new Set<string>()
  const groups: PuyoGroup[] = []

  for (const position of getAllPositions(field)) {
    const positionKey = positionToString(position)

    if (!visited.has(positionKey)) {
      const puyo = getPuyo(position, field)
      if (puyo) {
        const group = exploreConnectedGroup(
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

  return groups
}

/**
 * グループを消去し、新しいフィールド状態を返す（純粋関数）
 */
export const eliminateGroups = curry(
  (
    groups: readonly PuyoGroup[],
    field: ImmutableField,
  ): ImmutableEliminationResult => {
    const allPositions = flatMap((group) => group.positions, groups)
    const newField = removePuyos(allPositions, field)

    const eliminatedCount = allPositions.length
    const totalScore = flow(
      map((group: PuyoGroup) => group.size * 10),
      sumBy((score: number) => score),
    )(groups)

    return {
      eliminatedCount,
      groups,
      totalScore,
      field: newField,
    }
  },
)

/**
 * 完全な消去処理を実行する（純粋関数）
 */
export const processElimination = (
  field: ImmutableField,
): ImmutableEliminationResult => {
  const eliminableGroups = findEliminableGroups(field)
  return eliminateGroups(eliminableGroups, field)
}

/**
 * グループのフィルタリング関数
 */
export const filterEliminableGroups = (
  groups: readonly PuyoGroup[],
): readonly PuyoGroup[] => filter(isEliminable, groups)

/**
 * グループサイズによるフィルタリング
 */
export const filterGroupsBySize = curry(
  (minSize: number, groups: readonly PuyoGroup[]): readonly PuyoGroup[] =>
    filter((group) => group.size >= minSize, groups),
)

/**
 * 色によるグループフィルタリング
 */
export const filterGroupsByColor = curry(
  (color: PuyoColor, groups: readonly PuyoGroup[]): readonly PuyoGroup[] =>
    filter((group) => group.color === color, groups),
)

/**
 * スコア計算の関数型実装
 */
export const calculateGroupScore = (group: PuyoGroup): number => group.size * 10

export const calculateTotalScore = (groups: readonly PuyoGroup[]): number =>
  flow(
    map(calculateGroupScore),
    sumBy((score: number) => score),
  )(groups)

/**
 * 連結グループを探索する（内部関数）
 */
const exploreConnectedGroup = (
  field: ImmutableField,
  startPosition: { x: number; y: number },
  color: string,
  visited: Set<string>,
): PuyoGroup => {
  const positions: { x: number; y: number }[] = []
  const stack = [startPosition]

  while (stack.length > 0) {
    const position = stack.pop()!

    if (shouldSkipPosition(position, color, field, visited)) {
      continue
    }

    visited.add(positionToString(position))
    positions.push(position)
    addAdjacentPositionsToStack(position, stack, visited)
  }

  return createPuyoGroup(color as PuyoColor, positions)
}

/**
 * 位置をスキップすべきかを判定する（内部関数）
 */
const shouldSkipPosition = (
  position: { x: number; y: number },
  color: string,
  field: ImmutableField,
  visited: Set<string>,
): boolean => {
  const positionKey = positionToString(position)
  if (visited.has(positionKey)) return true
  if (!isValidPosition(position, field)) return true

  const puyo = getPuyo(position, field)
  return !puyo || puyo.color !== color
}

/**
 * 隣接する位置をスタックに追加する（内部関数）
 */
const addAdjacentPositionsToStack = (
  position: { x: number; y: number },
  stack: Array<{ x: number; y: number }>,
  visited: Set<string>,
): void => {
  const adjacentPositions = getAdjacentPositions(position)
  for (const adjPos of adjacentPositions) {
    const adjKey = positionToString(adjPos)
    if (!visited.has(adjKey)) {
      stack.push(adjPos)
    }
  }
}
