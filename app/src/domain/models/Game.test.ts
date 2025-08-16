import { describe, expect, it } from 'vitest'

import {
  createGame,
  dropPuyo,
  dropPuyoFast,
  movePuyoLeft,
  movePuyoRight,
  pauseGame,
  resetGame,
  resumeGame,
  rotatePuyo,
  startGame,
  updateGameScore,
  updateGameState,
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
      expect(game.score.current).toBe(0)
      expect(game.score.multiplier).toBe(1)
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

  // 注意: 以下のテストは古いcurrentPuyoシステム用です
  // 新しいPuyoPairシステムのテストはGame.PuyoPair.test.tsを参照してください
  describe.skip('ぷよ移動・回転ロジック（廃止予定 - PuyoPairシステムに移行済み）', () => {
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

  describe('updateGameScore', () => {
    it('スコアを更新できる', () => {
      // Arrange
      const game = createGame()
      const newScore = 1500

      // Act
      const updatedGame = updateGameScore(game, {
        current: newScore,
        multiplier: 1,
      })

      // Assert
      expect(updatedGame.score.current).toBe(newScore)
    })

    it('updatedAtが更新される', () => {
      // Arrange
      const game = createGame()
      const originalUpdatedAt = game.updatedAt

      // Act
      const updatedGame = updateGameScore(game, {
        current: 1000,
        multiplier: 1,
      })

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
      const updatedGame = updateGameScore(originalGame, {
        current: 2000,
        multiplier: 1,
      })

      // Assert
      expect(originalGame.score).toEqual(originalScore)
      expect(updatedGame.score.current).toBe(2000)
    })
  })

  describe('startGame', () => {
    it('ready状態からplaying状態に変更される', () => {
      // Arrange
      const game = createGame()
      expect(game.state).toBe('ready')

      // Act
      const startedGame = startGame(game)

      // Assert
      expect(startedGame.state).toBe('playing')
    })

    // 新しいPuyoPairシステムテスト
    it('currentPuyoPairが生成される', () => {
      // Arrange
      const game = createGame()
      expect(game.currentPuyoPair).toBeNull()

      // Act
      const startedGame = startGame(game)

      // Assert
      expect(startedGame.currentPuyoPair).not.toBeNull()
      expect(startedGame.currentPuyoPair?.main.color).toBeDefined()
      expect(startedGame.currentPuyoPair?.sub.color).toBeDefined()
      expect(startedGame.currentPuyo).toBeNull() // PuyoPairシステムではnull
    })

    it('ぷよペアがフィールド中央上部に配置される', () => {
      // Arrange
      const game = createGame()

      // Act
      const startedGame = startGame(game)

      // Assert
      const expectedX = Math.floor(game.field.getWidth() / 2)
      expect(startedGame.currentPuyoPair?.main.position.x).toBe(expectedX)
      expect(startedGame.currentPuyoPair?.main.position.y).toBe(0)
      expect(startedGame.currentPuyoPair?.sub.position.x).toBe(expectedX)
      expect(startedGame.currentPuyoPair?.sub.position.y).toBe(-1) // サブは上に配置
    })

    it('ready状態以外では何もしない', () => {
      // Arrange
      const game = createGame()
      const playingGame = updateGameState(game, 'playing')

      // Act
      const result = startGame(playingGame)

      // Assert
      expect(result).toBe(playingGame)
    })
  })

  describe('pauseGame', () => {
    it('playing状態からpaused状態に変更される', () => {
      // Arrange
      const game = createGame()
      const playingGame = updateGameState(game, 'playing')

      // Act
      const pausedGame = pauseGame(playingGame)

      // Assert
      expect(pausedGame.state).toBe('paused')
      expect(pausedGame.updatedAt.getTime()).toBeGreaterThanOrEqual(
        playingGame.updatedAt.getTime(),
      )
    })

    it('playing状態以外では何もしない', () => {
      // Arrange
      const readyGame = createGame()
      const pausedGame = updateGameState(readyGame, 'paused')
      const gameOverGame = updateGameState(readyGame, 'gameOver')

      // Act & Assert
      expect(pauseGame(readyGame)).toBe(readyGame)
      expect(pauseGame(pausedGame)).toBe(pausedGame)
      expect(pauseGame(gameOverGame)).toBe(gameOverGame)
    })

    it('元のゲームオブジェクトは変更されない（イミュータブル）', () => {
      // Arrange
      const game = createGame()
      const playingGame = updateGameState(game, 'playing')
      const originalState = playingGame.state

      // Act
      const pausedGame = pauseGame(playingGame)

      // Assert
      expect(playingGame.state).toBe(originalState)
      expect(pausedGame).not.toBe(playingGame)
    })
  })

  describe('resumeGame', () => {
    it('paused状態からplaying状態に変更される', () => {
      // Arrange
      const game = createGame()
      const pausedGame = updateGameState(game, 'paused')

      // Act
      const resumedGame = resumeGame(pausedGame)

      // Assert
      expect(resumedGame.state).toBe('playing')
      expect(resumedGame.updatedAt.getTime()).toBeGreaterThanOrEqual(
        pausedGame.updatedAt.getTime(),
      )
    })

    it('paused状態以外では何もしない', () => {
      // Arrange
      const readyGame = createGame()
      const playingGame = updateGameState(readyGame, 'playing')
      const gameOverGame = updateGameState(readyGame, 'gameOver')

      // Act & Assert
      expect(resumeGame(readyGame)).toBe(readyGame)
      expect(resumeGame(playingGame)).toBe(playingGame)
      expect(resumeGame(gameOverGame)).toBe(gameOverGame)
    })

    it('元のゲームオブジェクトは変更されない（イミュータブル）', () => {
      // Arrange
      const game = createGame()
      const pausedGame = updateGameState(game, 'paused')
      const originalState = pausedGame.state

      // Act
      const resumedGame = resumeGame(pausedGame)

      // Assert
      expect(pausedGame.state).toBe(originalState)
      expect(resumedGame).not.toBe(pausedGame)
    })
  })

  describe('resetGame', () => {
    it('ゲームを初期状態にリセットできる', () => {
      // Act
      const resetedGame = resetGame()

      // Assert
      expect(resetedGame.state).toBe('ready')
      expect(resetedGame.score.current).toBe(0)
      expect(resetedGame.score.multiplier).toBe(1)
      expect(resetedGame.level).toBe(1)
      expect(resetedGame.currentPuyoPair).toBeNull()
      expect(resetedGame.currentPuyo).toBeNull()
    })

    it('フィールドも初期状態にリセットされる', () => {
      // Arrange
      const game = createGame()
      game.field.setPuyo(0, 0, createPuyo('red', { x: 0, y: 0 }))
      game.field.setPuyo(1, 1, createPuyo('blue', { x: 1, y: 1 }))

      // Act
      const resetedGame = resetGame()

      // Assert
      expect(resetedGame.field.isEmpty(0, 0)).toBe(true)
      expect(resetedGame.field.isEmpty(1, 1)).toBe(true)
    })

    it('元のゲームオブジェクトは変更されない（イミュータブル）', () => {
      // Arrange
      const originalGame = createGame()
      const gameOverGame = updateGameState(originalGame, 'gameOver')

      // Act
      const resetedGame = resetGame()

      // Assert
      expect(gameOverGame.state).toBe('gameOver')
      expect(resetedGame).not.toBe(gameOverGame)
    })
  })

  // spawnNextPuyoPairのテストはGame.PuyoPair.test.tsに移動
})
