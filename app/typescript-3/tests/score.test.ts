import { describe, it, expect, beforeEach } from 'vitest'
import { Score } from '../src/score'

describe('スコア', () => {
  let score: Score

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
      <div id="score">0</div>
    `
    score = new Score()
  })

  describe('全消しボーナス', () => {
    it('全消しするとボーナスが加算される', () => {
      // 初期スコアを確認
      const initialScore = score.getScore()
      expect(initialScore).toBe(0)

      // 全消しボーナス加算
      score.addZenkeshiBonus()

      // 全消しボーナスが加算されていることを確認
      expect(score.getScore()).toBeGreaterThan(initialScore)
    })
  })
})
