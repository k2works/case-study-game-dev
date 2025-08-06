import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameBoard } from './GameBoard'
import { Game } from '../domain/Game'

describe('GameBoard', () => {
  describe('GameBoardを作成する', () => {
    it('GameBoardコンポーネントを表示できる', () => {
      const game = new Game()

      render(<GameBoard game={game} />)

      const gameboard = screen.getByTestId('game-board')
      expect(gameboard).toBeInTheDocument()
    })

    it('フィールドのマス目が正しく表示される', () => {
      const game = new Game()

      render(<GameBoard game={game} />)

      // 12x6 = 72個のセルが存在する
      const cells = screen.getAllByTestId(/^cell-/)
      expect(cells).toHaveLength(72)
    })

    it('空のフィールドが表示される', () => {
      const game = new Game()

      render(<GameBoard game={game} />)

      // すべてのセルが空である
      const emptyCells = screen
        .getAllByTestId(/^cell-/)
        .filter((cell) => !cell.classList.contains('puyo'))
      expect(emptyCells).toHaveLength(72)
    })
  })

  describe('ゲーム状態の表示', () => {
    it('ゲーム開始前の状態を表示する', () => {
      const game = new Game()

      render(<GameBoard game={game} />)

      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('ゲーム中の現在のぷよペアを表示する', () => {
      const game = new Game()
      game.start()

      render(<GameBoard game={game} />)

      expect(screen.getByText('Playing')).toBeInTheDocument()

      // 現在のぷよペアが表示される（main puyo）
      const mainPuyoCell = screen.getByTestId(
        `cell-${game.currentPair!.x}-${game.currentPair!.y}`
      )
      expect(mainPuyoCell).toHaveClass('puyo')

      // sub puyoも表示される
      const subPos = game.currentPair!.getSubPosition()
      const subPuyoCell = screen.getByTestId(`cell-${subPos.x}-${subPos.y}`)
      expect(subPuyoCell).toHaveClass('puyo')
    })
  })
})
