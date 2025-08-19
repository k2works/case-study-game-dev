import { describe, expect, it } from 'vitest'

import { createEmptyField, placePuyoAt } from './ImmutableField'
import { createPuyo } from './Puyo'
import {
  canPlaceOn,
  createPuyoPair,
  getOccupiedPositions,
  movePuyoPair,
  rotatePuyoPair,
} from './PuyoPair'

describe('PuyoPair', () => {
  describe('ぷよペア作成', () => {
    it('指定した色でぷよペアを作成する', () => {
      // Act
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Assert
      expect(pair.main.color).toBe('red')
      expect(pair.main.position.x).toBe(2)
      expect(pair.main.position.y).toBe(5)
      expect(pair.sub.color).toBe('blue')
      expect(pair.sub.position.x).toBe(2)
      expect(pair.sub.position.y).toBe(4)
    })
  })

  describe('回転', () => {
    it('時計回りに回転する', () => {
      // Arrange
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Act
      const rotatedPair = rotatePuyoPair(pair, 'clockwise')

      // Assert
      expect(rotatedPair.main.position.x).toBe(2)
      expect(rotatedPair.main.position.y).toBe(5)
      expect(rotatedPair.sub.position.x).toBe(3) // 右に移動
      expect(rotatedPair.sub.position.y).toBe(5)
    })

    it('反時計回りに回転する', () => {
      // Arrange
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Act
      const rotatedPair = rotatePuyoPair(pair, 'counterclockwise')

      // Assert
      expect(rotatedPair.main.position.x).toBe(2)
      expect(rotatedPair.main.position.y).toBe(5)
      expect(rotatedPair.sub.position.x).toBe(1) // 左に移動
      expect(rotatedPair.sub.position.y).toBe(5)
    })
  })

  describe('移動', () => {
    it('指定した方向に移動する', () => {
      // Arrange
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Act
      const movedPair = movePuyoPair(pair, 1, 2)

      // Assert
      expect(movedPair.main.position.x).toBe(3)
      expect(movedPair.main.position.y).toBe(7)
      expect(movedPair.sub.position.x).toBe(3)
      expect(movedPair.sub.position.y).toBe(6)
    })
  })

  describe('占有位置取得', () => {
    it('ぷよペアが占有する位置を取得する', () => {
      // Arrange
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Act
      const positions = getOccupiedPositions(pair)

      // Assert
      expect(positions).toHaveLength(2)
      expect(positions[0]).toEqual({ x: 2, y: 5 })
      expect(positions[1]).toEqual({ x: 2, y: 4 })
    })
  })

  describe('配置可能判定', () => {
    it('空きフィールドに配置可能', () => {
      // Arrange
      const field = createEmptyField()
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Act
      const canPlace = canPlaceOn(pair, field)

      // Assert
      expect(canPlace).toBe(true)
    })

    it('占有済みフィールドに配置不可', () => {
      // Arrange
      let field = createEmptyField()
      field = placePuyoAt(
        { x: 2, y: 5 },
        createPuyo('green', { x: 2, y: 5 }),
        field,
      )
      const pair = createPuyoPair('red', 'blue', 2, 5)

      // Act
      const canPlace = canPlaceOn(pair, field)

      // Assert
      expect(canPlace).toBe(false)
    })

    it('フィールド外に配置不可', () => {
      // Arrange
      const field = createEmptyField()
      const pair = createPuyoPair('red', 'blue', -1, 5)

      // Act
      const canPlace = canPlaceOn(pair, field)

      // Assert
      expect(canPlace).toBe(false)
    })
  })
})
