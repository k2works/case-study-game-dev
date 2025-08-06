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
})
