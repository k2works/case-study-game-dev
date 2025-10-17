import { describe, it, expect } from 'vitest'
import { Stage } from './Stage'

describe('Stage', () => {
  it('インスタンスが作成できる', () => {
    const stage = new Stage(6, 12)

    expect(stage).toBeDefined()
    expect(stage).toBeInstanceOf(Stage)
  })

  describe('バリデーション', () => {
    it('colsが0以下の場合はエラーをスローする', () => {
      expect(() => new Stage(0, 12)).toThrow()
      expect(() => new Stage(-1, 12)).toThrow()
    })

    it('rowsが0以下の場合はエラーをスローする', () => {
      expect(() => new Stage(6, 0)).toThrow()
      expect(() => new Stage(6, -1)).toThrow()
    })

    it('整数でない値が渡された場合はエラーをスローする', () => {
      expect(() => new Stage(6.5, 12)).toThrow()
      expect(() => new Stage(6, 12.5)).toThrow()
    })
  })
})
