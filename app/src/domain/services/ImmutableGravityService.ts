import type { ImmutableField } from '../models/ImmutableField'
import {
  createField,
  getPuyo,
  isEmpty,
  setPuyo,
} from '../models/ImmutableField'
import { createPosition } from '../models/Position'
import type { Puyo } from '../models/Puyo'

/**
 * 重力を適用して、新しいフィールド状態を返す（純粋関数）
 */
export const applyGravity = (field: ImmutableField): ImmutableField => {
  // 各列ごとに重力を適用
  const columns: Array<Array<{ puyo: Puyo; originalY: number }>> = []

  // 各列のぷよを収集
  for (let x = 0; x < field.width; x++) {
    const columnPuyos: Array<{ puyo: Puyo; originalY: number }> = []

    for (let y = 0; y < field.height; y++) {
      const puyo = getPuyo(createPosition(x, y), field)
      if (puyo) {
        columnPuyos.push({ puyo, originalY: y })
      }
    }

    columns.push(columnPuyos)
  }

  // 新しい空のフィールドを作成
  let newField = createField(field.width, field.height)

  // 各列に重力を適用してぷよを再配置
  for (let x = 0; x < field.width; x++) {
    const columnPuyos = columns[x]

    // ぷよを底から順に配置（降順ソート）
    columnPuyos.sort((a, b) => b.originalY - a.originalY)

    // 下から順に配置
    for (let i = 0; i < columnPuyos.length; i++) {
      const { puyo } = columnPuyos[i]
      const newY = field.height - 1 - i
      const newPosition = createPosition(x, newY)

      if (isEmpty(newPosition, newField)) {
        newField = setPuyo(newPosition, puyo, newField)
      }
    }
  }

  return newField
}

/**
 * 重力が必要かどうかを判定する（純粋関数）
 */
export const needsGravity = (field: ImmutableField): boolean => {
  for (let x = 0; x < field.width; x++) {
    let foundEmpty = false

    for (let y = field.height - 1; y >= 0; y--) {
      const position = createPosition(x, y)
      const puyo = getPuyo(position, field)

      if (!puyo) {
        foundEmpty = true
      } else if (foundEmpty) {
        // 空の位置の上にぷよがある場合、重力が必要
        return true
      }
    }
  }

  return false
}

/**
 * 重力適用の完了を待つ（必要に応じて複数回適用）
 */
export const applyGravityUntilStable = (
  field: ImmutableField,
): ImmutableField => {
  let currentField = field
  let iterations = 0
  const maxIterations = 20 // 無限ループ防止

  while (needsGravity(currentField) && iterations < maxIterations) {
    currentField = applyGravity(currentField)
    iterations++
  }

  return currentField
}
