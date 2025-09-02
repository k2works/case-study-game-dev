/**
 * GameApplicationServiceのテスト
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createGame } from '../../domain/models/Game'
import type { GameAction } from '../ports/GamePort'
import type { StoragePort } from '../ports/StoragePort'
import type { TimerId, TimerPort } from '../ports/TimerPort'
import type { GameViewModel } from '../viewmodels/GameViewModel'
import { GameApplicationService } from './GameApplicationService'

// StoragePortのモック
const createMockStoragePort = (): StoragePort => ({
  save: vi.fn().mockResolvedValue(undefined),
  load: vi.fn().mockResolvedValue(null),
  remove: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
})

// TimerPortのモック
const createMockTimerPort = (): TimerPort => ({
  startInterval: vi.fn().mockReturnValue('timer-id-1' as TimerId),
  stopTimer: vi.fn(),
  setTimeout: vi.fn().mockReturnValue('timeout-id-1' as TimerId),
})

describe('GameApplicationService', () => {
  let gameService: GameApplicationService
  let mockStorage: StoragePort
  let mockTimer: TimerPort

  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage = createMockStoragePort()
    mockTimer = createMockTimerPort()
    gameService = new GameApplicationService(mockStorage, mockTimer)
  })

  describe('ゲーム作成', () => {
    it('準備状態のゲームを作成できる', () => {
      // Act
      const result = gameService.createReadyGame()

      // Assert
      expect(result).toBeDefined()
      expect(result.state).toBe('ready')
      expect(result.id).toBeDefined()
      expect(mockStorage.save).toHaveBeenCalledWith(
        'current-game',
        expect.any(Object),
      )
    })

    it('新しいゲームを開始できる', () => {
      // Act
      const result = gameService.startNewGame()

      // Assert
      expect(result).toBeDefined()
      expect(result.state).toBe('playing')
      expect(result.currentPuyoPair).toBeDefined()
      expect(mockTimer.startInterval).toHaveBeenCalledWith(
        expect.any(Function),
        1000,
      )
      expect(mockStorage.save).toHaveBeenCalledWith(
        'current-game',
        expect.any(Object),
      )
    })

    it('新しいゲーム開始時に既存タイマーを停止する', () => {
      // Arrange
      gameService.startNewGame() // 最初のゲームを開始

      // Act
      gameService.startNewGame() // 2回目のゲーム開始

      // Assert
      expect(mockTimer.stopTimer).toHaveBeenCalledWith('timer-id-1')
    })
  })

  describe('ゲーム状態管理', () => {
    it('現在のゲーム状態を取得できる', () => {
      // Arrange
      gameService.createReadyGame()

      // Act
      const currentGame = gameService.getCurrentGame()

      // Assert
      expect(currentGame).toBeDefined()
      expect(currentGame?.state).toBe('ready')
    })

    it('初期状態では現在のゲームがnull', () => {
      // Act
      const currentGame = gameService.getCurrentGame()

      // Assert
      expect(currentGame).toBeNull()
    })
  })

  describe('ゲーム状態復元', () => {
    it('保存されたゲーム状態を復元できる', async () => {
      // Arrange
      const savedGame = createGame()
      mockStorage.load = vi.fn().mockResolvedValue(savedGame)

      // Act
      const restoredGame = await gameService.restoreGame()

      // Assert
      expect(restoredGame).toEqual(savedGame)
      expect(mockStorage.load).toHaveBeenCalledWith('current-game')
    })

    it('実行中のゲーム復元時にタイマーを再開する', async () => {
      // Arrange
      const playingGame = { ...createGame(), state: 'playing' as const }
      mockStorage.load = vi.fn().mockResolvedValue(playingGame)

      // Act
      await gameService.restoreGame()

      // Assert
      expect(mockTimer.startInterval).toHaveBeenCalled()
    })

    it('復元に失敗した場合はnullを返す', async () => {
      // Arrange
      mockStorage.load = vi.fn().mockRejectedValue(new Error('Load failed'))

      // Act
      const restoredGame = await gameService.restoreGame()

      // Assert
      expect(restoredGame).toBeNull()
    })

    it('保存されたゲームが存在しない場合はnullを返す', async () => {
      // Arrange
      mockStorage.load = vi.fn().mockResolvedValue(null)

      // Act
      const restoredGame = await gameService.restoreGame()

      // Assert
      expect(restoredGame).toBeNull()
    })
  })

  describe('ゲーム状態検証', () => {
    let validGameViewModel: GameViewModel

    beforeEach(() => {
      validGameViewModel = gameService.createReadyGame()
    })

    it('有効なゲーム状態を検証できる', () => {
      // Act
      const result = gameService.validateGameState(validGameViewModel)

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('IDが不足している場合にエラーを返す', () => {
      // Arrange
      const invalidGame = { ...validGameViewModel, id: '' }

      // Act
      const result = gameService.validateGameState(invalidGame)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Game ID is missing')
    })

    it('playing状態でcurrentPuyoPairが不足している場合にエラーを返す', () => {
      // Arrange
      const invalidGame = {
        ...validGameViewModel,
        state: 'playing' as const,
        currentPuyoPair: null,
      }

      // Act
      const result = gameService.validateGameState(invalidGame)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Playing game must have a current puyo pair',
      )
    })

    it('負のスコアの場合にエラーを返す', () => {
      // Arrange
      const invalidGame = {
        ...validGameViewModel,
        score: { current: -100, best: 0 },
      }

      // Act
      const result = gameService.validateGameState(invalidGame)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Score cannot be negative')
    })

    it('レベルが1未満の場合にエラーを返す', () => {
      // Arrange
      const invalidGame = {
        ...validGameViewModel,
        level: 0,
      }

      // Act
      const result = gameService.validateGameState(invalidGame)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Level must be at least 1')
    })

    it('フィールドが存在しない場合にエラーを返す', () => {
      // Arrange
      const invalidGame = {
        ...validGameViewModel,
        field: null as unknown,
      }

      // Act
      const result = gameService.validateGameState(invalidGame)

      // Assert
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Game field is missing')
    })

    it('非標準フィールドサイズの場合に警告を返す', () => {
      // Arrange
      const gameWithNonStandardField = {
        ...validGameViewModel,
        field: { width: 8, height: 16, cells: [] },
      }

      // Act
      const result = gameService.validateGameState(gameWithNonStandardField)

      // Assert
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Field width is not standard (6)')
      expect(result.warnings).toContain('Field height is not standard (12)')
    })
  })

  describe('アクション適用', () => {
    let gameViewModel: GameViewModel

    beforeEach(() => {
      gameViewModel = gameService.startNewGame()
    })

    it('MOVE_LEFTアクションを適用できる', () => {
      // Arrange
      const moveLeftAction: GameAction = { type: 'MOVE_LEFT' }

      // Act
      const result = gameService.updateGameState(gameViewModel, moveLeftAction)

      // Assert
      expect(result).toBeDefined()
      expect(mockStorage.save).toHaveBeenCalled()
    })

    it('MOVE_RIGHTアクションを適用できる', () => {
      // Arrange
      const moveRightAction: GameAction = { type: 'MOVE_RIGHT' }

      // Act
      const result = gameService.updateGameState(gameViewModel, moveRightAction)

      // Assert
      expect(result).toBeDefined()
      expect(mockStorage.save).toHaveBeenCalled()
    })

    it('ROTATEアクションを適用できる', () => {
      // Arrange
      const rotateAction: GameAction = { type: 'ROTATE' }

      // Act
      const result = gameService.updateGameState(gameViewModel, rotateAction)

      // Assert
      expect(result).toBeDefined()
      expect(mockStorage.save).toHaveBeenCalled()
    })

    it('DROPアクションを適用できる', () => {
      // Arrange
      const dropAction: GameAction = { type: 'DROP' }

      // Act
      const result = gameService.updateGameState(gameViewModel, dropAction)

      // Assert
      expect(result).toBeDefined()
      expect(mockStorage.save).toHaveBeenCalled()
    })

    it('PAUSEアクションを適用してタイマーを停止する', () => {
      // Arrange
      const pauseAction: GameAction = { type: 'PAUSE' }

      // Act
      const result = gameService.updateGameState(gameViewModel, pauseAction)

      // Assert
      expect(result).toBeDefined()
      expect(mockTimer.stopTimer).toHaveBeenCalled()
    })

    it('RESUMEアクションを適用してタイマーを再開する', () => {
      // Arrange
      const pauseAction: GameAction = { type: 'PAUSE' }
      const resumeAction: GameAction = { type: 'RESUME' }

      gameService.updateGameState(gameViewModel, pauseAction)
      vi.clearAllMocks()

      // Act
      const result = gameService.updateGameState(gameViewModel, resumeAction)

      // Assert
      expect(result).toBeDefined()
      expect(mockTimer.startInterval).toHaveBeenCalled()
    })

    it('RESTARTアクションを適用して新しいゲームを開始する', () => {
      // Arrange
      const restartAction: GameAction = { type: 'RESTART' }

      // Act
      const result = gameService.updateGameState(gameViewModel, restartAction)

      // Assert
      expect(result).toBeDefined()
      expect(result.state).toBe('ready')
      expect(mockTimer.stopTimer).toHaveBeenCalled()
      expect(mockStorage.save).toHaveBeenCalled()
    })

    it('QUITアクションを適用してゲームを終了する', () => {
      // Arrange
      const quitAction: GameAction = { type: 'QUIT' }

      // Act
      const result = gameService.updateGameState(gameViewModel, quitAction)

      // Assert
      expect(result.state).toBe('gameOver')
      expect(mockTimer.stopTimer).toHaveBeenCalled()
    })

    it('不明なアクションを適用しても状態が変更されない', () => {
      // Arrange
      const unknownAction = { type: 'UNKNOWN_ACTION' as never }

      // Act
      const result = gameService.updateGameState(gameViewModel, unknownAction)

      // Assert
      expect(result).toEqual(gameViewModel)
    })

    it('無効なゲーム状態の場合はアクションを適用しない', () => {
      // Arrange
      const invalidGame = { ...gameViewModel, id: '' }
      const moveAction: GameAction = { type: 'MOVE_LEFT' }

      // Act
      const result = gameService.updateGameState(invalidGame, moveAction)

      // Assert
      expect(result).toEqual(invalidGame)
    })

    it('ゲームオーバー時にタイマーを停止する', () => {
      // Arrange
      // まずゲームを開始してタイマーを設定
      gameService.startNewGame()
      vi.clearAllMocks()

      const playingGame = { ...gameViewModel, state: 'playing' as const }
      const quitAction: GameAction = { type: 'QUIT' }

      // Act
      gameService.updateGameState(playingGame, quitAction)

      // Assert
      expect(mockTimer.stopTimer).toHaveBeenCalled()
    })
  })

  describe('自動落下処理', () => {
    it('playing状態でない場合は処理しない', () => {
      // Arrange
      const readyGame = gameService.createReadyGame() // ready状態のゲーム作成

      // Act
      const result = gameService.processAutoFall(readyGame)

      // Assert
      expect(result.state).toBe('ready')
      expect(result.id).toBe(readyGame.id)
      // currentGameがready状態なので、そのまま返される
    })

    it('currentPuyoPairがない場合は処理しない', () => {
      // Arrange
      const readyGame = gameService.createReadyGame()

      // ready状態はcurrentPuyoPairがnullなので、そのまま返される
      // Act
      const result = gameService.processAutoFall(readyGame)

      // Assert
      expect(result.state).toBe('ready')
      expect(result.currentPuyoPair).toBeNull()
      expect(result.id).toBe(readyGame.id)
    })
  })

  describe('ぷよペア生成', () => {
    let gameViewModel: GameViewModel

    beforeEach(() => {
      gameViewModel = gameService.createReadyGame()
    })

    it('currentPuyoPairがない場合に新しいペアを生成する', () => {
      // Act
      const result = gameService.spawnNewPuyoPair(gameViewModel)

      // Assert
      expect(result).toBeDefined()
      expect(mockStorage.save).toHaveBeenCalled()
    })

    it('currentPuyoPairが既に存在する場合は変更しない', () => {
      // Arrange
      const gameWithPair = gameService.startNewGame()

      // Act
      const result = gameService.spawnNewPuyoPair(gameWithPair)

      // Assert
      expect(result).toEqual(gameWithPair)
    })
  })

  describe('ハイスコア管理', () => {
    it('ゲームオーバー時にハイスコアを更新する', async () => {
      // Arrange
      const gameViewModel = gameService.startNewGame()

      // 内部ゲーム状態を直接変更してハイスコアを設定
      const currentGame = gameService.getCurrentGame()
      if (currentGame) {
        currentGame.state = 'gameOver'
        currentGame.score.current = 5000
      }

      mockStorage.load = vi.fn().mockResolvedValue(2000) // 現在のハイスコア
      const moveAction: GameAction = { type: 'MOVE_LEFT' }

      // Act
      gameService.updateGameState(gameViewModel, moveAction)

      // Wait for async save operations
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Assert
      expect(mockStorage.save).toHaveBeenCalledWith('high-score', 5000)
      expect(mockStorage.save).toHaveBeenCalledWith(
        'current-game',
        expect.anything(),
      )
    })

    it('ハイスコアより低い場合は更新しない', async () => {
      // Arrange
      const gameViewModel = gameService.startNewGame()
      const lowScoreGame = {
        ...gameViewModel,
        state: 'gameOver' as const,
        score: { current: 1000, best: 0 },
      }

      mockStorage.load = vi.fn().mockResolvedValue(5000) // 現在のハイスコア
      const moveAction: GameAction = { type: 'MOVE_LEFT' }

      // Act
      gameService.updateGameState(lowScoreGame, moveAction)

      // Wait for async save operations
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Assert
      expect(mockStorage.save).not.toHaveBeenCalledWith('high-score', 1000)
    })
  })

  describe('エラーハンドリング', () => {
    it('保存エラーが発生してもゲームは継続する', async () => {
      // Arrange
      mockStorage.save = vi.fn().mockRejectedValue(new Error('Save failed'))

      // Act & Assert - エラーが投げられないことを確認
      expect(() => gameService.createReadyGame()).not.toThrow()
    })
  })

  describe('リソース管理', () => {
    it('dispose時にタイマーを停止しゲーム状態をクリアする', () => {
      // Arrange
      gameService.startNewGame()

      // Act
      gameService.dispose()

      // Assert
      expect(mockTimer.stopTimer).toHaveBeenCalled()
      expect(gameService.getCurrentGame()).toBeNull()
    })
  })

  describe('アクション分類', () => {
    let gameViewModel: GameViewModel

    beforeEach(() => {
      gameViewModel = gameService.startNewGame()
    })

    it('ROTATE_CLOCKWISEアクションを回転として認識する', () => {
      // Arrange
      const rotateAction: GameAction = { type: 'ROTATE_CLOCKWISE' }

      // Act
      const result = gameService.updateGameState(gameViewModel, rotateAction)

      // Assert
      expect(result).toBeDefined()
    })

    it('ROTATE_COUNTERCLOCKWISEアクションを回転として認識する', () => {
      // Arrange
      const rotateAction: GameAction = { type: 'ROTATE_COUNTERCLOCKWISE' }

      // Act
      const result = gameService.updateGameState(gameViewModel, rotateAction)

      // Assert
      expect(result).toBeDefined()
    })

    it('SOFT_DROPアクションをドロップとして認識する', () => {
      // Arrange
      const dropAction: GameAction = { type: 'SOFT_DROP' }

      // Act
      const result = gameService.updateGameState(gameViewModel, dropAction)

      // Assert
      expect(result).toBeDefined()
    })

    it('HARD_DROPアクションをドロップとして認識する', () => {
      // Arrange
      const dropAction: GameAction = { type: 'HARD_DROP' }

      // Act
      const result = gameService.updateGameState(gameViewModel, dropAction)

      // Assert
      expect(result).toBeDefined()
    })
  })

  describe('タイマー管理', () => {
    it('ゲーム開始時にタイマーが適切に設定される', () => {
      // Act
      gameService.startNewGame()

      // Assert
      expect(mockTimer.startInterval).toHaveBeenCalledWith(
        expect.any(Function),
        1000,
      )
    })

    it('既にタイマーが動いている状態でゲーム開始すると前のタイマーを停止する', () => {
      // Arrange
      gameService.startNewGame() // 最初のタイマー開始

      // Act
      gameService.startNewGame() // 2回目のゲーム開始

      // Assert
      expect(mockTimer.stopTimer).toHaveBeenCalledWith('timer-id-1')
    })
  })
})
