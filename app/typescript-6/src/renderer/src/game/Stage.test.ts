import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Stage } from './Stage'
import { Config } from './Config'
import { PuyoType } from './Puyo'
import type { PuyoImage } from './PuyoImage'

describe('Stage', () => {
  let config: Config
  let stage: Stage

  beforeEach(() => {
    config = new Config(32, 6, 12)
    stage = new Stage(config)
  })

  it('インスタンスが作成できる', () => {
    expect(stage).toBeDefined()
    expect(stage).toBeInstanceOf(Stage)
  })

  describe('フィールド管理', () => {
    it('初期状態では全てのセルが空', () => {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 6; x++) {
          expect(stage.getPuyo(x, y)).toBe(PuyoType.Empty)
        }
      }
    })

    it('ぷよを配置できる', () => {
      stage.setPuyo(2, 5, PuyoType.Red)

      expect(stage.getPuyo(2, 5)).toBe(PuyoType.Red)
    })

    it('指定位置が空かどうか判定できる', () => {
      expect(stage.isEmpty(3, 7)).toBe(true)

      stage.setPuyo(3, 7, PuyoType.Blue)

      expect(stage.isEmpty(3, 7)).toBe(false)
    })

    it('範囲外の座標にアクセスするとEmptyを返す', () => {
      expect(stage.getPuyo(-1, 5)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(6, 5)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(3, -1)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(3, 12)).toBe(PuyoType.Empty)
    })
  })

  describe('描画', () => {
    it('配置されたぷよが描画される', () => {
      // モックの準備
      const mockContext = {} as CanvasRenderingContext2D
      const mockPuyoImage = {
        draw: vi.fn()
      } as unknown as PuyoImage

      // ぷよを配置
      stage.setPuyo(2, 5, PuyoType.Red)
      stage.setPuyo(3, 7, PuyoType.Blue)
      stage.setPuyo(4, 9, PuyoType.Green)

      // 描画
      stage.draw(mockContext, mockPuyoImage)

      // 配置されたぷよに対して puyoImage.draw() が呼ばれたことを確認
      expect(mockPuyoImage.draw).toHaveBeenCalledTimes(3)
      expect(mockPuyoImage.draw).toHaveBeenCalledWith(mockContext, PuyoType.Red, 2, 5)
      expect(mockPuyoImage.draw).toHaveBeenCalledWith(mockContext, PuyoType.Blue, 3, 7)
      expect(mockPuyoImage.draw).toHaveBeenCalledWith(mockContext, PuyoType.Green, 4, 9)
    })

    it('空のセルは描画されない', () => {
      const mockContext = {} as CanvasRenderingContext2D
      const mockPuyoImage = {
        draw: vi.fn()
      } as unknown as PuyoImage

      // 空のステージを描画
      stage.draw(mockContext, mockPuyoImage)

      // puyoImage.draw() が呼ばれないことを確認
      expect(mockPuyoImage.draw).not.toHaveBeenCalled()
    })
  })
})
