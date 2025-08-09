import { describe, it, expect, beforeEach } from 'vitest'
import { GameUseCase } from './GameUseCase'

describe('GameUseCase', () => {
  let useCase: GameUseCase

  beforeEach(() => {
    useCase = new GameUseCase()
  })

  describe('ゲーム開始機能', () => {
    it('新しいゲームを開始できる', () => {
      // Arrange
      // Act
      useCase.startNewGame()

      // Assert
      expect(useCase.getGameState()).toBe('playing')
      expect(useCase.getScore().current).toBe(0)
    })

    it('ゲームをリスタートできる', () => {
      // Arrange
      useCase.startNewGame()
      useCase.moveDown()

      // Act
      useCase.restartGame()

      // Assert
      expect(useCase.getGameState()).toBe('playing')
      expect(useCase.getScore().current).toBe(0)
    })
  })

  describe('ゲーム制御機能', () => {
    beforeEach(() => {
      useCase.startNewGame()
    })

    it('ゲームを一時停止できる', () => {
      // Arrange
      // Act
      useCase.pauseGame()

      // Assert
      expect(useCase.getGameState()).toBe('paused')
      expect(useCase.isPaused()).toBe(true)
    })

    it('一時停止したゲームを再開できる', () => {
      // Arrange
      useCase.pauseGame()

      // Act
      useCase.resumeGame()

      // Assert
      expect(useCase.getGameState()).toBe('playing')
      expect(useCase.isPlaying()).toBe(true)
    })

    it('togglePauseで一時停止と再開を切り替えられる', () => {
      // Arrange
      const initialState = useCase.getGameState()

      // Act
      useCase.togglePause()
      const pausedState = useCase.getGameState()

      useCase.togglePause()
      const resumedState = useCase.getGameState()

      // Assert
      expect(initialState).toBe('playing')
      expect(pausedState).toBe('paused')
      expect(resumedState).toBe('playing')
    })
  })

  describe('ぷよ操作機能', () => {
    beforeEach(() => {
      useCase.startNewGame()
    })

    it('ぷよを左に移動できる', () => {
      // Arrange
      const initialPair = useCase.getCurrentPair()
      const initialX = initialPair?.x || 0

      // Act
      const result = useCase.moveLeft()

      // Assert
      expect(result).toBe(true)
      const currentPair = useCase.getCurrentPair()
      expect(currentPair?.x).toBe(initialX - 1)
    })

    it('ぷよを右に移動できる', () => {
      // Arrange
      const initialPair = useCase.getCurrentPair()
      const initialX = initialPair?.x || 0

      // Act
      const result = useCase.moveRight()

      // Assert
      expect(result).toBe(true)
      const currentPair = useCase.getCurrentPair()
      expect(currentPair?.x).toBe(initialX + 1)
    })

    it('ぷよを回転できる', () => {
      // Arrange
      const initialPair = useCase.getCurrentPair()
      const initialRotation = initialPair?.rotation || 0

      // Act
      const result = useCase.rotate()

      // Assert
      expect(result).toBe(true)
      const currentPair = useCase.getCurrentPair()
      expect(currentPair?.rotation).toBe((initialRotation + 90) % 360)
    })

    it('ぷよを下に移動できる', () => {
      // Arrange
      const initialPair = useCase.getCurrentPair()
      const initialY = initialPair?.y || 0

      // Act
      const result = useCase.moveDown()

      // Assert
      expect(result).toBe(true)
      const currentPair = useCase.getCurrentPair()
      expect(currentPair?.y).toBe(initialY + 1)
    })

    it('ぷよをハードドロップできる', () => {
      // Arrange
      const initialPair = useCase.getCurrentPair()

      // Act
      useCase.hardDrop()

      // Assert
      const currentPair = useCase.getCurrentPair()
      // ハードドロップ後は新しいぷよが生成される
      expect(currentPair).not.toEqual(initialPair)
    })
  })

  describe('ゲーム状態取得機能', () => {
    beforeEach(() => {
      useCase.startNewGame()
    })

    it('フィールドの状態を取得できる', () => {
      // Arrange
      // Act
      const grid = useCase.getFieldGrid()

      // Assert
      expect(Array.isArray(grid)).toBe(true)
      expect(grid.length).toBeGreaterThan(0)
    })

    it('現在のぷよペアを取得できる', () => {
      // Arrange
      // Act
      const pair = useCase.getCurrentPair()

      // Assert
      expect(pair).not.toBeNull()
      expect(pair?.main).toBeDefined()
      expect(pair?.sub).toBeDefined()
    })

    it('次のぷよペアを取得できる', () => {
      // Arrange
      // Act
      const nextPairs = useCase.getNextPairs()

      // Assert
      expect(Array.isArray(nextPairs)).toBe(true)
      expect(nextPairs.length).toBeGreaterThan(0)
    })

    it('スコアを取得できる', () => {
      // Arrange
      // Act
      const score = useCase.getScore()

      // Assert
      expect(score).toBeDefined()
      expect(score.current).toBe(0)
      expect(score.chains).toBe(0)
    })

    it('ゲーム設定を取得できる', () => {
      // Arrange
      // Act
      const config = useCase.getConfig()

      // Assert
      expect(config).toBeDefined()
      expect(config.width).toBe(6)
      expect(config.height).toBe(13)
    })
  })

  describe('ゲーム更新処理', () => {
    beforeEach(() => {
      useCase.startNewGame()
    })

    it('update処理が実行できる', () => {
      // Arrange
      const initialState = useCase.getGameState()

      // Act
      useCase.update(100)

      // Assert
      // updateメソッドが例外なく実行される
      expect(useCase.getGameState()).toBe(initialState)
    })
  })

  describe('ゲーム状態判定機能', () => {
    it('プレイ中の判定が正しく動作する', () => {
      // Arrange
      useCase.startNewGame()

      // Act & Assert
      expect(useCase.isPlaying()).toBe(true)
      expect(useCase.isPaused()).toBe(false)
      expect(useCase.isGameOver()).toBe(false)
    })

    it('一時停止中の判定が正しく動作する', () => {
      // Arrange
      useCase.startNewGame()
      useCase.pauseGame()

      // Act & Assert
      expect(useCase.isPlaying()).toBe(false)
      expect(useCase.isPaused()).toBe(true)
      expect(useCase.isGameOver()).toBe(false)
    })
  })
})
