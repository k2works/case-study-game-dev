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
})
