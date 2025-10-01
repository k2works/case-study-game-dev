import { describe, it, expect, beforeEach } from 'vitest'
import { Stage } from '../stage'
import { Config } from '../config'
import { PuyoImage } from '../puyoimage'

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

  describe('ぷよの落下処理', () => {
    it('下に空きがあるぷよは1マス落ちる', () => {
      // 浮いているぷよを配置 (列3の行2に配置)
      stage.setPuyo(3, 2, 1)

      // 重力を適用
      stage.applyGravity()

      // 1マス下に落ちていることを確認
      expect(stage.getPuyo(3, 2)).toBe(0) // 元の位置は空
      expect(stage.getPuyo(3, 3)).toBe(1) // 下に移動
    })

    it('下端にあるぷよは落ちない', () => {
      // 下端にぷよを配置
      const bottomRow = config.stageRows - 1
      stage.setPuyo(3, bottomRow, 1)

      // 重力を適用
      stage.applyGravity()

      // 位置が変わっていないことを確認
      expect(stage.getPuyo(3, bottomRow)).toBe(1)
    })

    it('他のぷよの上にあるぷよは落ちない', () => {
      // 下端にぷよを配置
      const bottomRow = config.stageRows - 1
      stage.setPuyo(3, bottomRow, 1)
      // その上にぷよを配置
      stage.setPuyo(3, bottomRow - 1, 2)

      // 重力を適用
      stage.applyGravity()

      // 両方とも位置が変わっていないことを確認
      expect(stage.getPuyo(3, bottomRow - 1)).toBe(2)
      expect(stage.getPuyo(3, bottomRow)).toBe(1)
    })

    it('複数のぷよが同時に落ちる', () => {
      // 列3に浮いているぷよを配置
      stage.setPuyo(3, 2, 1)
      // 列4にも浮いているぷよを配置
      stage.setPuyo(4, 2, 2)

      // 重力を適用
      stage.applyGravity()

      // 両方とも1マス下に落ちていることを確認
      expect(stage.getPuyo(3, 2)).toBe(0)
      expect(stage.getPuyo(3, 3)).toBe(1)
      expect(stage.getPuyo(4, 2)).toBe(0)
      expect(stage.getPuyo(4, 3)).toBe(2)
    })

    it('複数回呼び出すと、下端まで落ちる', () => {
      // 上の方に浮いているぷよを配置
      stage.setPuyo(3, 1, 1)

      // 重力を下端まで落ちるまで適用（row 1 → row 11 まで 10 回）
      for (let i = 0; i < 10; i++) {
        stage.applyGravity()
      }

      // 下端まで落ちていることを確認
      const bottomRow = config.stageRows - 1
      expect(stage.getPuyo(3, 1)).toBe(0)
      expect(stage.getPuyo(3, bottomRow)).toBe(1)
    })

    it('ユーザーが指摘したケースで青ぷよが落ちる', () => {
      // Y=黄色 B=青色
      // 位置 (3, 9), (3, 10), (3, 11) に黄色（下端から3段積み）
      stage.setPuyo(3, 9, 1)
      stage.setPuyo(3, 10, 1)
      stage.setPuyo(3, 11, 1)
      // 位置 (4, 2) に青色 (浮いている)
      stage.setPuyo(4, 2, 2)

      // 重力を適用
      stage.applyGravity()

      // 青ぷよが1マス落ちていることを確認
      expect(stage.getPuyo(4, 2)).toBe(0)
      expect(stage.getPuyo(4, 3)).toBe(2)
      // 黄色ぷよは変わらない（下端に積み重なっているので動かない）
      expect(stage.getPuyo(3, 9)).toBe(1)
      expect(stage.getPuyo(3, 10)).toBe(1)
      expect(stage.getPuyo(3, 11)).toBe(1)
    })
  })
})
