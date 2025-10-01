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

  describe('ゲームオーバー', () => {
    beforeEach(() => {
      // DOMの準備（chainも追加）
      document.body.innerHTML = `
        <div id="stage"></div>
        <div id="score"></div>
        <div id="chain"></div>
        <div id="next"></div>
        <div id="next2"></div>
      `
      game = new Game()
      game.initialize()
    })

    it('ゲームオーバーになると、ゲームモードがgameOverに変わる', () => {
      // ステージの上部（中央）にぷよを配置
      const stage = game['stage']
      const centerX = Math.floor(game['config'].stageCols / 2)
      stage.setPuyo(centerX, 0, 1)
      stage.setPuyo(centerX, 1, 1)

      // ゲームモードを設定
      game['mode'] = 'newPuyo'

      // requestAnimationFrameのモック
      const originalRequestAnimationFrame = window.requestAnimationFrame
      window.requestAnimationFrame = vi.fn()

      try {
        // ゲームループを実行
        game.loop()

        // ゲームモードがgameOverになっていることを確認
        expect(game['mode']).toBe('gameOver')
      } finally {
        // モックを元に戻す
        window.requestAnimationFrame = originalRequestAnimationFrame
      }
    })
  })
})
