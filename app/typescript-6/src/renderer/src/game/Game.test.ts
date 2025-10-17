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
      fillText: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'center',
      textBaseline: 'middle'
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
      const score = new Score()

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

  describe('全消しボーナス', () => {
    it('盤面上のぷよをすべて消すと全消しボーナスが加算される', () => {
      // 実際の依存オブジェクトを作成
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const config = new Config()
      const puyoImage = new PuyoImage(config)
      const stage = new Stage(config)
      const player = new Player(config, puyoImage, stage)
      const score = new Score()

      const game = new Game(canvas, config, puyoImage, stage, player, score)

      // 初期スコア確認
      const initialScore = score.getValue()

      // 盤面に4つのぷよを配置（すべて消去される）
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)

      // checkEraseモードに設定
      game['mode'] = 'checkErase' as GameMode

      // 消去判定と処理
      game['update'](0) // checkErase → erasing（消去実行）

      // 消去後の重力チェック
      game['update'](0) // erasing → checkFall

      // 重力適用（落下なし）
      game['update'](0) // checkFall → checkErase

      // 2回目の消去判定（全消し判定が実行される）
      game['update'](0) // checkErase → newPuyo（全消しボーナス加算）

      // スコアが増加していることを確認
      expect(score.getValue()).toBeGreaterThan(initialScore)
      expect(score.getValue()).toBe(3600) // 全消しボーナスのみ
    })

    it('盤面上にぷよが残っている場合は全消しボーナスが加算されない', () => {
      // 実際の依存オブジェクトを作成
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const config = new Config()
      const puyoImage = new PuyoImage(config)
      const stage = new Stage(config)
      const player = new Player(config, puyoImage, stage)
      const score = new Score()

      const game = new Game(canvas, config, puyoImage, stage, player, score)

      // 盤面にぷよを配置（一部だけ消去される）
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)
      stage.setPuyo(3, 11, PuyoType.Green) // 消えないぷよ

      // checkEraseモードに設定
      game['mode'] = 'checkErase' as GameMode

      // 消去判定と処理
      game['update'](0) // checkErase → erasing（赤ぷよ消去）
      game['update'](0) // erasing → checkFall
      game['update'](0) // checkFall → checkErase
      game['update'](0) // checkErase → newPuyo（全消しボーナスなし）

      // スコアが0のまま（全消しボーナスが加算されていない）
      expect(score.getValue()).toBe(0)
    })
  })

  describe('ゲームオーバー', () => {
    it('新しいぷよを配置できない場合、ゲームオーバーになる', () => {
      // 実際の依存オブジェクトを作成
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const config = new Config()
      const puyoImage = new PuyoImage(config)
      const stage = new Stage(config)
      const player = new Player(config, puyoImage, stage)
      const score = new Score()

      const game = new Game(canvas, config, puyoImage, stage, player, score)

      // 初期状態でぷよを生成できるか確認（newPuyoモード）
      game['mode'] = 'newPuyo' as GameMode
      game['update'](0) // newPuyo → playing

      expect(game['mode']).toBe('playing')

      // ステージの上部にぷよを配置（新しいぷよが配置できない状態）
      const startX = Math.floor(config.cols / 2)
      stage.setPuyo(startX, 0, PuyoType.Red)
      stage.setPuyo(startX, 1, PuyoType.Red)

      // 新しいぷよを生成（newPuyoモード）
      game['mode'] = 'newPuyo' as GameMode
      game['update'](0) // newPuyo → gameOver

      // ゲームオーバーになっていることを確認
      expect(game['mode']).toBe('gameOver')
    })

    it('ゲームオーバー後は更新が停止する', () => {
      // 実際の依存オブジェクトを作成
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const config = new Config()
      const puyoImage = new PuyoImage(config)
      const stage = new Stage(config)
      const player = new Player(config, puyoImage, stage)
      const score = new Score()

      const game = new Game(canvas, config, puyoImage, stage, player, score)

      // ゲームオーバーモードに設定
      game['mode'] = 'gameOver' as GameMode

      // 更新を実行
      game['update'](0)

      // ゲームオーバーのまま変化しないことを確認
      expect(game['mode']).toBe('gameOver')
    })

    it('ゲームオーバー画面が描画される', () => {
      // モック化されたキャンバスを使用
      const game = new Game(mockCanvas, mockConfig, mockPuyoImage, mockStage, mockPlayer, mockScore)

      // Canvas コンテキストのメソッドをスパイ
      const ctx = mockCanvas.getContext('2d')
      const fillTextSpy = vi.spyOn(ctx!, 'fillText')
      const fillRectSpy = vi.spyOn(ctx!, 'fillRect')

      // ゲームオーバーモードに設定
      game['mode'] = 'gameOver' as GameMode

      // 描画実行
      game.draw()

      // ゲームオーバーテキストが描画されたことを確認
      expect(fillRectSpy).toHaveBeenCalled() // 半透明背景
      expect(fillTextSpy).toHaveBeenCalled() // テキスト描画
    })
  })

  describe('リスタート機能', () => {
    it('restart()メソッドでゲーム状態がリセットされる', () => {
      // 実際の依存オブジェクトを作成
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800

      const config = new Config()
      const puyoImage = new PuyoImage(config)
      const stage = new Stage(config)
      const player = new Player(config, puyoImage, stage)
      const score = new Score()

      const game = new Game(canvas, config, puyoImage, stage, player, score)

      // ゲームオーバーモードに設定
      game['mode'] = 'gameOver' as GameMode

      // リスタート実行
      game.restart()

      // newPuyoモードに戻っていることを確認
      expect(game['mode']).toBe('newPuyo')
    })
  })
})
