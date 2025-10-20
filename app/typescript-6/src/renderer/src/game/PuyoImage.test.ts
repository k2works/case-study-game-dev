import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PuyoImage } from '@/game/PuyoImage'
import type { Config } from '@/game/Config'
import { PuyoType } from '@/game/Puyo'

describe('PuyoImage', () => {
  let mockConfig: Config
  let puyoImage: PuyoImage
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    mockConfig = {
      cellSize: 32,
      cols: 6,
      rows: 12
    } as Config

    puyoImage = new PuyoImage(mockConfig)

    // Canvas 2D コンテキストのモック
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    } as unknown as CanvasRenderingContext2D
  })

  it('インスタンスが作成できる', () => {
    expect(puyoImage).toBeDefined()
    expect(puyoImage).toBeInstanceOf(PuyoImage)
  })

  describe('draw メソッド', () => {
    it('赤ぷよが描画される', () => {
      puyoImage.draw(mockContext, PuyoType.Red, 2, 5)

      expect(mockContext.beginPath).toHaveBeenCalledTimes(2) // fill と stroke
      expect(mockContext.arc).toHaveBeenCalledTimes(2)
      expect(mockContext.fill).toHaveBeenCalledTimes(1)
      expect(mockContext.stroke).toHaveBeenCalledTimes(1)
      expect(mockContext.fillStyle).toBe('#ff0000')
    })

    it('緑ぷよが描画される', () => {
      puyoImage.draw(mockContext, PuyoType.Green, 3, 4)

      expect(mockContext.fillStyle).toBe('#00ff00')
      expect(mockContext.arc).toHaveBeenCalled()
    })

    it('青ぷよが描画される', () => {
      puyoImage.draw(mockContext, PuyoType.Blue, 1, 2)

      expect(mockContext.fillStyle).toBe('#0000ff')
      expect(mockContext.arc).toHaveBeenCalled()
    })

    it('黄ぷよが描画される', () => {
      puyoImage.draw(mockContext, PuyoType.Yellow, 0, 0)

      expect(mockContext.fillStyle).toBe('#ffff00')
      expect(mockContext.arc).toHaveBeenCalled()
    })

    it('空のぷよが描画される', () => {
      puyoImage.draw(mockContext, PuyoType.Empty, 0, 0)

      expect(mockContext.fillStyle).toBe('#888')
      expect(mockContext.arc).toHaveBeenCalled()
    })

    it('正しい座標に描画される', () => {
      const x = 2
      const y = 3
      const cellSize = mockConfig.cellSize

      puyoImage.draw(mockContext, PuyoType.Red, x, y)

      const expectedCenterX = x * cellSize + cellSize / 2
      const expectedCenterY = y * cellSize + cellSize / 2
      const expectedRadius = cellSize / 2 - 2

      // arc() の呼び出し引数を確認
      expect(mockContext.arc).toHaveBeenCalledWith(
        expectedCenterX,
        expectedCenterY,
        expectedRadius,
        0,
        Math.PI * 2
      )
    })

    it('枠線が黒で描画される', () => {
      puyoImage.draw(mockContext, PuyoType.Red, 0, 0)

      expect(mockContext.strokeStyle).toBe('#000')
      expect(mockContext.lineWidth).toBe(2)
    })

    it('無効な PuyoType が渡された場合はエラーをスローする', () => {
      expect(() => puyoImage.draw(mockContext, 99 as PuyoType, 0, 0)).toThrow()
    })

    it('座標が整数でない場合はエラーをスローする', () => {
      expect(() => puyoImage.draw(mockContext, PuyoType.Red, 2.5, 0)).toThrow()
      expect(() => puyoImage.draw(mockContext, PuyoType.Red, 0, 3.5)).toThrow()
    })
  })
})
