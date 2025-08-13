import { describe, expect, it } from 'vitest'

import { FieldAdapter } from './FieldAdapter'
import { createField } from './ImmutableField'
import { createPosition } from './Position'
import { createPuyo } from './Puyo'

describe('FieldAdapter', () => {
  describe('基本動作', () => {
    it('デフォルトコンストラクタで初期化できる', () => {
      // Act
      const adapter = new FieldAdapter()

      // Assert
      expect(adapter.getWidth()).toBe(6)
      expect(adapter.getHeight()).toBe(12)
    })

    it('ImmutableFieldから初期化できる', () => {
      // Arrange
      const immutableField = createField(4, 8)

      // Act
      const adapter = FieldAdapter.fromImmutableField(immutableField)

      // Assert
      expect(adapter.getWidth()).toBe(4)
      expect(adapter.getHeight()).toBe(8)
      expect(adapter.getImmutableField()).toBe(immutableField)
    })
  })

  describe('ぷよの操作', () => {
    it('ぷよを配置して取得できる', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)

      // Act
      adapter.setPuyo(2, 5, puyo)

      // Assert
      expect(adapter.getPuyo(2, 5)).toBe(puyo)
    })

    it('ぷよを削除できる', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)
      adapter.setPuyo(2, 5, puyo)

      // Act
      adapter.removePuyo(2, 5)

      // Assert
      expect(adapter.getPuyo(2, 5)).toBeNull()
    })

    it('空きを正しく判定する', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)

      // Act & Assert
      expect(adapter.isEmpty(2, 5)).toBe(true)
      adapter.setPuyo(2, 5, puyo)
      expect(adapter.isEmpty(2, 5)).toBe(false)
    })

    it('位置の有効性を正しく判定する', () => {
      // Arrange
      const adapter = new FieldAdapter()

      // Act & Assert
      expect(adapter.isValidPosition(2, 5)).toBe(true)
      expect(adapter.isValidPosition(-1, 5)).toBe(false)
      expect(adapter.isValidPosition(6, 12)).toBe(false)
    })
  })

  describe('新機能', () => {
    it('全てのぷよを取得できる', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position1 = createPosition(1, 1)
      const position2 = createPosition(2, 2)
      const puyo1 = createPuyo('red', position1)
      const puyo2 = createPuyo('blue', position2)
      adapter.setPuyo(1, 1, puyo1)
      adapter.setPuyo(2, 2, puyo2)

      // Act
      const puyos = adapter.getAllPuyos()

      // Assert
      expect(puyos).toHaveLength(2)
      expect(puyos).toContainEqual({ puyo: puyo1, position: position1 })
      expect(puyos).toContainEqual({ puyo: puyo2, position: position2 })
    })

    it('フィールドをクローンできる', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)
      adapter.setPuyo(2, 5, puyo)

      // Act
      const clonedAdapter = adapter.clone()

      // Assert
      expect(clonedAdapter).not.toBe(adapter)
      expect(clonedAdapter.getPuyo(2, 5)).toBe(puyo)

      // 元のアダプターの変更がクローンに影響しないことを確認
      adapter.removePuyo(2, 5)
      expect(clonedAdapter.getPuyo(2, 5)).toBe(puyo)
    })
  })

  describe('既存Fieldクラスとの互換性', () => {
    it('既存のコードと同じインターフェースを提供する', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position = createPosition(2, 5)
      const puyo = createPuyo('red', position)

      // Act & Assert - Field クラスと同じメソッドが使える
      expect(() => adapter.setPuyo(2, 5, puyo)).not.toThrow()
      expect(adapter.getPuyo(2, 5)).toBe(puyo)
      expect(adapter.isEmpty(1, 1)).toBe(true)
      expect(adapter.isValidPosition(2, 5)).toBe(true)
      expect(() => adapter.removePuyo(2, 5)).not.toThrow()
      expect(adapter.getWidth()).toBe(6)
      expect(adapter.getHeight()).toBe(12)
    })

    it('エラー処理も既存クラスと同様に動作する', () => {
      // Arrange
      const adapter = new FieldAdapter()
      const position = createPosition(2, 5)
      const puyo1 = createPuyo('red', position)
      const puyo2 = createPuyo('blue', position)

      // Act & Assert
      adapter.setPuyo(2, 5, puyo1)
      expect(() => adapter.setPuyo(2, 5, puyo2)).toThrow(
        'Position already occupied',
      )
      expect(() => adapter.setPuyo(-1, 5, puyo1)).toThrow('Invalid position')
    })
  })
})
