import { describe, it, expect, beforeEach } from 'vitest'
import { GameField } from './GameField'
import { PuyoColor } from './Puyo'

describe('GameField', () => {
  let gameField: GameField

  beforeEach(() => {
    gameField = new GameField()
  })

  describe('基本機能', () => {
    it('空のフィールドを作成できる', () => {
      expect(gameField.isEmpty()).toBe(true)
      expect(gameField.getWidth()).toBe(6)
      expect(gameField.getHeight()).toBe(12)
    })

    it('セルにぷよを配置できる', () => {
      gameField.setCell(0, 0, PuyoColor.RED)
      expect(gameField.getCell(0, 0)).toBe(PuyoColor.RED)
      expect(gameField.isEmpty()).toBe(false)
    })

    it('範囲外のセルアクセスはnullを返す', () => {
      expect(gameField.getCell(-1, 0)).toBe(null)
      expect(gameField.getCell(6, 0)).toBe(null)
      expect(gameField.getCell(0, -1)).toBe(null)
      expect(gameField.getCell(0, 12)).toBe(null)
    })
  })

  describe('接続判定', () => {
    beforeEach(() => {
      // テスト用のぷよ配置
      // R R B
      // R R B
      // B B R
      gameField.setCell(0, 9, PuyoColor.RED) // 下から3番目
      gameField.setCell(1, 9, PuyoColor.RED)
      gameField.setCell(2, 9, PuyoColor.BLUE)
      gameField.setCell(0, 10, PuyoColor.RED) // 下から2番目
      gameField.setCell(1, 10, PuyoColor.RED)
      gameField.setCell(2, 10, PuyoColor.BLUE)
      gameField.setCell(0, 11, PuyoColor.BLUE) // 最下段
      gameField.setCell(1, 11, PuyoColor.BLUE)
      gameField.setCell(2, 11, PuyoColor.RED)
    })

    it('隣接する同じ色のぷよを検出できる', () => {
      const connected = gameField.findConnectedPuyos(0, 9)
      expect(connected).toHaveLength(4) // 赤いぷよが4つ接続
    })

    it('4つ以上接続したぷよグループを検出できる', () => {
      const groups = gameField.findConnectedGroups()
      const redGroup = groups.find(
        (group) => gameField.getCell(group[0].x, group[0].y) === PuyoColor.RED
      )
      expect(redGroup).toBeDefined()
      expect(redGroup!.length).toBe(4)
    })

    it('4つ未満のグループは消去対象にならない', () => {
      const erasableGroups = gameField.findErasableGroups()
      const blueGroups = erasableGroups.filter(
        (group) => gameField.getCell(group[0].x, group[0].y) === PuyoColor.BLUE
      )
      expect(blueGroups).toHaveLength(0) // 青いぷよは3つずつなので消去対象外
    })
  })

  describe('ぷよの消去', () => {
    beforeEach(() => {
      // 4つ接続した赤いぷよを配置
      gameField.setCell(0, 9, PuyoColor.RED)
      gameField.setCell(1, 9, PuyoColor.RED)
      gameField.setCell(0, 10, PuyoColor.RED)
      gameField.setCell(1, 10, PuyoColor.RED)

      // 上に他の色のぷよを配置
      gameField.setCell(0, 8, PuyoColor.BLUE)
      gameField.setCell(1, 8, PuyoColor.GREEN)
    })

    it('4つ以上接続したぷよを消去できる', () => {
      const erasedCount = gameField.clearConnectedPuyos()
      expect(erasedCount).toBe(4) // 赤いぷよ4つが消去される

      // 赤いぷよが消去されていることを確認
      expect(gameField.getCell(0, 9)).toBe(null)
      expect(gameField.getCell(1, 9)).toBe(null)
      expect(gameField.getCell(0, 10)).toBe(null)
      expect(gameField.getCell(1, 10)).toBe(null)

      // 他の色のぷよは残っていることを確認
      expect(gameField.getCell(0, 8)).toBe(PuyoColor.BLUE)
      expect(gameField.getCell(1, 8)).toBe(PuyoColor.GREEN)
    })
  })

  describe('落下処理', () => {
    beforeEach(() => {
      // テスト用配置：中間に空きがある状態
      gameField.setCell(0, 8, PuyoColor.RED) // 上のぷよ
      gameField.setCell(0, 10, PuyoColor.BLUE) // 下のぷよ（9が空き）
    })

    it('空きスペースにぷよが落下する', () => {
      gameField.applyGravity()

      // 重力適用後：下から詰まる（順序を保持）
      expect(gameField.getCell(0, 8)).toBe(null) // 元の上の位置は空に
      expect(gameField.getCell(0, 9)).toBe(null) // 中間も空に
      expect(gameField.getCell(0, 10)).toBe(PuyoColor.RED) // 赤が下から2番目（元の順序保持）
      expect(gameField.getCell(0, 11)).toBe(PuyoColor.BLUE) // 青が最下段
    })

    it('複数列で同時に落下処理が動作する', () => {
      gameField.setCell(1, 7, PuyoColor.GREEN)
      gameField.setCell(1, 9, PuyoColor.YELLOW)
      // 列1の8が空き

      gameField.applyGravity()

      expect(gameField.getCell(1, 7)).toBe(null) // 元の位置は空に
      expect(gameField.getCell(1, 8)).toBe(null) // 中間も空に
      expect(gameField.getCell(1, 9)).toBe(null) // 元の位置も空に
      expect(gameField.getCell(1, 10)).toBe(PuyoColor.GREEN) // 緑が下から2番目（元の順序保持）
      expect(gameField.getCell(1, 11)).toBe(PuyoColor.YELLOW) // 黄が最下段
    })
  })
})
