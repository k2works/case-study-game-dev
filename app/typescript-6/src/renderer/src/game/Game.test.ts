import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Game, GameMode } from './Game'
import { Config } from './Config'
import { PuyoImage } from './PuyoImage'
import { Stage } from './Stage'
import { Player } from './Player'
import { Score } from './Score'
import { PuyoType } from './Puyo'

describe('Game', () => {
  let mockCanvas: HTMLCanvasElement
  let mockConfig: any
  let mockPuyoImage: any
  let mockStage: any
  let mockPlayer: any
  let mockScore: any

  beforeEach(() => {
    // モックの準備
    mockCanvas = document.createElement('canvas')
    mockCanvas.width = 192 // 32 * 6
    mockCanvas.height = 384 // 32 * 12

    // Canvas コンテキストのモック
    const mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1
    }
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext as any)

    mockConfig = {
      cellSize: 32,
      cols: 6,
      rows: 12
    }
    mockPuyoImage = {}
    mockStage = {
      draw: vi.fn()
    }
    mockPlayer = {
      createNewPuyoPair: vi.fn(),
      draw: vi.fn()
    }
    mockScore = {}

    // requestAnimationFrame のモック（コールバックは実行しない）
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1)
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  it('Gameクラスのインスタンスが作成できる', () => {
    // Game インスタンスの作成
    const game = new Game(mockCanvas, mockConfig, mockPuyoImage, mockStage, mockPlayer, mockScore)

    // 検証
    expect(game).toBeDefined()
    expect(game).toBeInstanceOf(Game)
  })

  it('start()メソッドでゲームループが開始される', () => {
    const game = new Game(mockCanvas, mockConfig, mockPuyoImage, mockStage, mockPlayer, mockScore)

    game.start()

    // requestAnimationFrame が呼ばれたことを確認
    expect(requestAnimationFrame).toHaveBeenCalled()
  })

  it('stop()メソッドでゲームループが停止される', () => {
    const game = new Game(mockCanvas, mockConfig, mockPuyoImage, mockStage, mockPlayer, mockScore)

    game.start()
    game.stop()

    // cancelAnimationFrame が呼ばれたことを確認
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  it('draw()メソッドでグリッド線が描画される', () => {
    const game = new Game(mockCanvas, mockConfig, mockPuyoImage, mockStage, mockPlayer, mockScore)
    const ctx = mockCanvas.getContext('2d')

    // Canvas コンテキストのメソッドをスパイ
    const strokeSpy = vi.spyOn(ctx!, 'stroke')
    const beginPathSpy = vi.spyOn(ctx!, 'beginPath')

    game.draw()

    // グリッド線が描画されたことを確認
    expect(beginPathSpy).toHaveBeenCalled()
    expect(strokeSpy).toHaveBeenCalled()
  })

  describe('連鎖反応', () => {
    it('ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する', () => {
      // 実際の依存オブジェクトを作成
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const config = new Config()
      const puyoImage = new PuyoImage(config)
      const stage = new Stage(config)
      const player = new Player(config, puyoImage, stage)
      const score = new Score(config)

      const game = new Game(canvas, config, puyoImage, stage, player, score)

      // ステージにぷよを配置
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)
      stage.setPuyo(3, 10, PuyoType.Green)
      stage.setPuyo(2, 7, PuyoType.Green)
      stage.setPuyo(2, 8, PuyoType.Green)
      stage.setPuyo(2, 9, PuyoType.Green)

      // checkEraseモードに設定
      game['mode'] = 'checkErase' as GameMode

      // 1回目の消去判定と消去実行
      game['update'](0) // checkErase → erasing
      expect(game['mode']).toBe('erasing')

      // 消去後の重力チェック
      game['update'](0) // erasing → checkFall
      expect(game['mode']).toBe('checkFall')

      // 重力適用（緑ぷよが落下）
      game['update'](0) // checkFall → falling（落下あり）
      expect(game['mode']).toBe('falling')

      // 落下アニメーション
      game['update'](0) // falling → checkFall
      expect(game['mode']).toBe('checkFall')

      // 落下完了まで繰り返し
      let iterations = 0
      const maxIterations = 20
      while (game['mode'] !== 'checkErase' && iterations < maxIterations) {
        game['update'](0)
        iterations++
      }

      // checkEraseモードに到達している
      expect(game['mode']).toBe('checkErase')

      // 2回目の消去判定（連鎖）
      const chainEraseInfo = stage.checkErase()

      // 連鎖が発生していることを確認（緑ぷよが4つつながっている）
      expect(chainEraseInfo.erasePuyoCount).toBeGreaterThan(0)
      expect(chainEraseInfo.erasePuyoCount).toBe(4)
    })
  })
})
