import React from 'react'
import { render, screen, act } from '@testing-library/react'
import App from '../App'

describe('連鎖表示統合テスト', () => {
  describe('連鎖表示の基本機能', () => {
    it('ゲーム開始時に連鎖表示用のコンテナが存在する', () => {
      // Arrange
      render(<App />)

      // Act
      act(() => {
        const startButton = screen.getByText('ゲーム開始')
        startButton.click()
      })

      // Assert
      const animatedContainer = document.querySelector(
        '.animated-puyos-container'
      )
      expect(animatedContainer).toBeInTheDocument()
    })

    it('ChainDisplayコンポーネントが統合されている', () => {
      // Arrange
      render(<App />)

      // Act
      act(() => {
        const startButton = screen.getByText('ゲーム開始')
        startButton.click()
      })

      // Assert
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      const field = gameBoard.querySelector('.field')
      expect(field).toBeInTheDocument()

      // 連鎖表示が表示可能な構造が存在
      const container = field?.querySelector('.animated-puyos-container')
      expect(container).toBeInTheDocument()
    })
  })

  describe('連鎖検出システム', () => {
    it('スコア変化時に連鎖表示が動作する準備ができている', () => {
      // Arrange
      render(<App />)

      // Act
      act(() => {
        const startButton = screen.getByText('ゲーム開始')
        startButton.click()
      })

      // Assert - ゲームボードが正常に機能していることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      // スコア表示が存在することを確認
      const scoreValue = screen.getByTestId('score-value')
      expect(scoreValue).toHaveTextContent('0')
    })
  })

  describe('UI統合', () => {
    it('連鎖表示とその他のエフェクトが共存できる', () => {
      // Arrange
      render(<App />)

      // Act & Assert
      const field = document.querySelector('.field')
      expect(field).toBeInTheDocument()

      // 全てのアニメーション要素が同じコンテナ内に存在
      const container = field?.querySelector('.animated-puyos-container')
      expect(container).toBeInTheDocument()
    })
  })
})
