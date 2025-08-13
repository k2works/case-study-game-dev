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
})
