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

  describe('ぷよの接続判定', () => {
    it('同じ色のぷよが4つつながっていると、消去対象になる', () => {
      // ステージにぷよを配置（1は赤ぷよ）
      // 2×2の正方形に配置
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)

      // 消去判定
      const eraseInfo = stage.checkErase()

      // 4つのぷよが消去対象になっていることを確認
      expect(eraseInfo.erasePuyoCount).toBe(4)
      expect(eraseInfo.eraseInfo.length).toBe(4)
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
      // ステージにぷよを配置（1は赤ぷよ）
      // 3つだけつなげる
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

  describe('ぷよの消去処理', () => {
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

    it('消去後、上にあるぷよが落下する', () => {
      // ステージにぷよを配置
      // 下に消去対象、上に落下するぷよ
      stage.setPuyo(1, 10, 1)
      stage.setPuyo(2, 10, 1)
      stage.setPuyo(1, 11, 1)
      stage.setPuyo(2, 11, 1)
      stage.setPuyo(2, 8, 2)
      stage.setPuyo(2, 9, 2)

      // 消去判定と実行
      const eraseInfo = stage.checkErase()
      stage.eraseBoards(eraseInfo.eraseInfo)

      // 重力を繰り返し適用（完全に落下するまで）
      while (stage.applyGravity()) {
        // 落下し続ける
      }

      // 上にあったぷよが落下していることを確認
      expect(stage.getPuyo(2, 10)).toBe(2)
      expect(stage.getPuyo(2, 11)).toBe(2)
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
