import { describe, it, expect, beforeEach } from 'vitest'
import { Stage } from './stage'
import { Config } from './config'
import { PuyoImage } from './puyoimage'

describe('ステージ', () => {
  let config: Config
  let puyoImage: PuyoImage
  let stage: Stage

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
            <canvas id="stage"></canvas>
        `

    // Canvas のモックを作成
    const canvas = document.getElementById('stage') as any
    canvas.getContext = () => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
    })

    config = new Config()
    puyoImage = new PuyoImage(config)
    stage = new Stage(config, puyoImage)
  })

  describe('ステージデータ', () => {
    it('初期状態では全てのセルが空である', () => {
      stage.initialize()

      // 全てのセルをチェック
      for (let row = 0; row < config.stageRows; row++) {
        for (let col = 0; col < config.stageCols; col++) {
          expect(stage.getPuyo(col, row)).toBe('')
        }
      }
    })

    it('指定した位置にぷよを配置できる', () => {
      stage.initialize()

      // ぷよを配置
      stage.setPuyo(2, 5, '#ff0000')

      // 配置したぷよを確認
      expect(stage.getPuyo(2, 5)).toBe('#ff0000')
    })

    it('配置したぷよは他のセルに影響しない', () => {
      stage.initialize()

      // ぷよを配置
      stage.setPuyo(2, 5, '#ff0000')

      // 隣接セルが空であることを確認
      expect(stage.getPuyo(1, 5)).toBe('')
      expect(stage.getPuyo(3, 5)).toBe('')
      expect(stage.getPuyo(2, 4)).toBe('')
      expect(stage.getPuyo(2, 6)).toBe('')
    })
  })

  describe('連結判定', () => {
    beforeEach(() => {
      stage.initialize()
    })

    it('横に4つ連結したぷよを検出できる', () => {
      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // 連結判定
      const connected = stage.findConnectedPuyos(0, 12)

      // 4つ連結していることを確認
      expect(connected.length).toBe(4)
      expect(connected).toContainEqual({ x: 0, y: 12 })
      expect(connected).toContainEqual({ x: 1, y: 12 })
      expect(connected).toContainEqual({ x: 2, y: 12 })
      expect(connected).toContainEqual({ x: 3, y: 12 })
    })

    it('縦に4つ連結したぷよを検出できる', () => {
      // 縦に4つ青いぷよを配置
      stage.setPuyo(2, 9, '#0000ff')
      stage.setPuyo(2, 10, '#0000ff')
      stage.setPuyo(2, 11, '#0000ff')
      stage.setPuyo(2, 12, '#0000ff')

      // 連結判定
      const connected = stage.findConnectedPuyos(2, 9)

      // 4つ連結していることを確認
      expect(connected.length).toBe(4)
      expect(connected).toContainEqual({ x: 2, y: 9 })
      expect(connected).toContainEqual({ x: 2, y: 10 })
      expect(connected).toContainEqual({ x: 2, y: 11 })
      expect(connected).toContainEqual({ x: 2, y: 12 })
    })

    it('L字型に連結したぷよを検出できる', () => {
      // L字型に緑のぷよを配置
      stage.setPuyo(1, 11, '#00ff00')
      stage.setPuyo(1, 12, '#00ff00')
      stage.setPuyo(2, 12, '#00ff00')
      stage.setPuyo(3, 12, '#00ff00')

      // 連結判定
      const connected = stage.findConnectedPuyos(1, 11)

      // 4つ連結していることを確認
      expect(connected.length).toBe(4)
      expect(connected).toContainEqual({ x: 1, y: 11 })
      expect(connected).toContainEqual({ x: 1, y: 12 })
      expect(connected).toContainEqual({ x: 2, y: 12 })
      expect(connected).toContainEqual({ x: 3, y: 12 })
    })

    it('3つ以下の連結は検出しない', () => {
      // 3つだけ配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')

      // 連結判定
      const connected = stage.findConnectedPuyos(0, 12)

      // 3つ連結していることを確認（4つ未満なので消去対象外）
      expect(connected.length).toBe(3)
    })

    it('異なる色のぷよは連結しない', () => {
      // 異なる色のぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#0000ff') // 青
      stage.setPuyo(3, 12, '#ff0000')

      // 連結判定
      const connected = stage.findConnectedPuyos(0, 12)

      // 赤いぷよ2つだけが連結
      expect(connected.length).toBe(2)
      expect(connected).toContainEqual({ x: 0, y: 12 })
      expect(connected).toContainEqual({ x: 1, y: 12 })
    })
  })

  describe('消去可能判定', () => {
    beforeEach(() => {
      stage.initialize()
    })

    it('4つ以上連結したぷよのグループを検出できる', () => {
      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // 消去可能なぷよを検出
      const erasableGroups = stage.checkErasablePuyos()

      // 1グループ検出されることを確認
      expect(erasableGroups.length).toBe(1)
      expect(erasableGroups[0].length).toBe(4)
    })

    it('複数のグループを検出できる', () => {
      // 横に4つ赤いぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // 縦に4つ青いぷよを配置
      stage.setPuyo(5, 9, '#0000ff')
      stage.setPuyo(5, 10, '#0000ff')
      stage.setPuyo(5, 11, '#0000ff')
      stage.setPuyo(5, 12, '#0000ff')

      // 消去可能なぷよを検出
      const erasableGroups = stage.checkErasablePuyos()

      // 2グループ検出されることを確認
      expect(erasableGroups.length).toBe(2)
    })

    it('消去可能なぷよがない場合は空配列を返す', () => {
      // 3つだけ配置（消去対象外）
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')

      // 消去可能なぷよを検出
      const erasableGroups = stage.checkErasablePuyos()

      // 検出されないことを確認
      expect(erasableGroups.length).toBe(0)
    })
  })

  describe('ぷよ消去', () => {
    beforeEach(() => {
      stage.initialize()
    })

    it('指定した座標のぷよを消去できる', () => {
      // ぷよを配置
      stage.setPuyo(0, 12, '#ff0000')
      stage.setPuyo(1, 12, '#ff0000')
      stage.setPuyo(2, 12, '#ff0000')
      stage.setPuyo(3, 12, '#ff0000')

      // ぷよを消去
      stage.erasePuyos([
        { x: 0, y: 12 },
        { x: 1, y: 12 },
        { x: 2, y: 12 },
        { x: 3, y: 12 },
      ])

      // 消去されたことを確認
      expect(stage.getPuyo(0, 12)).toBe('')
      expect(stage.getPuyo(1, 12)).toBe('')
      expect(stage.getPuyo(2, 12)).toBe('')
      expect(stage.getPuyo(3, 12)).toBe('')
    })
  })
})
