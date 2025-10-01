import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from '../player'
import { Config } from '../config'
import { Stage } from '../stage'
import { PuyoImage } from '../puyoimage'

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

  describe('ぷよの移動', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('左に移動できる場合、左に移動する', () => {
      // 初期位置を記録
      const initialX = player['puyoX']

      // 左に移動
      player.moveLeft()

      // 位置が1つ左に移動していることを確認
      expect(player['puyoX']).toBe(initialX - 1)
    })

    it('右に移動できる場合、右に移動する', () => {
      // 初期位置を記録
      const initialX = player['puyoX']

      // 右に移動
      player.moveRight()

      // 位置が1つ右に移動していることを確認
      expect(player['puyoX']).toBe(initialX + 1)
    })

    it('左端にいる場合、左に移動できない', () => {
      // 左端に移動
      player['puyoX'] = 0

      // 左に移動を試みる
      player.moveLeft()

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(0)
    })

    it('右端にいる場合、右に移動できない', () => {
      // 右端に移動（ステージの幅 - 1）
      player['puyoX'] = config.stageCols - 1

      // 右に移動を試みる
      player.moveRight()

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(config.stageCols - 1)
    })
  })

  describe('ぷよの回転', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('時計回りに回転すると、回転状態が1増える', () => {
      // 初期回転状態を記録
      const initialRotation = player['rotation']

      // 時計回りに回転
      player.rotateRight()

      // 回転状態が1増えていることを確認
      expect(player['rotation']).toBe((initialRotation + 1) % 4)
    })

    it('反時計回りに回転すると、回転状態が1減る', () => {
      // 初期回転状態を記録
      const initialRotation = player['rotation']

      // 反時計回りに回転
      player.rotateLeft()

      // 回転状態が1減っていることを確認（負の値にならないように調整）
      expect(player['rotation']).toBe((initialRotation + 3) % 4)
    })

    it('回転状態が4になると0に戻る', () => {
      // 回転状態を3に設定
      player['rotation'] = 3

      // 時計回りに回転
      player.rotateRight()

      // 回転状態が0になっていることを確認
      expect(player['rotation']).toBe(0)
    })
  })

  describe('壁キック処理', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('右端で右回転すると、左に移動して回転する（壁キック）', () => {
      // 右端に移動
      player['puyoX'] = config.stageCols - 1
      player['rotation'] = 0 // 上向き

      // 右回転（2つ目のぷよが右にくる）
      player.rotateRight()

      // 壁キックにより左に移動していることを確認
      expect(player['puyoX']).toBe(config.stageCols - 2)
      expect(player['rotation']).toBe(1)
    })

    it('左端で左回転すると、右に移動して回転する（壁キック）', () => {
      // 左端に移動
      player['puyoX'] = 0
      player['rotation'] = 0 // 上向き

      // 左回転（2つ目のぷよが左にくる）
      player.rotateLeft()

      // 壁キックにより右に移動していることを確認
      expect(player['puyoX']).toBe(1)
      expect(player['rotation']).toBe(3)
    })
  })

  describe('自由落下', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('指定時間が経過すると、ぷよが1マス下に落ちる', () => {
      // 初期位置を記録
      const initialY = player['puyoY']

      // 落下間隔を取得（例: 1000ms = 1秒）
      const dropInterval = 1000

      // ゲームの更新処理を実行（落下間隔分）
      player.update(dropInterval)

      // 位置が1つ下に移動していることを確認
      expect(player['puyoY']).toBe(initialY + 1)
    })

    it('指定時間未満では、ぷよは落ちない', () => {
      // 初期位置を記録
      const initialY = player['puyoY']

      // 落下間隔を取得
      const dropInterval = 1000

      // タイマーを半分だけ進める
      player.update(dropInterval / 2)

      // 位置が変わっていないことを確認
      expect(player['puyoY']).toBe(initialY)
    })

    it('下端に達した場合、それ以上落ちない', () => {
      // 下端の1つ上に配置
      player['puyoY'] = config.stageRows - 1

      // 落下処理を実行
      player.update(1000)

      // 位置が変わっていないことを確認（下端を超えない）
      expect(player['puyoY']).toBe(config.stageRows - 1)
    })
  })

  describe('着地処理', () => {
    it('下端に着地すると、着地フラグが立つ', () => {
      // 下端に配置（子ぷよが上にあるので、親ぷよはstageRows - 1）
      player['puyoY'] = config.stageRows - 1

      // 落下処理を実行（これ以上落ちられないので着地）
      player.update(1000)

      // 着地フラグが立っていることを確認
      expect(player.isLanded()).toBe(true)
    })

    it('着地していない状態では、着地フラグが立たない', () => {
      // 初期位置（上の方）
      player.createNewPuyo()

      // 着地フラグが立っていないことを確認
      expect(player.isLanded()).toBe(false)
    })

    it('他のぷよの上に着地すると、着地フラグが立つ', () => {
      // ステージに既存のぷよを配置（下端）
      stage.setPuyo(2, config.stageRows - 1, 1)

      // その上に新しいぷよを配置
      player.createNewPuyo()
      player['puyoX'] = 2
      player['puyoY'] = config.stageRows - 2

      // 落下処理を実行（既存のぷよの上で着地）
      player.update(1000)

      // 着地フラグが立っていることを確認
      expect(player.isLanded()).toBe(true)
    })

    it('他のぷよがある場所には移動できない', () => {
      // ステージに既存のぷよを配置
      stage.setPuyo(2, 5, 1)

      // その真上に新しいぷよを配置
      player.createNewPuyo()
      player['puyoX'] = 2
      player['puyoY'] = 3

      // 落下処理を実行（既存のぷよまで落ちる）
      player.update(1000)
      player.update(1000)

      // 既存のぷよの上で止まっていることを確認
      expect(player['puyoY']).toBe(4)
      expect(player.isLanded()).toBe(true)
    })
  })

  describe('回転時の衝突判定', () => {
    it('他のぷよがある場所には回転できない', () => {
      // ステージに既存のぷよを配置
      stage.setPuyo(4, 5, 1) // 右隣にぷよを配置

      // その隣に新しいぷよを配置（子ぷよは上）
      player.createNewPuyo()
      player['puyoX'] = 3
      player['puyoY'] = 5
      player['rotation'] = 0 // 子ぷよが上

      // 回転状態を記録
      const initialRotation = player['rotation']

      // 右回転を試みる（子ぷよが右に来る = 既存のぷよと重なる）
      player.rotateRight()

      // 回転できず、回転状態が変わっていないことを確認
      expect(player['rotation']).toBe(initialRotation)
    })

    it('回転可能な場合は回転できる', () => {
      // 周囲に何もない位置に配置
      player.createNewPuyo()
      player['puyoX'] = 3
      player['puyoY'] = 5
      player['rotation'] = 0

      // 右回転
      player.rotateRight()

      // 回転できていることを確認
      expect(player['rotation']).toBe(1)
    })
  })

  describe('高速落下', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('下キーが押されていると、落下速度が上がる', () => {
      // 下キーを押す
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))

      // 通常の落下処理
      const normalDropSpeed = 1
      const fastDropSpeed = player.getDropSpeed()

      // 高速落下の速度が通常より速いことを確認
      expect(fastDropSpeed).toBeGreaterThan(normalDropSpeed)
    })

    it('下に移動できる場合、下に移動する', () => {
      // 初期位置を記録
      const initialY = player['puyoY']

      // 下に移動
      player.moveDown()

      // 位置が1つ下に移動していることを確認
      expect(player['puyoY']).toBe(initialY + 1)
    })

    it('下に障害物がある場合、下に移動できない', () => {
      // ステージの一番下に移動
      player['puyoY'] = config.stageRows - 1

      // 下に移動を試みる
      const canMove = player.moveDown()

      // 移動できないことを確認
      expect(canMove).toBe(false)
      expect(player['puyoY']).toBe(config.stageRows - 1)
    })
  })
})
