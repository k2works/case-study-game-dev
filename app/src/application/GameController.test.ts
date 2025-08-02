import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GameController } from './GameController'

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
  measureText: vi.fn(() => ({ width: 50 })),
}

global.HTMLCanvasElement = vi.fn(() => ({
  getContext: vi.fn(() => mockContext),
  width: 320,
  height: 480,
})) as any

describe('GameController', () => {
  let canvas: HTMLCanvasElement
  let gameController: GameController

  beforeEach(() => {
    canvas = new HTMLCanvasElement()
    gameController = new GameController(canvas)
    vi.clearAllMocks()
  })

  describe('ゲームコントローラーの初期化', () => {
    it('ゲームコントローラーを作成できる', () => {
      expect(gameController).toBeDefined()
    })

    it('ゲームとレンダラーが初期化される', () => {
      expect(gameController['game']).toBeDefined()
      expect(gameController['renderer']).toBeDefined()
    })
  })

  describe('ゲームループ', () => {
    it('ゲームループを開始できる', () => {
      expect(() => {
        gameController.start()
      }).not.toThrow()
    })

    it('ゲームループ開始時にゲームがスタートする', () => {
      const gameStartSpy = vi.spyOn(gameController['game'], 'start')

      gameController.start()

      expect(gameStartSpy).toHaveBeenCalled()
    })

    it('ゲームループを停止できる', () => {
      gameController.start()

      expect(() => {
        gameController.stop()
      }).not.toThrow()
    })
  })

  describe('レンダリング', () => {
    it('ゲームが描画される', async () => {
      gameController.start()

      // フレームを待つ
      await new Promise((resolve) => setTimeout(resolve, 20))

      // レンダリングが呼ばれることを確認
      expect(mockContext.clearRect).toHaveBeenCalled()

      gameController.stop()
    })
  })

  describe('入力処理', () => {
    beforeEach(() => {
      gameController.start()
    })

    afterEach(() => {
      gameController.stop()
    })

    it('回転入力をゲームに転送する', () => {
      const game = gameController.getGame()
      const spy = vi.spyOn(game, 'rotatePuyo')

      // 上キーを押下
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(upEvent)

      // update を呼び出して入力処理を実行
      // @ts-expect-error privateメソッドにアクセスするため
      gameController.update()

      expect(spy).toHaveBeenCalled()
    })

    it('左右の移動入力をゲームに転送する', () => {
      const game = gameController.getGame()
      const spy = vi.spyOn(game, 'movePuyo')

      // 左キーを押下
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(leftEvent)

      // update を呼び出して入力処理を実行
      // @ts-expect-error privateメソッドにアクセスするため
      gameController.update()

      expect(spy).toHaveBeenCalledWith(-1, 0)
    })
  })
})
