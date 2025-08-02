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
    })

    it('新しいぷよを生成する', () => {
      expect(game.getCurrentPuyo()).toBeDefined()
    })
  })
})
