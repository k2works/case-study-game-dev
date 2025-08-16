import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import { createTestGameViewModel } from '../../test/helpers/gameViewModelHelpers'
import { GameBoard } from './GameBoard'

describe('GameBoardコンポーネント', () => {
  describe('初期表示テスト', () => {
    it('空のフィールドを表示できる', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-field')).toBeInTheDocument()
    })

    it('6×12のセルが表示される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      const cells = screen.getAllByTestId(/^cell-\d+-\d+$/)
      expect(cells).toHaveLength(72) // 6 × 12 = 72
    })

    it('各セルに正しい座標が設定される', () => {
      // Arrange
      const game = createTestGameViewModel()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('cell-0-0')).toBeInTheDocument()
      expect(screen.getByTestId('cell-5-11')).toBeInTheDocument()
      expect(screen.getByTestId('cell-2-6')).toBeInTheDocument()
    })
  })

  // TODO: GameViewModelに対応したテストに修正が必要
  // 現在は基本的な表示テストのみ実行し、ぷよ表示テストは後で実装する
})
