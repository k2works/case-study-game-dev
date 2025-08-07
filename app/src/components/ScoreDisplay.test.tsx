import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  describe('スコア表示機能', () => {
    it('現在のスコアが表示される', () => {
      render(<ScoreDisplay score={0} />)

      expect(screen.getByText('スコア')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('スコアが正しく表示される', () => {
      render(<ScoreDisplay score={1000} />)

      expect(screen.getByText('1,000')).toBeInTheDocument()
    })

    it('大きなスコアでもカンマ区切りで表示される', () => {
      render(<ScoreDisplay score={12345678} />)

      expect(screen.getByText('12,345,678')).toBeInTheDocument()
    })

    it('負のスコアも表示できる（テスト用）', () => {
      render(<ScoreDisplay score={-500} />)

      expect(screen.getByText('-500')).toBeInTheDocument()
    })
  })

  describe('スコア表示のスタイリング', () => {
    it('スコア要素に適切なテストIDが設定されている', () => {
      render(<ScoreDisplay score={2500} />)

      expect(screen.getByTestId('score-value')).toBeInTheDocument()
      expect(screen.getByTestId('score-value')).toHaveTextContent('2,500')
    })

    it('スコアラベルに適切なテストIDが設定されている', () => {
      render(<ScoreDisplay score={0} />)

      expect(screen.getByTestId('score-label')).toBeInTheDocument()
      expect(screen.getByTestId('score-label')).toHaveTextContent('スコア')
    })
  })
})
