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

  describe('ぷよの移動', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
      // 移動可能な位置に配置（上に回転できる位置）
      player['puyoY'] = 5
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

    it('横向き（右）の状態で右端にいる場合、右に移動できない', () => {
      // 右向き（rotation=1）にして、軸ぷよを右端の1つ左に配置
      player['puyoX'] = config.stageCols - 2
      player['rotation'] = 1 // 2つ目のぷよが右にある状態

      // 右に移動を試みる
      player.moveRight()

      // 位置が変わっていないことを確認（2つ目のぷよが壁に当たるため）
      expect(player['puyoX']).toBe(config.stageCols - 2)
    })

    it('横向き（左）の状態で左端にいる場合、左に移動できない', () => {
      // 左向き（rotation=3）にして、軸ぷよを左端の1つ右に配置
      player['puyoX'] = 1
      player['rotation'] = 3 // 2つ目のぷよが左にある状態

      // 左に移動を試みる
      player.moveLeft()

      // 位置が変わっていないことを確認（2つ目のぷよが壁に当たるため）
      expect(player['puyoX']).toBe(1)
    })

    it('既存のぷよがある位置には左に移動できない', () => {
      // プレイヤーを配置
      player['puyoX'] = 3
      player['puyoY'] = 5
      player['rotation'] = 0 // 上向き

      // 左側にぷよを配置
      stage.setPuyo(2, 5, 1)

      // 左に移動を試みる
      player.moveLeft()

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(3)
    })

    it('既存のぷよがある位置には右に移動できない', () => {
      // プレイヤーを配置
      player['puyoX'] = 2
      player['puyoY'] = 5
      player['rotation'] = 0 // 上向き

      // 右側にぷよを配置
      stage.setPuyo(3, 5, 1)

      // 右に移動を試みる
      player.moveRight()

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(2)
    })

    it('2つ目のぷよの位置に障害物がある場合も移動できない', () => {
      // プレイヤーを横向き（右）に配置
      player['puyoX'] = 2
      player['puyoY'] = 5
      player['rotation'] = 1 // 右向き

      // 2つ目のぷよの右側にぷよを配置
      stage.setPuyo(4, 5, 1)

      // 右に移動を試みる
      player.moveRight()

      // 位置が変わっていないことを確認
      expect(player['puyoX']).toBe(2)
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
      // プレイヤーをY=5に配置（上に回転できる位置）
      player['puyoY'] = 5
      // 回転状態を3に設定
      player['rotation'] = 3

      // 時計回りに回転
      player.rotateRight()

      // 回転状態が0になっていることを確認
      expect(player['rotation']).toBe(0)
    })

    it('左壁際で回転すると右にキックする', () => {
      // 左端に配置して横向き（rotation=3）にする
      player['puyoX'] = 0
      player['puyoY'] = 5 // 上に回転できる位置
      player['rotation'] = 3 // 2つ目のぷよが左にある状態

      // 時計回りに回転（2つ目のぷよが上に来る）
      player.rotateRight()

      // 回転成功し、位置は変わらない（壁キック不要）
      expect(player['rotation']).toBe(0)
      expect(player['puyoX']).toBe(0)

      // さらに回転（2つ目のぷよが右に来る）
      player.rotateRight()

      // 回転成功し、位置は変わらない
      expect(player['rotation']).toBe(1)
      expect(player['puyoX']).toBe(0)
    })

    it('右壁際で右向き回転時に左にキックする', () => {
      // 右端に配置して横向き（rotation=1）にする
      player['puyoX'] = config.stageCols - 1
      player['rotation'] = 1 // 2つ目のぷよが右にある状態

      // 時計回りに回転（2つ目のぷよが下に来る）
      player.rotateRight()

      // 回転成功
      expect(player['rotation']).toBe(2)
      expect(player['puyoX']).toBe(config.stageCols - 1)
    })

    it('左壁際で左向き状態から回転すると右にキックする', () => {
      // 左端に配置
      player['puyoX'] = 0
      player['rotation'] = 0

      // 回転して2つ目のぷよが左に来る状態にする
      player.rotateLeft() // rotation = 3（左）

      // この時、2つ目のぷよが壁外に出るので右にキックされる
      expect(player['rotation']).toBe(3)
      expect(player['puyoX']).toBe(1) // 右に1マスキック
    })

    it('既存のぷよがある位置には回転できない', () => {
      // プレイヤーを配置
      player['puyoX'] = 2
      player['puyoY'] = 5
      player['rotation'] = 0 // 上向き

      // 右側にぷよを配置
      stage.setPuyo(3, 5, 1)

      // 現在の回転状態を記録
      const beforeRotation = player['rotation']

      // 右向きに回転を試みる（2つ目のぷよが右に来る）
      player.rotateRight()

      // 右側にぷよがあるため回転できない
      expect(player['rotation']).toBe(beforeRotation)
    })

    it('回転後の位置が空いていれば回転できる', () => {
      // プレイヤーを配置
      player['puyoX'] = 2
      player['puyoY'] = 5
      player['rotation'] = 0 // 上向き

      // 回転を試みる
      player.rotateRight()

      // 回転成功
      expect(player['rotation']).toBe(1)
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
      const dropInterval = player['dropInterval']

      // ゲームの更新処理を実行（落下間隔分）
      player.updateWithDelta(dropInterval)

      // 位置が1つ下に移動していることを確認
      expect(player['puyoY']).toBe(initialY + 1)
    })

    it('指定時間未満では、ぷよは落ちない', () => {
      // 初期位置を記録
      const initialY = player['puyoY']

      // 落下間隔を取得
      const dropInterval = player['dropInterval']

      // タイマーを半分だけ進める
      player.updateWithDelta(dropInterval / 2)

      // 位置が変わっていないことを確認
      expect(player['puyoY']).toBe(initialY)
    })

    it('下端に達した場合、それ以上落ちない', () => {
      // 下端の1つ上に配置
      player['puyoY'] = config.stageRows - 1

      // 落下処理を実行
      player.updateWithDelta(player['dropInterval'])

      // 位置が変わっていないことを確認（下端を超えない）
      expect(player['puyoY']).toBe(config.stageRows - 1)
    })
  })

  describe('ぷよの着地', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('ぷよが下端に着地したら固定される', () => {
      // 下端の1つ上に配置
      player['puyoY'] = config.stageRows - 2

      // 落下処理を実行（下端に到達）
      player.updateWithDelta(player['dropInterval'])

      // 下端に到達している
      expect(player['puyoY']).toBe(config.stageRows - 1)

      // さらに落下処理を実行
      player.updateWithDelta(player['dropInterval'])

      // ステージにぷよが固定されていることを確認
      expect(
        stage.getPuyo(player['puyoX'], config.stageRows - 1)
      ).toBeGreaterThan(0)
    })

    it('ぷよが他のぷよの上に着地したら固定される', () => {
      // 下端にぷよを配置
      stage.setPuyo(2, config.stageRows - 1, 1)

      // プレイヤーのぷよを下端の2つ上に配置
      player['puyoY'] = config.stageRows - 3

      // 落下処理を実行（他のぷよの上に到達）
      player.updateWithDelta(player['dropInterval'])

      // 他のぷよの1つ上に到達している
      expect(player['puyoY']).toBe(config.stageRows - 2)

      // さらに落下処理を実行
      player.updateWithDelta(player['dropInterval'])

      // ステージにぷよが固定されていることを確認
      expect(
        stage.getPuyo(player['puyoX'], config.stageRows - 2)
      ).toBeGreaterThan(0)
    })

    it('ぷよが着地したら着地フラグが立つ', () => {
      // 下端の1つ上に配置
      player['puyoY'] = config.stageRows - 2

      // 落下処理を実行（下端に到達）
      player.updateWithDelta(player['dropInterval'])

      // まだ着地していない
      expect(player.hasLanded()).toBe(false)

      // さらに落下処理を実行（着地）
      player.updateWithDelta(player['dropInterval'])

      // 着地フラグが立っている
      expect(player.hasLanded()).toBe(true)
    })
  })

  describe('下向き回転時の着地', () => {
    beforeEach(() => {
      // 新しいぷよを作成
      player.createNewPuyo()
    })

    it('下向き（rotation=2）の状態で下端に着地したとき、下のぷよが下端を超えない', () => {
      // 下向きに回転
      player.rotateRight() // 0 → 1
      player.rotateRight() // 1 → 2 (下向き)

      // 下端の1つ上に配置
      player['puyoY'] = config.stageRows - 2

      // 落下処理を実行（下端に到達）
      player.updateWithDelta(player['dropInterval'])

      // 着地している
      expect(player.hasLanded()).toBe(true)

      // 軸ぷよの位置を確認（下端の1つ上）
      expect(
        stage.getPuyo(player['puyoX'], config.stageRows - 2)
      ).toBeGreaterThan(0)

      // 2つ目のぷよ（下）の位置を確認（下端）
      expect(
        stage.getPuyo(player['puyoX'], config.stageRows - 1)
      ).toBeGreaterThan(0)
    })

    it('下向き（rotation=2）の状態で下のぷよがステージの下端にあるとき、着地する', () => {
      // 下向きに回転
      player.rotateRight() // 0 → 1
      player.rotateRight() // 1 → 2 (下向き)

      // 下のぷよがちょうど下端になる位置に配置
      player['puyoY'] = config.stageRows - 2

      // 下に移動できないことを確認
      const canMove = player['canMoveDown']()
      expect(canMove).toBe(false)
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

      // 通常の落下速度
      const normalDropSpeed = 1
      const fastDropSpeed = player.getDropSpeed()

      // 高速落下の速度が通常より速いことを確認
      expect(fastDropSpeed).toBeGreaterThan(normalDropSpeed)
    })

    it('下に移動できる場合、下に移動する', () => {
      // 初期位置を記録
      const initialY = player['puyoY']

      // 下に移動
      const canMove = player.moveDown()

      // 位置が1つ下に移動していることを確認
      expect(canMove).toBe(true)
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
