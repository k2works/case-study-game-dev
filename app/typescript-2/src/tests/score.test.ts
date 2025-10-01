import { describe, it, expect, beforeEach } from 'vitest'
import { Score } from '../score'

describe('スコア', () => {
  let score: Score

  beforeEach(() => {
    score = new Score()
  })

  describe('スコア計算', () => {
    it('ぷよを消去するとスコアが加算される', () => {
      // 4つのぷよを消去（1連鎖目）
      score.addScore(4, 1)

      // スコアが加算されていることを確認
      expect(score.getScore()).toBeGreaterThan(0)
    })

    it('連鎖数が増えるとボーナスが加算される', () => {
      // 1連鎖目のスコア
      score.addScore(4, 1)
      const score1 = score.getScore()

      // スコアをリセット
      score.reset()

      // 2連鎖目のスコア
      score.addScore(4, 2)
      const score2 = score.getScore()

      // 2連鎖目のスコアが1連鎖目より大きいことを確認
      expect(score2).toBeGreaterThan(score1)
    })

    it('消去したぷよの数が多いほどスコアが高くなる', () => {
      // 4つ消去
      score.addScore(4, 1)
      const score4 = score.getScore()

      // スコアをリセット
      score.reset()

      // 6つ消去
      score.addScore(6, 1)
      const score6 = score.getScore()

      // 6つ消去の方がスコアが高いことを確認
      expect(score6).toBeGreaterThan(score4)
    })
  })

  describe('スコア取得とリセット', () => {
    it('初期スコアは0', () => {
      expect(score.getScore()).toBe(0)
    })

    it('リセットするとスコアが0になる', () => {
      score.addScore(4, 1)
      expect(score.getScore()).toBeGreaterThan(0)

      score.reset()
      expect(score.getScore()).toBe(0)
    })
  })
})
