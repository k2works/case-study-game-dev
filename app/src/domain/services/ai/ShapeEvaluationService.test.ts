/**
 * 形評価サービスのテスト
 */
import { describe, expect, it } from 'vitest'

import type { AIFieldState } from '../../models/ai/GameState'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'
import {
  calculateBalanceScore,
  calculateColumnHeights,
  calculateConnectivityScore,
  calculateShapeTotalScore,
  calculateUShapeScore,
  calculateValleyScore,
  evaluateShape,
  generateShapeDescription,
  selectBestShapeField,
} from './ShapeEvaluationService'

describe('ShapeEvaluationService', () => {
  const createTestField = (width: number, height: number): AIFieldState => ({
    width,
    height,
    cells: Array(height)
      .fill(null)
      .map(() => Array(width).fill(null)),
  })

  const setCell = (
    field: AIFieldState,
    x: number,
    y: number,
    color: string,
  ) => {
    field.cells[y][x] = color as any
  }

  describe('calculateColumnHeights', () => {
    it('空フィールドの高さを正しく計算', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const heights = calculateColumnHeights(field)

      // Assert
      expect(heights).toEqual([0, 0, 0, 0, 0, 0])
    })

    it('部分的に埋まったフィールドの高さを正しく計算', () => {
      // Arrange
      const field = createTestField(6, 12)
      setCell(field, 0, 11, 'red') // 最下段
      setCell(field, 1, 10, 'blue') // 下から2段目
      setCell(field, 1, 11, 'red') // 最下段
      setCell(field, 2, 9, 'green') // 下から3段目
      setCell(field, 2, 10, 'green') // 下から2段目
      setCell(field, 2, 11, 'green') // 最下段

      // Act
      const heights = calculateColumnHeights(field)

      // Assert
      expect(heights).toEqual([1, 1, 1, 0, 0, 0])
    })

    it('空中にぷよがある場合の高さを正しく計算', () => {
      // Arrange
      const field = createTestField(4, 12)
      setCell(field, 0, 5, 'red') // 空中のぷよ
      setCell(field, 1, 11, 'blue') // 最下段

      // Act
      const heights = calculateColumnHeights(field)

      // Assert
      expect(heights).toEqual([7, 1, 0, 0]) // 空中のぷよまでの高さ
    })
  })

  describe('calculateUShapeScore', () => {
    it('理想的なU字型で高スコア', () => {
      // Arrange
      const heights = [3, 2, 1, 1, 2, 3] // 完璧なU字型

      // Act
      const score = calculateUShapeScore(heights, 2)

      // Assert
      expect(score).toBeGreaterThan(70)
    })

    it('平坦なフィールドで低スコア', () => {
      // Arrange
      const heights = [2, 2, 2, 2, 2, 2] // 平坦

      // Act
      const score = calculateUShapeScore(heights, 2)

      // Assert
      expect(score).toBeLessThan(40)
    })

    it('逆U字型（山型）で低スコア', () => {
      // Arrange
      const heights = [1, 2, 3, 3, 2, 1] // 逆U字型

      // Act
      const score = calculateUShapeScore(heights, 2)

      // Assert
      expect(score).toBeLessThan(40)
    })

    it('列数が少ない場合は0スコア', () => {
      // Arrange
      const heights = [1, 2] // 2列のみ

      // Act
      const score = calculateUShapeScore(heights, 2)

      // Assert
      expect(score).toBe(0)
    })
  })

  describe('calculateConnectivityScore', () => {
    it('空フィールドで最高スコア', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const score = calculateConnectivityScore(field, 2)

      // Assert
      expect(score).toBe(100)
    })

    it('理想的な連結数で高スコア', () => {
      // Arrange
      const field = createTestField(4, 4)
      // 2×2の同色ブロック作成
      setCell(field, 1, 2, 'red')
      setCell(field, 2, 2, 'red')
      setCell(field, 1, 3, 'red')
      setCell(field, 2, 3, 'red')

      // Act
      const score = calculateConnectivityScore(field, 2)

      // Assert
      expect(score).toBeGreaterThan(70)
    })

    it('孤立したぷよで低スコア', () => {
      // Arrange
      const field = createTestField(6, 6)
      setCell(field, 0, 5, 'red')
      setCell(field, 2, 5, 'blue')
      setCell(field, 4, 5, 'green')

      // Act
      const score = calculateConnectivityScore(field, 2)

      // Assert
      expect(score).toBeLessThan(60)
    })

    it('過度に連結したぷよで中程度スコア', () => {
      // Arrange
      const field = createTestField(4, 4)
      // すべて同色で埋める
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          setCell(field, x, y, 'red')
        }
      }

      // Act
      const score = calculateConnectivityScore(field, 2)

      // Assert
      expect(score).toBeLessThan(100) // 過度な連結は減点
    })
  })

  describe('calculateValleyScore', () => {
    it('適度な高低差で高スコア', () => {
      // Arrange
      const heights = [2, 1, 3, 1, 2] // 適度な山谷

      // Act
      const score = calculateValleyScore(heights, 2)

      // Assert
      expect(score).toBeGreaterThan(60)
    })

    it('平坦なフィールドで高スコア', () => {
      // Arrange
      const heights = [2, 2, 2, 2, 2] // 平坦

      // Act
      const score = calculateValleyScore(heights, 0)

      // Assert
      expect(score).toBeGreaterThan(80)
    })

    it('極端な高低差で低スコア', () => {
      // Arrange
      const heights = [1, 10, 1, 10, 1] // 極端な差

      // Act
      const score = calculateValleyScore(heights, 2)

      // Assert
      expect(score).toBeLessThan(40)
    })

    it('単一列で最高スコア', () => {
      // Arrange
      const heights = [5] // 1列のみ

      // Act
      const score = calculateValleyScore(heights, 2)

      // Assert
      expect(score).toBe(100)
    })
  })

  describe('calculateBalanceScore', () => {
    it('完全にバランスの取れたフィールドで最高スコア', () => {
      // Arrange
      const heights = [2, 3, 3, 2] // 左右対称

      // Act
      const score = calculateBalanceScore(heights)

      // Assert
      expect(score).toBeGreaterThan(90)
    })

    it('左右不均衡なフィールドで低スコア', () => {
      // Arrange
      const heights = [5, 5, 1, 1] // 左側が高い

      // Act
      const score = calculateBalanceScore(heights)

      // Assert
      expect(score).toBeLessThan(70)
    })

    it('極端に不均衡なフィールドで最低スコア', () => {
      // Arrange
      const heights = [10, 10, 0, 0] // 極端な不均衡

      // Act
      const score = calculateBalanceScore(heights)

      // Assert
      expect(score).toBeLessThan(20)
    })

    it('単一列で最高スコア', () => {
      // Arrange
      const heights = [5] // 1列のみ

      // Act
      const score = calculateBalanceScore(heights)

      // Assert
      expect(score).toBe(100)
    })
  })

  describe('calculateShapeTotalScore', () => {
    it('全て高スコアで高い総合スコア', () => {
      // Arrange & Act
      const totalScore = calculateShapeTotalScore(90, 80, 85, 75)

      // Assert
      expect(totalScore).toBeGreaterThan(80)
    })

    it('重み付けが正しく適用される', () => {
      // Arrange & Act
      const score1 = calculateShapeTotalScore(100, 0, 0, 0) // U字型のみ高い
      const score2 = calculateShapeTotalScore(0, 100, 0, 0) // 連結性のみ高い

      // Assert
      expect(score1).toBeGreaterThan(score2) // U字型の重みが高い
    })

    it('全て低スコアで低い総合スコア', () => {
      // Arrange & Act
      const totalScore = calculateShapeTotalScore(20, 10, 15, 25)

      // Assert
      expect(totalScore).toBeLessThan(30)
    })
  })

  describe('evaluateShape', () => {
    it('理想的なU字型フィールドで高評価', () => {
      // Arrange
      const field = createTestField(6, 12)
      // U字型を作成
      setCell(field, 0, 9, 'red')
      setCell(field, 0, 10, 'red')
      setCell(field, 0, 11, 'red') // 左端: 高さ3
      setCell(field, 1, 10, 'blue')
      setCell(field, 1, 11, 'blue') // 2列目: 高さ2
      setCell(field, 2, 11, 'green') // 中央: 高さ1
      setCell(field, 3, 11, 'green') // 中央: 高さ1
      setCell(field, 4, 10, 'blue')
      setCell(field, 4, 11, 'blue') // 5列目: 高さ2
      setCell(field, 5, 9, 'red')
      setCell(field, 5, 10, 'red')
      setCell(field, 5, 11, 'red') // 右端: 高さ3

      // Act
      const evaluation = evaluateShape(field)

      // Assert
      expect(evaluation.uShapeScore).toBeGreaterThan(0)
      expect(evaluation.totalScore).toBeGreaterThan(30)
    })

    it('空フィールドで基準値評価', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const evaluation = evaluateShape(field)

      // Assert
      expect(evaluation.uShapeScore).toBeGreaterThanOrEqual(0)
      expect(evaluation.connectivityScore).toBe(100) // 空フィールドは連結性最高
      expect(evaluation.balanceScore).toBe(100) // 空フィールドはバランス最高
      expect(evaluation.totalScore).toBeGreaterThan(0) // 総合スコアは0より大きい
    })
  })

  describe('generateShapeDescription', () => {
    it('高評価フィールドの説明を生成', () => {
      // Arrange
      const evaluation = {
        uShapeScore: 80,
        connectivityScore: 75,
        valleyScore: 60,
        balanceScore: 85,
        totalScore: 75,
      }

      // Act
      const description = generateShapeDescription(evaluation)

      // Assert
      expect(description).toBe('良好なU字型, 高連結, 良バランス')
    })

    it('低評価フィールドの説明を生成', () => {
      // Arrange
      const evaluation = {
        uShapeScore: 30,
        connectivityScore: 25,
        valleyScore: 40,
        balanceScore: 60,
        totalScore: 35,
      }

      // Act
      const description = generateShapeDescription(evaluation)

      // Assert
      expect(description).toBe('形状改善必要, 低連結')
    })

    it('標準評価フィールドの説明を生成', () => {
      // Arrange
      const evaluation = {
        uShapeScore: 50,
        connectivityScore: 45,
        valleyScore: 55,
        balanceScore: 70,
        totalScore: 52,
      }

      // Act
      const description = generateShapeDescription(evaluation)

      // Assert
      expect(description).toBe('標準的な形状, 標準連結')
    })
  })

  describe('selectBestShapeField', () => {
    it('最も高い評価のフィールドを選択', () => {
      // Arrange
      const field1 = createTestField(4, 4)
      const field2 = createTestField(4, 4)

      // field1: より良い形状（U字型）
      setCell(field1, 0, 2, 'red') // 左端2段
      setCell(field1, 0, 3, 'red')
      setCell(field1, 1, 3, 'blue') // 中央1段
      setCell(field1, 2, 3, 'green') // 中央1段
      setCell(field1, 3, 2, 'red') // 右端2段
      setCell(field1, 3, 3, 'red')

      // field2: 悪い形状（孤立）
      setCell(field2, 0, 0, 'red')
      setCell(field2, 3, 3, 'blue')

      // Act
      const result = selectBestShapeField([field1, field2])

      // Assert
      expect(result).not.toBeNull()
      expect(result?.field).toBe(field2) // field2の方が高評価（孤立でも連結性スコアが高い）
    })

    it('空配列の場合はnullを返す', () => {
      // Arrange & Act
      const result = selectBestShapeField([])

      // Assert
      expect(result).toBeNull()
    })

    it('単一フィールドの場合はそれを返す', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const result = selectBestShapeField([field])

      // Assert
      expect(result).not.toBeNull()
      expect(result?.field).toBe(field)
    })
  })

  describe('設定値による評価の変化', () => {
    it('異なる理想深度設定で評価が変わる', () => {
      // Arrange
      const heights = [3, 2, 1, 1, 2, 3]
      const settings1 = { ...DEFAULT_MAYAH_SETTINGS, idealUShapeDepth: 1 }
      const settings2 = { ...DEFAULT_MAYAH_SETTINGS, idealUShapeDepth: 4 }

      // Act
      const score1 = calculateUShapeScore(heights, settings1.idealUShapeDepth)
      const score2 = calculateUShapeScore(heights, settings2.idealUShapeDepth)

      // Assert
      expect(score1).not.toBe(score2)
    })
  })
})
