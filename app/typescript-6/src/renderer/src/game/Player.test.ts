import { describe, it, expect } from 'vitest'
import { Player } from './Player'

describe('Player', () => {
  it('インスタンスが作成できる', () => {
    const player = new Player()

    expect(player).toBeDefined()
    expect(player).toBeInstanceOf(Player)
  })
})
