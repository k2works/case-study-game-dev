import { describe, it, expect } from 'vitest'
import { Puyo, PuyoType } from './Puyo'

describe('Puyo', () => {
  describe('初期化', () => {
    it('位置と色を指定してPuyoを作成できる', () => {
      const puyo = new Puyo(2, 5, PuyoType.Red)

      expect(puyo.x).toBe(2)
      expect(puyo.y).toBe(5)
      expect(puyo.type).toBe(PuyoType.Red)
    })

    it('ランダムな色でPuyoを作成できる', () => {
      const puyo = Puyo.createRandom(3, 4)

      expect(puyo.x).toBe(3)
      expect(puyo.y).toBe(4)
      expect([PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]).toContain(puyo.type)
    })
  })

  describe('移動', () => {
    it('左に移動できる', () => {
      const puyo = new Puyo(3, 5, PuyoType.Red)
      puyo.moveLeft()

      expect(puyo.x).toBe(2)
      expect(puyo.y).toBe(5)
    })

    it('右に移動できる', () => {
      const puyo = new Puyo(3, 5, PuyoType.Red)
      puyo.moveRight()

      expect(puyo.x).toBe(4)
      expect(puyo.y).toBe(5)
    })

    it('下に移動できる', () => {
      const puyo = new Puyo(3, 5, PuyoType.Red)
      puyo.moveDown()

      expect(puyo.x).toBe(3)
      expect(puyo.y).toBe(6)
    })
  })
})
