import { describe, it, expect } from 'vitest'
import { PuyoPair, PuyoColor } from './Puyo'

describe('PuyoPair', () => {
  describe('ペアの作成', () => {
    it('デフォルト位置でペアを作成できる', () => {
      const pair = PuyoPair.create(PuyoColor.RED, PuyoColor.BLUE)

      expect(pair.main.color).toBe(PuyoColor.RED)
      expect(pair.main.position.x).toBe(2)
      expect(pair.main.position.y).toBe(0)

      expect(pair.sub.color).toBe(PuyoColor.BLUE)
      expect(pair.sub.position.x).toBe(2)
      expect(pair.sub.position.y).toBe(-1)
    })

    it('指定位置でペアを作成できる', () => {
      const pair = PuyoPair.create(PuyoColor.GREEN, PuyoColor.YELLOW, 3, 5)

      expect(pair.main.position.x).toBe(3)
      expect(pair.main.position.y).toBe(5)

      expect(pair.sub.position.x).toBe(3)
      expect(pair.sub.position.y).toBe(4)
    })
  })

  describe('移動', () => {
    it('ペア全体を移動できる', () => {
      const pair = PuyoPair.create(PuyoColor.RED, PuyoColor.BLUE, 2, 2)
      const movedPair = pair.moveBy(1, 1)

      expect(movedPair.main.position.x).toBe(3)
      expect(movedPair.main.position.y).toBe(3)

      expect(movedPair.sub.position.x).toBe(3)
      expect(movedPair.sub.position.y).toBe(2)
    })
  })

  describe('回転', () => {
    it('時計回りに回転できる（上から右へ）', () => {
      // メインが(2,2)、サブが(2,1)の状態
      const pair = PuyoPair.create(PuyoColor.RED, PuyoColor.BLUE, 2, 2)
      const rotatedPair = pair.rotate()

      // 回転後：メインが(2,2)、サブが(3,2)
      expect(rotatedPair.main.position.x).toBe(2)
      expect(rotatedPair.main.position.y).toBe(2)

      expect(rotatedPair.sub.position.x).toBe(3)
      expect(rotatedPair.sub.position.y).toBe(2)
    })

    it('時計回りに回転できる（右から下へ）', () => {
      // メインが(2,2)、サブが(3,2)の状態を作成
      const pair = PuyoPair.create(PuyoColor.RED, PuyoColor.BLUE, 2, 2).rotate()
      const rotatedPair = pair.rotate()

      // 回転後：メインが(2,2)、サブが(2,3)
      expect(rotatedPair.main.position.x).toBe(2)
      expect(rotatedPair.main.position.y).toBe(2)

      expect(rotatedPair.sub.position.x).toBe(2)
      expect(rotatedPair.sub.position.y).toBe(3)
    })

    it('4回回転すると元の位置に戻る', () => {
      const originalPair = PuyoPair.create(PuyoColor.RED, PuyoColor.BLUE, 2, 2)

      const rotated4Times = originalPair.rotate().rotate().rotate().rotate()

      expect(
        rotated4Times.main.position.equals(originalPair.main.position)
      ).toBe(true)
      expect(rotated4Times.sub.position.equals(originalPair.sub.position)).toBe(
        true
      )
    })

    it('回転しても色は変わらない', () => {
      const pair = PuyoPair.create(PuyoColor.RED, PuyoColor.BLUE, 2, 2)
      const rotatedPair = pair.rotate()

      expect(rotatedPair.main.color).toBe(PuyoColor.RED)
      expect(rotatedPair.sub.color).toBe(PuyoColor.BLUE)
    })
  })
})
