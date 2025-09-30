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

  describe('重なり検出と即座着地', () => {
    it('配置済みぷよと重なっている場合、即座に着地処理が実行される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player
      const stage = anyGame.stage

      // ステージにぷよを配置
      stage.setPuyo(3, 5, '#ff0000')

      // プレイヤーぷよを重なる位置に配置
      player.puyoX = 3
      player.puyoY = 5
      player.rotation = 0

      // 更新処理を実行
      anyGame.update()

      // 即座にcheckEraseモードに遷移していることを確認
      expect(anyGame.mode).toBe('checkErase')
    })
  })

  describe('着地と次のぷよ生成', () => {
    it('ぷよが着地すると、checkEraseモードを経て新しいぷよが上部に生成される', () => {
      game.initialize()

      const anyGame = game as any
      const player = anyGame._player

      // ぷよを下端まで移動
      player.puyoY = anyGame.config.stageRows - 1

      // 1フレーム更新（着地）
      anyGame.update()
      expect(anyGame.mode).toBe('checkErase')

      // 消去判定（消すぷよなし）
      anyGame.update()
      expect(anyGame.mode).toBe('checkFall')

      // 落下判定（落下可能なぷよなし）
      anyGame.update()
      expect(anyGame.mode).toBe('newPuyo')

      // 新ぷよ生成
      anyGame.update()
      expect(anyGame.mode).toBe('playing')

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

  describe('ぷよ消去', () => {
    it('4つ連結したぷよが着地すると、checkEraseモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 横に3つ赤いぷよを事前配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')

      // プレイヤーの軸ぷよを(3, 12)に配置して着地させる
      const player = anyGame._player
      player.puyoX = 3
      player.puyoY = 12
      player.rotation = 0 // 2つ目のぷよは上

      // 着地処理を実行
      anyGame.update()

      // checkEraseモードに遷移していることを確認
      expect(anyGame.mode).toBe('checkErase')
    })

    it('checkEraseモードで4つ以上連結したぷよがあると、erasingモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // checkEraseモードに設定
      anyGame.mode = 'checkErase'

      // 更新処理
      anyGame.update()

      // erasingモードに遷移していることを確認
      expect(anyGame.mode).toBe('erasing')
    })

    it('erasingモードではぷよが消去される', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // checkEraseモードで消去対象を検出
      anyGame.mode = 'checkErase'
      anyGame.update()

      // erasingモードで消去実行
      expect(anyGame.mode).toBe('erasing')
      anyGame.update()

      // ぷよが消去されていることを確認
      expect(stage.getPuyo(0, 12)).toBe('')
      expect(stage.getPuyo(1, 12)).toBe('')
      expect(stage.getPuyo(2, 12)).toBe('')
      expect(stage.getPuyo(3, 12)).toBe('')
    })

    it('消すぷよがない場合は、checkFallモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 3つだけ配置（消去対象外）
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')

      // checkEraseモードに設定
      anyGame.mode = 'checkErase'

      // 更新処理
      anyGame.update()

      // checkFallモードに遷移していることを確認
      expect(anyGame.mode).toBe('checkFall')
    })

    it('newPuyoモードでは新しいぷよが生成されてplayingモードに戻る', () => {
      game.initialize()

      const anyGame = game as any

      // newPuyoモードに設定
      anyGame.mode = 'newPuyo'

      // 更新処理
      anyGame.update()

      // playingモードに戻っていることを確認
      expect(anyGame.mode).toBe('playing')
    })
  })

  describe('重力落下', () => {
    it('ぷよ消去後、落下可能なぷよがあればcheckFallモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 縦に積まれたぷよを配置
      stage.setPuyo(2, 10, '#ff0000')
      stage.setPuyo(2, 11, '#0000ff')
      stage.setPuyo(2, 12, '#00ff00')

      // 横に4つ配置して消去可能にする
      stage.setPuyo(0, 12, '#00ff00')
      stage.setPuyo(1, 12, '#00ff00')
      stage.setPuyo(3, 12, '#00ff00')

      // checkEraseモードで消去対象検出
      anyGame.mode = 'checkErase'
      anyGame.update()
      expect(anyGame.mode).toBe('erasing')

      // 消去実行
      anyGame.update()

      // 落下判定モードに遷移
      expect(anyGame.mode).toBe('checkFall')
    })

    it('checkFallモードで落下可能なぷよがあればfallモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 空白の上にぷよを配置
      stage.setPuyo(2, 5, '#ff0000')

      // checkFallモードに設定
      anyGame.mode = 'checkFall'

      // 更新処理
      anyGame.update()

      // fallモードに遷移していることを確認
      expect(anyGame.mode).toBe('fall')
    })

    it('fallモードでは重力が適用されcheckEraseモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 空白の上にぷよを配置
      stage.setPuyo(2, 5, '#ff0000')

      // fallモードに設定
      anyGame.mode = 'fall'

      // 更新処理
      anyGame.update()

      // ぷよが落下していることを確認
      expect(stage.getPuyo(2, 12)).toBe('#ff0000')
      expect(stage.getPuyo(2, 5)).toBe('')

      // checkEraseモードに遷移（連鎖判定）
      expect(anyGame.mode).toBe('checkErase')
    })

    it('落下可能なぷよがない場合はnewPuyoモードに遷移する', () => {
      game.initialize()

      const anyGame = game as any
      const stage = anyGame.stage

      // 下端にぷよを配置（落下不可）
      stage.setPuyo(2, 12, '#ff0000')

      // checkFallモードに設定
      anyGame.mode = 'checkFall'

      // 更新処理
      anyGame.update()

      // newPuyoモードに遷移していることを確認
      expect(anyGame.mode).toBe('newPuyo')
    })
  })
})
