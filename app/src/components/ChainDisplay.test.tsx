import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChainDisplay } from './ChainDisplay'

describe('ChainDisplay', () => {
  describe('連鎖数の表示', () => {
    it('連鎖数が表示される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={3} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toBeInTheDocument()
      expect(display).toHaveTextContent('3連鎖!')
    })

    it('異なる連鎖数が正しく表示される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={5} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toHaveTextContent('5連鎖!')
    })

    it('連鎖数0の場合は表示されない', () => {
      // Arrange & Act
      const { container } = render(<ChainDisplay chainCount={0} />)

      // Assert
      const display = container.querySelector('[data-testid="chain-display"]')
      expect(display).not.toBeInTheDocument()
    })
  })

  describe('アニメーション', () => {
    it('連鎖表示にアニメーションクラスが適用される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={2} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toHaveClass('chain-display')
      expect(display).toHaveClass('chain-animation')
    })

    it('大連鎖時に特別なスタイルが適用される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={7} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toHaveClass('large-chain')
    })

    it('超大連鎖時に更に特別なスタイルが適用される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={10} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toHaveClass('super-chain')
    })
  })

  describe('表示位置', () => {
    it('指定した位置に表示される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={4} x={3} y={5} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toHaveStyle({
        left: '96px',
        top: '160px',
      })
    })

    it('位置指定がない場合は中央に表示される', () => {
      // Arrange & Act
      render(<ChainDisplay chainCount={3} />)

      // Assert
      const display = screen.getByTestId('chain-display')
      expect(display).toHaveClass('center-position')
    })
  })

  describe('表示制御', () => {
    it('連鎖数が0でない場合に表示される', () => {
      // Act
      render(<ChainDisplay chainCount={3} />)

      // Assert
      expect(screen.getByTestId('chain-display')).toBeInTheDocument()
      expect(screen.getByText('3連鎖!')).toBeInTheDocument()
    })
  })
})
