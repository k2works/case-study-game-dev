import type { FieldData } from '../models/Field.ts'
import { isEmptyAt, isValidPosition } from '../models/Field.ts'
import type { Position } from '../models/Position'
import type { PuyoData } from '../models/Puyo'
import type { PuyoPair } from '../models/PuyoPair'
import { movePuyoPair } from '../models/PuyoPair'

// 関数型スタイルの衝突判定サービス関数群

/**
 * ぷよペアがフィールドに配置可能かチェック
 * @param puyoPair 配置するぷよペア
 * @param field 対象フィールド
 * @returns 配置可能な場合true
 */
export const canPlacePuyoPair = (
  puyoPair: PuyoPair,
  field: FieldData,
): boolean => {
  const mainCanPlace = canPlacePuyo(puyoPair.main, field)
  const subCanPlace = canPlacePuyo(puyoPair.sub, field)

  return mainCanPlace && subCanPlace
}

/**
 * 単一のぷよが指定位置に配置可能かチェック
 * @param puyo 配置するぷよ
 * @param field 対象フィールド
 * @returns 配置可能な場合true
 */
export const canPlacePuyo = (puyo: PuyoData, field: FieldData): boolean => {
  const { x, y } = puyo.position

  // 境界チェック
  if (!isWithinBounds(puyo.position, field)) {
    return false
  }

  // 占有チェック
  if (!isEmptyAt({ x, y }, field)) {
    return false
  }

  return true
}

/**
 * ぷよペアの着地位置を探索
 * @param puyoPair 落下するぷよペア
 * @param field 対象フィールド
 * @returns 着地位置のぷよペア、着地できない場合null
 */
export const findLandingPosition = (
  puyoPair: PuyoPair,
  field: FieldData,
): PuyoPair | null => {
  let currentPair = puyoPair
  let nextPair = movePuyoPairDown(currentPair)

  // 下に移動できる限り下げる
  while (canPlacePuyoPair(nextPair, field)) {
    currentPair = nextPair
    nextPair = movePuyoPairDown(currentPair)
  }

  // 最終的に配置できない場合はnullを返す
  return canPlacePuyoPair(currentPair, field) ? currentPair : null
}

/**
 * ぷよペアを1マス下に移動
 * @param puyoPair 移動するぷよペア
 * @returns 移動後のぷよペア
 */
const movePuyoPairDown = (puyoPair: PuyoPair): PuyoPair =>
  movePuyoPair(puyoPair, 0, 1)

/**
 * 指定位置がフィールド境界内かチェック
 * @param position チェックする位置
 * @param field 対象フィールド
 * @returns 境界内の場合true
 */
export const isWithinBounds = (position: Position, field: FieldData): boolean =>
  isValidPosition(position, field)

/**
 * ぷよペアの水平移動の妥当性をチェック
 * @param puyoPair 移動するぷよペア
 * @param direction 移動方向（-1: 左, 1: 右）
 * @param field 対象フィールド
 * @returns 移動可能な場合true
 */
export const canMoveHorizontally = (
  puyoPair: PuyoPair,
  direction: -1 | 1,
  field: FieldData,
): boolean => {
  const movedPair = movePuyoPair(puyoPair, direction, 0)
  return canPlacePuyoPair(movedPair, field)
}

/**
 * ぷよペアの回転の妥当性をチェック
 * @param originalPair 元のぷよペア
 * @param rotatedPair 回転後のぷよペア
 * @param field 対象フィールド
 * @returns 回転可能な場合true
 */
export const canRotate = (
  _originalPair: PuyoPair,
  rotatedPair: PuyoPair,
  field: FieldData,
): boolean => canPlacePuyoPair(rotatedPair, field)

/**
 * 壁蹴り可能な位置を探索
 * @param rotatedPair 回転後のぷよペア
 * @param field 対象フィールド
 * @param kickOffsets 試行する蹴り位置のオフセット
 * @returns 壁蹴り可能な位置のぷよペア、不可能な場合null
 */
export const findWallKickPosition = (
  rotatedPair: PuyoPair,
  field: FieldData,
  kickOffsets: Position[],
): PuyoPair | null => {
  for (const offset of kickOffsets) {
    const kickedPair = movePuyoPair(rotatedPair, offset.x, offset.y)

    if (canPlacePuyoPair(kickedPair, field)) {
      return kickedPair
    }
  }

  return null
}

/**
 * ゲームオーバー判定
 * @param field 対象フィールド
 * @param spawnPosition 新しいぷよの生成位置
 * @returns ゲームオーバーの場合true
 */
export const isGameOver = (
  field: FieldData,
  spawnPosition: Position,
): boolean => !isEmptyAt(spawnPosition, field)

/**
 * フィールド内の危険な領域をチェック
 * @param field 対象フィールド
 * @param dangerLine 危険ライン（この高さ以上にぷよがあると危険）
 * @returns 危険な場合true
 */
export const isDangerZone = (
  field: FieldData,
  dangerLine: number = 2,
): boolean => {
  for (let x = 0; x < field.width; x++) {
    for (let y = 0; y < dangerLine; y++) {
      if (!isEmptyAt({ x, y }, field)) {
        return true
      }
    }
  }
  return false
}

/**
 * 指定位置から落下する可能性のあるぷよを検索
 * @param field 対象フィールド
 * @param checkPosition チェック開始位置
 * @returns 落下するぷよの位置配列
 */
export const findFloatingPuyos = (
  field: FieldData,
  checkPosition: Position,
): Position[] => {
  const floatingPuyos: Position[] = []

  // 指定位置から上方向をチェック
  for (let y = checkPosition.y - 1; y >= 0; y--) {
    if (!isEmptyAt({ x: checkPosition.x, y }, field)) {
      floatingPuyos.push({ x: checkPosition.x, y })
    }
  }

  return floatingPuyos
}
