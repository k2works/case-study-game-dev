import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Game } from './game'
import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'
import { Player } from './player'
import { Score } from './score'

describe('ゲーム', () => {
  let game: Game

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
            <canvas id="stage"></canvas>
            <div id="score"></div>
            <div id="next"></div>
            <div id="next2"></div>
        `

    // Canvas のモックを作成
    const canvas = document.getElementById('stage') as any
    canvas.getContext = () => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
    })

    game = new Game()
  })

  describe('ゲームの初期化', () => {
    it('ゲームを初期化すると、必要なコンポーネントが作成される', () => {
      game.initialize()

      // privateフィールドにアクセスするためにany型にキャスト
      const anyGame = game as any
      expect(anyGame.config).toBeInstanceOf(Config)
      expect(anyGame.puyoImage).toBeInstanceOf(PuyoImage)
      expect(anyGame.stage).toBeInstanceOf(Stage)
      expect(anyGame._player).toBeInstanceOf(Player)
      expect(anyGame._score).toBeInstanceOf(Score)
    })

    it('ゲームを初期化すると、ゲームモードがplayingになる', () => {
      game.initialize()

      const anyGame = game as any
      expect(anyGame.mode).toEqual('playing')
    })
  })

  describe('ゲームループ', () => {
    it('ゲームループを開始すると、requestAnimationFrameが呼ばれる', () => {
      // requestAnimationFrameのモック
      const originalRequestAnimationFrame = window.requestAnimationFrame
      const mockRequestAnimationFrame = vi.fn()
      window.requestAnimationFrame = mockRequestAnimationFrame as any

      try {
        game.initialize()
        game.start()

        expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1)
        expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function))
      } finally {
        // モックを元に戻す
        window.requestAnimationFrame = originalRequestAnimationFrame
      }
    })
  })
})
