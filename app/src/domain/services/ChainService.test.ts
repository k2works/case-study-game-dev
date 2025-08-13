import { describe, expect, it } from 'vitest'

import { Field } from '../models/Field'
import { createPuyo } from '../models/Puyo'
import { ChainService } from './ChainService'

describe('ChainService', () => {
  describe('連鎖処理', () => {
    it('単発消去を正しく処理する', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('red', { x: 1, y: 11 }))
      field.setPuyo(0, 10, createPuyo('red', { x: 0, y: 10 }))
      field.setPuyo(1, 10, createPuyo('red', { x: 1, y: 10 }))

      const chainService = new ChainService()

      // Act
      const result = chainService.processChain(field)

      // Assert
      expect(result.chainCount).toBe(1)
      expect(result.totalScore).toBe(40) // 4ぷよ × 10 × 1倍（1連鎖）
      expect(result.eliminationResults).toHaveLength(1)
    })

    it('2連鎖を正しく処理する', () => {
      // Arrange
      const field = new Field()

      // 1段目（青4つ）
      field.setPuyo(0, 11, createPuyo('blue', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('blue', { x: 1, y: 11 }))
      field.setPuyo(2, 11, createPuyo('blue', { x: 2, y: 11 }))
      field.setPuyo(3, 11, createPuyo('blue', { x: 3, y: 11 }))

      // 2段目（赤3つ + 青1つが支えている）
      field.setPuyo(0, 10, createPuyo('red', { x: 0, y: 10 }))
      field.setPuyo(1, 10, createPuyo('red', { x: 1, y: 10 }))
      field.setPuyo(2, 10, createPuyo('red', { x: 2, y: 10 }))
      field.setPuyo(3, 10, createPuyo('blue', { x: 3, y: 10 }))

      // 3段目（赤1つ）
      field.setPuyo(3, 9, createPuyo('red', { x: 3, y: 9 }))

      const chainService = new ChainService()

      // Act
      const result = chainService.processChain(field)

      // Assert
      expect(result.chainCount).toBe(2)
      expect(result.eliminationResults).toHaveLength(2)

      // 1回目：青5つ消去（5 × 10 × 1 = 50）
      expect(result.eliminationResults[0].eliminatedCount).toBe(5)
      expect(result.eliminationResults[0].totalScore).toBe(50)

      // 2回目：赤4つ消去（4 × 10 × 8 = 320）落下後に4つ連結
      expect(result.eliminationResults[1].eliminatedCount).toBe(4)
      expect(result.eliminationResults[1].totalScore).toBe(320)

      expect(result.totalScore).toBe(370) // 50 + 320
    })

    it('消去対象がない場合は何もしない', () => {
      // Arrange
      const field = new Field()
      field.setPuyo(0, 11, createPuyo('red', { x: 0, y: 11 }))
      field.setPuyo(1, 11, createPuyo('blue', { x: 1, y: 11 }))
      field.setPuyo(0, 10, createPuyo('green', { x: 0, y: 10 }))

      const chainService = new ChainService()

      // Act
      const result = chainService.processChain(field)

      // Assert
      expect(result.chainCount).toBe(0)
      expect(result.totalScore).toBe(0)
      expect(result.eliminationResults).toHaveLength(0)
    })
  })
})
