/**
 * 操作評価サービスのテスト
 */
import { describe, expect, it } from 'vitest'

import type { Position } from '../../models/Position'
import type { PossibleMove } from '../../models/ai/MoveTypes'
import {
  calculateChigiriCount,
  calculateEfficiencyScore,
  calculateFrameCount,
  calculateOperationTotalScore,
  calculateRotationCount,
  evaluateOperation,
  generateOperationDescription,
  selectMostEfficientMove,
} from './OperationEvaluationService'

describe('OperationEvaluationService', () => {
  describe('calculateRotationCount', () => {
    it('同じ向きの場合は0回転', () => {
      // Arrange & Act & Assert
      expect(calculateRotationCount(0, 0)).toBe(0)
      expect(calculateRotationCount(1, 1)).toBe(0)
      expect(calculateRotationCount(2, 2)).toBe(0)
      expect(calculateRotationCount(3, 3)).toBe(0)
    })

    it('時計回り1回転を正しく計算', () => {
      // Arrange & Act & Assert
      expect(calculateRotationCount(0, 1)).toBe(1) // 上→右
      expect(calculateRotationCount(1, 2)).toBe(1) // 右→下
      expect(calculateRotationCount(2, 3)).toBe(1) // 下→左
      expect(calculateRotationCount(3, 0)).toBe(1) // 左→上
    })

    it('反時計回り1回転を正しく計算', () => {
      // Arrange & Act & Assert
      expect(calculateRotationCount(1, 0)).toBe(1) // 右→上
      expect(calculateRotationCount(2, 1)).toBe(1) // 下→右
      expect(calculateRotationCount(3, 2)).toBe(1) // 左→下
      expect(calculateRotationCount(0, 3)).toBe(1) // 上→左
    })

    it('180度回転を正しく計算', () => {
      // Arrange & Act & Assert
      expect(calculateRotationCount(0, 2)).toBe(2) // 上→下
      expect(calculateRotationCount(1, 3)).toBe(2) // 右→左
      expect(calculateRotationCount(2, 0)).toBe(2) // 下→上
      expect(calculateRotationCount(3, 1)).toBe(2) // 左→右
    })
  })

  describe('calculateChigiriCount', () => {
    it('隣接している場合はちぎり0', () => {
      // Arrange
      const primary: Position = { x: 2, y: 10 }
      const secondary1: Position = { x: 3, y: 10 } // 右隣
      const secondary2: Position = { x: 2, y: 11 } // 下隣

      // Act & Assert
      expect(calculateChigiriCount(primary, secondary1)).toBe(0)
      expect(calculateChigiriCount(primary, secondary2)).toBe(0)
    })

    it('離れている場合のちぎり数を正しく計算', () => {
      // Arrange
      const primary: Position = { x: 2, y: 10 }
      const secondary1: Position = { x: 4, y: 10 } // 2マス離れ
      const secondary2: Position = { x: 2, y: 12 } // 2マス離れ
      const secondary3: Position = { x: 4, y: 12 } // 斜め2マス

      // Act & Assert
      expect(calculateChigiriCount(primary, secondary1)).toBe(1)
      expect(calculateChigiriCount(primary, secondary2)).toBe(1)
      expect(calculateChigiriCount(primary, secondary3)).toBe(1)
    })

    it('大きく離れている場合のちぎり数を正しく計算', () => {
      // Arrange
      const primary: Position = { x: 0, y: 10 }
      const secondary: Position = { x: 5, y: 10 } // 5マス離れ

      // Act & Assert
      expect(calculateChigiriCount(primary, secondary)).toBe(4)
    })
  })

  describe('calculateFrameCount', () => {
    it('移動なし・回転なしの場合の最小フレーム数', () => {
      // Arrange
      const move: PossibleMove = {
        x: 2,
        rotation: 0,
        primaryPosition: { x: 2, y: 11 },
        secondaryPosition: { x: 2, y: 10 },
        isValid: true,
      }

      // Act
      const frames = calculateFrameCount(move, 2, 0, 12)

      // Assert
      expect(frames).toBe(1) // 落下1マス分のみ
    })

    it('横移動のフレーム数を正しく計算', () => {
      // Arrange
      const move: PossibleMove = {
        x: 4,
        rotation: 0,
        primaryPosition: { x: 4, y: 11 },
        secondaryPosition: { x: 4, y: 10 },
        isValid: true,
      }

      // Act
      const frames = calculateFrameCount(move, 2, 0, 12)

      // Assert
      expect(frames).toBe(5) // 横2マス(4F) + 落下1マス(1F)
    })

    it('回転を含む場合のフレーム数を正しく計算', () => {
      // Arrange
      const move: PossibleMove = {
        x: 2,
        rotation: 1,
        primaryPosition: { x: 2, y: 11 },
        secondaryPosition: { x: 3, y: 11 },
        isValid: true,
      }

      // Act
      const frames = calculateFrameCount(move, 2, 0, 12)

      // Assert
      expect(frames).toBe(3) // 回転1回(3F) + 落下0マス
    })

    it('ちぎりペナルティを含むフレーム数を正しく計算', () => {
      // Arrange
      const move: PossibleMove = {
        x: 2,
        rotation: 0,
        primaryPosition: { x: 2, y: 11 },
        secondaryPosition: { x: 4, y: 11 }, // ちぎり1
        isValid: true,
      }

      // Act
      const frames = calculateFrameCount(move, 2, 0, 12)

      // Assert
      expect(frames).toBe(5) // 落下0マス + ちぎりペナルティ5F
    })
  })

  describe('calculateEfficiencyScore', () => {
    it('理想的なフレーム数で100点', () => {
      // Arrange & Act
      const score = calculateEfficiencyScore(10, 0)

      // Assert
      expect(score).toBe(100)
    })

    it('フレーム数増加で減点', () => {
      // Arrange & Act
      const score1 = calculateEfficiencyScore(20, 0)
      const score2 = calculateEfficiencyScore(30, 0)
      const score3 = calculateEfficiencyScore(40, 0)

      // Assert
      expect(score1).toBeLessThan(100)
      expect(score2).toBeLessThan(score1)
      expect(score3).toBeLessThan(score2)
    })

    it('ちぎりペナルティで減点', () => {
      // Arrange & Act
      const score1 = calculateEfficiencyScore(10, 0)
      const score2 = calculateEfficiencyScore(10, 1)
      const score3 = calculateEfficiencyScore(10, 2)

      // Assert
      expect(score1).toBe(100)
      expect(score2).toBe(80) // -20点
      expect(score3).toBe(60) // -40点
    })

    it('スコアは0以上100以下に制限', () => {
      // Arrange & Act
      const scoreMin = calculateEfficiencyScore(100, 10)
      const scoreMax = calculateEfficiencyScore(0, 0)

      // Assert
      expect(scoreMin).toBe(0)
      expect(scoreMax).toBe(100)
    })
  })

  describe('calculateOperationTotalScore', () => {
    it('効率的な操作で高スコア', () => {
      // Arrange & Act
      const score = calculateOperationTotalScore(10, 0, 100)

      // Assert
      expect(score).toBe(1000) // 100 * 10
    })

    it('フレーム数超過でペナルティ', () => {
      // Arrange & Act
      const score1 = calculateOperationTotalScore(30, 0, 80)
      const score2 = calculateOperationTotalScore(40, 0, 80)

      // Assert
      expect(score1).toBe(800) // ペナルティなし
      expect(score2).toBe(750) // 10フレーム超過で-50
    })

    it('ちぎりで大幅減点', () => {
      // Arrange & Act
      const score1 = calculateOperationTotalScore(20, 0, 80)
      const score2 = calculateOperationTotalScore(20, 1, 80)
      const score3 = calculateOperationTotalScore(20, 2, 80)

      // Assert
      expect(score1).toBe(800)
      expect(score2).toBe(700) // -100
      expect(score3).toBe(600) // -200
    })
  })

  describe('evaluateOperation', () => {
    it('総合的な操作評価を正しく実行', () => {
      // Arrange
      const move: PossibleMove = {
        x: 3,
        rotation: 1,
        primaryPosition: { x: 3, y: 10 },
        secondaryPosition: { x: 4, y: 10 },
        isValid: true,
      }

      // Act
      const evaluation = evaluateOperation(move, 2, 0, 12)

      // Assert
      expect(evaluation.frameCount).toBeGreaterThan(0)
      expect(evaluation.chigiriCount).toBe(0)
      expect(evaluation.efficiencyScore).toBeGreaterThan(0)
      expect(evaluation.totalScore).toBeGreaterThan(0)
    })
  })

  describe('selectMostEfficientMove', () => {
    it('最も効率的な手を選択', () => {
      // Arrange
      const moves: PossibleMove[] = [
        {
          x: 2,
          rotation: 0,
          primaryPosition: { x: 2, y: 11 },
          secondaryPosition: { x: 2, y: 10 },
          isValid: true,
        },
        {
          x: 4,
          rotation: 2,
          primaryPosition: { x: 4, y: 11 },
          secondaryPosition: { x: 4, y: 10 },
          isValid: true,
        },
      ]

      // Act
      const result = selectMostEfficientMove(moves)

      // Assert
      expect(result).not.toBeNull()
      expect(result?.move).toBe(moves[0]) // 最初の手の方が効率的
    })

    it('空の配列の場合はnullを返す', () => {
      // Arrange & Act
      const result = selectMostEfficientMove([])

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('generateOperationDescription', () => {
    it('高効率の説明を生成', () => {
      // Arrange
      const evaluation = {
        frameCount: 10,
        chigiriCount: 0,
        efficiencyScore: 90,
        totalScore: 900,
      }

      // Act
      const description = generateOperationDescription(evaluation)

      // Assert
      expect(description).toBe('10F, 高効率')
    })

    it('ちぎりありの説明を生成', () => {
      // Arrange
      const evaluation = {
        frameCount: 25,
        chigiriCount: 1,
        efficiencyScore: 60,
        totalScore: 500,
      }

      // Act
      const description = generateOperationDescription(evaluation)

      // Assert
      expect(description).toBe('25F, ちぎり1, 標準効率')
    })

    it('低効率の説明を生成', () => {
      // Arrange
      const evaluation = {
        frameCount: 40,
        chigiriCount: 2,
        efficiencyScore: 30,
        totalScore: 100,
      }

      // Act
      const description = generateOperationDescription(evaluation)

      // Assert
      expect(description).toBe('40F, ちぎり2, 低効率')
    })
  })
})
