import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameRenderer } from './GameRenderer'
import { Game } from '../../domain/model/Game'

// HTMLCanvasElementのモック
const mockContext = {
  fillStyle: '',
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  rect: vi.fn(),
  stroke: vi.fn(),
  fillText: vi.fn(),
  font: '',
  textAlign: '',
  lineWidth: 1,
  strokeStyle: '',
  measureText: vi.fn(() => ({ width: 50 }))
}

global.HTMLCanvasElement = vi.fn(() => ({
  getContext: vi.fn(() => mockContext),
  width: 320,
  height: 480
})) as any

describe('GameRenderer', () => {
  let canvas: HTMLCanvasElement
  let renderer: GameRenderer
  let game: Game

  beforeEach(() => {
    canvas = new HTMLCanvasElement()
    renderer = new GameRenderer(canvas)
    game = new Game()
  })

  describe('レンダラーの初期化', () => {
    it('レンダラーを作成できる', () => {
      expect(renderer).toBeDefined()
    })

    it('キャンバスが設定される', () => {
      expect(renderer['canvas']).toBe(canvas)
    })
  })

  describe('ゲーム画面の描画', () => {
    beforeEach(() => {
      // モックをリセット
      vi.clearAllMocks()
    })

    it('ゲームを描画できる', () => {
      expect(() => {
        renderer.render(game)
      }).not.toThrow()
    })

    it('ゲームフィールドが描画される', () => {
      renderer.render(game)

      expect(mockContext.clearRect).toHaveBeenCalled()
      expect(mockContext.strokeRect).toHaveBeenCalled()
    })

    it('スコアが描画される', () => {
      renderer.render(game)

      expect(mockContext.fillText).toHaveBeenCalledWith(expect.stringContaining('Score'), expect.any(Number), expect.any(Number))
    })
  })

  describe('ぷよの描画', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('現在のぷよが描画される', () => {
      game.start() // ぷよを生成

      renderer.render(game)

      expect(mockContext.fillRect).toHaveBeenCalled()
    })
  })
})