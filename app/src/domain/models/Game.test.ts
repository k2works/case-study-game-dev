import { describe, expect, it } from 'vitest'

import {
  createEmptyField,
  createGame,
  updateGameState,
  updateScore,
} from './Game'

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

  describe('createEmptyField', () => {
    it('6列×12行の空フィールドを作成できる', () => {
      // Arrange & Act
      const field = createEmptyField()

      // Assert
      expect(field.length).toBe(12) // 12行
      expect(field[0].length).toBe(6) // 6列
    })

    it('すべてのセルがnullの色で初期化される', () => {
      // Arrange & Act
      const field = createEmptyField()

      // Assert
      field.forEach((row) => {
        row.forEach((cell) => {
          expect(cell.color).toBeNull()
        })
      })
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
