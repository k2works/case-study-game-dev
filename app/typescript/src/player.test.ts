import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from './player'
import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'

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

      // privateフィールドにアクセスするためにany型にキャスト
      const anyPlayer = player as any
      expect(anyPlayer.inputKeyLeft).toBe(true)
    })

    it('右キーが押されると、右向きの移動フラグが立つ', () => {
      // キーダウンイベントをシミュレート（右キー）
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)

      const anyPlayer = player as any
      expect(anyPlayer.inputKeyRight).toBe(true)
    })

    it('キーが離されると、対応する移動フラグが下がる', () => {
      // まず左キーを押す
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      const anyPlayer = player as any
      expect(anyPlayer.inputKeyLeft).toBe(true)

      // 次に左キーを離す
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
      expect(anyPlayer.inputKeyLeft).toBe(false)
    })
  })

  describe('ぷよの移動', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('左に移動できる場合、左に移動する', () => {
      // 初期位置を記録
      const anyPlayer = player as any
      const initialX = anyPlayer.puyoX

      // 左に移動
      player.moveLeft()

      // 位置が1つ左に移動していることを確認
      expect(anyPlayer.puyoX).toBe(initialX - 1)
    })

    it('右に移動できる場合、右に移動する', () => {
      // 初期位置を記録
      const anyPlayer = player as any
      const initialX = anyPlayer.puyoX

      // 右に移動
      player.moveRight()

      // 位置が1つ右に移動していることを確認
      expect(anyPlayer.puyoX).toBe(initialX + 1)
    })

    it('左端にいる場合、左に移動できない', () => {
      // 左端に移動
      const anyPlayer = player as any
      anyPlayer.puyoX = 0

      // 左に移動を試みる
      player.moveLeft()

      // 位置が変わっていないことを確認
      expect(anyPlayer.puyoX).toBe(0)
    })

    it('右端にいる場合、右に移動できない', () => {
      // 右端に移動（ステージの幅 - 1）
      const anyPlayer = player as any
      anyPlayer.puyoX = config.stageCols - 1

      // 右に移動を試みる
      player.moveRight()

      // 位置が変わっていないことを確認
      expect(anyPlayer.puyoX).toBe(config.stageCols - 1)
    })
  })

  describe('ぷよの回転', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('時計回りに回転すると、回転状態が1増える', () => {
      // 初期回転状態を記録
      const anyPlayer = player as any
      const initialRotation = anyPlayer.rotation

      // 時計回りに回転
      player.rotateRight()

      // 回転状態が1増えていることを確認
      expect(anyPlayer.rotation).toBe((initialRotation + 1) % 4)
    })

    it('反時計回りに回転すると、回転状態が1減る', () => {
      // 初期回転状態を記録
      const anyPlayer = player as any
      const initialRotation = anyPlayer.rotation

      // 反時計回りに回転
      player.rotateLeft()

      // 回転状態が1減っていることを確認（負の値にならないように調整）
      expect(anyPlayer.rotation).toBe((initialRotation + 3) % 4)
    })

    it('回転状態が4になると0に戻る', () => {
      // 回転状態を3に設定
      const anyPlayer = player as any
      anyPlayer.rotation = 3

      // 時計回りに回転
      player.rotateRight()

      // 回転状態が0になっていることを確認
      expect(anyPlayer.rotation).toBe(0)
    })
  })

  describe('壁キック処理', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('右端で右回転すると、左に移動して回転する（壁キック）', () => {
      // 右端に移動
      const anyPlayer = player as any
      anyPlayer.puyoX = config.stageCols - 1
      anyPlayer.rotation = 0 // 上向き

      // 右回転（2つ目のぷよが右にくる）
      player.rotateRight()

      // 壁キックにより左に移動していることを確認
      expect(anyPlayer.puyoX).toBe(config.stageCols - 2)
      expect(anyPlayer.rotation).toBe(1)
    })

    it('左端で左回転すると、右に移動して回転する（壁キック）', () => {
      // 左端に移動
      const anyPlayer = player as any
      anyPlayer.puyoX = 0
      anyPlayer.rotation = 0 // 上向き

      // 左回転（2つ目のぷよが左にくる）
      player.rotateLeft()

      // 壁キックにより右に移動していることを確認
      expect(anyPlayer.puyoX).toBe(1)
      expect(anyPlayer.rotation).toBe(3)
    })
  })

  describe('高速落下', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('下キーが押されると、下向きの移動フラグが立つ', () => {
      // キーダウンイベントをシミュレート（下キー）
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      const anyPlayer = player as any
      expect(anyPlayer.inputKeyDown).toBe(true)
    })

    it('下に移動できる場合、下に移動する', () => {
      // 初期位置を記録
      const anyPlayer = player as any
      const initialY = anyPlayer.puyoY

      // 下に移動
      const result = player.moveDown()

      // 位置が1つ下に移動していることを確認
      expect(result).toBe(true)
      expect(anyPlayer.puyoY).toBe(initialY + 1)
    })

    it('ステージの下端にいる場合、下に移動できない', () => {
      // ステージの一番下に移動
      const anyPlayer = player as any
      anyPlayer.puyoY = config.stageRows - 1

      // 下に移動を試みる
      const result = player.moveDown()

      // 移動できないことを確認
      expect(result).toBe(false)
      expect(anyPlayer.puyoY).toBe(config.stageRows - 1)
    })
  })

  describe('着地判定', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('下に移動できない場合、着地したと判定する', () => {
      // ステージの一番下に移動
      const anyPlayer = player as any
      anyPlayer.puyoY = config.stageRows - 1

      // 着地判定
      const landed = player.checkLanded()

      // 着地していることを確認
      expect(landed).toBe(true)
    })

    it('下に移動できる場合、着地していないと判定する', () => {
      // 初期位置（上部）
      const landed = player.checkLanded()

      // 着地していないことを確認
      expect(landed).toBe(false)
    })
  })
})
