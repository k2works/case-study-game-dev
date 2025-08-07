import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('Score Integration', () => {
  describe('スコア表示の統合テスト', () => {
    it('ゲーム開始時にスコア0が表示される', () => {
      render(<App />)

      // スコア表示エリアが表示される
      expect(screen.getByTestId('score-label')).toBeInTheDocument()
      expect(screen.getByTestId('score-value')).toBeInTheDocument()
      expect(screen.getByText('スコア')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('スコア値が正しくフォーマット表示される', () => {
      render(<App />)

      // 初期スコア0が表示される
      expect(screen.getByTestId('score-value')).toHaveTextContent('0')
    })
  })

  describe('ゲーム状態とスコア表示の連携', () => {
    it('ゲーム状態に関係なくスコア表示は常に表示される', () => {
      render(<App />)

      // Ready状態でもスコア表示は表示される
      expect(screen.getByText('Ready')).toBeInTheDocument()
      expect(screen.getByTestId('score-value')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })
})
