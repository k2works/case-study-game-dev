import { describe, expect, it } from 'vitest'

import { createField, setPuyo } from '../models/ImmutableField'
import { createPuyo } from '../models/Puyo'
import {
  eliminateGroups,
  findEliminableGroups,
  processElimination,
} from './ImmutableEliminationService'

describe('ImmutableEliminationService', () => {
  describe('findEliminableGroups', () => {
    it('空のフィールドでは消去可能なグループを見つけない', () => {
      // Arrange
      const field = createField()

      // Act
      const groups = findEliminableGroups(field)

      // Assert
      expect(groups).toHaveLength(0)
    })

    it('4つ連結した同色ぷよを消去可能なグループとして見つける', () => {
      // Arrange
      let field = createField()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })

      // 垂直に4つ配置
      field = setPuyo(field, { x: 0, y: 0 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 3 }, redPuyo)

      // Act
      const groups = findEliminableGroups(field)

      // Assert
      expect(groups).toHaveLength(1)
      expect(groups[0].size).toBe(4)
      expect(groups[0].color).toBe('red')
    })

    it('3つ以下の連結では消去可能なグループとして見つけない', () => {
      // Arrange
      let field = createField()
      const bluePuyo = createPuyo('blue', { x: 0, y: 0 })

      // 3つだけ配置
      field = setPuyo(field, { x: 0, y: 0 }, bluePuyo)
      field = setPuyo(field, { x: 0, y: 1 }, bluePuyo)
      field = setPuyo(field, { x: 0, y: 2 }, bluePuyo)

      // Act
      const groups = findEliminableGroups(field)

      // Assert
      expect(groups).toHaveLength(0)
    })

    it('L字型の連結を正しく検出する', () => {
      // Arrange
      let field = createField()
      const greenPuyo = createPuyo('green', { x: 0, y: 0 })

      // L字型に配置
      field = setPuyo(field, { x: 0, y: 0 }, greenPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, greenPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, greenPuyo)
      field = setPuyo(field, { x: 1, y: 0 }, greenPuyo)

      // Act
      const groups = findEliminableGroups(field)

      // Assert
      expect(groups).toHaveLength(1)
      expect(groups[0].size).toBe(4)
      expect(groups[0].color).toBe('green')
    })

    it('複数の消去可能なグループを同時に見つける', () => {
      // Arrange
      let field = createField()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })
      const bluePuyo = createPuyo('blue', { x: 0, y: 0 })

      // 赤を4つ配置
      field = setPuyo(field, { x: 0, y: 0 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 3 }, redPuyo)

      // 青を4つ配置（別の列）
      field = setPuyo(field, { x: 2, y: 0 }, bluePuyo)
      field = setPuyo(field, { x: 2, y: 1 }, bluePuyo)
      field = setPuyo(field, { x: 2, y: 2 }, bluePuyo)
      field = setPuyo(field, { x: 2, y: 3 }, bluePuyo)

      // Act
      const groups = findEliminableGroups(field)

      // Assert
      expect(groups).toHaveLength(2)
      expect(groups.map((g) => g.color).sort()).toEqual(['blue', 'red'])
      expect(groups.every((g) => g.size === 4)).toBe(true)
    })

    it('大きな連結グループを正しく検出する', () => {
      // Arrange
      let field = createField()
      const yellowPuyo = createPuyo('yellow', { x: 0, y: 0 })

      // 十字型に6つ配置
      field = setPuyo(field, { x: 1, y: 0 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 1 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 2 }, yellowPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, yellowPuyo)
      field = setPuyo(field, { x: 2, y: 1 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 3 }, yellowPuyo)

      // Act
      const groups = findEliminableGroups(field)

      // Assert
      expect(groups).toHaveLength(1)
      expect(groups[0].size).toBe(6)
      expect(groups[0].color).toBe('yellow')
    })
  })

  describe('eliminateGroups', () => {
    it('グループを消去して新しいフィールドを返す', () => {
      // Arrange
      let field = createField()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })
      const bluePuyo = createPuyo('blue', { x: 0, y: 0 })

      // 赤を4つ配置（消去対象）
      field = setPuyo(field, { x: 0, y: 0 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 3 }, redPuyo)

      // 青を2つ配置（残る）
      field = setPuyo(field, { x: 1, y: 0 }, bluePuyo)
      field = setPuyo(field, { x: 1, y: 1 }, bluePuyo)

      const groups = findEliminableGroups(field)

      // Act
      const result = eliminateGroups(field, groups)

      // Assert
      expect(result.eliminatedCount).toBe(4)
      expect(result.totalScore).toBe(40) // 4 * 10
      expect(result.groups).toHaveLength(1)

      // 赤が消えて青が残っていることを確認
      const newField = result.field
      expect(newField.grid[0][0]).toBeNull()
      expect(newField.grid[1][0]).toBeNull()
      expect(newField.grid[2][0]).toBeNull()
      expect(newField.grid[3][0]).toBeNull()
      expect(newField.grid[0][1]?.color).toBe('blue')
      expect(newField.grid[1][1]?.color).toBe('blue')
    })

    it('空のグループリストで元のフィールドを返す', () => {
      // Arrange
      let field = createField()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })
      field = setPuyo(field, { x: 0, y: 0 }, redPuyo)

      // Act
      const result = eliminateGroups(field, [])

      // Assert
      expect(result.eliminatedCount).toBe(0)
      expect(result.totalScore).toBe(0)
      expect(result.groups).toHaveLength(0)
      expect(result.field).toStrictEqual(field) // 同じ内容を返す
    })

    it('複数のグループを同時に消去する', () => {
      // Arrange
      let field = createField()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })
      const bluePuyo = createPuyo('blue', { x: 0, y: 0 })

      // 赤を4つ配置
      field = setPuyo(field, { x: 0, y: 0 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 3 }, redPuyo)

      // 青を4つ配置
      field = setPuyo(field, { x: 2, y: 0 }, bluePuyo)
      field = setPuyo(field, { x: 2, y: 1 }, bluePuyo)
      field = setPuyo(field, { x: 2, y: 2 }, bluePuyo)
      field = setPuyo(field, { x: 2, y: 3 }, bluePuyo)

      const groups = findEliminableGroups(field)

      // Act
      const result = eliminateGroups(field, groups)

      // Assert
      expect(result.eliminatedCount).toBe(8)
      expect(result.totalScore).toBe(80) // (4 + 4) * 10
      expect(result.groups).toHaveLength(2)

      // 両方消えていることを確認
      const newField = result.field
      expect(newField.grid[0][0]).toBeNull()
      expect(newField.grid[0][2]).toBeNull()
    })
  })

  describe('processElimination', () => {
    it('消去処理を一括で実行する', () => {
      // Arrange
      let field = createField()
      const greenPuyo = createPuyo('green', { x: 0, y: 0 })

      // 緑を5つ配置
      field = setPuyo(field, { x: 0, y: 0 }, greenPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, greenPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, greenPuyo)
      field = setPuyo(field, { x: 0, y: 3 }, greenPuyo)
      field = setPuyo(field, { x: 0, y: 4 }, greenPuyo)

      // Act
      const result = processElimination(field)

      // Assert
      expect(result.eliminatedCount).toBe(5)
      expect(result.totalScore).toBe(50) // 5 * 10
      expect(result.groups).toHaveLength(1)
      expect(result.groups[0].size).toBe(5)

      // フィールドが空になっていることを確認
      const newField = result.field
      for (let y = 0; y < 5; y++) {
        expect(newField.grid[y][0]).toBeNull()
      }
    })

    it('消去可能なグループがない場合は元のフィールドを返す', () => {
      // Arrange
      let field = createField()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })
      const bluePuyo = createPuyo('blue', { x: 0, y: 0 })

      // 消去できない配置（3つずつ）
      field = setPuyo(field, { x: 0, y: 0 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 1 }, redPuyo)
      field = setPuyo(field, { x: 0, y: 2 }, redPuyo)
      field = setPuyo(field, { x: 1, y: 0 }, bluePuyo)
      field = setPuyo(field, { x: 1, y: 1 }, bluePuyo)
      field = setPuyo(field, { x: 1, y: 2 }, bluePuyo)

      // Act
      const result = processElimination(field)

      // Assert
      expect(result.eliminatedCount).toBe(0)
      expect(result.totalScore).toBe(0)
      expect(result.groups).toHaveLength(0)
      expect(result.field).toStrictEqual(field) // 同じ内容
    })

    it('複雑な形状のグループを処理する', () => {
      // Arrange
      let field = createField()
      const yellowPuyo = createPuyo('yellow', { x: 0, y: 0 })

      // T字型に7つ配置
      field = setPuyo(field, { x: 0, y: 0 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 0 }, yellowPuyo)
      field = setPuyo(field, { x: 2, y: 0 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 1 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 2 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 3 }, yellowPuyo)
      field = setPuyo(field, { x: 1, y: 4 }, yellowPuyo)

      // Act
      const result = processElimination(field)

      // Assert
      expect(result.eliminatedCount).toBe(7)
      expect(result.totalScore).toBe(70) // 7 * 10
      expect(result.groups).toHaveLength(1)
      expect(result.groups[0].size).toBe(7)
    })
  })
})
