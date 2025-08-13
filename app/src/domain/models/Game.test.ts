import { describe, expect, it } from 'vitest'

import {
  createGame,
  updateGameState,
  updateScore,
  dropPuyo,
} from './Game'
import { createPuyo } from './Puyo'

describe('Game', () => {
  describe('createGame', () => {
    it('新しいゲームを作成できる', () => {
      // Arrange & Act
      const game = createGame()

      // Assert
      expect(game.id).toBeDefined()
      expect(game.state).toBe('ready')
      expect(game.field).toBeDefined()
      expect(game.score).toBe(0)
      expect(game.level).toBe(1)
      expect(game.createdAt).toBeInstanceOf(Date)
      expect(game.updatedAt).toBeInstanceOf(Date)
    })

    it('作成されるゲームIDは一意である', () => {
      // Arrange & Act
      const game1 = createGame()
      const game2 = createGame()

      // Assert
      expect(game1.id).not.toBe(game2.id)
    })
  })

  describe('dropPuyo', () => {
    it('ぷよをフィールドの最下部に落下させる', () => {
      // Arrange
      const game = createGame()
      const puyo = createPuyo('red', { x: 2, y: 0 })

      // Act
      const updatedGame = dropPuyo(game, puyo, 2)

      // Assert
      expect(updatedGame.field.getPuyo(2, 11)).toBe(puyo)
      expect(updatedGame.field.isEmpty(2, 10)).toBe(true)
    })

    it('すでにぷよがある場合は、その上に落下する', () => {
      // Arrange
      let game = createGame()
      const bottomPuyo = createPuyo('blue', { x: 2, y: 11 })
      const topPuyo = createPuyo('red', { x: 2, y: 0 })
      
      // 最下部にぷよを配置
      game = dropPuyo(game, bottomPuyo, 2)

      // Act
      const updatedGame = dropPuyo(game, topPuyo, 2)

      // Assert
      expect(updatedGame.field.getPuyo(2, 11)).toBe(bottomPuyo)
      expect(updatedGame.field.getPuyo(2, 10)).toBe(topPuyo)
    })

    it.skip('列が満杯の場合はゲームオーバーになる', () => {
      // Arrange
      let game = createGame()
      
      // 列を満杯にする - dropPuyo関数を使ってイミュータブルに
      for (let y = 0; y < 12; y++) {
        const puyo = createPuyo('red', { x: 2, y })
        game = dropPuyo(game, puyo, 2)
        // ゲームオーバーになったらループを抜ける
        if (game.state === 'gameOver') {
          break
        }
      }

      // この時点でゲームオーバーになっているはず（列が満杯）
      // Assert
      expect(game.state).toBe('gameOver')
    })
  })

  describe('updateGameState', () => {
    it('ゲーム状態を更新できる', () => {
      // Arrange
      const game = createGame()
      const originalUpdatedAt = game.updatedAt

      // Act
      // 時間差を作るために少し待つ
      const updatedGame = updateGameState(game, 'playing')

      // Assert
      expect(updatedGame.state).toBe('playing')
      expect(updatedGame.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      )
    })

    it('元のゲームオブジェクトは変更されない（イミュータブル）', () => {
      // Arrange
      const originalGame = createGame()
      const originalState = originalGame.state

      // Act
      const updatedGame = updateGameState(originalGame, 'paused')

      // Assert
      expect(originalGame.state).toBe(originalState)
      expect(updatedGame).not.toBe(originalGame)
    })
  })

  describe('updateScore', () => {
    it('スコアを更新できる', () => {
      // Arrange
      const game = createGame()
      const newScore = 1500

      // Act
      const updatedGame = updateScore(game, newScore)

      // Assert
      expect(updatedGame.score).toBe(newScore)
    })

    it('updatedAtが更新される', () => {
      // Arrange
      const game = createGame()
      const originalUpdatedAt = game.updatedAt

      // Act
      const updatedGame = updateScore(game, 1000)

      // Assert
      expect(updatedGame.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      )
    })

    it('元のゲームオブジェクトは変更されない（イミュータブル）', () => {
      // Arrange
      const originalGame = createGame()
      const originalScore = originalGame.score

      // Act
      const updatedGame = updateScore(originalGame, 2000)

      // Assert
      expect(originalGame.score).toBe(originalScore)
      expect(updatedGame).not.toBe(originalGame)
    })
  })
})
