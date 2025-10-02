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

  describe('スコア計算', () => {
    it('4つのぷよを消すと基本スコアが加算される', () => {
      // 4個消去、1連鎖、1色
      score.addScore(4, 1, 1)

      // 基本スコア: 4 × 10 = 40
      // 連鎖ボーナス: 8
      // 色ボーナス: 0
      // 計算: 40 × 8 = 320
      expect(score.getScore()).toBe(320)
    })

    it('連鎖数が増えるとボーナスが増える', () => {
      // 4個消去、2連鎖、1色
      score.addScore(4, 2, 1)

      // 基本スコア: 4 × 10 = 40
      // 連鎖ボーナス: 16
      // 色ボーナス: 0
      // 計算: 40 × 16 = 640
      expect(score.getScore()).toBe(640)
    })

    it('複数色を消すとボーナスが増える', () => {
      // 8個消去、1連鎖、2色
      score.addScore(8, 1, 2)

      // 基本スコア: 8 × 10 = 80
      // 連鎖ボーナス: 8
      // 色ボーナス: 3
      // 計算: 80 × (8 + 3) = 880
      expect(score.getScore()).toBe(880)
    })

    it('連鎖と色ボーナスが両方適用される', () => {
      // 4個消去、3連鎖、3色
      score.addScore(4, 3, 3)

      // 基本スコア: 4 × 10 = 40
      // 連鎖ボーナス: 32
      // 色ボーナス: 6
      // 計算: 40 × (32 + 6) = 1520
      expect(score.getScore()).toBe(1520)
    })
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
      expect(score.getScore()).toBe(3600)
    })
  })
})
