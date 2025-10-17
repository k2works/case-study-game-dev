import { describe, it, expect } from 'vitest'
import { PuyoImage } from './PuyoImage'
import type { Config } from './Config'

describe('PuyoImage', () => {
  it('インスタンスが作成できる', () => {
    const mockConfig = {
      cellSize: 32,
      cols: 6,
      rows: 12
    } as Config

    const puyoImage = new PuyoImage(mockConfig)

    expect(puyoImage).toBeDefined()
    expect(puyoImage).toBeInstanceOf(PuyoImage)
  })
})
