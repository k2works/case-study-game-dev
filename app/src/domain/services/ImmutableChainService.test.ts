import { describe, expect, it } from 'vitest'

import { createEmptyField, placePuyoAt } from '../models/ImmutableField'
import { createPosition } from '../models/Position'
import { createPuyo } from '../models/Puyo'
import {
  calculateChainBonus,
  canChain,
  predictMaxChain,
  processChain,
  processSingleElimination,
} from './ImmutableChainService'

describe('ImmutableChainService', () => {
  describe('連鎖ボーナス計算', () => {
    it('1連鎖のボーナスは1倍', () => {
      // Act
      const bonus = calculateChainBonus(1)

      // Assert
      expect(bonus).toBe(1)
    })

    it('2連鎖のボーナスは8倍', () => {
      // Act
      const bonus = calculateChainBonus(2)

      // Assert
      expect(bonus).toBe(8)
    })

    it('3連鎖のボーナスは16倍', () => {
      // Act
      const bonus = calculateChainBonus(3)

      // Assert
      expect(bonus).toBe(16)
    })

    it('5連鎖以上のボーナスは64倍', () => {
      // Act
      const bonus = calculateChainBonus(5)

      // Assert
      expect(bonus).toBe(64)
    })
  })

  describe('連鎖可能性判定', () => {
    it('連鎖可能なフィールドを正しく判定する', () => {
      // Arrange
      let field = createEmptyField()

      // 4つの赤ぷよを縦に並べる（消去可能）
      field = placePuyoAt(
        createPosition(0, 11),
        createPuyo('red', createPosition(0, 11)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 10),
        createPuyo('red', createPosition(0, 10)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 9),
        createPuyo('red', createPosition(0, 9)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 8),
        createPuyo('red', createPosition(0, 8)),
        field,
      )

      // Act
      const result = canChain(field)

      // Assert
      expect(result).toBe(true)
    })

    it('連鎖不可能なフィールドを正しく判定する', () => {
      // Arrange
      let field = createEmptyField()

      // 3つの赤ぷよを縦に並べる（消去不可能）
      field = placePuyoAt(
        createPosition(0, 11),
        createPuyo('red', createPosition(0, 11)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 10),
        createPuyo('red', createPosition(0, 10)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 9),
        createPuyo('red', createPosition(0, 9)),
        field,
      )

      // Act
      const result = canChain(field)

      // Assert
      expect(result).toBe(false)
    })
  })

  describe('単発消去処理', () => {
    it('消去可能なグループがある場合に正しく処理する', () => {
      // Arrange
      let field = createEmptyField()

      // 4つの赤ぷよを縦に並べる
      field = placePuyoAt(
        createPosition(0, 11),
        createPuyo('red', createPosition(0, 11)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 10),
        createPuyo('red', createPosition(0, 10)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 9),
        createPuyo('red', createPosition(0, 9)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 8),
        createPuyo('red', createPosition(0, 8)),
        field,
      )

      // Act
      const result = processSingleElimination(field)

      // Assert
      expect(result.chainCount).toBe(1)
      expect(result.totalScore).toBe(40) // 4個 × 10点
      expect(result.eliminatedGroups).toHaveLength(1)
    })

    it('消去可能なグループがない場合に正しく処理する', () => {
      // Arrange
      const field = createEmptyField()

      // Act
      const result = processSingleElimination(field)

      // Assert
      expect(result.chainCount).toBe(0)
      expect(result.totalScore).toBe(0)
      expect(result.eliminatedGroups).toHaveLength(0)
    })
  })

  describe('連鎖処理', () => {
    it('単発消去の場合に正しく処理する', () => {
      // Arrange
      let field = createEmptyField()

      // 4つの赤ぷよを縦に並べる
      field = placePuyoAt(
        createPosition(0, 11),
        createPuyo('red', createPosition(0, 11)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 10),
        createPuyo('red', createPosition(0, 10)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 9),
        createPuyo('red', createPosition(0, 9)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 8),
        createPuyo('red', createPosition(0, 8)),
        field,
      )

      // Act
      const result = processChain(field)

      // Assert
      expect(result.chainCount).toBe(1)
      expect(result.totalScore).toBe(40) // 4個 × 10点 × 1倍
    })

    it('連鎖がない場合は連鎖数0を返す', () => {
      // Arrange
      const field = createEmptyField()

      // Act
      const result = processChain(field)

      // Assert
      expect(result.chainCount).toBe(0)
      expect(result.totalScore).toBe(0)
    })
  })

  describe('最大連鎖予測', () => {
    it('連鎖がない場合は0を返す', () => {
      // Arrange
      const field = createEmptyField()

      // Act
      const result = predictMaxChain(field)

      // Assert
      expect(result).toBe(0)
    })

    it('単発消去の場合は1を返す', () => {
      // Arrange
      let field = createEmptyField()

      // 4つの赤ぷよを縦に並べる
      field = placePuyoAt(
        createPosition(0, 11),
        createPuyo('red', createPosition(0, 11)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 10),
        createPuyo('red', createPosition(0, 10)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 9),
        createPuyo('red', createPosition(0, 9)),
        field,
      )
      field = placePuyoAt(
        createPosition(0, 8),
        createPuyo('red', createPosition(0, 8)),
        field,
      )

      // Act
      const result = predictMaxChain(field)

      // Assert
      expect(result).toBe(1)
    })
  })
})
