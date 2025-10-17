import { describe, it, expect } from 'vitest'
import { Config } from './Config'

describe('Config', () => {
  it('デフォルト設定でインスタンスが作成できる', () => {
    const config = new Config()

    expect(config).toBeDefined()
    expect(config).toBeInstanceOf(Config)
  })

  it('cellSizeが正しく設定される', () => {
    const config = new Config()

    expect(config.cellSize).toBe(32)
  })

  it('colsが正しく設定される', () => {
    const config = new Config()

    expect(config.cols).toBe(6)
  })

  it('rowsが正しく設定される', () => {
    const config = new Config()

    expect(config.rows).toBe(12)
  })

  it('カスタム設定でインスタンスが作成できる', () => {
    const config = new Config(40, 8, 16)

    expect(config.cellSize).toBe(40)
    expect(config.cols).toBe(8)
    expect(config.rows).toBe(16)
  })

  describe('バリデーション', () => {
    it('cellSizeが0以下の場合はエラーをスローする', () => {
      expect(() => new Config(0, 6, 12)).toThrow()
      expect(() => new Config(-1, 6, 12)).toThrow()
    })

    it('colsが0以下の場合はエラーをスローする', () => {
      expect(() => new Config(32, 0, 12)).toThrow()
      expect(() => new Config(32, -1, 12)).toThrow()
    })

    it('rowsが0以下の場合はエラーをスローする', () => {
      expect(() => new Config(32, 6, 0)).toThrow()
      expect(() => new Config(32, 6, -1)).toThrow()
    })

    it('整数でない値が渡された場合はエラーをスローする', () => {
      expect(() => new Config(32.5, 6, 12)).toThrow()
      expect(() => new Config(32, 6.5, 12)).toThrow()
      expect(() => new Config(32, 6, 12.5)).toThrow()
    })
  })
})
