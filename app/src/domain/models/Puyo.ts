import { curry, filter, flow, groupBy, map } from 'lodash/fp'

import type { Position } from './Position'
import { positionEquals } from './Position'

export type PuyoColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | null

/**
 * ぷよの不変データ構造
 * 実装戦略：完全にイミュータブルな値オブジェクト
 */
export interface PuyoData {
  readonly color: PuyoColor
  readonly position: Position
}

// =============================================================================
// ファクトリ関数（純粋関数）
// =============================================================================

/**
 * ぷよを生成する純粋関数
 * @param color ぷよの色
 * @param position ぷよの位置
 * @returns 不変なぷよデータ
 */
export const createPuyo = (color: PuyoColor, position: Position): PuyoData => {
  validatePuyoColor(color)
  validatePosition(position)
  return Object.freeze({ color, position })
}

/**
 * 色情報なしでぷよデータを生成（空のセル用）
 */
export const createEmptyPuyo = (position: Position): PuyoData =>
  createPuyo(null, position)

// =============================================================================
// バリデーション関数（純粋関数）
// =============================================================================

/**
 * ぷよの色が有効かどうかを検証
 */
const validatePuyoColor = (color: PuyoColor): void => {
  const validColors: PuyoColor[] = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    null,
  ]
  if (!validColors.includes(color)) {
    throw new Error(`Invalid puyo color: ${color}`)
  }
}

/**
 * 位置が有効かどうかを検証
 */
const validatePosition = (position: Position): void => {
  if (!Number.isInteger(position.x) || !Number.isInteger(position.y)) {
    throw new Error(
      `Position coordinates must be integers: ${position.x}, ${position.y}`,
    )
  }
  // ゲームロジックでは一時的に負の座標が発生する可能性があるため
  // 極端に大きな負の値のみ制限する
  if (position.x < -100 || position.y < -100) {
    throw new Error(
      `Position coordinates out of reasonable range: ${position.x}, ${position.y}`,
    )
  }
}

// =============================================================================
// 変換関数（純粋関数 + カリー化）
// =============================================================================

/**
 * ぷよを新しい位置に移動（カリー化関数）
 */
export const movePuyo = curry(
  (newPosition: Position, puyo: PuyoData): PuyoData =>
    createPuyo(puyo.color, newPosition),
)

/**
 * ぷよの色を変更（カリー化関数）
 */
export const changePuyoColor = curry(
  (newColor: PuyoColor, puyo: PuyoData): PuyoData =>
    createPuyo(newColor, puyo.position),
)

// =============================================================================
// 述語関数（カリー化）
// =============================================================================

/**
 * ぷよが指定の色かどうかを判定
 */
export const isPuyoColor = curry(
  (color: PuyoColor, puyo: PuyoData): boolean => puyo.color === color,
)

/**
 * ぷよが指定の位置にあるかどうかを判定
 */
export const isPuyoAtPosition = curry(
  (position: Position, puyo: PuyoData): boolean =>
    positionEquals(puyo.position, position),
)

/**
 * ぷよが空（色なし）かどうかを判定
 */
export const isPuyoEmpty = (puyo: PuyoData): boolean => puyo.color === null

/**
 * ぷよが色付きかどうかを判定
 */
export const isPuyoColored = (puyo: PuyoData): boolean => puyo.color !== null

/**
 * 2つのぷよが同じかどうかを判定
 */
export const arePuyosEqual = curry(
  (puyo1: PuyoData, puyo2: PuyoData): boolean =>
    puyo1.color === puyo2.color &&
    positionEquals(puyo1.position, puyo2.position),
)

/**
 * 2つのぷよが同じ色かどうかを判定
 */
export const arePuyosSameColor = curry(
  (puyo1: PuyoData, puyo2: PuyoData): boolean =>
    puyo1.color === puyo2.color && puyo1.color !== null,
)

// =============================================================================
// 高階関数とファクトリ
// =============================================================================

/**
 * 特定の色のぷよをフィルタリングする関数を生成
 */
export const createColorFilter = (color: PuyoColor) =>
  filter(isPuyoColor(color))

/**
 * 特定の位置のぷよをフィルタリングする関数を生成
 */
export const createPositionFilter = (position: Position) =>
  filter(isPuyoAtPosition(position))

/**
 * 色付きぷよのみをフィルタリング
 */
export const filterColoredPuyos = filter(isPuyoColored)

/**
 * 空のぷよのみをフィルタリング
 */
export const filterEmptyPuyos = filter(isPuyoEmpty)

// =============================================================================
// 関数合成によるデータ変換パイプライン
// =============================================================================

/**
 * ぷよリストを色でグループ化
 */
export const groupPuyosByColor = groupBy((puyo: PuyoData) => puyo.color)

/**
 * ぷよリストから位置リストを抽出
 */
export const extractPositions = map((puyo: PuyoData) => puyo.position)

/**
 * ぷよリストから色リストを抽出
 */
export const extractColors = map((puyo: PuyoData) => puyo.color)

/**
 * ぷよリストから色付きぷよの位置を抽出するパイプライン
 */
export const getColoredPuyoPositions = flow(
  filterColoredPuyos,
  extractPositions,
)

/**
 * 指定した色のぷよの位置を取得するパイプライン関数を生成
 */
export const createColorPositionExtractor = (color: PuyoColor) =>
  flow(createColorFilter(color), extractPositions)

// =============================================================================
// 便利関数
// =============================================================================

/**
 * ぷよを文字列表現に変換（デバッグ用）
 */
export const puyoToString = (puyo: PuyoData): string =>
  `Puyo(${puyo.color || 'empty'}, ${puyo.position.x}, ${puyo.position.y})`

/**
 * ぷよの簡潔な文字表現（パターン表示用）
 */
export const puyoToChar = (puyo: PuyoData): string => {
  const colorMap: Record<NonNullable<PuyoColor>, string> = {
    red: 'R',
    blue: 'B',
    green: 'G',
    yellow: 'Y',
    purple: 'P',
  }
  return puyo.color ? colorMap[puyo.color] : '.'
}
