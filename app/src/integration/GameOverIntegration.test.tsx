import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('GameOver Integration', () => {
  describe('ゲームオーバー画面の統合テスト', () => {
    it('ゲーム開始時にはゲームオーバー画面は表示されない', () => {
      render(<App />)

      // ゲームオーバー画面が表示されていないことを確認
      expect(screen.queryByTestId('game-over-display')).not.toBeInTheDocument()
      expect(screen.queryByText('ゲームオーバー')).not.toBeInTheDocument()
    })

    it('Ready状態でもゲームオーバー画面は表示されない', () => {
      render(<App />)

      expect(screen.getByText('Ready')).toBeInTheDocument()
      expect(screen.queryByTestId('game-over-display')).not.toBeInTheDocument()
    })
  })

  describe('リトライ機能の統合テスト', () => {
    it('リトライボタンが正しく機能する準備ができている', () => {
      render(<App />)

      // ゲーム開始ボタンが存在することを確認
      const startButton = screen.getByTestId('start-button')
      expect(startButton).toBeInTheDocument()

      // スコア表示が存在することを確認
      expect(screen.getByTestId('score-value')).toBeInTheDocument()
      expect(screen.getByText('0点')).toBeInTheDocument()
    })
  })

  describe('ゲーム状態とUI連携', () => {
    it('各ゲーム状態で適切なUI要素が表示される', () => {
      render(<App />)

      // Ready状態の確認
      expect(screen.getByText('Ready')).toBeInTheDocument()
      expect(screen.getByTestId('start-button')).toBeInTheDocument()
      expect(screen.getByTestId('score-value')).toHaveTextContent('0')

      // ゲームオーバー画面は表示されない
      expect(screen.queryByTestId('game-over-display')).not.toBeInTheDocument()
    })
  })
})
