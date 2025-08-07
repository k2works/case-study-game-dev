import { describe, expect, it } from 'vitest'
import { Score } from './Score'

describe('Score', () => {
  describe('基本スコア計算', () => {
    it('4つのぷよを消去すると基本スコアが加算される', () => {
      const score = new Score()

      const addedScore = score.calculateScore(4)

      expect(addedScore).toBe(40) // 4つ × 10ポイント
    })

    it('消去したぷよの数に比例してスコアが増加する', () => {
      const score = new Score()

      expect(score.calculateScore(4)).toBe(40) // 4つ × 10
      expect(score.calculateScore(5)).toBe(50) // 5つ × 10
      expect(score.calculateScore(8)).toBe(80) // 8つ × 10
    })

    it('3つ以下では0点になる', () => {
      const score = new Score()

      expect(score.calculateScore(0)).toBe(0)
      expect(score.calculateScore(1)).toBe(0)
      expect(score.calculateScore(2)).toBe(0)
      expect(score.calculateScore(3)).toBe(0)
    })
  })

  describe('スコア管理', () => {
    it('現在のスコアを取得できる', () => {
      const score = new Score()

      expect(score.getCurrentScore()).toBe(0)
    })

    it('スコアを加算できる', () => {
      const score = new Score()

      score.addScore(100)
      expect(score.getCurrentScore()).toBe(100)

      score.addScore(50)
      expect(score.getCurrentScore()).toBe(150)
    })

    it('スコアをリセットできる', () => {
      const score = new Score()

      score.addScore(500)
      expect(score.getCurrentScore()).toBe(500)

      score.reset()
      expect(score.getCurrentScore()).toBe(0)
    })
  })

  describe('連鎖ボーナス計算', () => {
    it('1連鎖では連鎖ボーナスなし', () => {
      const score = new Score()

      const addedScore = score.calculateScoreWithChain(4, 1)

      expect(addedScore).toBe(40) // 4つ × 10 × 1倍
    })

    it('2連鎖では8倍ボーナス', () => {
      const score = new Score()

      const addedScore = score.calculateScoreWithChain(4, 2)

      expect(addedScore).toBe(320) // 4つ × 10 × 8倍
    })

    it('3連鎖では16倍ボーナス', () => {
      const score = new Score()

      const addedScore = score.calculateScoreWithChain(4, 3)

      expect(addedScore).toBe(640) // 4つ × 10 × 16倍
    })

    it('高連鎖では大幅なボーナス', () => {
      const score = new Score()

      expect(score.calculateScoreWithChain(4, 5)).toBe(2560) // 4つ × 10 × 64倍
      expect(score.calculateScoreWithChain(4, 10)).toBe(8960) // 4つ × 10 × 224倍
    })

    it('13連鎖以上では最大倍率が適用される', () => {
      const score = new Score()

      expect(score.calculateScoreWithChain(4, 13)).toBe(12800) // 4つ × 10 × 320倍
      expect(score.calculateScoreWithChain(4, 20)).toBe(12800) // 4つ × 10 × 320倍（上限）
    })

    it('連鎖ありでも4つ未満では0点', () => {
      const score = new Score()

      expect(score.calculateScoreWithChain(3, 5)).toBe(0)
    })
  })
})
