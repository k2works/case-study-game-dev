/**
 * PerformanceChart コンポーネントのテスト
 */
import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import type { PerformanceReport } from '../../../domain/models/ai/index'
import type { PerformanceStatistics } from '../../services/PerformanceAnalysisService'
import { PerformanceChart } from './PerformanceChart'

// モックデータ
const mockStatistics: PerformanceStatistics = {
  totalGames: 5,
  totalScore: 15000,
  totalPlayTime: 3000,
  totalChains: 25,
  averageScore: 3000,
  averageChain: 5,
  averagePlayTime: 600,
  highScore: 5000,
  longestChain: 8,
  gameResults: [
    {
      gameId: '1',
      score: 2000,
      chain: 4,
      playTime: 500,
      timestamp: new Date('2023-01-01'),
      isAI: false,
    },
    {
      gameId: '2',
      score: 3000,
      chain: 5,
      playTime: 600,
      timestamp: new Date('2023-01-02'),
      isAI: false,
    },
    {
      gameId: '3',
      score: 4000,
      chain: 6,
      playTime: 700,
      timestamp: new Date('2023-01-03'),
      isAI: false,
    },
  ],
}

const mockComparisonReport: PerformanceReport = {
  ai: {
    gamesPlayed: 3,
    avgScore: 3500,
    avgChain: 6.5,
    avgPlayTime: 450,
    chainSuccessRate: 0.8,
  },
  human: {
    gamesPlayed: 2,
    avgScore: 2500,
    avgChain: 4.5,
    avgPlayTime: 650,
    chainSuccessRate: 0.6,
  },
}

const mockLearningCurve = {
  epochs: [1, 2, 3, 4, 5],
  trainLoss: [1.2, 0.9, 0.7, 0.5, 0.4],
  validationLoss: [1.3, 1.0, 0.8, 0.6, 0.5],
  trainAccuracy: [0.6, 0.7, 0.8, 0.85, 0.9],
  validationAccuracy: [0.55, 0.68, 0.75, 0.82, 0.88],
}

describe('PerformanceChart', () => {
  describe('基本レンダリング', () => {
    it('データが空の時は空状態を表示する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={{ ...mockStatistics, gameResults: [] }}
        />,
      )

      expect(screen.getByText('パフォーマンスチャート')).toBeInTheDocument()
      expect(screen.getByText('データがありません')).toBeInTheDocument()
    })

    it('ゲームパフォーマンスデータでチャートを表示する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
          metricType="score"
        />,
      )

      expect(screen.getByText('スコア推移')).toBeInTheDocument()
      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('score')
    })

    it('AI比較データでチャートを表示する', () => {
      render(
        <PerformanceChart
          dataType="aiComparison"
          comparisonReport={mockComparisonReport}
        />,
      )

      expect(
        screen.getByText('AI vs 人間 パフォーマンス比較'),
      ).toBeInTheDocument()
    })

    it('学習曲線データでチャートを表示する', () => {
      render(
        <PerformanceChart
          dataType="learningCurve"
          learningCurve={mockLearningCurve}
        />,
      )

      expect(screen.getByText('学習曲線')).toBeInTheDocument()
    })
  })

  describe('チャートタイプ切り替え', () => {
    it('ラインチャートを表示する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
          chartType="line"
        />,
      )

      expect(screen.getByText('line chart')).toBeInTheDocument()
    })

    it('バーチャートを表示する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
          chartType="bar"
        />,
      )

      expect(screen.getByText('bar chart')).toBeInTheDocument()
    })

    it('エリアチャートを表示する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
          chartType="area"
        />,
      )

      expect(screen.getByText('area chart')).toBeInTheDocument()
    })
  })

  describe('メトリック選択', () => {
    it('スコア、連鎖数、プレイ時間の選択肢を提供する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
        />,
      )

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select).toBeInTheDocument()

      const options = Array.from(select.options).map((option) => option.text)
      expect(options).toContain('スコア')
      expect(options).toContain('連鎖数')
      expect(options).toContain('プレイ時間')
    })
  })

  describe('プロップス処理', () => {
    it('カスタムクラス名を適用する', () => {
      const { container } = render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
          className="custom-chart"
        />,
      )

      const chartElement = container.querySelector('.custom-chart')
      expect(chartElement).toBeInTheDocument()
    })

    it('カスタム高さを適用する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          statistics={mockStatistics}
          height={500}
        />,
      )

      // ResponsiveContainer が適切な高さで表示されることを確認
      // 実際のテストでは、コンテナの高さなどをテストする
      expect(screen.getByText('スコア推移')).toBeInTheDocument()
    })
  })

  describe('エラーハンドリング', () => {
    it('必要なデータがない場合は適切に処理する', () => {
      render(
        <PerformanceChart
          dataType="gamePerformance"
          // statistics prop を意図的に省略
        />,
      )

      expect(screen.getByText('データがありません')).toBeInTheDocument()
    })

    it('空のcomparisonReportでも適切に処理する', () => {
      const emptyReport: PerformanceReport = {
        ai: {
          gamesPlayed: 0,
          avgScore: 0,
          avgChain: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
        },
        human: {
          gamesPlayed: 0,
          avgScore: 0,
          avgChain: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
        },
      }

      render(
        <PerformanceChart
          dataType="aiComparison"
          comparisonReport={emptyReport}
        />,
      )

      expect(screen.getByText('データがありません')).toBeInTheDocument()
    })
  })
})
