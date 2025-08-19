/**
 * AIInsightsコンポーネントのテスト
 */
import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import type { AIMove } from '../../../domain/models/ai'
import { AIInsights } from './AIInsights.tsx'

describe('AIInsightsコンポーネント', () => {
  describe('AI思考状況表示', () => {
    it('AI思考中の場合、思考中メッセージが表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={null} isThinking={true} />)

      // Assert
      expect(screen.getByText('🧠 AI思考状況')).toBeInTheDocument()
      expect(screen.getByText('🤔 AIが次の手を考え中...')).toBeInTheDocument()
    })

    it('AI思考中でない場合、思考中メッセージが表示されない', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={null} isThinking={false} />)

      // Assert
      expect(screen.getByText('🧠 AI思考状況')).toBeInTheDocument()
      expect(
        screen.queryByText('🤔 AIが次の手を考え中...'),
      ).not.toBeInTheDocument()
    })

    it('AI履歴がない場合、適切なメッセージが表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={null} isThinking={false} />)

      // Assert
      expect(
        screen.getByText('まだAIの判断履歴がありません'),
      ).toBeInTheDocument()
    })
  })

  describe('AI判断詳細表示', () => {
    const mockAIMove: AIMove = {
      x: 2,
      rotation: 90,
      score: 85,
      evaluation: {
        heightScore: 50,
        centerScore: 25,
        modeScore: 10,
        totalScore: 85,
        averageY: 8.5,
        averageX: 2.5,
        distanceFromCenter: 0.5,
        reason: '位置(2, 9), バランス型: 標準評価, スコア: 85',
      },
    }

    it('AI判断詳細が正しく表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={mockAIMove} isThinking={false} />)

      // Assert
      expect(screen.getByText('最後の判断:')).toBeInTheDocument()
      expect(
        screen.getByText('位置(2, 9), バランス型: 標準評価, スコア: 85'),
      ).toBeInTheDocument()
    })

    it('配置位置が正しく表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={mockAIMove} isThinking={false} />)

      // Assert
      expect(screen.getByText('配置位置')).toBeInTheDocument()
      expect(screen.getByText('列2 / 90°')).toBeInTheDocument()
    })

    it('評価スコアが正しく表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={mockAIMove} isThinking={false} />)

      // Assert
      expect(screen.getByText('総合スコア')).toBeInTheDocument()
      expect(screen.getByText('85')).toBeInTheDocument()

      expect(screen.getByText('高さ評価')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()

      expect(screen.getByText('中央度評価')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('モード補正スコアがある場合、表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={mockAIMove} isThinking={false} />)

      // Assert
      expect(screen.getByText('モード補正: +10')).toBeInTheDocument()
    })

    it('モード補正スコアが0の場合、表示されない', () => {
      // Arrange
      const mockMoveWithoutMode: AIMove = {
        ...mockAIMove,
        evaluation: {
          ...mockAIMove.evaluation!,
          modeScore: 0,
        },
      }

      // Act
      render(<AIInsights lastAIMove={mockMoveWithoutMode} isThinking={false} />)

      // Assert
      expect(screen.queryByText(/モード補正/)).not.toBeInTheDocument()
    })

    it('evaluation情報がない場合、詳細表示されない', () => {
      // Arrange
      const mockMoveWithoutEvaluation: AIMove = {
        x: 2,
        rotation: 90,
        score: 85,
      }

      // Act
      render(
        <AIInsights
          lastAIMove={mockMoveWithoutEvaluation}
          isThinking={false}
        />,
      )

      // Assert
      expect(screen.queryByText('最後の判断:')).not.toBeInTheDocument()
    })
  })

  describe('思考状態インジケーター', () => {
    it('思考中の場合、アニメーションインジケーターが表示される', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={null} isThinking={true} />)

      // Assert
      const indicator = document.querySelector('.animate-pulse')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveClass('bg-yellow-400')
    })

    it('思考中でない場合、アニメーションインジケーターが表示されない', () => {
      // Arrange & Act
      render(<AIInsights lastAIMove={null} isThinking={false} />)

      // Assert
      const indicator = document.querySelector('.animate-pulse')
      expect(indicator).not.toBeInTheDocument()
    })
  })
})
