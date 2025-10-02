import { describe, it, expect, beforeEach } from 'vitest'
import { Stage } from '../src/stage'
import { Config } from '../src/config'
import { PuyoImage } from '../src/puyoimage'

describe('ステージ', () => {
  let config: Config
  let puyoImage: PuyoImage
  let stage: Stage

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
      <div id="stage"></div>
    `
    config = new Config()
    puyoImage = new PuyoImage(config)
    stage = new Stage(config, puyoImage)
  })

  describe('重力判定', () => {
    it('個別のぷよに重力が作用する', () => {
      // Y=黄色 B=青色
      // 位置 (3, 9), (3, 10), (3, 11) に黄色（下端から3段積み）
      stage.setPuyo(3, 9, 1)
      stage.setPuyo(3, 10, 1)
      stage.setPuyo(3, 11, 1)
      // 位置 (4, 2) に青色 (浮いている)
      stage.setPuyo(4, 2, 2)

      // 重力を適用
      const hasFallen = stage.applyGravity()

      // 落下したぷよがある
      expect(hasFallen).toBe(true)

      // 青ぷよが1マス落ちていることを確認
      expect(stage.getPuyo(4, 2)).toBe(0)
      expect(stage.getPuyo(4, 3)).toBe(2)
      // 黄色ぷよは変わらない（下端に積み重なっているので動かない）
      expect(stage.getPuyo(3, 9)).toBe(1)
      expect(stage.getPuyo(3, 10)).toBe(1)
      expect(stage.getPuyo(3, 11)).toBe(1)
    })

    it('浮いているぷよがない場合、何も変化しない', () => {
      // 下端にぷよを配置
      stage.setPuyo(2, 11, 1)
      stage.setPuyo(3, 11, 2)

      // 重力を適用
      const hasFallen = stage.applyGravity()

      // 落下したぷよがない
      expect(hasFallen).toBe(false)

      // ぷよの位置は変わらない
      expect(stage.getPuyo(2, 11)).toBe(1)
      expect(stage.getPuyo(3, 11)).toBe(2)
    })

    it('複数の浮いているぷよに重力が作用する', () => {
      // 複数のぷよを浮かせる
      stage.setPuyo(1, 2, 1)
      stage.setPuyo(3, 5, 2)
      stage.setPuyo(5, 8, 3)

      // 重力を適用
      const hasFallen = stage.applyGravity()

      // 落下したぷよがある
      expect(hasFallen).toBe(true)

      // 各ぷよが1マス落ちている
      expect(stage.getPuyo(1, 2)).toBe(0)
      expect(stage.getPuyo(1, 3)).toBe(1)

      expect(stage.getPuyo(3, 5)).toBe(0)
      expect(stage.getPuyo(3, 6)).toBe(2)

      expect(stage.getPuyo(5, 8)).toBe(0)
      expect(stage.getPuyo(5, 9)).toBe(3)
    })
  })
})
