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
})
