import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './Game'

describe('Game', () => {
  let game: Game

  beforeEach(() => {
    game = new Game()
  })

  describe('新しいゲームを開始', () => {
    it('ゲームの初期化処理を実装する', () => {
      expect(game).toBeDefined()
      expect(game.isGameOver()).toBe(false)
    })

    it('ゲーム画面を表示する', () => {
      expect(game.getField()).toBeDefined()
      const field = game.getField()
      expect(field).toHaveLength(12) // 12行
      expect(field[0]).toHaveLength(6) // 6列
    })

    it('新しいぷよを生成する', () => {
      const puyo = game.getCurrentPuyo()
      expect(puyo).toBeDefined()
      expect(puyo).not.toBeNull()
    })

    it('ぷよが画面に表示されること', () => {
      const puyo = game.getCurrentPuyo()
      expect(puyo).not.toBeNull()
      expect(puyo!.x).toBe(2) // 中央に生成
      expect(puyo!.y).toBe(0) // 上部に生成
      expect(puyo!.color).toBe(1) // 色が設定されている
    })

    it('ゲームループが正常に動作すること', () => {
      // ゲームが初期状態で動作可能な状態にあることを確認
      expect(game.isGameOver()).toBe(false)
      expect(game.getField()).toBeDefined()
      expect(game.getCurrentPuyo()).toBeDefined()
    })
  })
})
