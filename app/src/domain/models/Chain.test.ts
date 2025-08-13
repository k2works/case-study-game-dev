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
})
