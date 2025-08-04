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

  describe('ぷよの移動', () => {
    it('ぷよが自動的に落下すること', () => {
      const initialY = game.getCurrentPuyo()!.y
      game.update()
      const newY = game.getCurrentPuyo()!.y
      expect(newY).toBe(initialY + 1)
    })

    it('一定時間経過後にぷよが落下すること', () => {
      const initialY = game.getCurrentPuyo()!.y
      // 落下に必要な時間が経過していない場合
      game.update(100) // 100ms
      expect(game.getCurrentPuyo()!.y).toBe(initialY)

      // 落下に必要な時間が経過した場合
      game.update(1000) // 1000ms (1秒)
      expect(game.getCurrentPuyo()!.y).toBe(initialY + 1)
    })

    it('左矢印キーでぷよを左に移動できること', () => {
      const initialX = game.getCurrentPuyo()!.x
      game.handleInput('ArrowLeft')
      const newX = game.getCurrentPuyo()!.x
      expect(newX).toBe(initialX - 1)
    })

    it('右矢印キーでぷよを右に移動できること', () => {
      const initialX = game.getCurrentPuyo()!.x
      game.handleInput('ArrowRight')
      const newX = game.getCurrentPuyo()!.x
      expect(newX).toBe(initialX + 1)
    })

    it('下矢印キーでぷよを高速落下できること', () => {
      const initialY = game.getCurrentPuyo()!.y
      game.handleInput('ArrowDown')
      const newY = game.getCurrentPuyo()!.y
      expect(newY).toBe(initialY + 1)
    })
  })
})
