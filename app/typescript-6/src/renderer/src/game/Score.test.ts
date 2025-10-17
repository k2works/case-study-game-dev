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
})
