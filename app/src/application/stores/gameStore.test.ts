import { beforeEach, describe, expect, it } from 'vitest'

import { act, renderHook } from '@testing-library/react'

import { createGame } from '../../domain/models/Game'
import { createPuyo } from '../../domain/models/Puyo'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useGameStore.getState().resetGame()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      // Arrange & Act
      const { result } = renderHook(() => useGameStore())

      // Assert
      expect(result.current.game).toBeDefined()
      expect(result.current.game.state).toBe('ready')
      expect(result.current.game.score).toBe(0)
      expect(result.current.game.level).toBe(1)
      expect(result.current.currentPuyo).toBeNull()
      expect(result.current.score).toBe(0)
      expect(result.current.isGameOver).toBe(false)
      expect(result.current.isPaused).toBe(false)
    })
  })

  describe('ゲーム初期化', () => {
    it('ゲームを初期化できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())

      // Act
      act(() => {
        result.current.initializeGame()
      })

      // Assert
      expect(result.current.game).toBeDefined()
      expect(result.current.game.state).toBe('ready')
      expect(result.current.isGameOver).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.score).toBe(0)
    })
  })

  describe('ゲーム状態管理', () => {
    it('ゲームを一時停止できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())

      // Act
      act(() => {
        result.current.pauseGame()
      })

      // Assert
      expect(result.current.isPaused).toBe(true)
    })

    it('ゲームを再開できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())
      act(() => {
        result.current.pauseGame()
      })

      // Act
      act(() => {
        result.current.resumeGame()
      })

      // Assert
      expect(result.current.isPaused).toBe(false)
    })

    it('ゲームオーバー状態を設定できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())

      // Act
      act(() => {
        result.current.setGameOver(true)
      })

      // Assert
      expect(result.current.isGameOver).toBe(true)
    })
  })

  describe('スコア管理', () => {
    it('スコアを更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())
      const newScore = 1000

      // Act
      act(() => {
        result.current.updateScore(newScore)
      })

      // Assert
      expect(result.current.score).toBe(newScore)
    })
  })

  describe('ゲーム更新', () => {
    it('ゲームを更新できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())
      const newGame = createGame()

      // Act
      act(() => {
        result.current.updateGame(newGame)
      })

      // Assert
      expect(result.current.game.id).toBe(newGame.id)
    })
  })

  describe('ぷよ管理', () => {
    it('現在のぷよを設定できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())
      const puyo = createPuyo('red', { x: 2, y: 10 })

      // Act
      act(() => {
        result.current.setCurrentPuyo(puyo)
      })

      // Assert
      expect(result.current.currentPuyo).toEqual(puyo)
    })

    it('現在のぷよをnullに設定できる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())
      const puyo = createPuyo('blue', { x: 1, y: 5 })
      act(() => {
        result.current.setCurrentPuyo(puyo)
      })

      // Act
      act(() => {
        result.current.setCurrentPuyo(null)
      })

      // Assert
      expect(result.current.currentPuyo).toBeNull()
    })
  })

  describe('ゲームリセット', () => {
    it('ゲームをリセットできる', () => {
      // Arrange
      const { result } = renderHook(() => useGameStore())
      act(() => {
        result.current.updateScore(5000)
        result.current.setGameOver(true)
        result.current.pauseGame()
      })

      // Act
      act(() => {
        result.current.resetGame()
      })

      // Assert
      expect(result.current.game).toBeDefined()
      expect(result.current.game.state).toBe('ready')
      expect(result.current.score).toBe(0)
      expect(result.current.isGameOver).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.currentPuyo).toBeNull()
    })
  })
})
