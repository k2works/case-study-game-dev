import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Game } from '../src/game'
import { Config } from '../src/config'
import { Stage } from '../src/stage'
import { PuyoImage } from '../src/puyoimage'
import { Player } from '../src/player'
import { Score } from '../src/score'

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
      expect(game['score']).toBeInstanceOf(Score)
    })

    it('ゲームを初期化すると、ゲームモードがnewPuyoになる', () => {
      game.initialize()

      expect(game['mode']).toEqual('newPuyo')
    })
  })

  describe('ゲームループ', () => {
    it('ゲームループを開始すると、requestAnimationFrameが呼ばれる', () => {
      // 初期化してからループを開始
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

  describe('ぷよの着地と次のぷよ', () => {
    it('ぷよが着地したら次のぷよが出る', () => {
      // 初期化
      game.initialize()

      // 最初のぷよが作成される（mode: 'newPuyo' → 'playing'）
      game['update'](0)
      expect(game['mode']).toBe('playing')

      // プレイヤーを下端近くに配置
      game['player']['puyoY'] = game['config'].stageRows - 2

      // 落下処理を実行（着地）
      game['player'].updateWithDelta(game['player']['dropInterval'])
      game['player'].updateWithDelta(game['player']['dropInterval'])

      // 着地している
      expect(game['player'].hasLanded()).toBe(true)

      // ゲームを更新（着地 → checkFall）
      game['update'](0)

      // モードが checkFall になっている
      expect(game['mode']).toBe('checkFall')

      // さらに更新（重力適用後、落下するぷよがないので newPuyo へ）
      game['update'](0)

      // モードが newPuyo に戻っている
      expect(game['mode']).toBe('newPuyo')
    })
  })
})
