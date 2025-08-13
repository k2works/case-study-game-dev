import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  createGame,
  startGame,
  updateGameScore,
  updateGameState,
} from '../../domain/models/Game'
import { createScore } from '../../domain/models/Score'
import { GameInfo } from './GameInfo'

describe('GameInfoコンポーネント', () => {
  describe('基本表示テスト', () => {
    it('ゲーム情報コンテナが表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('game-info')).toBeInTheDocument()
    })

    it('スコア表示エリアが表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('score-display')).toBeInTheDocument()
      expect(screen.getByText('スコア')).toBeInTheDocument()
    })

    it('レベル表示エリアが表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('level-display')).toBeInTheDocument()
      expect(screen.getByText('レベル')).toBeInTheDocument()
    })

    it('ゲーム状態表示エリアが表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('state-display')).toBeInTheDocument()
      expect(screen.getByText('状態')).toBeInTheDocument()
    })

    it('次のぷよペア表示エリアが表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('next-puyo-display')).toBeInTheDocument()
      expect(screen.getByText('次のぷよ')).toBeInTheDocument()
    })
  })

  describe('スコア表示テスト', () => {
    it('初期スコア0が表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('0')
    })

    it('更新されたスコアが表示される', () => {
      // Arrange
      const game = createGame()
      const updatedGame = updateGameScore(game, createScore(1500))

      // Act
      render(<GameInfo game={updatedGame} />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('1,500')
    })

    it('大きなスコアが正しく表示される', () => {
      // Arrange
      const game = createGame()
      const updatedGame = updateGameScore(game, createScore(999999))

      // Act
      render(<GameInfo game={updatedGame} />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('999,999')
    })
  })

  describe('レベル表示テスト', () => {
    it('初期レベル1が表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('level-value')).toHaveTextContent('1')
    })
  })

  describe('ゲーム状態表示テスト', () => {
    it('ready状態が日本語で表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent('準備中')
    })

    it('playing状態が日本語で表示される', () => {
      // Arrange
      const game = createGame()
      const playingGame = updateGameState(game, 'playing')

      // Act
      render(<GameInfo game={playingGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent('プレイ中')
    })

    it('paused状態が日本語で表示される', () => {
      // Arrange
      const game = createGame()
      const pausedGame = updateGameState(game, 'paused')

      // Act
      render(<GameInfo game={pausedGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent('一時停止')
    })

    it('gameOver状態が日本語で表示される', () => {
      // Arrange
      const game = createGame()
      const gameOverGame = updateGameState(game, 'gameOver')

      // Act
      render(<GameInfo game={gameOverGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent(
        'ゲームオーバー',
      )
    })
  })

  describe('状態別スタイルテスト', () => {
    it('ready状態で適切なクラスが設定される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveClass('state-ready')
    })

    it('playing状態で適切なクラスが設定される', () => {
      // Arrange
      const game = createGame()
      const playingGame = updateGameState(game, 'playing')

      // Act
      render(<GameInfo game={playingGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveClass('state-playing')
    })

    it('gameOver状態で適切なクラスが設定される', () => {
      // Arrange
      const game = createGame()
      const gameOverGame = updateGameState(game, 'gameOver')

      // Act
      render(<GameInfo game={gameOverGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveClass('state-gameOver')
    })
  })

  describe('リスタートボタンテスト', () => {
    it('ゲームオーバー時にリスタートボタンが表示される', () => {
      // Arrange
      const game = updateGameState(createGame(), 'gameOver')
      const mockOnRestart = vi.fn()

      // Act
      render(<GameInfo game={game} onRestart={mockOnRestart} />)

      // Assert
      expect(screen.getByTestId('restart-button')).toBeInTheDocument()
      expect(screen.getByText('リスタート')).toBeInTheDocument()
    })

    it('ゲームオーバー以外では リスタートボタンが表示されない', () => {
      // Arrange
      const readyGame = createGame()
      const playingGame = updateGameState(createGame(), 'playing')
      const pausedGame = updateGameState(createGame(), 'paused')
      const mockOnRestart = vi.fn()

      // Act & Assert
      render(<GameInfo game={readyGame} onRestart={mockOnRestart} />)
      expect(screen.queryByTestId('restart-button')).not.toBeInTheDocument()

      render(<GameInfo game={playingGame} onRestart={mockOnRestart} />)
      expect(screen.queryByTestId('restart-button')).not.toBeInTheDocument()

      render(<GameInfo game={pausedGame} onRestart={mockOnRestart} />)
      expect(screen.queryByTestId('restart-button')).not.toBeInTheDocument()
    })

    it('リスタートボタンクリック時にonRestartが呼ばれる', async () => {
      // Arrange
      const user = userEvent.setup()
      const game = updateGameState(createGame(), 'gameOver')
      const mockOnRestart = vi.fn()

      // Act
      render(<GameInfo game={game} onRestart={mockOnRestart} />)
      const restartButton = screen.getByTestId('restart-button')
      await user.click(restartButton)

      // Assert
      expect(mockOnRestart).toHaveBeenCalledOnce()
    })
  })

  describe('次のぷよペア表示テスト', () => {
    it('ゲーム未開始時は次のぷよペアが空表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('next-puyo-pair-empty')).toBeInTheDocument()
    })

    it('ゲーム開始時は次のぷよペアが表示される', () => {
      // Arrange
      const game = startGame(createGame())

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('next-puyo-pair')).toBeInTheDocument()
    })
  })
})
