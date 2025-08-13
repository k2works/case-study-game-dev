import { describe, expect, it } from 'vitest'

import { Chain } from './Chain'
import { Field } from './Field'
import { createPuyo } from './Puyo'

describe('Chain', () => {
  describe('連結ぷよ検索', () => {
    it('4つ以上の同色ぷよが連結している場合に検出できる', () => {
      // Arrange
      const field = new Field()
      const redPuyo1 = createPuyo('red', { x: 0, y: 11 })
      const redPuyo2 = createPuyo('red', { x: 1, y: 11 })
      const redPuyo3 = createPuyo('red', { x: 0, y: 10 })
      const redPuyo4 = createPuyo('red', { x: 1, y: 10 })

      field.setPuyo(0, 11, redPuyo1)
      field.setPuyo(1, 11, redPuyo2)
      field.setPuyo(0, 10, redPuyo3)
      field.setPuyo(1, 10, redPuyo4)

      const chain = new Chain()

      // Act
      const connectedGroups = chain.findConnectedGroups(field)

      // Assert
      expect(connectedGroups).toHaveLength(1)
      expect(connectedGroups[0].size).toBe(4)
      expect(connectedGroups[0].color).toBe('red')
    })

    it('3つ以下の同色ぷよは消去対象にならない', () => {
      // Arrange
      const field = new Field()
      const redPuyo1 = createPuyo('red', { x: 0, y: 11 })
      const redPuyo2 = createPuyo('red', { x: 1, y: 11 })
      const redPuyo3 = createPuyo('red', { x: 0, y: 10 })

      field.setPuyo(0, 11, redPuyo1)
      field.setPuyo(1, 11, redPuyo2)
      field.setPuyo(0, 10, redPuyo3)

      const chain = new Chain()

      // Act
      const connectedGroups = chain.findConnectedGroups(field)

      // Assert
      expect(connectedGroups).toHaveLength(0)
    })

    it('異なる色のぷよは連結されない', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('blue', { x: 1, y: 11 }))
      field.setPuyo(0, 10, createPuyo('red', { x: 0, y: 10 }))
      field.setPuyo(1, 10, createPuyo('red', { x: 1, y: 10 }))

      const chain = new Chain()

      // Act
      const connectedGroups = chain.findConnectedGroups(field)

      // Assert
      expect(connectedGroups).toHaveLength(0)
    })

    it('L字型の配置でも正しく連結を検出する', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(0, 10, createPuyo('red', { x: 0, y: 10 }))
      field.setPuyo(0, 9, createPuyo('red', { x: 0, y: 9 }))
      field.setPuyo(1, 9, createPuyo('red', { x: 1, y: 9 }))

      const chain = new Chain()

      // Act
      const connectedGroups = chain.findConnectedGroups(field)

      // Assert
      expect(connectedGroups).toHaveLength(1)
      expect(connectedGroups[0].size).toBe(4)
    })
  })

  describe('消去判定', () => {
    it('連結グループを正しく消去する', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('red', { x: 1, y: 11 }))
      field.setPuyo(0, 10, createPuyo('red', { x: 0, y: 10 }))
      field.setPuyo(1, 10, createPuyo('red', { x: 1, y: 10 }))
      field.setPuyo(2, 11, createPuyo('blue', { x: 2, y: 11 }))

      const chain = new Chain()

      // Act
      const eliminationResult = chain.eliminateConnectedGroups(field)

      // Assert
      expect(eliminationResult.eliminatedCount).toBe(4)
      expect(field.isEmpty(0, 11)).toBe(true)
      expect(field.isEmpty(1, 11)).toBe(true)
      expect(field.isEmpty(0, 10)).toBe(true)
      expect(field.isEmpty(1, 10)).toBe(true)
      expect(field.getPuyo(2, 11)).not.toBeNull() // blue should remain
    })

    it('複数の連結グループを同時に消去する', () => {
      // Arrange
      const field = new Field()
      // Red group
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('red', { x: 1, y: 11 }))
      field.setPuyo(0, 10, createPuyo('red', { x: 0, y: 10 }))
      field.setPuyo(1, 10, createPuyo('red', { x: 1, y: 10 }))

      // Blue group
      field.setPuyo(3, 11, createPuyo('blue', { x: 3, y: 11 }))
      field.setPuyo(4, 11, createPuyo('blue', { x: 4, y: 11 }))
      field.setPuyo(3, 10, createPuyo('blue', { x: 3, y: 10 }))
      field.setPuyo(4, 10, createPuyo('blue', { x: 4, y: 10 }))

      const chain = new Chain()

      // Act
      const eliminationResult = chain.eliminateConnectedGroups(field)

      // Assert
      expect(eliminationResult.eliminatedCount).toBe(8)
      expect(eliminationResult.groups).toHaveLength(2)
    })

    it('消去対象がない場合は何も消去しない', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('blue', { x: 1, y: 11 }))
      field.setPuyo(0, 10, createPuyo('green', { x: 0, y: 10 }))

      const chain = new Chain()

      // Act
      const eliminationResult = chain.eliminateConnectedGroups(field)

      // Assert
      expect(eliminationResult.eliminatedCount).toBe(0)
      expect(eliminationResult.groups).toHaveLength(0)
    })
  })

  describe('重力適用', () => {
    it('浮いているぷよを下に落とす', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 9, createPuyo('red', { x: 0, y: 9 }))
      field.setPuyo(0, 7, createPuyo('blue', { x: 0, y: 7 }))

      const chain = new Chain()

      // Act
      chain.applyGravity(field)

      // Assert
      expect(field.isEmpty(0, 9)).toBe(true)
      expect(field.isEmpty(0, 7)).toBe(true)
      expect(field.getPuyo(0, 11)).not.toBeNull()
      expect(field.getPuyo(0, 11)?.color).toBe('red')
      expect(field.getPuyo(0, 10)).not.toBeNull()
      expect(field.getPuyo(0, 10)?.color).toBe('blue')
    })

    it('異なる列のぷよが独立して落下する', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 8, createPuyo('red', { x: 0, y: 8 }))
      field.setPuyo(1, 6, createPuyo('blue', { x: 1, y: 6 }))
      field.setPuyo(2, 11, createPuyo('green', { x: 2, y: 11 })) // 既に底にある

      const chain = new Chain()

      // Act
      chain.applyGravity(field)

      // Assert
      expect(field.getPuyo(0, 11)?.color).toBe('red')
      expect(field.getPuyo(1, 11)?.color).toBe('blue')
      expect(field.getPuyo(2, 11)?.color).toBe('green')
    })

    it('複数のぷよが同じ列で正しい順序で積み重なる', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 5, createPuyo('red', { x: 0, y: 5 }))
      field.setPuyo(0, 3, createPuyo('blue', { x: 0, y: 3 }))
      field.setPuyo(0, 1, createPuyo('green', { x: 0, y: 1 }))

      const chain = new Chain()

      // Act
      chain.applyGravity(field)

      // Assert
      expect(field.getPuyo(0, 11)?.color).toBe('red') // 最初に置かれたもの
      expect(field.getPuyo(0, 10)?.color).toBe('blue') // 2番目
      expect(field.getPuyo(0, 9)?.color).toBe('green') // 3番目
    })

    it('隙間があっても正しく詰まる', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 })) // 底
      field.setPuyo(0, 8, createPuyo('blue', { x: 0, y: 8 })) // 隙間をあけて配置

      const chain = new Chain()

      // Act
      chain.applyGravity(field)

      // Assert
      expect(field.getPuyo(0, 11)?.color).toBe('red')
      expect(field.getPuyo(0, 10)?.color).toBe('blue') // 隙間が詰まる
      expect(field.isEmpty(0, 8)).toBe(true)
    })
  })
})
