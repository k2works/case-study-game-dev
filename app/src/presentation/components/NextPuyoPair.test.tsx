import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import { createTestPuyoPairViewModel } from '../../test/helpers/gameViewModelHelpers'
import { NextPuyoPair } from './NextPuyoPair'

describe('NextPuyoPairコンポーネント', () => {
  describe('基本表示テスト', () => {
    it('次のぷよペアがnullの場合、空の表示が表示される', () => {
      // Arrange & Act
      render(<NextPuyoPair puyoPair={null} />)

      // Assert
      expect(screen.getByTestId('next-puyo-pair-empty')).toBeInTheDocument()
    })

    it('次のぷよペアが設定されている場合、ぷよペアが表示される', () => {
      // Arrange
      const puyoPair = createTestPuyoPairViewModel(2, 0, 'red', 'blue')

      // Act
      render(<NextPuyoPair puyoPair={puyoPair} />)

      // Assert
      expect(screen.getByTestId('next-puyo-pair')).toBeInTheDocument()
      expect(screen.getByTestId('next-puyo-main')).toBeInTheDocument()
      expect(screen.getByTestId('next-puyo-sub')).toBeInTheDocument()
    })

    it('メインぷよとサブぷよが正しく表示される', () => {
      // Arrange
      const puyoPair = createTestPuyoPairViewModel(2, 0, 'yellow', 'green')

      // Act
      render(<NextPuyoPair puyoPair={puyoPair} />)

      // Assert
      const mainPuyo = screen.getByTestId('next-puyo-main')
      const subPuyo = screen.getByTestId('next-puyo-sub')

      expect(mainPuyo).toBeInTheDocument()
      expect(subPuyo).toBeInTheDocument()
      expect(mainPuyo).toHaveClass('bg-yellow-500')
      expect(subPuyo).toHaveClass('bg-green-500')
    })

    it('サブぷよが上、メインぷよが下に配置される', () => {
      // Arrange
      const puyoPair = createTestPuyoPairViewModel(2, 0, 'red', 'blue')

      // Act
      render(<NextPuyoPair puyoPair={puyoPair} />)

      // Assert
      const container = screen.getByTestId('next-puyo-pair')
      const subPuyo = screen.getByTestId('next-puyo-sub')
      const mainPuyo = screen.getByTestId('next-puyo-main')

      // flex-colなので最初の子要素が上に表示される
      expect(container.firstChild).toBe(subPuyo)
      expect(container.lastChild).toBe(mainPuyo)
    })

    it('異なる色の組み合わせで正しく表示される', () => {
      // Arrange
      const puyoPair = createTestPuyoPairViewModel(2, 0, 'purple', 'green')

      // Act
      render(<NextPuyoPair puyoPair={puyoPair} />)

      // Assert
      const mainPuyo = screen.getByTestId('next-puyo-main')
      const subPuyo = screen.getByTestId('next-puyo-sub')

      expect(mainPuyo).toHaveClass('bg-purple-500')
      expect(subPuyo).toHaveClass('bg-green-500')
    })
  })

  describe('空表示テスト', () => {
    it('空表示の場合、2つのグレーの丸が表示される', () => {
      // Arrange & Act
      render(<NextPuyoPair puyoPair={null} />)

      // Assert
      const emptyContainer = screen.getByTestId('next-puyo-pair-empty')
      const grayElements = emptyContainer.querySelectorAll('.bg-gray-600')
      expect(grayElements).toHaveLength(2)
    })

    it('空表示の要素が適切なスタイルを持つ', () => {
      // Arrange & Act
      render(<NextPuyoPair puyoPair={null} />)

      // Assert
      const emptyContainer = screen.getByTestId('next-puyo-pair-empty')
      expect(emptyContainer).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'gap-1',
      )
    })
  })

  describe('レイアウトテスト', () => {
    it('ぷよペアコンテナが適切なスタイルを持つ', () => {
      // Arrange
      const puyoPair = createTestPuyoPairViewModel(2, 0, 'red', 'blue')

      // Act
      render(<NextPuyoPair puyoPair={puyoPair} />)

      // Assert
      const container = screen.getByTestId('next-puyo-pair')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'gap-1')
    })
  })
})
