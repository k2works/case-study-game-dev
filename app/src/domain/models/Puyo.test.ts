import { describe, expect, it } from 'vitest'

import { type Puyo, type PuyoPosition, createPuyo, movePuyo } from './Puyo'

describe('Puyo', () => {
  describe('createPuyo', () => {
    it('指定した色と位置でぷよを作成できる', () => {
      // Arrange
      const color = 'red'
      const position: PuyoPosition = { x: 2, y: 10 }

      // Act
      const puyo = createPuyo(color, position)

      // Assert
      expect(puyo.color).toBe('red')
      expect(puyo.position).toEqual({ x: 2, y: 10 })
    })

    it('null色のぷよを作成できる', () => {
      // Arrange
      const position: PuyoPosition = { x: 0, y: 0 }

      // Act
      const puyo = createPuyo(null, position)

      // Assert
      expect(puyo.color).toBeNull()
      expect(puyo.position).toEqual({ x: 0, y: 0 })
    })
  })

  describe('movePuyo', () => {
    it('ぷよを新しい位置に移動できる', () => {
      // Arrange
      const puyo: Puyo = createPuyo('blue', { x: 2, y: 10 })
      const newPosition: PuyoPosition = { x: 3, y: 11 }

      // Act
      const movedPuyo = movePuyo(puyo, newPosition)

      // Assert
      expect(movedPuyo.position).toEqual({ x: 3, y: 11 })
      expect(movedPuyo.color).toBe('blue')
    })

    it('元のぷよは変更されない（イミュータブル）', () => {
      // Arrange
      const originalPuyo: Puyo = createPuyo('green', { x: 1, y: 5 })
      const newPosition: PuyoPosition = { x: 2, y: 6 }

      // Act
      const movedPuyo = movePuyo(originalPuyo, newPosition)

      // Assert
      expect(originalPuyo.position).toEqual({ x: 1, y: 5 })
      expect(movedPuyo).not.toBe(originalPuyo)
    })
  })
})
