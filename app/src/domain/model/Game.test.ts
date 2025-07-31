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
})