import { describe, it, expect } from 'vitest'
import { Game, GameState } from './Game'
import { PuyoColor } from './Puyo'

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
      expect(game.currentPair!.y).toBe(1)
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

      expect(game.currentPair!.rotation).toBe(90)
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
      expect(game.currentPair!.y).toBe(1)
    })
  })
})
