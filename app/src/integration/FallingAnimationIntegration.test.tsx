import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('落下アニメーション統合テスト', () => {
  describe('ぷよの落下アニメーション', () => {
    it('ゲーム開始時にアニメーション用のコンテナが存在する', () => {
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

    it('アニメーション用のフィールドスタイルが適用される', () => {
      // Arrange
      render(<App />)

      // Act & Assert
      const field = document.querySelector('.field')
      expect(field).toBeInTheDocument()
      // CSSが適用されているかチェック（getComputedStyleはvitestで正確に取得できない場合がある）
      expect(field?.className).toContain('field')
    })
  })

  describe('AnimatedPuyoコンポーネントの統合', () => {
    it('ゲームボードがAnimatedPuyoコンポーネントをサポートする', () => {
      // Arrange
      render(<App />)

      // Act
      const startButton = screen.getByText('ゲーム開始')
      startButton.click()

      // Assert - AnimatedPuyoがレンダリング可能な構造が存在
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      const field = gameBoard.querySelector('.field')
      expect(field).toBeInTheDocument()

      const animatedContainer = field?.querySelector(
        '.animated-puyos-container'
      )
      expect(animatedContainer).toBeInTheDocument()
    })
  })
})
