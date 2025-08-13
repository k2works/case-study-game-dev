import { describe, expect, it } from 'vitest'

import {
  addScore,
  applyMultiplier,
  createScore,
  getDisplayScore,
  resetScore,
} from './Score'

describe('Score', () => {
  describe('スコア作成', () => {
    it('デフォルト値でスコアを作成する', () => {
      // Act
      const score = createScore()

      // Assert
      expect(score.current).toBe(0)
      expect(score.multiplier).toBe(1)
    })

    it('指定した値でスコアを作成する', () => {
      // Act
      const score = createScore(100, 2)

      // Assert
      expect(score.current).toBe(100)
      expect(score.multiplier).toBe(2)
    })
  })

  describe('スコア加算', () => {
    it('スコアに点数を加算する', () => {
      // Arrange
      const score = createScore(100, 1)

      // Act
      const newScore = addScore(score, 50)

      // Assert
      expect(newScore.current).toBe(150)
      expect(newScore.multiplier).toBe(1)
    })
  })

  describe('倍率適用', () => {
    it('スコアに倍率を適用する', () => {
      // Arrange
      const score = createScore(100, 1)

      // Act
      const newScore = applyMultiplier(score, 2)

      // Assert
      expect(newScore.current).toBe(200)
      expect(newScore.multiplier).toBe(2)
    })
  })

  describe('スコアリセット', () => {
    it('スコアを初期状態にリセットする', () => {
      // Act
      const score = resetScore()

      // Assert
      expect(score.current).toBe(0)
      expect(score.multiplier).toBe(1)
    })
  })

  describe('表示スコア取得', () => {
    it('倍率を適用した表示スコアを取得する', () => {
      // Arrange
      const score = createScore(100, 3)

      // Act
      const displayScore = getDisplayScore(score)

      // Assert
      expect(displayScore).toBe(300)
    })
  })
})
