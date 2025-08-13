import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import { createGame } from '../../domain/models/Game'
import { createPuyo } from '../../domain/models/Puyo'
import { GameBoard } from './GameBoard'

describe('GameBoardコンポーネント', () => {
  describe('初期表示テスト', () => {
    it('空のフィールドを表示できる', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-field')).toBeInTheDocument()
    })

    it('6×12のセルが表示される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      const cells = screen.getAllByTestId(/^cell-\d+-\d+$/)
      expect(cells).toHaveLength(72) // 6 × 12 = 72
    })

    it('各セルに正しい座標が設定される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('cell-0-0')).toBeInTheDocument()
      expect(screen.getByTestId('cell-5-11')).toBeInTheDocument()
      expect(screen.getByTestId('cell-2-6')).toBeInTheDocument()
    })
  })

  describe('ぷよ表示テスト', () => {
    it('フィールド上のぷよを表示できる', () => {
      // Arrange
      const game = createGame()
      const redPuyo = createPuyo('red', { x: 2, y: 5 })
      game.field.setPuyo(2, 5, redPuyo)

      // Act
      render(<GameBoard game={game} />)

      // Assert
      const cell = screen.getByTestId('cell-2-5')
      expect(cell).toHaveClass('puyo-red')
    })

    it('複数のぷよを正しい位置に表示できる', () => {
      // Arrange
      const game = createGame()
      const redPuyo = createPuyo('red', { x: 1, y: 3 })
      const bluePuyo = createPuyo('blue', { x: 3, y: 7 })
      const greenPuyo = createPuyo('green', { x: 5, y: 1 })

      game.field.setPuyo(1, 3, redPuyo)
      game.field.setPuyo(3, 7, bluePuyo)
      game.field.setPuyo(5, 1, greenPuyo)

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('cell-1-3')).toHaveClass('puyo-red')
      expect(screen.getByTestId('cell-3-7')).toHaveClass('puyo-blue')
      expect(screen.getByTestId('cell-5-1')).toHaveClass('puyo-green')
    })

    it('空のセルには特別なクラスが設定される', () => {
      // Arrange
      const game = createGame()

      // Act
      render(<GameBoard game={game} />)

      // Assert
      const emptyCell = screen.getByTestId('cell-2-5')
      expect(emptyCell).toHaveClass('cell-empty')
    })
  })

  describe('ぷよ色の表示テスト', () => {
    it('赤ぷよに正しいクラスが設定される', () => {
      // Arrange
      const game = createGame()
      const redPuyo = createPuyo('red', { x: 0, y: 0 })
      game.field.setPuyo(0, 0, redPuyo)

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('cell-0-0')).toHaveClass('puyo-red')
    })

    it('青ぷよに正しいクラスが設定される', () => {
      // Arrange
      const game = createGame()
      const bluePuyo = createPuyo('blue', { x: 1, y: 1 })
      game.field.setPuyo(1, 1, bluePuyo)

      // Act
      render(<GameBoard game={game} />)

      // Assert
      expect(screen.getByTestId('cell-1-1')).toHaveClass('puyo-blue')
    })

    it('全ての色のぷよが正しく表示される', () => {
      // Arrange
      const game = createGame()
      const colors: Array<'red' | 'blue' | 'green' | 'yellow' | 'purple'> = [
        'red',
        'blue',
        'green',
        'yellow',
        'purple',
      ]

      colors.forEach((color, index) => {
        const puyo = createPuyo(color, { x: index, y: 0 })
        game.field.setPuyo(index, 0, puyo)
      })

      // Act
      render(<GameBoard game={game} />)

      // Assert
      colors.forEach((color, index) => {
        expect(screen.getByTestId(`cell-${index}-0`)).toHaveClass(
          `puyo-${color}`,
        )
      })
    })
  })
})
