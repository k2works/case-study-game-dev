import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('Next Puyo Integration', () => {
  describe('NEXTぷよ表示の統合テスト', () => {
    it('ゲーム開始前はNEXTぷよが表示されない', () => {
      render(<App />)

      // ゲーム開始前はNEXTぷよエリアが表示されない
      expect(screen.queryByTestId('next-puyo-area')).not.toBeInTheDocument()
      expect(screen.queryByText('NEXT')).not.toBeInTheDocument()
    })

    it('ゲーム開始後にNEXTぷよが表示される', () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // NEXTぷよエリアが表示される
      expect(screen.getByTestId('next-puyo-area')).toBeInTheDocument()
      expect(screen.getByText('NEXT')).toBeInTheDocument()

      // NEXTぷよのメインとサブが表示される
      expect(screen.getByTestId('next-main-puyo')).toBeInTheDocument()
      expect(screen.getByTestId('next-sub-puyo')).toBeInTheDocument()

      // 色クラスが設定されている
      const nextMainPuyo = screen.getByTestId('next-main-puyo')
      const nextSubPuyo = screen.getByTestId('next-sub-puyo')
      expect(nextMainPuyo).toHaveClass('puyo')
      expect(nextSubPuyo).toHaveClass('puyo')
    })

    it('スコア表示の下にNEXTぷよが配置される', () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // スコア表示とNEXTぷよ表示の両方が存在する
      expect(screen.getByTestId('score-value')).toBeInTheDocument()
      expect(screen.getByTestId('next-puyo-area')).toBeInTheDocument()
    })
  })
})
