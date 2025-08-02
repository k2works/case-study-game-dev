import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InputHandler } from './InputHandler'

describe('InputHandler', () => {
  let inputHandler: InputHandler

  beforeEach(() => {
    // DOM イベントをモック
    vi.spyOn(document, 'addEventListener')
    inputHandler = new InputHandler()
  })

  describe('キーボード入力の検出', () => {
    it('インスタンスを作成できる', () => {
      expect(inputHandler).toBeDefined()
    })

    it('キーが押されていない状態を検出できる', () => {
      expect(inputHandler.isKeyPressed('ArrowLeft')).toBe(false)
      expect(inputHandler.isKeyPressed('ArrowRight')).toBe(false)
    })

    it('JustPressedは初期状態でfalseを返す', () => {
      expect(inputHandler.isKeyJustPressed('ArrowLeft')).toBe(false)
      expect(inputHandler.isKeyJustPressed('ArrowRight')).toBe(false)
    })

    it('updateメソッドが正常に動作する', () => {
      expect(() => inputHandler.update()).not.toThrow()
    })
  })
})