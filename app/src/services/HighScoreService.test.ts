import { describe, it, expect, beforeEach, vi } from 'vitest'
import { highScoreService, HighScoreRecord } from './HighScoreService'

describe('HighScoreService', () => {
  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear()
    // コンソールエラーをモック
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('初期状態', () => {
    it('ハイスコアが空の状態で開始される', () => {
      // Act
      const scores = highScoreService.getHighScores()

      // Assert
      expect(scores).toEqual([])
    })

    it('最高スコアが0で開始される', () => {
      // Act
      const topScore = highScoreService.getTopScore()

      // Assert
      expect(topScore).toBe(0)
    })
  })

  describe('スコアの追加', () => {
    it('新しいスコアが追加される', () => {
      // Act
      const result = highScoreService.addScore(1000)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].score).toBe(1000)
      expect(result[0].rank).toBe(1)
      expect(result[0].date).toBeDefined()
    })

    it('複数のスコアが降順でソートされる', () => {
      // Arrange & Act
      highScoreService.addScore(500)
      highScoreService.addScore(1000)
      highScoreService.addScore(750)
      const scores = highScoreService.getHighScores()

      // Assert
      expect(scores).toHaveLength(3)
      expect(scores[0].score).toBe(1000)
      expect(scores[0].rank).toBe(1)
      expect(scores[1].score).toBe(750)
      expect(scores[1].rank).toBe(2)
      expect(scores[2].score).toBe(500)
      expect(scores[2].rank).toBe(3)
    })

    it('最大記録数を超える場合は低いスコアが削除される', () => {
      // Arrange - 11個のスコアを追加（MAX_RECORDS=10を超える）
      const scores = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 50]
      scores.forEach((score) => highScoreService.addScore(score))

      // Act
      const result = highScoreService.getHighScores()

      // Assert
      expect(result).toHaveLength(10) // 最大10個
      expect(result.every((record) => record.score >= 100)).toBe(true) // 50は削除される
      expect(result.find((record) => record.score === 50)).toBeUndefined()
    })
  })

  describe('ハイスコア判定', () => {
    beforeEach(() => {
      // 5個のスコアを準備
      ;[100, 200, 300, 400, 500].forEach((score) =>
        highScoreService.addScore(score)
      )
    })

    it('記録数が上限未満の場合は常にハイスコア', () => {
      // Arrange
      highScoreService.clearHighScores()
      highScoreService.addScore(100)

      // Act & Assert
      expect(highScoreService.isHighScore(50)).toBe(true) // 記録数が上限未満
    })

    it('最低スコアより高い場合はハイスコア', () => {
      // Act & Assert
      expect(highScoreService.isHighScore(150)).toBe(true) // 100より高い
    })

    it('最低スコアより低い場合はハイスコアではない', () => {
      // Arrange - 上限まで埋める
      ;[600, 700, 800, 900, 1000].forEach((score) =>
        highScoreService.addScore(score)
      )

      // Act & Assert
      expect(highScoreService.isHighScore(50)).toBe(false) // 最低スコア100より低い
    })

    it('最低スコアと同じ場合はハイスコアではない', () => {
      // Arrange - 上限まで埋める
      ;[600, 700, 800, 900, 1000].forEach((score) =>
        highScoreService.addScore(score)
      )

      // Act & Assert
      expect(highScoreService.isHighScore(100)).toBe(false) // 最低スコアと同じ
    })
  })

  describe('最高スコア取得', () => {
    it('スコアが存在する場合は最高スコアを返す', () => {
      // Arrange
      highScoreService.addScore(500)
      highScoreService.addScore(1000)
      highScoreService.addScore(750)

      // Act
      const topScore = highScoreService.getTopScore()

      // Assert
      expect(topScore).toBe(1000)
    })

    it('スコアが存在しない場合は0を返す', () => {
      // Act
      const topScore = highScoreService.getTopScore()

      // Assert
      expect(topScore).toBe(0)
    })
  })

  describe('データの永続化', () => {
    it('localStorageに正しく保存される', () => {
      // Act
      highScoreService.addScore(1000)

      // Assert
      const stored = localStorage.getItem('puyo-puyo-high-scores')
      expect(stored).toBeDefined()
      
      const parsed: HighScoreRecord[] = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].score).toBe(1000)
    })

    it('localStorageから正しく読み込まれる', () => {
      // Arrange - 直接localStorageにデータを設定
      const testData: HighScoreRecord[] = [
        { score: 1000, date: '2024-01-01T00:00:00.000Z', rank: 1 },
      ]
      localStorage.setItem('puyo-puyo-high-scores', JSON.stringify(testData))

      // Act
      const scores = highScoreService.getHighScores()

      // Assert
      expect(scores).toHaveLength(1)
      expect(scores[0].score).toBe(1000)
    })
  })

  describe('エラーハンドリング', () => {
    it('不正なデータが存在する場合は空配列を返す', () => {
      // Arrange
      localStorage.setItem('puyo-puyo-high-scores', 'invalid-json')

      // Act
      const scores = highScoreService.getHighScores()

      // Assert
      expect(scores).toEqual([])
      expect(console.warn).toHaveBeenCalled()
    })

    it('localStorageエラー時も正常に動作する', () => {
      // Arrange
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Act
      const scores = highScoreService.getHighScores()

      // Assert
      expect(scores).toEqual([])
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('クリア機能', () => {
    it('ハイスコアがクリアされる', () => {
      // Arrange
      const result = highScoreService.addScore(1000)
      expect(result).toHaveLength(1)

      // Act
      highScoreService.clearHighScores()

      // Assert
      expect(highScoreService.getHighScores()).toEqual([])
    })
  })
})