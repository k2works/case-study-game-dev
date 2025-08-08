import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('消去エフェクト統合テスト', () => {
  describe('消去エフェクトの表示', () => {
    it('ゲーム開始時に消去エフェクト用のコンテナが存在する', () => {
      // Arrange
      render(<App />)

      // Act
      const startButton = screen.getByText('ゲーム開始')
      startButton.click()

      // Assert
      const animatedContainer = document.querySelector(
        '.animated-puyos-container'
      )
      expect(animatedContainer).toBeInTheDocument()
    })

    it('DisappearEffectコンポーネントが統合されている', () => {
      // Arrange
      render(<App />)

      // Act
      const startButton = screen.getByText('ゲーム開始')
      startButton.click()

      // Assert
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      const field = gameBoard.querySelector('.field')
      expect(field).toBeInTheDocument()

      // 消去エフェクトが表示可能な構造が存在
      const container = field?.querySelector('.animated-puyos-container')
      expect(container).toBeInTheDocument()
    })
  })

  describe('エフェクトのスタイル', () => {
    it('消去エフェクト用のCSSが適用される', () => {
      // Arrange
      render(<App />)

      // Act & Assert
      const field = document.querySelector('.field')
      expect(field).toBeInTheDocument()

      // animated-puyos-containerが存在することを確認
      const container = field?.querySelector('.animated-puyos-container')
      expect(container).toBeInTheDocument()
    })
  })
})
