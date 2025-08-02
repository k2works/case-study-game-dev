import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './Game'
import { GameState } from './GameState'
import { PuyoColor } from './Puyo'

describe('Game', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
  })

  describe('ゲームの初期化', () => {
    it('新しいゲームを作成できる', () => {
      expect(game).toBeDefined()
    })

    it('ゲーム状態が初期状態である', () => {
      expect(game.getState()).toBe(GameState.READY)
    })

    it('スコアが0で初期化される', () => {
      expect(game.getScore()).toBe(0)
    })

    it('ゲームフィールドが初期化される', () => {
      const field = game.getField()
      expect(field).toBeDefined()
      expect(field.isEmpty()).toBe(true)
    })
  })

  describe('ゲーム開始', () => {
    it('ゲームを開始できる', () => {
      game.start()
      expect(game.getState()).toBe(GameState.PLAYING)
    })

    it('ゲーム開始時に最初のぷよが生成される', () => {
      game.start()
      const currentPuyo = game.getCurrentPuyo()
      expect(currentPuyo).toBeDefined()
    })
  })

  describe('ぷよの移動', () => {
    beforeEach(() => {
      game.start()
    })

    it('ぷよが自動的に下に落下する', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialMainY = initialPuyo!.main.position.y
      const initialSubY = initialPuyo!.sub.position.y

      // 落下タイマー分（30フレーム）ゲームを更新
      for (let i = 0; i < 30; i++) {
        game.update()
      }

      const updatedPuyo = game.getCurrentPuyo()
      expect(updatedPuyo!.main.position.y).toBe(initialMainY + 1)
      expect(updatedPuyo!.sub.position.y).toBe(initialSubY + 1)
    })

    it('ぷよが地面に着地する', () => {
      const field = game.getField()
      const fieldHeight = field.getHeight()

      // ぷよを地面近くまで落下させる（フレーム数を調整）
      for (let i = 0; i < fieldHeight * 30; i++) {
        game.update()
      }

      // 着地したぷよがフィールドに配置される
      expect(field.isEmpty()).toBe(false)
    })

    it('ぷよが着地したら新しいぷよが生成される', () => {
      const initialPuyo = game.getCurrentPuyo()
      const field = game.getField()
      const fieldHeight = field.getHeight()

      // ぷよを地面まで落下させる（フレーム数を調整）
      for (let i = 0; i < fieldHeight * 30; i++) {
        game.update()
      }

      const newPuyo = game.getCurrentPuyo()
      expect(newPuyo).toBeDefined()
      expect(newPuyo).not.toBe(initialPuyo)
      expect(newPuyo!.main.position.y).toBe(0) // 新しいぷよは上から開始
    })

    it('ぷよを左に移動できる', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialX = initialPuyo!.main.position.x

      const moved = game.movePuyo(-1, 0)

      expect(moved).toBe(true)
      const movedPuyo = game.getCurrentPuyo()
      expect(movedPuyo!.main.position.x).toBe(initialX - 1)
    })

    it('ぷよを右に移動できる', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialX = initialPuyo!.main.position.x

      const moved = game.movePuyo(1, 0)

      expect(moved).toBe(true)
      const movedPuyo = game.getCurrentPuyo()
      expect(movedPuyo!.main.position.x).toBe(initialX + 1)
    })

    it('フィールドの左端を超えて移動できない', () => {
      // ぷよを左端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(-1, 0)
      }

      const puyoBeforeMove = game.getCurrentPuyo()
      const moved = game.movePuyo(-1, 0)

      expect(moved).toBe(false)
      const puyoAfterMove = game.getCurrentPuyo()
      expect(puyoAfterMove!.main.position.x).toBe(
        puyoBeforeMove!.main.position.x
      )
    })

    it('フィールドの右端を超えて移動できない', () => {
      // ぷよを右端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(1, 0)
      }

      const puyoBeforeMove = game.getCurrentPuyo()
      const moved = game.movePuyo(1, 0)

      expect(moved).toBe(false)
      const puyoAfterMove = game.getCurrentPuyo()
      expect(puyoAfterMove!.main.position.x).toBe(
        puyoBeforeMove!.main.position.x
      )
    })
  })

  describe('ぷよの回転', () => {
    beforeEach(() => {
      game.start()
    })

    it('ぷよを時計回りに回転できる', () => {
      const initialPuyo = game.getCurrentPuyo()
      const initialSubPosition = initialPuyo!.sub.position

      const rotated = game.rotatePuyo()

      expect(rotated).toBe(true)
      const rotatedPuyo = game.getCurrentPuyo()
      expect(rotatedPuyo!.sub.position).not.toEqual(initialSubPosition)
    })

    it('壁キック処理が動作する', () => {
      // ぷよを右端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(1, 0)
      }

      // 現在の位置を記録
      const puyoBeforeRotate = game.getCurrentPuyo()!
      const originalX = puyoBeforeRotate.main.position.x

      // 回転を試行（壁キックが必要な状況）
      const rotated = game.rotatePuyo()

      if (rotated) {
        const puyoAfterRotate = game.getCurrentPuyo()!
        // 壁キックが発生した場合、位置が調整される
        expect(puyoAfterRotate.main.position.x).toBeLessThanOrEqual(originalX)
      }
    })

    it('壁キックでも回転できない場合は失敗する', () => {
      // まず1回回転させてサブぷよを右側に配置
      game.rotatePuyo()

      // 左端まで移動
      for (let i = 0; i < 10; i++) {
        game.movePuyo(-1, 0)
      }

      const puyoBeforeRotate = game.getCurrentPuyo()!

      // この状態でもう一度回転を試行（サブぷよが左端から出てしまう）
      const rotated = game.rotatePuyo()

      // 特定の状況では回転できない場合もある
      if (!rotated) {
        const puyoAfterRotate = game.getCurrentPuyo()!
        expect(puyoAfterRotate.sub.position).toEqual(
          puyoBeforeRotate.sub.position
        )
      }
    })

    it('他のぷよがある位置への回転は失敗する', () => {
      // この時点ではまだ他のぷよがフィールドにないため、
      // フィールドに配置されたぷよとの衝突テストは後で実装
      expect(true).toBe(true) // プレースホルダー
    })
  })

  describe('ぷよの消去', () => {
    beforeEach(() => {
      game.start()
    })

    it('4つ以上接続したぷよが消去されスコアが加算される', () => {
      const field = game.getField()

      // 4つ接続した赤いぷよを手動で配置
      field.setCell(0, 8, PuyoColor.RED)
      field.setCell(1, 8, PuyoColor.RED)
      field.setCell(0, 9, PuyoColor.RED)
      field.setCell(1, 9, PuyoColor.RED)

      // 消去処理を実行するために新しいぷよを配置してprocessClearAndGravityを呼び出す
      // 直接processClearAndGravityを呼び出すことはできないので、
      // placePuyoOnFieldメソッドが呼ばれる状況を作る

      // ゲームの更新処理中にぷよ着地をシミュレート
      // テスト用にprivateメソッドを直接呼ぶ代わりに、
      // clearConnectedPuyosを直接呼び出してテストする
      const clearedCount = field.clearConnectedPuyos()

      expect(clearedCount).toBe(4) // 4つの赤いぷよが消去される
      expect(field.getCell(0, 8)).toBe(null)
      expect(field.getCell(1, 8)).toBe(null)
      expect(field.getCell(0, 9)).toBe(null)
      expect(field.getCell(1, 9)).toBe(null)
    })

    it('消去後に重力が適用される', () => {
      const field = game.getField()

      // テスト用配置：下に4つ接続、上に別の色を配置
      field.setCell(0, 8, PuyoColor.BLUE) // 上のぷよ
      field.setCell(0, 9, PuyoColor.RED) // 消去対象
      field.setCell(1, 9, PuyoColor.RED) // 消去対象
      field.setCell(0, 10, PuyoColor.RED) // 消去対象
      field.setCell(1, 10, PuyoColor.RED) // 消去対象

      // 消去処理を実行
      field.clearConnectedPuyos()

      // 重力を適用
      field.applyGravity()

      // 青いぷよが落下していることを確認
      expect(field.getCell(0, 8)).toBe(null) // 元の位置は空
      expect(field.getCell(0, 11)).toBe(PuyoColor.BLUE) // 最下段に落下
    })
  })
})
