import { describe, expect, it } from 'vitest'

import { placePuyoAt } from './Field.ts'
import {
  createGame,
  dropPuyoFast,
  movePuyoLeft,
  movePuyoRight,
  rotatePuyo,
  spawnNextPuyoPair,
  startGame,
} from './Game'

describe('Game PuyoPair System', () => {
  describe('startGame', () => {
    it('ゲームを開始してPuyoPairが生成される', () => {
      // Arrange
      const game = createGame()
      expect(game.state).toBe('ready')
      expect(game.currentPuyoPair).toBeNull()

      // Act
      const startedGame = startGame(game)

      // Assert
      expect(startedGame.state).toBe('playing')
      expect(startedGame.currentPuyoPair).not.toBeNull()
      expect(startedGame.currentPuyoPair?.main.color).toBeDefined()
      expect(startedGame.currentPuyoPair?.sub.color).toBeDefined()
      expect(startedGame.currentPuyo).toBeNull() // PuyoPairを使う場合はnull
    })

    it('PuyoPairがフィールド中央上部に配置される', () => {
      // Arrange
      const game = createGame()

      // Act
      const startedGame = startGame(game)

      // Assert
      const expectedX = Math.floor(game.field.width / 2)
      expect(startedGame.currentPuyoPair?.main.position.x).toBe(expectedX)
      expect(startedGame.currentPuyoPair?.main.position.y).toBe(0)
      expect(startedGame.currentPuyoPair?.sub.position.x).toBe(expectedX)
      expect(startedGame.currentPuyoPair?.sub.position.y).toBe(-1) // サブは上に配置
    })

    it('ready状態以外では何もしない', () => {
      // Arrange
      const game = createGame()
      const playingGame = { ...game, state: 'playing' as const }

      // Act
      const result = startGame(playingGame)

      // Assert
      expect(result).toBe(playingGame)
    })
  })

  describe('movePuyoLeft', () => {
    it('PuyoPairが左に移動できる場合は移動する', () => {
      // Arrange
      const game = createGame()
      const startedGame = startGame(game)
      const originalX = startedGame.currentPuyoPair!.main.position.x

      // Act
      const result = movePuyoLeft(startedGame)

      // Assert
      expect(result.currentPuyoPair?.main.position.x).toBe(originalX - 1)
      expect(result.currentPuyoPair?.sub.position.x).toBe(originalX - 1)
    })

    it('左端にいる場合は移動しない', () => {
      // Arrange
      const game = createGame()
      let startedGame = startGame(game)

      // 左端まで移動
      while (startedGame.currentPuyoPair!.main.position.x > 0) {
        startedGame = movePuyoLeft(startedGame)
      }

      const originalX = startedGame.currentPuyoPair!.main.position.x

      // Act
      const result = movePuyoLeft(startedGame)

      // Assert
      expect(result.currentPuyoPair?.main.position.x).toBe(originalX)
      expect(result.currentPuyoPair?.sub.position.x).toBe(originalX)
    })

    it('currentPuyoPairがnullの場合は何もしない', () => {
      // Arrange
      const game = createGame()

      // Act
      const result = movePuyoLeft(game)

      // Assert
      expect(result).toBe(game)
    })
  })

  describe('movePuyoRight', () => {
    it('PuyoPairが右に移動できる場合は移動する', () => {
      // Arrange
      const game = createGame()
      const startedGame = startGame(game)
      const originalX = startedGame.currentPuyoPair!.main.position.x

      // Act
      const result = movePuyoRight(startedGame)

      // Assert
      expect(result.currentPuyoPair?.main.position.x).toBe(originalX + 1)
      expect(result.currentPuyoPair?.sub.position.x).toBe(originalX + 1)
    })

    it('右端にいる場合は移動しない', () => {
      // Arrange
      const game = createGame()
      let startedGame = startGame(game)

      // 右端まで移動
      while (
        startedGame.currentPuyoPair!.main.position.x <
        game.field.width - 1
      ) {
        startedGame = movePuyoRight(startedGame)
      }

      const originalX = startedGame.currentPuyoPair!.main.position.x

      // Act
      const result = movePuyoRight(startedGame)

      // Assert
      expect(result.currentPuyoPair?.main.position.x).toBe(originalX)
      expect(result.currentPuyoPair?.sub.position.x).toBe(originalX)
    })
  })

  describe('dropPuyoFast', () => {
    it('PuyoPairが1つ下に移動する', () => {
      // Arrange
      const game = createGame()
      const startedGame = startGame(game)
      const originalY = startedGame.currentPuyoPair!.main.position.y

      // Act
      const result = dropPuyoFast(startedGame)

      // Assert
      expect(result.currentPuyoPair?.main.position.y).toBe(originalY + 1)
      expect(result.currentPuyoPair?.sub.position.y).toBe(originalY) // サブは元々-1なので0になる
    })

    it('最下段にいる場合は移動しない', () => {
      // Arrange
      const game = createGame()
      let startedGame = startGame(game)

      // 最下段まで移動
      while (
        startedGame.currentPuyoPair!.main.position.y <
        game.field.height - 1
      ) {
        startedGame = dropPuyoFast(startedGame)
      }

      const originalY = startedGame.currentPuyoPair!.main.position.y

      // Act
      const result = dropPuyoFast(startedGame)

      // Assert
      expect(result.currentPuyoPair?.main.position.y).toBe(originalY)
    })
  })

  describe('rotatePuyo', () => {
    it('PuyoPairが時計回りに回転する', () => {
      // Arrange
      const game = createGame()
      const startedGame = startGame(game)
      const originalMainX = startedGame.currentPuyoPair!.main.position.x
      const originalMainY = startedGame.currentPuyoPair!.main.position.y

      // Act
      const result = rotatePuyo(startedGame)

      // Assert
      // メインぷよの位置は変わらない
      expect(result.currentPuyoPair?.main.position.x).toBe(originalMainX)
      expect(result.currentPuyoPair?.main.position.y).toBe(originalMainY)

      // サブぷよがメインぷよの右に移動する（上→右→下→左の順）
      expect(result.currentPuyoPair?.sub.position.x).toBe(originalMainX + 1)
      expect(result.currentPuyoPair?.sub.position.y).toBe(originalMainY)
    })
  })

  describe('spawnNextPuyoPair', () => {
    it('新しいPuyoPairを生成する', () => {
      // Arrange
      const game = createGame()

      // Act
      const gameWithPuyoPair = spawnNextPuyoPair(game)

      // Assert
      expect(gameWithPuyoPair.currentPuyoPair).not.toBeNull()
      expect(gameWithPuyoPair.currentPuyoPair?.main.color).toBeDefined()
      expect(gameWithPuyoPair.currentPuyoPair?.sub.color).toBeDefined()
      expect(gameWithPuyoPair.currentPuyo).toBeNull()
    })

    it('生成位置が占有されている場合はゲームオーバーになる', () => {
      // Arrange
      const game = createGame()
      const centerX = Math.floor(game.field.width / 2)
      const blockingPuyo = {
        color: 'red' as const,
        position: { x: centerX, y: 0 },
        id: 'test-puyo',
      }
      const updatedField = placePuyoAt(
        { x: centerX, y: 0 },
        blockingPuyo,
        game.field,
      )
      const gameWithBlockedField = { ...game, field: updatedField }

      // Act
      const result = spawnNextPuyoPair(gameWithBlockedField)

      // Assert
      expect(result.state).toBe('gameOver')
      expect(result.currentPuyoPair).toBeNull()
      expect(result.currentPuyo).toBeNull()
    })
  })
})
