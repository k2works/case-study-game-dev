import { curry, flow } from 'lodash/fp'

import type { ImmutableField } from '../models/ImmutableField'
import type { PuyoGroup } from '../models/PuyoGroup'
import {
  eliminateGroups,
  findEliminableGroups,
} from './ImmutableEliminationService'
import { applyGravityUntilStable } from './ImmutableGravityService'

export interface ImmutableChainResult {
  readonly field: ImmutableField
  readonly chainCount: number
  readonly totalScore: number
  readonly eliminatedGroups: readonly PuyoGroup[]
}

/**
 * 連鎖処理を実行する（純粋関数）
 */
export const processChain = (field: ImmutableField): ImmutableChainResult => {
  let currentField = field
  let chainCount = 0
  let totalScore = 0
  const allEliminatedGroups: PuyoGroup[] = []

  // 連鎖が続く限り処理を継続
  while (true) {
    // 重力を適用
    currentField = applyGravityUntilStable(currentField)

    // 消去可能なグループを探す
    const eliminableGroups = findEliminableGroups(currentField)

    if (eliminableGroups.length === 0) {
      // 消去可能なグループがない場合、連鎖終了
      break
    }

    // グループを消去
    const eliminationResult = eliminateGroups(eliminableGroups, currentField)
    currentField = eliminationResult.field

    // 連鎖カウントと記録を更新
    chainCount++
    allEliminatedGroups.push(...eliminationResult.groups)

    // スコア計算（連鎖ボーナス適用）
    const chainBonus = calculateChainBonus(chainCount)
    const chainScore = eliminationResult.totalScore * chainBonus
    totalScore += chainScore
  }

  return {
    field: currentField,
    chainCount,
    totalScore,
    eliminatedGroups: allEliminatedGroups,
  }
}

/**
 * 単発の消去処理を実行する（純粋関数）
 */
export const processSingleElimination = (
  field: ImmutableField,
): ImmutableChainResult => {
  // 重力を適用
  const fieldAfterGravity = applyGravityUntilStable(field)

  // 消去可能なグループを探す
  const eliminableGroups = findEliminableGroups(fieldAfterGravity)

  if (eliminableGroups.length === 0) {
    return {
      field: fieldAfterGravity,
      chainCount: 0,
      totalScore: 0,
      eliminatedGroups: [],
    }
  }

  // グループを消去
  const eliminationResult = eliminateGroups(eliminableGroups, fieldAfterGravity)

  return {
    field: eliminationResult.field,
    chainCount: 1,
    totalScore: eliminationResult.totalScore,
    eliminatedGroups: eliminationResult.groups,
  }
}

/**
 * 連鎖ボーナスを計算する（純粋関数）
 */
export const calculateChainBonus = (chainCount: number): number => {
  if (chainCount <= 1) return 1

  // 連鎖ボーナス計算
  // 2連鎖: 8倍, 3連鎖: 16倍, 4連鎖: 32倍, 5連鎖以上: 64倍
  const bonusMap = {
    2: 8,
    3: 16,
    4: 32,
  }

  return bonusMap[chainCount as keyof typeof bonusMap] ?? 64
}

/**
 * 連鎖スコアを計算する関数型アプローチ
 */
export const calculateChainScore = curry(
  (chainCount: number, baseScore: number): number =>
    flow(calculateChainBonus, (bonus: number) => baseScore * bonus)(chainCount),
)

/**
 * 連鎖可能性を判定する（純粋関数）
 */
export const canChain = (field: ImmutableField): boolean => {
  const eliminableGroups = findEliminableGroups(field)
  return eliminableGroups.length > 0
}

/**
 * 最大連鎖数を予測する（純粋関数、簡易版）
 */
export const predictMaxChain = (field: ImmutableField): number => {
  let currentField = field
  let maxChain = 0
  let iterations = 0
  const maxIterations = 20 // 無限ループ防止

  while (canChain(currentField) && iterations < maxIterations) {
    const chainResult = processSingleElimination(currentField)
    currentField = chainResult.field
    maxChain++
    iterations++
  }

  return maxChain
}
