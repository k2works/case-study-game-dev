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

      // さらに更新（重力適用後、落下するぷよがないので checkErase へ）
      game['update'](0)

      // モードが checkErase になっている
      expect(game['mode']).toBe('checkErase')

      // さらに更新（消去対象がないので newPuyo へ）
      game['update'](0)

      // モードが newPuyo に戻っている
      expect(game['mode']).toBe('newPuyo')
    })
  })

  describe('ぷよの消去処理統合', () => {
    it('4つ以上つながったぷよは消去される', () => {
      // 初期化
      game.initialize()

      // ステージに消去対象のぷよを配置
      const stage = game['stage']
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)

      // checkErase モードに設定
      game['mode'] = 'checkErase'

      // 更新（消去判定と消去実行）
      game['update'](0)

      // モードが erasing になっている
      expect(game['mode']).toBe('erasing')

      // さらに更新（消去後の重力チェック）
      game['update'](0)

      // モードが checkFall になっている
      expect(game['mode']).toBe('checkFall')

      // ぷよが消去されていることを確認
      expect(stage.getPuyo(1, 10)).toBe(0)
      expect(stage.getPuyo(2, 10)).toBe(0)
      expect(stage.getPuyo(1, 11)).toBe(0)
      expect(stage.getPuyo(2, 11)).toBe(0)
    })
  })

  describe('連鎖反応', () => {
    it('ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する', () => {
      // 初期化
      game.initialize()

      // ゲームのステージにぷよを配置
      // 赤ぷよの2×2と、その上に青ぷよが縦に3つ、さらに青ぷよが1つ横に
      const stage = game['stage']
      stage.setPuyo(1, 10, 1) // 赤
      stage.setPuyo(2, 10, 1) // 赤
      stage.setPuyo(1, 11, 1) // 赤
      stage.setPuyo(2, 11, 1) // 赤
      stage.setPuyo(3, 10, 2) // 青（横）
      stage.setPuyo(2, 7, 2) // 青（上）
      stage.setPuyo(2, 8, 2) // 青（上）
      stage.setPuyo(2, 9, 2) // 青（上）

      // checkErase モードに設定
      game['mode'] = 'checkErase'

      // 1回目の消去判定と消去実行
      game['update'](0) // checkErase → erasing
      expect(game['mode']).toBe('erasing')

      // 消去後の重力チェック
      game['update'](0) // erasing → checkFall
      expect(game['mode']).toBe('checkFall')

      // 重力適用（青ぷよが落下）
      game['update'](0) // checkFall → falling（落下あり）
      expect(game['mode']).toBe('falling')

      // 落下アニメーション
      game['update'](0) // falling → checkFall
      expect(game['mode']).toBe('checkFall')

      // 重力適用（青ぷよがさらに落下）
      game['update'](0) // checkFall → falling（落下あり）

      // 落下完了まで繰り返し
      let iterations = 0
      while (game['mode'] !== 'checkErase' && iterations < 20) {
        game['update'](0)
        iterations++
      }

      // checkErase モードに到達している
      expect(game['mode']).toBe('checkErase')

      // 2回目の消去判定（連鎖）
      const chainEraseInfo = stage.checkErase()

      // 連鎖が発生していることを確認（青ぷよが4つつながっている）
      expect(chainEraseInfo.erasePuyoCount).toBeGreaterThan(0)
    })
  })
})
