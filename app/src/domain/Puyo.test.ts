import { describe, it, expect } from 'vitest'
import { Puyo, PuyoColor } from './Puyo'

describe('Puyo', () => {
  describe('Puyoを作成する', () => {
    it('色を指定してPuyoを作成できる', () => {
      const puyo = new Puyo(PuyoColor.RED)
      expect(puyo.color).toBe(PuyoColor.RED)
    })

    it('異なる色のPuyoを作成できる', () => {
      const redPuyo = new Puyo(PuyoColor.RED)
      const bluePuyo = new Puyo(PuyoColor.BLUE)
      const greenPuyo = new Puyo(PuyoColor.GREEN)
      const yellowPuyo = new Puyo(PuyoColor.YELLOW)

      expect(redPuyo.color).toBe(PuyoColor.RED)
      expect(bluePuyo.color).toBe(PuyoColor.BLUE)
      expect(greenPuyo.color).toBe(PuyoColor.GREEN)
      expect(yellowPuyo.color).toBe(PuyoColor.YELLOW)
    })
  })
})
