import { describe, it, expect } from 'vitest'
import { Field } from './Field'
import { Puyo, PuyoColor } from './Puyo'

describe('Field', () => {
  describe('Fieldを作成する', () => {
    it('12行6列の空フィールドを作成できる', () => {
      const field = new Field()
      expect(field.height).toBe(12)
      expect(field.width).toBe(6)
      expect(field.isEmpty()).toBe(true)
    })
  })

  describe('ぷよをフィールドに配置する', () => {
    it('指定した位置にぷよを配置できる', () => {
      const field = new Field()
      const puyo = new Puyo(PuyoColor.RED)

      field.setPuyo(5, 11, puyo)

      expect(field.getPuyo(5, 11)).toBe(puyo)
      expect(field.isEmpty()).toBe(false)
    })

    it('範囲外の位置にはぷよを配置できない', () => {
      const field = new Field()
      const puyo = new Puyo(PuyoColor.RED)

      field.setPuyo(-1, 0, puyo)
      field.setPuyo(6, 0, puyo)
      field.setPuyo(0, -1, puyo)
      field.setPuyo(0, 12, puyo)

      expect(field.isEmpty()).toBe(true)
    })

    it('空の位置からはnullが返される', () => {
      const field = new Field()

      expect(field.getPuyo(0, 0)).toBeNull()
      expect(field.getPuyo(5, 11)).toBeNull()
    })
  })

  describe('連結ぷよを検索する', () => {
    it('同じ色の連結ぷよを検索できる', () => {
      const field = new Field()
      // 2×2の赤いぷよを配置
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(0, 1, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 1, new Puyo(PuyoColor.RED))

      const connectedPuyos = field.findConnectedPuyos(0, 0)
      expect(connectedPuyos).toHaveLength(4)
      expect(connectedPuyos).toEqual(
        expect.arrayContaining([
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ])
      )
    })

    it('異なる色のぷよは連結されない', () => {
      const field = new Field()
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 0, new Puyo(PuyoColor.BLUE))

      const connectedPuyos = field.findConnectedPuyos(0, 0)
      expect(connectedPuyos).toHaveLength(1)
      expect(connectedPuyos).toEqual([[0, 0]])
    })

    it('L字型の連結ぷよを正しく検索できる', () => {
      const field = new Field()
      // L字型に配置
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(0, 1, new Puyo(PuyoColor.RED))
      field.setPuyo(0, 2, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 2, new Puyo(PuyoColor.RED))

      const connectedPuyos = field.findConnectedPuyos(0, 0)
      expect(connectedPuyos).toHaveLength(4)
      expect(connectedPuyos).toEqual(
        expect.arrayContaining([
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 2],
        ])
      )
    })

    it('空の位置では空配列を返す', () => {
      const field = new Field()

      const connectedPuyos = field.findConnectedPuyos(0, 0)
      expect(connectedPuyos).toHaveLength(0)
    })

    it('単独のぷよでも自分自身を返す', () => {
      const field = new Field()
      field.setPuyo(2, 2, new Puyo(PuyoColor.GREEN))

      const connectedPuyos = field.findConnectedPuyos(2, 2)
      expect(connectedPuyos).toHaveLength(1)
      expect(connectedPuyos).toEqual([[2, 2]])
    })
  })

  describe('ぷよを消去する', () => {
    it('4つ以上連結したぷよを消去できる', () => {
      const field = new Field()
      // 2×2の赤いぷよを配置（4つ）
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(0, 1, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 1, new Puyo(PuyoColor.RED))

      const removedPuyos = field.removePuyos()
      expect(removedPuyos).toHaveLength(4)
      expect(removedPuyos).toEqual(
        expect.arrayContaining([
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ])
      )

      // 消去後はフィールドが空になる
      expect(field.isEmpty()).toBe(true)
    })

    it('3つ以下の連結は消去されない', () => {
      const field = new Field()
      // 3つの赤いぷよを配置
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(0, 1, new Puyo(PuyoColor.RED))

      const removedPuyos = field.removePuyos()
      expect(removedPuyos).toHaveLength(0)

      // ぷよは残っている
      expect(field.getPuyo(0, 0)).toBeTruthy()
      expect(field.getPuyo(1, 0)).toBeTruthy()
      expect(field.getPuyo(0, 1)).toBeTruthy()
    })

    it('複数の消去グループが同時に消去される', () => {
      const field = new Field()
      // 左側に4つの赤いぷよ
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(0, 1, new Puyo(PuyoColor.RED))
      field.setPuyo(1, 1, new Puyo(PuyoColor.RED))

      // 右側に4つの青いぷよ
      field.setPuyo(4, 0, new Puyo(PuyoColor.BLUE))
      field.setPuyo(5, 0, new Puyo(PuyoColor.BLUE))
      field.setPuyo(4, 1, new Puyo(PuyoColor.BLUE))
      field.setPuyo(5, 1, new Puyo(PuyoColor.BLUE))

      const removedPuyos = field.removePuyos()
      expect(removedPuyos).toHaveLength(8)

      // 全て消去されている
      expect(field.isEmpty()).toBe(true)
    })

    it('消去対象がない場合は空配列を返す', () => {
      const field = new Field()
      // 単独ぷよのみ配置
      field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      field.setPuyo(2, 2, new Puyo(PuyoColor.BLUE))

      const removedPuyos = field.removePuyos()
      expect(removedPuyos).toHaveLength(0)

      // ぷよは残っている
      expect(field.getPuyo(0, 0)).toBeTruthy()
      expect(field.getPuyo(2, 2)).toBeTruthy()
    })
  })
})
