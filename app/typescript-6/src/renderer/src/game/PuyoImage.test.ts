import { describe, it, expect } from 'vitest'
import { PuyoImage } from './PuyoImage'

describe('PuyoImage', () => {
  it('インスタンスが作成できる', () => {
    const puyoImage = new PuyoImage()

    expect(puyoImage).toBeDefined()
    expect(puyoImage).toBeInstanceOf(PuyoImage)
  })
})
