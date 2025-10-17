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

  describe('消去判定', () => {
    it('赤ぷよが縦に4つ繋がっている場合、消去対象として検出される', () => {
      // Arrange: 赤ぷよを縦に4つ配置
      stage.setPuyo(2, 8, PuyoType.Red)
      stage.setPuyo(2, 9, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)

      // Act: 消去判定を実行
      const eraseInfo = stage.checkErase()

      // Assert: 4つの赤ぷよが消去対象として検出される
      expect(eraseInfo.erasePuyoCount).toBe(4)
      expect(eraseInfo.eraseInfo).toHaveLength(4)
      expect(eraseInfo.eraseInfo).toContainEqual({ x: 2, y: 8, type: PuyoType.Red })
      expect(eraseInfo.eraseInfo).toContainEqual({ x: 2, y: 9, type: PuyoType.Red })
      expect(eraseInfo.eraseInfo).toContainEqual({ x: 2, y: 10, type: PuyoType.Red })
      expect(eraseInfo.eraseInfo).toContainEqual({ x: 2, y: 11, type: PuyoType.Red })
    })
  })

  describe('ぷよの消去と落下', () => {
    it('消去対象のぷよを消去する', () => {
      // Arrange: 赤ぷよを4つ配置
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)

      // Act: 消去判定と消去実行
      const eraseInfo = stage.checkErase()
      stage.eraseBoards(eraseInfo.eraseInfo)

      // Assert: ぷよが消去されている
      expect(stage.getPuyo(1, 10)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(2, 10)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(1, 11)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(2, 11)).toBe(PuyoType.Empty)
    })

    it('消去後、上にあるぷよが落下する', () => {
      // Arrange: 赤ぷよ4つと緑ぷよ2つを配置
      // 0 0 2 0 0 0  (y=8) 緑
      // 0 0 2 0 0 0  (y=9) 緑
      // 0 1 1 0 0 0  (y=10) 赤・赤
      // 0 1 1 0 0 0  (y=11) 赤・赤
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)
      stage.setPuyo(2, 8, PuyoType.Green)
      stage.setPuyo(2, 9, PuyoType.Green)

      // Act: 消去判定と消去実行、落下処理
      const eraseInfo = stage.checkErase()
      stage.eraseBoards(eraseInfo.eraseInfo)
      stage.fall()

      // Assert: 上にあった緑ぷよが落下している
      expect(stage.getPuyo(2, 10)).toBe(PuyoType.Green)
      expect(stage.getPuyo(2, 11)).toBe(PuyoType.Green)
    })
  })

  describe('重力適用', () => {
    it('浮いているぷよがある場合、重力適用後に true を返す', () => {
      // Arrange: 緑ぷよを浮いた状態で配置
      // 0 0 2 0 0 0  (y=8) 緑
      // 0 0 0 0 0 0  (y=9) 空
      // 0 0 0 0 0 0  (y=10) 空
      // 0 0 0 0 0 0  (y=11) 空
      stage.setPuyo(2, 8, PuyoType.Green)

      // Act: 重力適用
      const hasFallen = stage.applyGravity()

      // Assert: 落下したので true
      expect(hasFallen).toBe(true)
      // ぷよが下に落下している
      expect(stage.getPuyo(2, 8)).toBe(PuyoType.Empty)
      expect(stage.getPuyo(2, 11)).toBe(PuyoType.Green)
    })

    it('全てのぷよが着地している場合、false を返す', () => {
      // Arrange: 赤ぷよを下端に配置
      stage.setPuyo(2, 11, PuyoType.Red)

      // Act: 重力適用
      const hasFallen = stage.applyGravity()

      // Assert: 落下しなかったので false
      expect(hasFallen).toBe(false)
      // ぷよは移動していない
      expect(stage.getPuyo(2, 11)).toBe(PuyoType.Red)
    })

    it('空のステージの場合、false を返す', () => {
      // Arrange: 空のステージ

      // Act: 重力適用
      const hasFallen = stage.applyGravity()

      // Assert: 落下しなかったので false
      expect(hasFallen).toBe(false)
    })
  })

  describe('連鎖反応', () => {
    it('ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する', () => {
      // ステージにぷよを配置
      // 赤ぷよの2×2と、その上に緑ぷよが縦に3つ、さらに緑ぷよが1つ横に
      // 0 0 0 0 0 0
      // 0 0 2 0 0 0  (y=7)
      // 0 0 2 0 0 0  (y=8)
      // 0 0 2 0 0 0  (y=9)
      // 0 1 1 2 0 0  (y=10)
      // 0 1 1 0 0 0  (y=11)
      stage.setPuyo(1, 10, PuyoType.Red) // 赤
      stage.setPuyo(2, 10, PuyoType.Red) // 赤
      stage.setPuyo(1, 11, PuyoType.Red) // 赤
      stage.setPuyo(2, 11, PuyoType.Red) // 赤
      stage.setPuyo(3, 10, PuyoType.Green) // 緑（横）
      stage.setPuyo(2, 7, PuyoType.Green) // 緑（上）
      stage.setPuyo(2, 8, PuyoType.Green) // 緑（上）
      stage.setPuyo(2, 9, PuyoType.Green) // 緑（上）

      // 1回目の消去判定
      const eraseInfo = stage.checkErase()

      // 赤ぷよが消去対象になっていることを確認
      expect(eraseInfo.erasePuyoCount).toBe(4)

      // 消去実行
      stage.eraseBoards(eraseInfo.eraseInfo)

      // 落下処理
      stage.fall()

      // 2回目の消去判定（連鎖）
      const chainEraseInfo = stage.checkErase()

      // 連鎖が発生していることを確認（緑ぷよが4つつながっている）
      expect(chainEraseInfo.erasePuyoCount).toBeGreaterThan(0)
      expect(chainEraseInfo.erasePuyoCount).toBe(4)
    })
  })

  describe('全消し判定', () => {
    it('盤面上のぷよがすべて消えると全消しになる', () => {
      // ステージにぷよを配置
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)

      // 消去判定と実行
      const eraseInfo = stage.checkErase()
      stage.eraseBoards(eraseInfo.eraseInfo)

      // 全消し判定
      const isZenkeshi = stage.checkZenkeshi()

      // 全消しになっていることを確認
      expect(isZenkeshi).toBe(true)
    })

    it('盤面上にぷよが残っていると全消しにならない', () => {
      // ステージにぷよを配置
      stage.setPuyo(1, 10, PuyoType.Red)
      stage.setPuyo(2, 10, PuyoType.Red)
      stage.setPuyo(1, 11, PuyoType.Red)
      stage.setPuyo(2, 11, PuyoType.Red)
      stage.setPuyo(3, 11, PuyoType.Green) // 消えないぷよ

      // 消去判定と実行
      const eraseInfo = stage.checkErase()
      stage.eraseBoards(eraseInfo.eraseInfo)

      // 全消し判定
      const isZenkeshi = stage.checkZenkeshi()

      // 全消しになっていないことを確認
      expect(isZenkeshi).toBe(false)
    })
  })
})
