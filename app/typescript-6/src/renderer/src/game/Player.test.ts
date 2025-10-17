import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from './Player'
import type { Config } from './Config'
import type { PuyoImage } from './PuyoImage'
import { PuyoType } from './Puyo'

describe('Player', () => {
  let mockConfig: Config
  let mockPuyoImage: PuyoImage
  let player: Player

  beforeEach(() => {
    mockConfig = {
      cellSize: 32,
      cols: 6,
      rows: 12
    } as Config

    mockPuyoImage = {} as PuyoImage
    player = new Player(mockConfig, mockPuyoImage)
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
})
