import { describe, it, expect, beforeEach } from 'vitest'
import { Game } from './Game'
import { GameState } from './GameState'

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
      expect(puyoAfterMove!.main.position.x).toBe(puyoBeforeMove!.main.position.x)
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
      expect(puyoAfterMove!.main.position.x).toBe(puyoBeforeMove!.main.position.x)
    })
  })
})