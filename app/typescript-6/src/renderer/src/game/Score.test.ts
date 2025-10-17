import { describe, it, expect } from 'vitest'
import { Score } from './Score'

describe('Score', () => {
  it('インスタンスが作成できる', () => {
    const score = new Score()

    expect(score).toBeDefined()
    expect(score).toBeInstanceOf(Score)
  })

  it('初期スコアは0である', () => {
    const score = new Score()

    expect(score.getValue()).toBe(0)
  })

  describe('全消しボーナス', () => {
    it('全消しするとボーナスが加算される', () => {
      const score = new Score()

      // 初期スコア確認
      const initialScore = score.getValue()
      expect(initialScore).toBe(0)

      // 全消しボーナス加算
      score.addZenkeshiBonus()

      // 全消しボーナスが加算されていることを確認
      expect(score.getValue()).toBeGreaterThan(initialScore)
      expect(score.getValue()).toBe(3600)
    })
  })
})
