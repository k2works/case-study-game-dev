import { describe, expect, it } from 'vitest'

import { Field } from './Field'
import { createPuyo } from './Puyo'

describe('Fieldクラス', () => {
  describe('初期化テスト', () => {
    it('6×12のフィールドを初期化できる', () => {
      const field = new Field()

      expect(field.getWidth()).toBe(6)
      expect(field.getHeight()).toBe(12)
    })

    it('初期状態ではすべてのセルが空である', () => {
      const field = new Field()

      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 12; y++) {
          expect(field.getPuyo(x, y)).toBeNull()
        }
      }
    })
  })

  describe('ぷよ配置テスト', () => {
    it('指定した位置にぷよを配置できる', () => {
      const field = new Field()
      const puyo = createPuyo('red', { x: 2, y: 5 })

      field.setPuyo(2, 5, puyo)

      expect(field.getPuyo(2, 5)).toBe(puyo)
    })

    it('範囲外の位置には配置できない', () => {
      const field = new Field()
      const puyo = createPuyo('red', { x: 2, y: 5 })

      expect(() => field.setPuyo(-1, 5, puyo)).toThrow()
      expect(() => field.setPuyo(6, 5, puyo)).toThrow()
      expect(() => field.setPuyo(2, -1, puyo)).toThrow()
      expect(() => field.setPuyo(2, 12, puyo)).toThrow()
    })

    it('既にぷよがある位置には配置できない', () => {
      const field = new Field()
      const puyo1 = createPuyo('red', { x: 2, y: 5 })
      const puyo2 = createPuyo('blue', { x: 2, y: 5 })

      field.setPuyo(2, 5, puyo1)

      expect(() => field.setPuyo(2, 5, puyo2)).toThrow()
    })
  })

  describe('ぷよ除去テスト', () => {
    it('指定した位置のぷよを除去できる', () => {
      const field = new Field()
      const puyo = createPuyo('red', { x: 2, y: 5 })

      field.setPuyo(2, 5, puyo)
      field.removePuyo(2, 5)

      expect(field.getPuyo(2, 5)).toBeNull()
    })

    it('空のセルを除去してもエラーにならない', () => {
      const field = new Field()

      expect(() => field.removePuyo(2, 5)).not.toThrow()
    })
  })

  describe('空きセル判定テスト', () => {
    it('空のセルに対してisEmptyがtrueを返す', () => {
      const field = new Field()

      expect(field.isEmpty(2, 5)).toBe(true)
    })

    it('ぷよがあるセルに対してisEmptyがfalseを返す', () => {
      const field = new Field()
      const puyo = createPuyo('red', { x: 2, y: 5 })

      field.setPuyo(2, 5, puyo)

      expect(field.isEmpty(2, 5)).toBe(false)
    })
  })

  describe('境界チェックテスト', () => {
    it('有効な座標に対してisValidPositionがtrueを返す', () => {
      const field = new Field()

      expect(field.isValidPosition(0, 0)).toBe(true)
      expect(field.isValidPosition(5, 11)).toBe(true)
      expect(field.isValidPosition(2, 5)).toBe(true)
    })

    it('無効な座標に対してisValidPositionがfalseを返す', () => {
      const field = new Field()

      expect(field.isValidPosition(-1, 0)).toBe(false)
      expect(field.isValidPosition(6, 0)).toBe(false)
      expect(field.isValidPosition(0, -1)).toBe(false)
      expect(field.isValidPosition(0, 12)).toBe(false)
    })
  })
})
