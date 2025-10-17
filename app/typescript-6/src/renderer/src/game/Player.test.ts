import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from './Player'
import type { Config } from './Config'
import type { PuyoImage } from './PuyoImage'
import { PuyoType } from './Puyo'

describe('Player', () => {
  let mockConfig: Config
  let mockPuyoImage: PuyoImage
  let player: Player

  beforeEach(() => {
    mockConfig = {
      cellSize: 32,
      cols: 6,
      rows: 12
    } as Config

    mockPuyoImage = {} as PuyoImage
    player = new Player(mockConfig, mockPuyoImage)
  })

  it('インスタンスが作成できる', () => {
    expect(player).toBeDefined()
    expect(player).toBeInstanceOf(Player)
  })

  describe('ぷよペア生成', () => {
    it('新しいぷよペアを生成できる', () => {
      player.createNewPuyoPair()

      const mainPuyo = player.getMainPuyo()
      const subPuyo = player.getSubPuyo()

      expect(mainPuyo).toBeDefined()
      expect(subPuyo).toBeDefined()
      expect(mainPuyo!.x).toBe(3) // 中央に配置（cols 6 / 2 = 3）
      expect(mainPuyo!.y).toBe(0) // 一番上
      expect(subPuyo!.x).toBe(3)
      expect(subPuyo!.y).toBe(-1) // メインぷよの上
    })

    it('ぷよペアはランダムな色で生成される', () => {
      player.createNewPuyoPair()

      const mainPuyo = player.getMainPuyo()
      const subPuyo = player.getSubPuyo()

      expect([PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]).toContain(
        mainPuyo!.type
      )
      expect([PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]).toContain(
        subPuyo!.type
      )
    })
  })
})
