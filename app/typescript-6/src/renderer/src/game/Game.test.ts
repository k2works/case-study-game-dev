import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Game } from './Game'

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
})
