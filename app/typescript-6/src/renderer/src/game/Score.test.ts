import { describe, it, expect } from 'vitest'
import { Score } from '@/game/Score'

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

  describe('スコアのバリデーション', () => {
    it('スコアは非負整数である', () => {
      const score = new Score()

      // 初期値は0
      expect(score.getValue()).toBe(0)

      // 正の整数を加算できる
      score.addZenkeshiBonus()
      expect(score.getValue()).toBeGreaterThanOrEqual(0)
    })

    it('複数回ボーナスを加算しても非負整数である', () => {
      const score = new Score()

      // 複数回加算
      score.addZenkeshiBonus()
      score.addZenkeshiBonus()

      // スコアが整数であることを確認
      expect(Number.isInteger(score.getValue())).toBe(true)
      expect(score.getValue()).toBeGreaterThanOrEqual(0)
    })
  })

  describe('リセット', () => {
    it('reset()でスコアが0に戻る', () => {
      const score = new Score()

      // スコアを増やす
      score.addZenkeshiBonus()
      expect(score.getValue()).toBe(3600)

      // リセット
      score.reset()

      // スコアが0に戻っている
      expect(score.getValue()).toBe(0)
    })
  })

  describe('ぷよ消去スコア', () => {
    it('4個消去、1連鎖、1色の場合', () => {
      const score = new Score()

      // 4個消去、1連鎖、1色
      score.addEraseScore(4, 1, 1)

      // 基本スコア: 4 × 10 = 40
      expect(score.getValue()).toBe(40)
    })

    it('8個消去、2連鎖、2色の場合', () => {
      const score = new Score()

      // 8個消去、2連鎖、2色
      score.addEraseScore(8, 2, 2)

      // 8 × 10 × 8 × 3 = 1920
      expect(score.getValue()).toBe(1920)
    })

    it('12個消去、3連鎖、3色の場合', () => {
      const score = new Score()

      // 12個消去、3連鎖、3色
      score.addEraseScore(12, 3, 3)

      // 12 × 10 × 16 × 6 = 11520
      expect(score.getValue()).toBe(11520)
    })

    it('複数回消去した場合スコアが累積される', () => {
      const score = new Score()

      // 1回目: 4個消去、1連鎖、1色
      score.addEraseScore(4, 1, 1)
      expect(score.getValue()).toBe(40)

      // 2回目: 4個消去、1連鎖、1色
      score.addEraseScore(4, 1, 1)
      expect(score.getValue()).toBe(80)
    })
  })
})
