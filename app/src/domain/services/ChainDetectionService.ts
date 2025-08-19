import { curry, flow, map, sum } from 'lodash/fp'

import type { FieldData, PuyoWithPosition } from '../models/Field.ts'
import {
  findConnectedPuyos as fieldFindConnectedPuyos,
  findErasableGroups as fieldFindErasableGroups,
  getColoredPuyosWithPositions,
} from '../models/Field.ts'
import type { PuyoColor } from '../models/Puyo'

/**
 * 連鎖検出用のぷよグループ情報
 */
export interface PuyoGroupData {
  readonly puyos: PuyoWithPosition[]
  readonly color: PuyoColor
  readonly size: number
  readonly baseScore: number
  readonly positions: { x: number; y: number }[]
}

/**
 * 連鎖結果情報
 */
export interface ChainResult {
  readonly erasedGroups: PuyoGroupData[]
  readonly chainCount: number
  readonly totalScore: number
  readonly isAllClear: boolean
  readonly bonusScore: number
}

// =============================================================================
// 純粋関数による連鎖検出・スコア計算サービス
// =============================================================================
/**
 * フィールド内の消去可能なぷよグループを検索する純粋関数
 * @param field 対象のフィールド
 * @returns 消去可能なぷよグループの配列
 */
export const findErasableGroups = (field: FieldData): PuyoGroupData[] => {
  return flow(fieldFindErasableGroups, map(convertToPuyoGroupData))(field)
}

/**
 * PuyoWithPosition[]をPuyoGroupDataに変換する純粋関数
 */
const convertToPuyoGroupData = (puyos: PuyoWithPosition[]): PuyoGroupData => {
  if (puyos.length === 0) {
    throw new Error('Empty puyo group')
  }

  const color = puyos[0].puyo.color
  const positions = map(({ position }) => position)(puyos)

  return Object.freeze({
    puyos,
    color,
    size: puyos.length,
    baseScore: calculateGroupBaseScore(puyos.length),
    positions,
  })
}

/**
 * 指定位置から同色で連結されたぷよを探索する純粋関数
 * @param startPosition 開始位置
 * @param field フィールド
 * @returns 連結されたぷよの配列
 */
export const findConnectedPuyos = curry(
  (
    startPosition: { x: number; y: number },
    field: FieldData,
  ): PuyoWithPosition[] => {
    return fieldFindConnectedPuyos(startPosition, field)
  },
)

// =============================================================================
// スコア計算用純粋関数
// =============================================================================

/**
 * 連鎖数に基づくボーナススコアを計算する純粋関数
 * @param chainCount 連鎖数
 * @returns チェインボーナス
 */
export const calculateChainBonus = (chainCount: number): number => {
  const chainBonusTable = [
    0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448,
    480, 512,
  ]

  if (chainCount <= 0) {
    return 0
  }

  return chainCount < chainBonusTable.length
    ? chainBonusTable[chainCount]
    : chainBonusTable[chainBonusTable.length - 1]
}

/**
 * 同時消しボーナスを計算する純粋関数
 * @param groupCount 同時に消去されたグループ数
 * @returns 同時消しボーナス
 */
export const calculateGroupBonus = (groupCount: number): number => {
  const groupBonusTable = [0, 2, 3, 4, 5, 6, 7, 10]

  if (groupCount <= 1) {
    return 0
  }

  return groupCount < groupBonusTable.length
    ? groupBonusTable[groupCount]
    : groupBonusTable[groupBonusTable.length - 1]
}

/**
 * 全消しボーナスを計算する純粋関数
 * @returns 全消しボーナススコア
 */
export const calculateAllClearBonus = (): number => 2100

/**
 * グループサイズに基づくベーススコアを計算する純粋関数
 * @param groupSize グループサイズ
 * @returns ベーススコア
 */
export const calculateGroupBaseScore = (groupSize: number): number => {
  return groupSize * 10
}

/**
 * 連鎖全体のスコアを計算する純粋関数
 * @param erasedGroups 消去されたグループ
 * @param chainCount 連鎖数
 * @param isAllClear 全消しかどうか
 * @returns 計算されたスコア
 */
export const calculateChainScore = curry(
  (
    chainCount: number,
    isAllClear: boolean,
    erasedGroups: PuyoGroupData[],
  ): number => {
    // 各グループのベーススコアを合計
    const totalBaseScore = flow(
      map((group: PuyoGroupData) => group.baseScore),
      sum,
    )(erasedGroups)

    // ボーナス計算
    const chainBonus = calculateChainBonus(chainCount)
    const groupBonus = calculateGroupBonus(erasedGroups.length)
    const bonusMultiplier = Math.max(1, chainBonus + groupBonus)

    let totalScore = totalBaseScore * bonusMultiplier

    // 全消しボーナス
    if (isAllClear) {
      totalScore += calculateAllClearBonus()
    }

    return totalScore
  },
)

/**
 * 次の連鎖が発生するかチェックする純粋関数
 * @param field 重力適用後のフィールド
 * @returns 連鎖が継続する場合true
 */
export const hasNextChain = (field: FieldData): boolean => {
  const erasableGroups = findErasableGroups(field)
  return erasableGroups.length > 0
}

// =============================================================================
// 関数合成によるチェーン処理パイプライン
// =============================================================================

/**
 * 単一チェーンを処理するパイプライン
 * @param field フィールド
 * @param chainCount 現在の連鎖数
 * @returns 連鎖結果
 */
export const processSingleChain = curry(
  (chainCount: number, field: FieldData): ChainResult => {
    const erasedGroups = findErasableGroups(field)
    const isAllClear =
      erasedGroups.length > 0 &&
      getColoredPuyosWithPositions(field).length ===
        sum(map((g: PuyoGroupData) => g.size)(erasedGroups))
    const totalScore = calculateChainScore(chainCount, isAllClear, erasedGroups)
    const bonusScore =
      totalScore - sum(map((g: PuyoGroupData) => g.baseScore)(erasedGroups))

    return Object.freeze({
      erasedGroups,
      chainCount,
      totalScore,
      isAllClear,
      bonusScore,
    })
  },
)

/**
 * チェーン情報を組み合わせる純粋関数
 */
export const combineChainResults = (results: ChainResult[]): ChainResult => {
  const allErasedGroups = flattenDeep(
    map((r: ChainResult) => r.erasedGroups)(results),
  )
  const maxChainCount = Math.max(
    ...map((r: ChainResult) => r.chainCount)(results),
  )
  const totalScore = sum(map((r: ChainResult) => r.totalScore)(results))
  const totalBonusScore = sum(map((r: ChainResult) => r.bonusScore)(results))
  const isAllClear = results.some((r: ChainResult) => r.isAllClear)

  return Object.freeze({
    erasedGroups: allErasedGroups,
    chainCount: maxChainCount,
    totalScore,
    isAllClear,
    bonusScore: totalBonusScore,
  })
}

// ヘルパー関数（lodash/fpにない関数）
const flattenDeep = <T>(arr: T[][]): T[] => arr.flat()

/**
 * フィールドから全てのぷよを削除する純粋関数
 * @param field 対象フィールド
 * @returns 全消し状態かどうか
 */
export const isAllClear = (field: FieldData): boolean => {
  const coloredPuyos = getColoredPuyosWithPositions(field)
  return coloredPuyos.length === 0
}

/**
 * 連鎖処理を実行する純粋関数パイプライン
 * @param field 対象フィールド
 * @param currentChainCount 現在の連鎖数
 * @returns 処理結果
 */
export const executeChainStep = curry(
  (currentChainCount: number, field: FieldData): ChainResult => {
    const erasedGroups = findErasableGroups(field)

    if (erasedGroups.length === 0) {
      return Object.freeze({
        erasedGroups: [],
        chainCount: currentChainCount,
        totalScore: 0,
        isAllClear: false,
        bonusScore: 0,
      })
    }

    const isAllClearState = isAllClear(field)
    const totalScore = calculateChainScore(
      currentChainCount,
      isAllClearState,
      erasedGroups,
    )
    const baseScore = sum(map((g: PuyoGroupData) => g.baseScore)(erasedGroups))
    const bonusScore = totalScore - baseScore

    return Object.freeze({
      erasedGroups,
      chainCount: currentChainCount,
      totalScore,
      isAllClear: isAllClearState,
      bonusScore,
    })
  },
)
