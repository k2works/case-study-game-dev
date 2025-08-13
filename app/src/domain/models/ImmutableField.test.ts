import { describe, expect, it } from 'vitest'

import {
  cloneField,
  createField,
  createFieldFromGrid,
  getAllPositions,
  getAllPuyos,
  getPuyo,
  isEmpty,
  isValidPosition,
  removePuyo,
  removePuyos,
  setPuyo,
} from './ImmutableField'
import { createPosition } from './Position'
import { createPuyo } from './Puyo'

describe('ImmutableField', () => {
  describe('フィールド作成', () => {
    it('デフォルトサイズでフィールドを作成する', () => {
      // Act
      const field = createField()

      // Assert
      expect(field.width).toBe(6)
      expect(field.height).toBe(12)
      expect(field.grid).toHaveLength(12)
      expect(field.grid[0]).toHaveLength(6)
    })

    it('カスタムサイズでフィールドを作成する', () => {
      // Act
      const field = createField(8, 10)

      // Assert
      expect(field.width).toBe(8)
      expect(field.height).toBe(10)
      expect(field.grid).toHaveLength(10)
      expect(field.grid[0]).toHaveLength(8)
    })

    it('既存のグリッドからフィールドを作成する', () => {
      // Arrange
      const grid = [
        [null, null, null],
        [null, null, null],
      ]

      // Act
      const field = createFieldFromGrid(grid)

      // Assert
      expect(field.width).toBe(3)
      expect(field.height).toBe(2)
      expect(field.grid).toBe(grid)
    })
  })

  describe('位置の有効性', () => {
    it('有効な位置を正しく判定する', () => {
      // Arrange
      const field = createField()
      const validPosition = createPosition(2, 5)

      // Act
      const result = isValidPosition(field, validPosition)

      // Assert
      expect(result).toBe(true)
    })

    it('無効な位置を正しく判定する', () => {
      // Arrange
      const field = createField()
      const invalidPosition = createPosition(-1, 5)

      // Act
      const result = isValidPosition(field, invalidPosition)

      // Assert
      expect(result).toBe(false)
    })

    it('範囲外の位置を正しく判定する', () => {
      // Arrange
      const field = createField()
      const outOfBoundsPosition = createPosition(6, 12)

      // Act
      const result = isValidPosition(field, outOfBoundsPosition)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('ぷよの配置と取得', () => {
    it('ぷよを配置できる', () => {
      // Arrange
      const field = createField()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)

      // Act
      const newField = setPuyo(field, position, puyo)

      // Assert
      expect(getPuyo(newField, position)).toBe(puyo)
      expect(getPuyo(field, position)).toBeNull() // 元のフィールドは変更されない
    })

    it('既に占有されている位置にぷよを配置しようとするとエラーが発生する', () => {
      // Arrange
      const field = createField()
      const position = createPosition(2, 5)
      const puyo1 = createPuyo('red', position)
      const puyo2 = createPuyo('blue', position)
      const fieldWithPuyo = setPuyo(field, position, puyo1)

      // Act & Assert
      expect(() => setPuyo(fieldWithPuyo, position, puyo2)).toThrow(
        'Position already occupied',
      )
    })

    it('無効な位置にぷよを配置しようとするとエラーが発生する', () => {
      // Arrange
      const field = createField()
      const invalidPosition = createPosition(-1, 5)
      const puyo = createPuyo('red', invalidPosition)

      // Act & Assert
      expect(() => setPuyo(field, invalidPosition, puyo)).toThrow(
        'Invalid position',
      )
    })

    it('無効な位置からぷよを取得するとnullが返される', () => {
      // Arrange
      const field = createField()
      const invalidPosition = createPosition(-1, 5)

      // Act
      const result = getPuyo(field, invalidPosition)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('ぷよの削除', () => {
    it('ぷよを削除できる', () => {
      // Arrange
      const field = createField()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)
      const fieldWithPuyo = setPuyo(field, position, puyo)

      // Act
      const newField = removePuyo(fieldWithPuyo, position)

      // Assert
      expect(getPuyo(newField, position)).toBeNull()
      expect(getPuyo(fieldWithPuyo, position)).toBe(puyo) // 元のフィールドは変更されない
    })

    it('無効な位置からぷよを削除しても元のフィールドが返される', () => {
      // Arrange
      const field = createField()
      const invalidPosition = createPosition(-1, 5)

      // Act
      const result = removePuyo(field, invalidPosition)

      // Assert
      expect(result).toBe(field)
    })

    it('複数のぷよを一度に削除できる', () => {
      // Arrange
      const field = createField()
      const position1 = createPosition(1, 1)
      const position2 = createPosition(2, 2)
      const puyo1 = createPuyo('red', position1)
      const puyo2 = createPuyo('blue', position2)
      let fieldWithPuyos = setPuyo(field, position1, puyo1)
      fieldWithPuyos = setPuyo(fieldWithPuyos, position2, puyo2)

      // Act
      const newField = removePuyos(fieldWithPuyos, [position1, position2])

      // Assert
      expect(getPuyo(newField, position1)).toBeNull()
      expect(getPuyo(newField, position2)).toBeNull()
    })
  })

  describe('空きの判定', () => {
    it('空の位置を正しく判定する', () => {
      // Arrange
      const field = createField()
      const position = createPosition(2, 5)

      // Act
      const result = isEmpty(field, position)

      // Assert
      expect(result).toBe(true)
    })

    it('占有されている位置を正しく判定する', () => {
      // Arrange
      const field = createField()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)
      const fieldWithPuyo = setPuyo(field, position, puyo)

      // Act
      const result = isEmpty(fieldWithPuyo, position)

      // Assert
      expect(result).toBe(false)
    })

    it('無効な位置は空でないと判定される', () => {
      // Arrange
      const field = createField()
      const invalidPosition = createPosition(-1, 5)

      // Act
      const result = isEmpty(field, invalidPosition)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('ユーティリティ関数', () => {
    it('全ての位置を取得できる', () => {
      // Arrange
      const field = createField(2, 2)

      // Act
      const positions = getAllPositions(field)

      // Assert
      expect(positions).toHaveLength(4)
      expect(positions).toContainEqual({ x: 0, y: 0 })
      expect(positions).toContainEqual({ x: 1, y: 0 })
      expect(positions).toContainEqual({ x: 0, y: 1 })
      expect(positions).toContainEqual({ x: 1, y: 1 })
    })

    it('全てのぷよを取得できる', () => {
      // Arrange
      const field = createField(2, 2)
      const position1 = createPosition(0, 0)
      const position2 = createPosition(1, 1)
      const puyo1 = createPuyo('red', position1)
      const puyo2 = createPuyo('blue', position2)
      let fieldWithPuyos = setPuyo(field, position1, puyo1)
      fieldWithPuyos = setPuyo(fieldWithPuyos, position2, puyo2)

      // Act
      const puyos = getAllPuyos(fieldWithPuyos)

      // Assert
      expect(puyos).toHaveLength(2)
      expect(puyos).toContainEqual({ puyo: puyo1, position: position1 })
      expect(puyos).toContainEqual({ puyo: puyo2, position: position2 })
    })

    it('フィールドをクローンできる', () => {
      // Arrange
      const field = createField()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)
      const fieldWithPuyo = setPuyo(field, position, puyo)

      // Act
      const clonedField = cloneField(fieldWithPuyo)

      // Assert
      expect(clonedField).not.toBe(fieldWithPuyo)
      expect(clonedField.grid).not.toBe(fieldWithPuyo.grid)
      expect(getPuyo(clonedField, position)).toBe(puyo)
    })
  })
})
