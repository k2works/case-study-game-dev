import { describe, expect, it } from 'vitest'

import {
  areFieldsEqual,
  createEmptyField,
  // 下位互換のエイリアス
  createField,
  createFieldFromGrid,
  createFieldFromPattern,
  fieldToPatternString,
  findConnectedPuyos,
  findErasableGroups,
  getColoredPositions,
  getFieldStatistics,
  getPuyo,
  getPuyoAt,
  getPuyosOfColor,
  isEmpty,
  isFieldEmpty,
  isFieldFull,
  isRowFull,
  isValidPosition,
  placePuyoAt,
  removeAllPuyosOfColor,
  removePuyoAt,
  setPuyo,
} from './ImmutableField'
import { createPosition } from './Position'
import { createPuyo } from './Puyo'

describe('関数型ImmutableField', () => {
  describe('ファクトリ関数', () => {
    describe('createEmptyField', () => {
      it('デフォルトサイズで不変な空フィールドを作成する', () => {
        // When
        const field = createEmptyField()

        // Then
        expect(field.width).toBe(6)
        expect(field.height).toBe(12)
        expect(field.grid).toHaveLength(12)
        expect(field.grid[0]).toHaveLength(6)
        expect(Object.isFrozen(field)).toBe(true)
        expect(Object.isFrozen(field.grid)).toBe(true)
        expect(Object.isFrozen(field.grid[0])).toBe(true)
      })

      it('カスタムサイズで不変なフィールドを作成する', () => {
        // When
        const field = createEmptyField(8, 10)

        // Then
        expect(field.width).toBe(8)
        expect(field.height).toBe(10)
        expect(field.grid).toHaveLength(10)
        expect(field.grid[0]).toHaveLength(8)
        expect(Object.isFrozen(field)).toBe(true)
      })

      it('無効な寸法の場合はエラーをスローする', () => {
        // When & Then
        expect(() => createEmptyField(0, 10)).toThrow(
          'Field dimensions must be positive',
        )
        expect(() => createEmptyField(10, 0)).toThrow(
          'Field dimensions must be positive',
        )
        expect(() => createEmptyField(-1, 10)).toThrow(
          'Field dimensions must be positive',
        )
        expect(() => createEmptyField(25, 10)).toThrow(
          'Field dimensions too large',
        )
      })
    })

    describe('createFieldFromGrid', () => {
      it('既存のグリッドから不変なフィールドを作成する', () => {
        // Given
        const grid = [
          [null, null, null],
          [null, null, null],
        ]

        // When
        const field = createFieldFromGrid(grid)

        // Then
        expect(field.width).toBe(3)
        expect(field.height).toBe(2)
        expect(field.grid).not.toBe(grid) // 新しいインスタンス
        expect(Object.isFrozen(field)).toBe(true)
        expect(Object.isFrozen(field.grid)).toBe(true)
      })
    })

    describe('createFieldFromPattern', () => {
      it('文字列パターンからフィールドを作成する', () => {
        // Given
        const pattern = [
          ['R', 'B', '.'],
          ['.', 'G', 'Y'],
        ]

        // When
        const field = createFieldFromPattern(pattern)

        // Then
        expect(field.width).toBe(3)
        expect(field.height).toBe(2)
        expect(getPuyoAt(createPosition(0, 0), field)?.color).toBe('red')
        expect(getPuyoAt(createPosition(1, 0), field)?.color).toBe('blue')
        expect(getPuyoAt(createPosition(2, 0), field)).toBeNull()
        expect(getPuyoAt(createPosition(1, 1), field)?.color).toBe('green')
        expect(Object.isFrozen(field)).toBe(true)
      })
    })
  })

  describe('述語関数（カリー化）', () => {
    const field = createEmptyField()

    describe('isValidPosition', () => {
      it('有効な位置を正しく判定する', () => {
        // Given
        const validPosition = createPosition(2, 5)

        // When
        const result = isValidPosition(validPosition, field)

        // Then
        expect(result).toBe(true)
      })

      it('無効な位置を正しく判定する', () => {
        // Given
        const invalidPosition = createPosition(-1, 5)

        // When
        const result = isValidPosition(invalidPosition, field)

        // Then
        expect(result).toBe(false)
      })

      it('範囲外の位置を正しく判定する', () => {
        // Given
        const outOfBoundsPosition = createPosition(6, 12)

        // When
        const result = isValidPosition(outOfBoundsPosition, field)

        // Then
        expect(result).toBe(false)
      })

      it('カリー化された関数として使用できる', () => {
        // Given
        const isValidInField = isValidPosition(createPosition(3, 3))

        // When & Then
        expect(isValidInField(field)).toBe(true)
        expect(isValidInField(createEmptyField(2, 2))).toBe(false)
      })
    })

    describe('フィールド状態判定', () => {
      it('空のフィールドを正しく判定する', () => {
        // When & Then
        expect(isFieldEmpty(field)).toBe(true)
        expect(isFieldFull(field)).toBe(false)
      })

      it('満杯のフィールドを正しく判定する', () => {
        // Given
        const smallField = createEmptyField(2, 2)
        let fullField = smallField
        for (let y = 0; y < 2; y++) {
          for (let x = 0; x < 2; x++) {
            const puyo = createPuyo('red', createPosition(x, y))
            fullField = placePuyoAt(createPosition(x, y), puyo, fullField)
          }
        }

        // When & Then
        expect(isFieldEmpty(fullField)).toBe(false)
        expect(isFieldFull(fullField)).toBe(true)
      })

      it('行の満杯状態を正しく判定する', () => {
        // Given
        const field = createEmptyField(3, 2)
        const puyo1 = createPuyo('red', createPosition(0, 0))
        const puyo2 = createPuyo('blue', createPosition(1, 0))
        const puyo3 = createPuyo('green', createPosition(2, 0))
        let fieldWithPuyos = placePuyoAt(createPosition(0, 0), puyo1, field)
        fieldWithPuyos = placePuyoAt(
          createPosition(1, 0),
          puyo2,
          fieldWithPuyos,
        )
        fieldWithPuyos = placePuyoAt(
          createPosition(2, 0),
          puyo3,
          fieldWithPuyos,
        )

        // When & Then
        expect(isRowFull(0, fieldWithPuyos)).toBe(true)
        expect(isRowFull(1, fieldWithPuyos)).toBe(false)
      })
    })
  })

  describe('関数型プログラミングの性質検証', () => {
    it('純粋関数：同じ入力に対して常に同じ出力を返す', () => {
      // Given
      const pattern = [
        ['R', 'B'],
        ['.', 'G'],
      ]

      // When
      const field1 = createFieldFromPattern(pattern)
      const field2 = createFieldFromPattern(pattern)

      // Then
      expect(areFieldsEqual(field1, field2)).toBe(true)
    })

    it('イミュータビリティ：オブジェクトが凍結されている', () => {
      // Given
      const field = createEmptyField()

      // When & Then
      expect(Object.isFrozen(field)).toBe(true)
      expect(Object.isFrozen(field.grid)).toBe(true)
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(field as any).width = 10 // 型チェックを回避してテスト
      }).toThrow()
    })

    it('副作用なし：変換操作は元のデータを変更しない', () => {
      // Given
      const originalField = createEmptyField()
      const puyo = createPuyo('red', createPosition(0, 0))

      // When
      placePuyoAt(createPosition(0, 0), puyo, originalField)
      removePuyoAt(createPosition(0, 0), originalField)
      removeAllPuyosOfColor('red', originalField)

      // Then
      expect(isFieldEmpty(originalField)).toBe(true)
    })
  })

  describe('高階関数とフィルタリング', () => {
    const testField = createFieldFromPattern([
      ['R', 'R', 'B'],
      ['G', '.', 'B'],
      ['G', 'Y', '.'],
    ])

    it('色付きぷよの位置を正しく抽出する', () => {
      // When
      const coloredPositions = getColoredPositions(testField)

      // Then
      expect(coloredPositions).toHaveLength(7)
      expect(coloredPositions).toContainEqual({ x: 0, y: 0 })
      expect(coloredPositions).not.toContainEqual({ x: 1, y: 1 })
    })

    it('特定の色のぷよを取得する', () => {
      // When
      const redPuyos = getPuyosOfColor('red', testField)

      // Then
      expect(redPuyos).toHaveLength(2)
      expect(redPuyos.every(({ puyo }) => puyo.color === 'red')).toBe(true)
    })

    it('述語関数に基づいてぷよを削除する', () => {
      // When
      const fieldWithoutRed = removeAllPuyosOfColor('red', testField)

      // Then
      const redPuyosAfter = getPuyosOfColor('red', fieldWithoutRed)
      expect(redPuyosAfter).toHaveLength(0)
    })
  })

  describe('連鎖検出機能', () => {
    it('連結したぷよを正しく検出する', () => {
      // Given
      const field = createFieldFromPattern([
        ['R', 'R', '.'],
        ['R', 'B', '.'],
        ['.', 'B', '.'],
      ])

      // When
      const connectedRed = findConnectedPuyos(createPosition(0, 0), field)

      // Then
      expect(connectedRed).toHaveLength(3)
      expect(connectedRed.every(({ puyo }) => puyo.color === 'red')).toBe(true)
    })

    it('消去可能グループを正しく検出する', () => {
      // Given
      const field = createFieldFromPattern([
        ['R', 'R', 'B'],
        ['R', 'R', 'B'],
        ['G', 'G', 'B'],
      ])

      // When
      const erasableGroups = findErasableGroups(field)

      // Then
      expect(erasableGroups).toHaveLength(1) // 赤ぷよが4個
      expect(erasableGroups[0]).toHaveLength(4)
      expect(erasableGroups[0].every(({ puyo }) => puyo.color === 'red')).toBe(
        true,
      )
    })
  })

  describe('ユーティリティ関数', () => {
    const testField = createFieldFromPattern([
      ['R', 'B'],
      ['.', 'G'],
    ])

    it('フィールドをパターン文字列に変換する', () => {
      // When
      const patternString = fieldToPatternString(testField)

      // Then
      expect(patternString).toBe('RB\n.G')
    })

    it('フィールド統計を正しく計算する', () => {
      // When
      const stats = getFieldStatistics(testField)

      // Then
      expect(stats.totalPuyos).toBe(3)
      expect(stats.emptySpaces).toBe(1)
      expect(stats.isEmpty).toBe(false)
      expect(stats.isFull).toBe(false)
    })

    it('フィールドの等価性を判定する', () => {
      // Given
      const field1 = createFieldFromPattern([['R', 'B']])
      const field2 = createFieldFromPattern([['R', 'B']])
      const field3 = createFieldFromPattern([['B', 'R']])

      // When & Then
      expect(areFieldsEqual(field1, field2)).toBe(true)
      expect(areFieldsEqual(field1, field3)).toBe(false)
    })
  })

  // 下位互換性テスト
  describe('下位互換性テスト', () => {
    it('古いAPIも引き続き動作する', () => {
      // When
      const field = createField() // 古いAPI
      const position = createPosition(1, 1)
      const puyo = createPuyo('red', position)
      const newField = setPuyo(position, puyo, field) // 古いAPI

      // Then
      expect(getPuyo(position, newField)).toBe(puyo) // 古いAPI
      expect(isEmpty(position, field)).toBe(true) // 古いAPI
    })
  })
})
