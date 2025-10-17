import { describe, it, expect } from 'vitest'
import { Stage } from './Stage'

describe('Stage', () => {
  it('インスタンスが作成できる', () => {
    const stage = new Stage(6, 12)

    expect(stage).toBeDefined()
    expect(stage).toBeInstanceOf(Stage)
  })
})
