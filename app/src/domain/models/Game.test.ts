import { describe, expect, it } from 'vitest'

import { 
  createGame, 
  dropPuyo, 
  updateGameState, 
  updateScore,
  movePuyoLeft,
  movePuyoRight,
  dropPuyoFast,
  rotatePuyo
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
      expect(game.currentPuyo).toBeNull()
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

  describe('ぷよ移動・回転ロジック', () => {
    describe('movePuyoLeft関数', () => {
      it('左に移動できる場合は移動する', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 2, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = movePuyoLeft(gameWithPuyo)

        // Assert
        expect(result.currentPuyo).toBeDefined()
        expect(result.currentPuyo?.position.x).toBe(1)
        expect(result.currentPuyo?.position.y).toBe(10)
        expect(result.currentPuyo?.color).toBe('red')
      })

      it('左端にいる場合は移動しない', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 0, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = movePuyoLeft(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(0)
        expect(result.currentPuyo?.position.y).toBe(10)
      })

      it('左にぷよがある場合は移動しない', () => {
        // Arrange
        const game = createGame()
        const bluePuyo = createPuyo('blue', { x: 1, y: 10 })
        game.field.setPuyo(1, 10, bluePuyo)
        
        const redPuyo = createPuyo('red', { x: 2, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = movePuyoLeft(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(2)
        expect(result.currentPuyo?.position.y).toBe(10)
      })
    })

    describe('movePuyoRight関数', () => {
      it('右に移動できる場合は移動する', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 2, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = movePuyoRight(gameWithPuyo)

        // Assert
        expect(result.currentPuyo).toBeDefined()
        expect(result.currentPuyo?.position.x).toBe(3)
        expect(result.currentPuyo?.position.y).toBe(10)
        expect(result.currentPuyo?.color).toBe('red')
      })

      it('右端にいる場合は移動しない', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 5, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = movePuyoRight(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(5)
        expect(result.currentPuyo?.position.y).toBe(10)
      })

      it('右にぷよがある場合は移動しない', () => {
        // Arrange
        const game = createGame()
        const bluePuyo = createPuyo('blue', { x: 3, y: 10 })
        game.field.setPuyo(3, 10, bluePuyo)
        
        const redPuyo = createPuyo('red', { x: 2, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = movePuyoRight(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(2)
        expect(result.currentPuyo?.position.y).toBe(10)
      })
    })

    describe('dropPuyoFast関数', () => {
      it('高速落下でぷよが1つ下に移動する', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 2, y: 8 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = dropPuyoFast(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(2)
        expect(result.currentPuyo?.position.y).toBe(9)
      })

      it('下にぷよがある場合は移動しない', () => {
        // Arrange
        const game = createGame()
        const bluePuyo = createPuyo('blue', { x: 2, y: 9 })
        game.field.setPuyo(2, 9, bluePuyo)
        
        const redPuyo = createPuyo('red', { x: 2, y: 8 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = dropPuyoFast(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(2)
        expect(result.currentPuyo?.position.y).toBe(8)
      })

      it('最下段にいる場合は移動しない', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 2, y: 11 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = dropPuyoFast(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(2)
        expect(result.currentPuyo?.position.y).toBe(11)
      })
    })

    describe('rotatePuyo関数', () => {
      it('ぷよの色を次の色に回転する', () => {
        // Arrange
        const game = createGame()
        const redPuyo = createPuyo('red', { x: 2, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: redPuyo }

        // Act
        const result = rotatePuyo(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.position.x).toBe(2)
        expect(result.currentPuyo?.position.y).toBe(10)
        expect(result.currentPuyo?.color).toBe('blue')
      })

      it('紫の次は赤に戻る', () => {
        // Arrange
        const game = createGame()
        const purplePuyo = createPuyo('purple', { x: 2, y: 10 })
        const gameWithPuyo = { ...game, currentPuyo: purplePuyo }

        // Act
        const result = rotatePuyo(gameWithPuyo)

        // Assert
        expect(result.currentPuyo?.color).toBe('red')
      })

      it('currentPuyoがnullの場合は何もしない', () => {
        // Arrange
        const game = createGame()

        // Act
        const result = rotatePuyo(game)

        // Assert
        expect(result.currentPuyo).toBeNull()
      })
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
