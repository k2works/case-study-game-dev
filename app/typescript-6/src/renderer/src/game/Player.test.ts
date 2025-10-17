import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from './Player'
import { Config } from './Config'
import type { PuyoImage } from './PuyoImage'
import { Stage } from './Stage'
import { PuyoType } from './Puyo'

describe('Player', () => {
  let mockConfig: Config
  let mockPuyoImage: PuyoImage
  let mockStage: Stage
  let player: Player

  beforeEach(() => {
    mockConfig = new Config(32, 6, 12)
    mockPuyoImage = {} as PuyoImage
    mockStage = new Stage(mockConfig)
    player = new Player(mockConfig, mockPuyoImage, mockStage)
  })

  it('インスタンスが作成できる', () => {
    expect(player).toBeDefined()
    expect(player).toBeInstanceOf(Player)
  })

  describe('ぷよペア生成', () => {
    it('新しいぷよペアを生成できる', () => {
      player.createNewPuyoPair()

      const mainPuyo = player.getMainPuyo()
      const subPuyo = player.getSubPuyo()

      expect(mainPuyo).toBeDefined()
      expect(subPuyo).toBeDefined()
      expect(mainPuyo!.x).toBe(3) // 中央に配置（cols 6 / 2 = 3）
      expect(mainPuyo!.y).toBe(0) // 一番上
      expect(subPuyo!.x).toBe(3)
      expect(subPuyo!.y).toBe(-1) // メインぷよの上
    })

    it('ぷよペアはランダムな色で生成される', () => {
      player.createNewPuyoPair()

      const mainPuyo = player.getMainPuyo()
      const subPuyo = player.getSubPuyo()

      expect([PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]).toContain(
        mainPuyo!.type
      )
      expect([PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]).toContain(
        subPuyo!.type
      )
    })
  })

  describe('移動', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('左に移動できる', () => {
      const initialX = player.getMainPuyo()!.x

      player.moveLeft()

      expect(player.getMainPuyo()!.x).toBe(initialX - 1)
      expect(player.getSubPuyo()!.x).toBe(initialX - 1)
    })

    it('右に移動できる', () => {
      const initialX = player.getMainPuyo()!.x

      player.moveRight()

      expect(player.getMainPuyo()!.x).toBe(initialX + 1)
      expect(player.getSubPuyo()!.x).toBe(initialX + 1)
    })

    it('左端では左に移動できない', () => {
      // 左端に移動
      player.getMainPuyo()!.x = 0
      player.getSubPuyo()!.x = 0

      player.moveLeft()

      expect(player.getMainPuyo()!.x).toBe(0)
      expect(player.getSubPuyo()!.x).toBe(0)
    })

    it('右端では右に移動できない', () => {
      // 右端に移動
      player.getMainPuyo()!.x = mockConfig.cols - 1
      player.getSubPuyo()!.x = mockConfig.cols - 1

      player.moveRight()

      expect(player.getMainPuyo()!.x).toBe(mockConfig.cols - 1)
      expect(player.getSubPuyo()!.x).toBe(mockConfig.cols - 1)
    })

    it('メインぷよの左にぷよがあるとき、左に移動できない', () => {
      // フィールドの (2, 0) にぷよを配置
      mockStage.setPuyo(2, 0, PuyoType.Red)

      // メインぷよを (3, 0) に配置
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = -1

      // 手動で左移動を試みる
      player.moveLeft()

      // 移動していないことを確認
      expect(player.getMainPuyo()!.x).toBe(3)
      expect(player.getSubPuyo()!.x).toBe(3)
    })

    it('サブぷよの左にぷよがあるとき、左に移動できない', () => {
      // フィールドの (2, 0) にぷよを配置
      mockStage.setPuyo(2, 0, PuyoType.Red)

      // メインぷよを (3, 0)、サブぷよを (3, 0) に配置（回転状態: 右 → 下に変更）
      player.rotateClockwise() // 右
      player.rotateClockwise() // 下
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = 1

      // 手動で左移動を試みる
      player.moveLeft()

      // 移動していないことを確認
      expect(player.getMainPuyo()!.x).toBe(3)
      expect(player.getSubPuyo()!.x).toBe(3)
    })

    it('メインぷよの右にぷよがあるとき、右に移動できない', () => {
      // フィールドの (4, 0) にぷよを配置
      mockStage.setPuyo(4, 0, PuyoType.Red)

      // メインぷよを (3, 0) に配置
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = -1

      // 手動で右移動を試みる
      player.moveRight()

      // 移動していないことを確認
      expect(player.getMainPuyo()!.x).toBe(3)
      expect(player.getSubPuyo()!.x).toBe(3)
    })

    it('サブぷよの右にぷよがあるとき、右に移動できない', () => {
      // フィールドの (4, 0) にぷよを配置
      mockStage.setPuyo(4, 0, PuyoType.Red)

      // メインぷよを (3, 0)、サブぷよを (3, 1) に配置（回転状態: 下）
      player.rotateClockwise() // 右
      player.rotateClockwise() // 下
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = 1

      // 手動で右移動を試みる
      player.moveRight()

      // 移動していないことを確認
      expect(player.getMainPuyo()!.x).toBe(3)
      expect(player.getSubPuyo()!.x).toBe(3)
    })

    it('メインぷよの下にぷよがあるとき、下に移動できない', () => {
      // フィールドの (3, 1) にぷよを配置
      mockStage.setPuyo(3, 1, PuyoType.Red)

      // メインぷよを (3, 0) に配置
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = -1

      // 手動で下移動を試みる
      player.moveDown()

      // 移動していないことを確認
      expect(player.getMainPuyo()!.y).toBe(0)
      expect(player.getSubPuyo()!.y).toBe(-1)
    })

    it('サブぷよの下にぷよがあるとき、下に移動できない', () => {
      // フィールドの (4, 1) にぷよを配置
      mockStage.setPuyo(4, 1, PuyoType.Red)

      // メインぷよを (3, 0)、サブぷよを (4, 0) に配置（回転状態: 右）
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 4
      player.getSubPuyo()!.y = 0

      // 手動で下移動を試みる
      player.moveDown()

      // 移動していないことを確認
      expect(player.getMainPuyo()!.y).toBe(0)
      expect(player.getSubPuyo()!.y).toBe(0)
    })
  })

  describe('回転', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('時計回りに回転すると、回転状態が1増える', () => {
      const initialRotation = player.getRotation()

      player.rotateClockwise()

      expect(player.getRotation()).toBe((initialRotation + 1) % 4)
    })

    it('回転状態が3のときに回転すると0に戻る', () => {
      // 回転状態を3に設定
      player.rotateClockwise()
      player.rotateClockwise()
      player.rotateClockwise()
      expect(player.getRotation()).toBe(3)

      // もう一度回転
      player.rotateClockwise()

      expect(player.getRotation()).toBe(0)
    })

    it('回転すると、サブぷよの位置が変わる', () => {
      const mainPuyo = player.getMainPuyo()!
      const subPuyo = player.getSubPuyo()!

      // 初期状態：サブぷよは上（y = -1）
      expect(subPuyo.x).toBe(mainPuyo.x)
      expect(subPuyo.y).toBe(mainPuyo.y - 1)

      // 時計回りに回転：サブぷよは右（x = +1）
      player.rotateClockwise()
      const subPuyoAfter1 = player.getSubPuyo()!
      expect(subPuyoAfter1.x).toBe(mainPuyo.x + 1)
      expect(subPuyoAfter1.y).toBe(mainPuyo.y)

      // もう一度回転：サブぷよは下（y = +1）
      player.rotateClockwise()
      const subPuyoAfter2 = player.getSubPuyo()!
      expect(subPuyoAfter2.x).toBe(mainPuyo.x)
      expect(subPuyoAfter2.y).toBe(mainPuyo.y + 1)

      // もう一度回転：サブぷよは左（x = -1）
      player.rotateClockwise()
      const subPuyoAfter3 = player.getSubPuyo()!
      expect(subPuyoAfter3.x).toBe(mainPuyo.x - 1)
      expect(subPuyoAfter3.y).toBe(mainPuyo.y)
    })
  })

  describe('回転時の接触判定', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('回転後の位置にぷよがある場合、回転できない', () => {
      // Arrange: ステージの右にぷよを配置
      const centerX = Math.floor(mockConfig.cols / 2)
      mockStage.setPuyo(centerX + 1, 0, PuyoType.Red)

      // メインぷよを (3, 0)、サブぷよを (3, -1) に配置（回転状態: 上）
      player.getMainPuyo()!.x = centerX
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = centerX
      player.getSubPuyo()!.y = -1

      // Act: 右に回転しようとする（サブぷよが centerX + 1, 0 に来る）
      const rotationBefore = player.getRotation()
      player.rotateClockwise()

      // Assert: 回転していない
      expect(player.getRotation()).toBe(rotationBefore)
      expect(player.getSubPuyo()!.x).toBe(centerX)
      expect(player.getSubPuyo()!.y).toBe(-1)
    })
  })

  describe('壁キック', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('右端で右回転すると、左にずれて回転する', () => {
      // 右端に配置
      player.getMainPuyo()!.x = mockConfig.cols - 1
      player.getSubPuyo()!.x = mockConfig.cols - 1
      player.getSubPuyo()!.y = player.getMainPuyo()!.y - 1

      // 時計回りに回転（サブぷよが右に来る）
      player.rotateClockwise()

      // メインぷよが左にずれていることを確認
      expect(player.getMainPuyo()!.x).toBe(mockConfig.cols - 2)
      // サブぷよが画面内にあることを確認
      expect(player.getSubPuyo()!.x).toBe(mockConfig.cols - 1)
    })

    it('左端で左回転すると、右にずれて回転する', () => {
      // 左端に配置（回転状態を2：下向きにする）
      player.rotateClockwise()
      player.rotateClockwise()
      player.getMainPuyo()!.x = 0
      player.getSubPuyo()!.x = 0

      // もう一度回転（サブぷよが左に来る）
      player.rotateClockwise()

      // メインぷよが右にずれていることを確認
      expect(player.getMainPuyo()!.x).toBe(1)
      // サブぷよが画面内にあることを確認
      expect(player.getSubPuyo()!.x).toBe(0)
    })
  })

  describe('バリデーション', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('回転状態は常に0-3の範囲内である', () => {
      // 初期状態は0
      expect(player.getRotation()).toBe(0)

      // 4回転で元に戻る
      player.rotateClockwise()
      player.rotateClockwise()
      player.rotateClockwise()
      player.rotateClockwise()

      expect(player.getRotation()).toBe(0)
    })
  })

  describe('自由落下', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('一定時間経過すると、ぷよが1マス下に落ちる', () => {
      const initialY = player.getMainPuyo()!.y

      player.update(1000)

      expect(player.getMainPuyo()!.y).toBe(initialY + 1)
    })

    it('落下間隔未満では、ぷよは落ちない', () => {
      const initialY = player.getMainPuyo()!.y

      player.update(500)

      expect(player.getMainPuyo()!.y).toBe(initialY)
    })

    it('下端に達した場合、それ以上落ちない', () => {
      // 下端に配置
      player.getMainPuyo()!.y = mockConfig.rows - 1
      player.getSubPuyo()!.y = mockConfig.rows - 2

      player.update(1000)

      // ぷよペアがまだ存在することを確認
      expect(player.getMainPuyo()).not.toBeNull()
      expect(player.getSubPuyo()).not.toBeNull()
    })
  })

  describe('着地処理', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('下端に達したとき、フィールドにぷよが配置される', () => {
      const mainPuyo = player.getMainPuyo()!
      const subPuyo = player.getSubPuyo()!
      const mainPuyoType = mainPuyo.type
      const subPuyoType = subPuyo.type
      const mainPuyoX = mainPuyo.x
      const subPuyoX = subPuyo.x

      // 下端に配置（これ以上落ちない状態）
      mainPuyo.y = mockConfig.rows - 1
      subPuyo.y = mockConfig.rows - 2

      // 1秒経過させて着地フラグを立てる
      player.update(1000)

      // 着地していることを確認
      expect(player.hasLanded()).toBe(true)

      // ぷよを配置
      player.placePuyos()

      // フィールドにぷよが配置されていることを確認
      expect(mockStage.getPuyo(mainPuyoX, mockConfig.rows - 1)).toBe(mainPuyoType)
      expect(mockStage.getPuyo(subPuyoX, mockConfig.rows - 2)).toBe(subPuyoType)
    })

    it('着地したとき、新しいぷよペアが生成される', () => {
      // 下端に配置（これ以上落ちない状態）
      player.getMainPuyo()!.y = mockConfig.rows - 1
      player.getSubPuyo()!.y = mockConfig.rows - 2

      // 1秒経過させて着地フラグを立てる
      player.update(1000)

      // 着地していることを確認
      expect(player.hasLanded()).toBe(true)

      // ぷよを配置
      player.placePuyos()

      // 新しいぷよペアを生成
      player.createNewPuyoPair()

      // 新しいぷよペアが生成されていることを確認
      const newMainPuyo = player.getMainPuyo()!
      const newSubPuyo = player.getSubPuyo()!

      expect(newMainPuyo.x).toBe(Math.floor(mockConfig.cols / 2))
      expect(newMainPuyo.y).toBe(0)
      expect(newSubPuyo.x).toBe(Math.floor(mockConfig.cols / 2))
      expect(newSubPuyo.y).toBe(-1)
    })

    it('サブぷよが画面外にいても、メインぷよの下にぷよがあれば着地する', () => {
      // フィールドの (3, 1) にぷよを配置
      mockStage.setPuyo(3, 1, PuyoType.Red)

      // メインぷよを (3, 0)、サブぷよを (3, -1) に配置
      const mainPuyo = player.getMainPuyo()!
      const subPuyo = player.getSubPuyo()!
      mainPuyo.x = 3
      mainPuyo.y = 0
      subPuyo.x = 3
      subPuyo.y = -1

      const mainPuyoType = mainPuyo.type

      // 1秒経過させて着地フラグを立てる
      player.update(1000)

      // 着地していることを確認
      expect(player.hasLanded()).toBe(true)

      // ぷよを配置
      player.placePuyos()

      // メインぷよが (3, 0) で着地していることを確認
      expect(mockStage.getPuyo(3, 0)).toBe(mainPuyoType)
      // サブぷよは画面外なので配置されない
      expect(mockStage.getPuyo(3, -1)).toBe(PuyoType.Empty)

      // 新しいぷよペアを生成
      player.createNewPuyoPair()

      // 新しいぷよペアが生成されていることを確認
      const newMainPuyo = player.getMainPuyo()!
      expect(newMainPuyo.x).toBe(Math.floor(mockConfig.cols / 2))
      expect(newMainPuyo.y).toBe(0)
    })

    it('サブぷよが右にいるとき、サブぷよの下にぷよがあれば着地する', () => {
      // フィールドの (4, 1) にぷよを配置
      mockStage.setPuyo(4, 1, PuyoType.Red)

      // メインぷよを (3, 0)、サブぷよを (4, 0) に配置（回転状態: 右）
      const mainPuyo = player.getMainPuyo()!
      const subPuyo = player.getSubPuyo()!
      mainPuyo.x = 3
      mainPuyo.y = 0
      subPuyo.x = 4
      subPuyo.y = 0

      const mainPuyoType = mainPuyo.type
      const subPuyoType = subPuyo.type

      // 1秒経過させて着地フラグを立てる
      player.update(1000)

      // 着地していることを確認
      expect(player.hasLanded()).toBe(true)

      // ぷよを配置
      player.placePuyos()

      // メインぷよとサブぷよが着地していることを確認
      expect(mockStage.getPuyo(3, 0)).toBe(mainPuyoType)
      expect(mockStage.getPuyo(4, 0)).toBe(subPuyoType)

      // 新しいぷよペアを生成
      player.createNewPuyoPair()

      // 新しいぷよペアが生成されていることを確認
      const newMainPuyo = player.getMainPuyo()!
      expect(newMainPuyo.x).toBe(Math.floor(mockConfig.cols / 2))
      expect(newMainPuyo.y).toBe(0)
    })
  })

  describe('高速落下', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('下キーが押されていないときは通常速度（1）を返す', () => {
      const speed = player.getDropSpeed(false)

      expect(speed).toBe(1)
    })

    it('下キーが押されているときは高速（10）を返す', () => {
      const speed = player.getDropSpeed(true)

      expect(speed).toBe(10)
    })

    it('下キーが押されていると、タイマーが速く進む', () => {
      // タイマーを初期化
      player['fallTimer'] = 0

      // 通常速度で50ms経過（タイマーリセットされない範囲）
      player.update(50, false)
      const normalTimer = player['fallTimer']

      // タイマーをリセット
      player['fallTimer'] = 0

      // 高速落下で50ms経過（タイマーリセットされない範囲）
      player.update(50, true)
      const fastTimer = player['fallTimer']

      // 高速落下の方がタイマーが速く進むことを確認
      expect(fastTimer).toBeGreaterThan(normalTimer)
      expect(fastTimer).toBe(normalTimer * 10)
    })
  })

  describe('着地判定', () => {
    beforeEach(() => {
      player.createNewPuyoPair()
    })

    it('下に移動できる場合、着地していない', () => {
      // メインぷよを (3, 0)、サブぷよを (3, -1) に配置
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = -1

      // 下に移動できる場合、着地していない
      expect(player.hasLanded()).toBe(false)
    })

    it('下端に達した場合、着地している', () => {
      // 下端に配置
      player.getMainPuyo()!.y = mockConfig.rows - 1
      player.getSubPuyo()!.y = mockConfig.rows - 2

      // 1秒経過させて着地フラグを立てる
      player.update(1000)

      // 下端に達した場合、着地している
      expect(player.hasLanded()).toBe(true)
    })

    it('下にぷよがある場合、着地している', () => {
      // フィールドの (3, 1) にぷよを配置
      mockStage.setPuyo(3, 1, PuyoType.Red)

      // メインぷよを (3, 0) に配置
      player.getMainPuyo()!.x = 3
      player.getMainPuyo()!.y = 0
      player.getSubPuyo()!.x = 3
      player.getSubPuyo()!.y = -1

      // 1秒経過させて着地フラグを立てる
      player.update(1000)

      // 下にぷよがある場合、着地している
      expect(player.hasLanded()).toBe(true)
    })
  })

  describe('ゲームオーバー判定', () => {
    it('新しいぷよを配置できない場合、ゲームオーバーになる', () => {
      // ステージの上部にぷよを配置
      const startX = Math.floor(mockConfig.cols / 2)
      mockStage.setPuyo(startX, 0, PuyoType.Red)
      mockStage.setPuyo(startX, 1, PuyoType.Red)

      // 新しいぷよペアを生成
      player.createNewPuyoPair()

      // ゲームオーバー判定
      const isGameOver = player.checkGameOver()

      // ゲームオーバーになっていることを確認
      expect(isGameOver).toBe(true)
    })

    it('新しいぷよを配置できる場合、ゲームオーバーにならない', () => {
      // 空のステージで新しいぷよペアを生成
      player.createNewPuyoPair()

      // ゲームオーバー判定
      const isGameOver = player.checkGameOver()

      // ゲームオーバーになっていないことを確認
      expect(isGameOver).toBe(false)
    })
  })
})
