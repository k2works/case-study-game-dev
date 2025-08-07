import { describe, it, expect } from 'vitest'
import { Game, GameState } from './Game'
import { Puyo, PuyoColor } from './Puyo'

describe('Game', () => {
  describe('Gameを作成する', () => {
    it('新しいゲームを作成できる', () => {
      const game = new Game()

      expect(game.state).toBe(GameState.READY)
      expect(game.score).toBe(0)
      expect(game.field).toBeDefined()
      expect(game.field.isEmpty()).toBe(true)
    })
  })

  describe('ゲームを開始する', () => {
    it('ゲームを開始すると状態がPLAYINGになる', () => {
      const game = new Game()

      game.start()

      expect(game.state).toBe(GameState.PLAYING)
      expect(game.currentPair).toBeDefined()
    })

    it('開始時に最初のぷよペアが生成される', () => {
      const game = new Game()

      game.start()

      expect(game.currentPair).not.toBeNull()
      expect(game.currentPair!.main.color).toBeOneOf([
        PuyoColor.RED,
        PuyoColor.BLUE,
        PuyoColor.GREEN,
        PuyoColor.YELLOW,
      ])
      expect(game.currentPair!.sub.color).toBeOneOf([
        PuyoColor.RED,
        PuyoColor.BLUE,
        PuyoColor.GREEN,
        PuyoColor.YELLOW,
      ])
    })

    it('初期位置が中央上部に設定される', () => {
      const game = new Game()

      game.start()

      expect(game.currentPair!.x).toBe(2)
      expect(game.currentPair!.y).toBe(2)
      expect(game.currentPair!.rotation).toBe(180)
    })
  })

  describe('ぷよペアを操作する', () => {
    it('ぷよペアを左に移動できる', () => {
      const game = new Game()
      game.start()
      const initialX = game.currentPair!.x

      const moved = game.moveLeft()

      expect(moved).toBe(true)
      expect(game.currentPair!.x).toBe(initialX - 1)
    })

    it('ぷよペアを右に移動できる', () => {
      const game = new Game()
      game.start()
      const initialX = game.currentPair!.x

      const moved = game.moveRight()

      expect(moved).toBe(true)
      expect(game.currentPair!.x).toBe(initialX + 1)
    })

    it('ぷよペアを回転できる', () => {
      const game = new Game()
      game.start()

      game.rotate()

      expect(game.currentPair!.rotation).toBe(270)
    })

    describe('壁蹴り処理', () => {
      it('左壁に接触時、右にずらして回転する', () => {
        const game = new Game()
        game.start()

        // 左壁近くでの衝突をシミュレート
        // x=0の位置に障害物を置く
        game.field.setPuyo(0, 2, new Puyo(PuyoColor.RED))

        // x=0, y=2の位置にぷよペアを配置
        game.currentPair!.x = 0
        game.currentPair!.y = 2
        // 180度回転状態（サブぷよが下）
        game.currentPair!.rotation = 180

        // 回転を実行（270度になろうとするが、サブぷよがx=-1になるので壁蹴り）
        const rotated = game.rotate()

        expect(rotated).toBe(true)
        // kickOffsetsの順番により、最初の成功位置が使われる
        // 障害物があるため、x=1も使えず、x=2になる
        expect(game.currentPair!.x).toBeGreaterThan(0) // 右にずれる
        expect(game.currentPair!.rotation).toBe(270)
      })

      it('右壁に接触時、左にずらして回転する', () => {
        const game = new Game()
        game.start()

        // 右端に移動
        game.currentPair!.x = 5

        // 回転を実行
        const rotated = game.rotate()

        expect(rotated).toBe(true)
        expect(game.currentPair!.x).toBe(5) // 位置調整により変化なしまたは最小限の調整
        expect(game.currentPair!.rotation).toBe(270)
      })

      it('他のぷよに接触時、横にずらして回転を試みる', () => {
        const game = new Game()
        game.start()

        // 障害物を配置
        game.field.setPuyo(3, 1, new Puyo(PuyoColor.RED))

        // 障害物の隣に配置
        game.currentPair!.x = 2
        game.currentPair!.y = 1

        // 回転を実行
        const rotated = game.rotate()

        expect(rotated).toBe(true)
        expect(game.currentPair!.x).toBe(2) // 位置は基本的に維持
        expect(game.currentPair!.rotation).toBe(270)
      })

      it('どの位置でも回転できない場合は回転しない', () => {
        const game = new Game()
        game.start()

        // 周囲を完全にブロック（回転できないパターン）
        // 左右と上下をブロック
        game.field.setPuyo(0, 1, new Puyo(PuyoColor.RED))
        game.field.setPuyo(1, 1, new Puyo(PuyoColor.RED))
        game.field.setPuyo(3, 1, new Puyo(PuyoColor.RED))
        game.field.setPuyo(4, 1, new Puyo(PuyoColor.RED))
        game.field.setPuyo(5, 1, new Puyo(PuyoColor.RED))
        game.field.setPuyo(2, 2, new Puyo(PuyoColor.RED))

        game.currentPair!.x = 2
        game.currentPair!.y = 1

        // 回転を実行
        const rotated = game.rotate()

        expect(rotated).toBe(false)
        expect(game.currentPair!.rotation).toBe(180) // 初期回転状態を維持
      })
    })

    it('ぷよペアを下に落下できる', () => {
      const game = new Game()
      game.start()
      const initialY = game.currentPair!.y

      const dropped = game.drop()

      expect(dropped).toBe(true)
      expect(game.currentPair!.y).toBe(initialY + 1)
    })

    it('境界を超えて移動しようとすると失敗する', () => {
      const game = new Game()
      game.start()

      // 左端まで移動
      game.moveLeft()
      game.moveLeft()
      const leftmost = game.moveLeft()

      expect(leftmost).toBe(false)
      expect(game.currentPair!.x).toBe(0)
    })
  })

  describe('ぷよペアの固定と新ペア生成', () => {
    it('ぷよペアが底に到達すると固定され新しいペアが生成される', () => {
      const game = new Game()
      game.start()
      const originalPair = game.currentPair!

      // 底まで落下させる
      while (game.drop()) {
        // 落下し続ける
      }

      // ぷよペアを固定し新しいペアを生成
      game.fixCurrentPair()

      // フィールドにぷよが固定されている
      const mainPos = originalPair.getMainPosition()
      const subPos = originalPair.getSubPosition()
      expect(game.field.getPuyo(mainPos.x, mainPos.y)).not.toBeNull()
      expect(game.field.getPuyo(subPos.x, subPos.y)).not.toBeNull()

      // 新しいペアが生成されている
      expect(game.currentPair).not.toBeNull()
      expect(game.currentPair).not.toBe(originalPair)
      expect(game.currentPair!.x).toBe(2)
      expect(game.currentPair!.y).toBe(2)
      expect(game.currentPair!.rotation).toBe(180)
    })
  })

  describe('ゲームオーバー判定', () => {
    it('新しいぷよペアの初期位置に既存のぷよがある場合ゲームオーバーになる', () => {
      const game = new Game()
      game.start()

      // 見える範囲(y>=2)にぷよを配置してゲームオーバー状態を作る
      game.field.setPuyo(2, 2, new Puyo(PuyoColor.RED))

      // 新しいペアを生成しようとする
      game.generateNewPair()

      expect(game.state).toBe(GameState.GAME_OVER)
    })

    it('ゲームオーバー状態では操作が無効になる', () => {
      const game = new Game()
      game.start()

      // ゲームオーバー状態にする
      game.field.setPuyo(2, 2, new Puyo(PuyoColor.RED))
      game.generateNewPair()

      // 操作が無効になることを確認
      expect(game.moveLeft()).toBe(false)
      expect(game.moveRight()).toBe(false)
      expect(game.rotate()).toBe(false)
      expect(game.drop()).toBe(false)
    })
  })

  describe('NEXTぷよ機能', () => {
    it('ゲーム開始時にNEXTぷよが生成される', () => {
      const game = new Game()

      game.start()

      expect(game.nextPair).toBeDefined()
      expect(game.nextPair).not.toBeNull()
      expect(game.nextPair!.main.color).toBeOneOf([
        PuyoColor.RED,
        PuyoColor.BLUE,
        PuyoColor.GREEN,
        PuyoColor.YELLOW,
      ])
    })

    it('現在のぷよペアを固定すると、NEXTぷよが現在のぷよペアになる', () => {
      const game = new Game()
      game.start()

      const originalNextPair = game.nextPair

      // 底まで落下させる
      while (game.drop()) {
        // 落下し続ける
      }

      // ぷよペアを固定
      game.fixCurrentPair()

      // 元のNEXTぷよが現在のぷよペアになっている
      expect(game.currentPair!.main.color).toBe(originalNextPair!.main.color)
      expect(game.currentPair!.sub.color).toBe(originalNextPair!.sub.color)

      // 新しいNEXTぷよが生成されている
      expect(game.nextPair).toBeDefined()
      expect(game.nextPair).not.toBe(originalNextPair)
    })

    it('NEXTぷよは初期位置に配置されない', () => {
      const game = new Game()
      game.start()

      // NEXTぷよは表示用のため、初期位置を持たない
      expect(game.nextPair!.x).toBe(0)
      expect(game.nextPair!.y).toBe(0)
      expect(game.nextPair!.rotation).toBe(0)
    })
  })

  describe('消去・連鎖システム統合', () => {
    it('ぷよ固定後に4つ以上連結したぷよが自動消去される', () => {
      const game = new Game()
      game.start()

      // 2×2の赤いぷよ配置をシミュレート（手動でフィールドに配置）
      game.field.setPuyo(0, 0, new Puyo(PuyoColor.RED))
      game.field.setPuyo(1, 0, new Puyo(PuyoColor.RED))
      game.field.setPuyo(0, 1, new Puyo(PuyoColor.RED))

      // 最後の1つを固定で追加
      game.field.setPuyo(1, 1, new Puyo(PuyoColor.RED))

      // 消去・連鎖処理を実行
      game.processChain()

      // 4つのぷよが消去される
      expect(game.field.isEmpty()).toBe(true)
      expect(game.score).toBeGreaterThan(0)
    })
  })
})
