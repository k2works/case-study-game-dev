import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from '../src/player'
import { Config } from '../src/config'
import { Stage } from '../src/stage'
import { PuyoImage } from '../src/puyoimage'

describe('プレイヤー', () => {
  let config: Config
  let puyoImage: PuyoImage
  let stage: Stage
  let player: Player

  beforeEach(() => {
    // DOMの準備
    document.body.innerHTML = `
            <div id="stage"></div>
        `
    config = new Config()
    puyoImage = new PuyoImage(config)
    stage = new Stage(config, puyoImage)
    player = new Player(config, stage, puyoImage)
  })

  describe('キー入力', () => {
    it('左キーが押されると、左向きの移動フラグが立つ', () => {
      // キーダウンイベントをシミュレート（左キー）
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(event)

      expect(player['inputKeyLeft']).toBe(true)
    })

    it('右キーが押されると、右向きの移動フラグが立つ', () => {
      // キーダウンイベントをシミュレート（右キー）
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)

      expect(player['inputKeyRight']).toBe(true)
    })

    it('キーが離されると、対応する移動フラグが下がる', () => {
      // まず左キーを押す
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      expect(player['inputKeyLeft']).toBe(true)

      // 次に左キーを離す
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
      expect(player['inputKeyLeft']).toBe(false)
    })
  })
})
