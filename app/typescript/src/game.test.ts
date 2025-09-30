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

  describe('自由落下', () => {
    it('フレームカウントが一定値に達すると、ぷよが自動的に下に移動する', () => {
      game.initialize()

      // privateフィールドにアクセスするためにany型にキャスト
      const anyGame = game as any
      const player = anyGame._player
      const initialY = player.puyoY

      // フレームカウントを自由落下速度まで進める（30フレーム）
      for (let i = 0; i < 30; i++) {
        anyGame.update()
      }

      // ぷよが下に移動していることを確認
      expect(player.puyoY).toBeGreaterThan(initialY)
    })

    it('下キーが押されている時は、毎フレームぷよが下に移動する', () => {
      game.initialize()

      // 下キーを押す
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(downEvent)

      const anyGame = game as any
      const player = anyGame._player
      const initialY = player.puyoY

      // 1フレーム更新
      anyGame.update()

      // ぷよが下に移動していることを確認
      expect(player.puyoY).toBe(initialY + 1)
    })
  })

  describe('着地と次のぷよ生成', () => {
    it('ぷよが着地すると、新しいぷよが上部に生成される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player

      // ぷよを下端まで移動
      player.puyoY = anyGame.config.stageRows - 1

      // 1フレーム更新
      anyGame.update()

      // 新しいぷよが上部に生成されていることを確認
      expect(player.puyoY).toBe(0)
    })

    it('ぷよが着地すると、ステージにぷよが配置される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player
      const stage = anyGame.stage

      // ぷよの位置を記録
      const landedX = player.puyoX
      const landedY = anyGame.config.stageRows - 1
      player.puyoY = landedY

      // 1フレーム更新（着地処理）
      anyGame.update()

      // ステージにぷよが配置されていることを確認
      expect(stage.getPuyo(landedX, landedY)).not.toBe('')
    })
  })
})
