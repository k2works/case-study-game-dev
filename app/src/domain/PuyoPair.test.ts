import { describe, it, expect } from 'vitest'
import { PuyoPair } from './PuyoPair'
import { Puyo, PuyoColor } from './Puyo'

describe('PuyoPair', () => {
  describe('PuyoPairを作成する', () => {
    it('2つのぷよでPuyoPairを作成できる', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const puyoPair = new PuyoPair(mainPuyo, subPuyo, 3, 0)

      expect(puyoPair.main).toBe(mainPuyo)
      expect(puyoPair.sub).toBe(subPuyo)
      expect(puyoPair.x).toBe(3)
      expect(puyoPair.y).toBe(0)
    })

    it('初期状態では回転角度が0である', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const puyoPair = new PuyoPair(mainPuyo, subPuyo, 3, 0)

      expect(puyoPair.rotation).toBe(0)
    })
  })

  describe('PuyoPairを回転する', () => {
    it('時計回りに90度回転できる', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const puyoPair = new PuyoPair(mainPuyo, subPuyo, 3, 1)

      puyoPair.rotate()

      expect(puyoPair.rotation).toBe(90)
    })

    it('4回回転すると元の状態に戻る', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const puyoPair = new PuyoPair(mainPuyo, subPuyo, 3, 1)

      puyoPair.rotate()
      puyoPair.rotate()
      puyoPair.rotate()
      puyoPair.rotate()

      expect(puyoPair.rotation).toBe(0)
    })
  })

  describe('PuyoPairの位置を取得する', () => {
    it('回転角度に応じたsubぷよの位置を取得できる', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const puyoPair = new PuyoPair(mainPuyo, subPuyo, 3, 5)

      // 初期状態（0度）: subが上
      expect(puyoPair.getMainPosition()).toEqual({ x: 3, y: 5 })
      expect(puyoPair.getSubPosition()).toEqual({ x: 3, y: 4 })

      // 90度回転: subが右
      puyoPair.rotate()
      expect(puyoPair.getMainPosition()).toEqual({ x: 3, y: 5 })
      expect(puyoPair.getSubPosition()).toEqual({ x: 4, y: 5 })

      // 180度回転: subが下
      puyoPair.rotate()
      expect(puyoPair.getMainPosition()).toEqual({ x: 3, y: 5 })
      expect(puyoPair.getSubPosition()).toEqual({ x: 3, y: 6 })

      // 270度回転: subが左
      puyoPair.rotate()
      expect(puyoPair.getMainPosition()).toEqual({ x: 3, y: 5 })
      expect(puyoPair.getSubPosition()).toEqual({ x: 2, y: 5 })
    })
  })
})
