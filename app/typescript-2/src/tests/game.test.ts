import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Game } from '../game'
import { Config } from '../config'
import { Stage } from '../stage'
import { PuyoImage } from '../puyoimage'
import { Player } from '../player'
import { Score } from '../score'

describe('ゲーム', () => {
  let game: Game

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
      <div id="stage"></div>
      <div id="score"></div>
      <div id="next"></div>
      <div id="next2"></div>
    `
    game = new Game()
  })

  describe('ゲームの初期化', () => {
    it('ゲームを初期化すると、必要なコンポーネントが作成される', () => {
      game.initialize()

      expect(game['config']).toBeInstanceOf(Config)
      expect(game['puyoImage']).toBeInstanceOf(PuyoImage)
      expect(game['stage']).toBeInstanceOf(Stage)
      expect(game['player']).toBeInstanceOf(Player)
      expect(game['_score']).toBeInstanceOf(Score)
    })

    it('ゲームを初期化すると、ゲームモードがstartになる', () => {
      game.initialize()

      expect(game['mode']).toEqual('start')
    })
  })

  describe('ゲームループ', () => {
    it('ゲームループを開始すると、requestAnimationFrameが呼ばれる', () => {
      game.initialize()

      // requestAnimationFrameのモック
      const originalRequestAnimationFrame = window.requestAnimationFrame
      const mockRequestAnimationFrame = vi.fn()
      window.requestAnimationFrame = mockRequestAnimationFrame

      try {
        game.loop()

        expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1)
        expect(mockRequestAnimationFrame).toHaveBeenCalledWith(
          expect.any(Function)
        )
      } finally {
        // モックを元に戻す
        window.requestAnimationFrame = originalRequestAnimationFrame
      }
    })
  })
})
