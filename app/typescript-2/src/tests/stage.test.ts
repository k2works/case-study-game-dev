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

  describe('ぷよの接続判定', () => {
    it('同じ色のぷよが4つつながっていると、消去対象になる', () => {
      // ステージにぷよを配置（1は赤ぷよ）
      // 2×2の正方形に赤ぷよを配置
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)

      // 消去判定
      const eraseInfo = stage.checkErase()

      // 4つのぷよが消去対象になっていることを確認
      expect(eraseInfo.erasePuyoCount).toBe(4)
      expect(eraseInfo.eraseInfo.length).toBeGreaterThan(0)
    })

    it('異なる色のぷよは消去対象にならない', () => {
      // ステージにぷよを配置（1は赤ぷよ、2は青ぷよ）
      // 市松模様に配置
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 2)
      stage.setPuyo(1, 11, 2)
      stage.setPuyo(2, 11, 1)

      // 消去判定
      const eraseInfo = stage.checkErase()

      // 消去対象がないことを確認
      expect(eraseInfo.erasePuyoCount).toBe(0)
      expect(eraseInfo.eraseInfo.length).toBe(0)
    })

    it('3つ以下のつながりは消去対象にならない', () => {
      // 3つだけ並べる
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)
      stage.setPuyo(3, 11, 1)

      // 消去判定
      const eraseInfo = stage.checkErase()

      // 消去対象がないことを確認
      expect(eraseInfo.erasePuyoCount).toBe(0)
      expect(eraseInfo.eraseInfo.length).toBe(0)
    })
  })

  describe('ぷよの消去と落下', () => {
    it('消去対象のぷよを消去する', () => {
      // ステージにぷよを配置
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)

      // 消去判定
      const eraseInfo = stage.checkErase()

      // 消去実行
      stage.eraseBoards(eraseInfo.eraseInfo)

      // ぷよが消去されていることを確認
      expect(stage.getPuyo(1, 10)).toBe(0)
      expect(stage.getPuyo(2, 10)).toBe(0)
      expect(stage.getPuyo(1, 11)).toBe(0)
      expect(stage.getPuyo(2, 11)).toBe(0)
    })
  })

  describe('全消し判定', () => {
    it('盤面上のぷよがすべて消えると全消しになる', () => {
      // ステージにぷよを配置
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)

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
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)
      stage.setPuyo(3, 11, 2) // 消えないぷよ

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
