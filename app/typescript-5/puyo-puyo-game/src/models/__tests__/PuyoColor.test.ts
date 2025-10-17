import { PuyoColor, getPuyoColorStyle } from '../PuyoColor'

describe('PuyoColor', () => {
  describe('ぷよの色定義', () => {
    it('EMPTYは0であること', () => {
      expect(PuyoColor.EMPTY).toBe(0)
    })

    it('REDは1であること', () => {
      expect(PuyoColor.RED).toBe(1)
    })

    it('BLUEは2であること', () => {
      expect(PuyoColor.BLUE).toBe(2)
    })

    it('GREENは3であること', () => {
      expect(PuyoColor.GREEN).toBe(3)
    })

    it('YELLOWは4であること', () => {
      expect(PuyoColor.YELLOW).toBe(4)
    })
  })

  describe('ぷよの色スタイル', () => {
    it('REDの場合、赤色のスタイルが返されること', () => {
      const style = getPuyoColorStyle(PuyoColor.RED)
      expect(style.backgroundColor).toBe('#ff4444')
    })

    it('BLUEの場合、青色のスタイルが返されること', () => {
      const style = getPuyoColorStyle(PuyoColor.BLUE)
      expect(style.backgroundColor).toBe('#4444ff')
    })

    it('GREENの場合、緑色のスタイルが返されること', () => {
      const style = getPuyoColorStyle(PuyoColor.GREEN)
      expect(style.backgroundColor).toBe('#44ff44')
    })

    it('YELLOWの場合、黄色のスタイルが返されること', () => {
      const style = getPuyoColorStyle(PuyoColor.YELLOW)
      expect(style.backgroundColor).toBe('#ffff44')
    })

    it('EMPTYの場合、透明なスタイルが返されること', () => {
      const style = getPuyoColorStyle(PuyoColor.EMPTY)
      expect(style.backgroundColor).toBe('transparent')
    })
  })
})
