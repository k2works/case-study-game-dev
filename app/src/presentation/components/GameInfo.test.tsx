import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GameStateViewModel } from '../../application/viewmodels/GameViewModel'
import {
  createTestGameViewModel,
  createTestPuyoPairViewModel,
  createTestScoreViewModel,
} from '../../test/helpers/gameViewModelHelpers'
import { GameInfo } from './GameInfo'

describe('GameInfoコンポーネント', () => {
  describe('基本表示テスト', () => {
    it('ゲーム情報コンテナが表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('game-info')).toBeInTheDocument()
    })

    it('スコア表示エリアが表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('score-display')).toBeInTheDocument()
      expect(screen.getByText('スコア')).toBeInTheDocument()
    })

    it('レベル表示エリアが表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('level-display')).toBeInTheDocument()
      expect(screen.getByText('レベル')).toBeInTheDocument()
    })

    it('ゲーム状態表示エリアが表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('state-display')).toBeInTheDocument()
      expect(screen.getByText('状態')).toBeInTheDocument()
    })

    it('次のぷよペア表示エリアが表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

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
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('0')
    })

    it('更新されたスコアが表示される', () => {
      // Arrange
      const updatedGame = createTestGameViewModel({
        score: createTestScoreViewModel(1500),
      })

      // Act
      render(<GameInfo game={updatedGame} />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('1,500')
    })

    it('大きなスコアが正しく表示される', () => {
      // Arrange
      const updatedGame = createTestGameViewModel({
        score: createTestScoreViewModel(999999),
      })

      // Act
      render(<GameInfo game={updatedGame} />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('999,999')
    })
  })

  describe('レベル表示テスト', () => {
    it('初期レベル1が表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('level-value')).toHaveTextContent('1')
    })
  })

  describe('ゲーム状態表示テスト', () => {
    it('ready状態が日本語で表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent('準備中')
    })

    it('playing状態が日本語で表示される', () => {
      // Arrange
      const playingGame = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
      })

      // Act
      render(<GameInfo game={playingGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent('プレイ中')
    })

    it('paused状態が日本語で表示される', () => {
      // Arrange
      const pausedGame = createTestGameViewModel({
        state: 'paused' as GameStateViewModel,
      })

      // Act
      render(<GameInfo game={pausedGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveTextContent('一時停止')
    })

    it('gameOver状態が日本語で表示される', () => {
      // Arrange
      const gameOverGame = createTestGameViewModel({
        state: 'gameOver' as GameStateViewModel,
      })

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
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveClass('state-ready')
    })

    it('playing状態で適切なクラスが設定される', () => {
      // Arrange
      const playingGame = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
      })

      // Act
      render(<GameInfo game={playingGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveClass('state-playing')
    })

    it('gameOver状態で適切なクラスが設定される', () => {
      // Arrange
      const gameOverGame = createTestGameViewModel({
        state: 'gameOver' as GameStateViewModel,
      })

      // Act
      render(<GameInfo game={gameOverGame} />)

      // Assert
      expect(screen.getByTestId('state-value')).toHaveClass('state-gameOver')
    })
  })

  describe('リスタートボタンテスト', () => {
    it('ゲームオーバー時にリスタートボタンが表示される', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'gameOver' as GameStateViewModel,
      })
      const mockOnRestart = vi.fn()

      // Act
      render(<GameInfo game={game} onRestart={mockOnRestart} />)

      // Assert
      expect(screen.getByTestId('restart-button')).toBeInTheDocument()
      expect(screen.getByText('リスタート')).toBeInTheDocument()
    })

    it('ゲームオーバー以外では リスタートボタンが表示されない', () => {
      // Arrange
      const readyGame = createTestGameViewModel()
      const playingGame = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
      })
      const pausedGame = createTestGameViewModel({
        state: 'paused' as GameStateViewModel,
      })
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
      const game = createTestGameViewModel({
        state: 'gameOver' as GameStateViewModel,
      })
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
      const game = createTestGameViewModel()

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('next-puyo-pair-empty')).toBeInTheDocument()
    })

    it('ゲーム開始時は次のぷよペアが表示される', () => {
      // Arrange
      const game = createTestGameViewModel({
        nextPuyoPair: createTestPuyoPairViewModel(),
      })

      // Act
      render(<GameInfo game={game} />)

      // Assert
      expect(screen.getByTestId('next-puyo-pair')).toBeInTheDocument()
    })
  })
})
