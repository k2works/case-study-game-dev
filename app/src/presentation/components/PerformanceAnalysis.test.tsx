/**
 * パフォーマンス分析コンポーネントのテスト
 */
import { describe, expect, test, vi } from 'vitest'

import { render, screen } from '@testing-library/react'

import type { PerformanceStatistics } from '../../application/services/PerformanceAnalysisService'
import type { PerformanceReport } from '../../domain/models/ai/index'
import { PerformanceAnalysis } from './PerformanceAnalysis'

describe('PerformanceAnalysis', () => {
  describe('基本表示', () => {
    test('パフォーマンス統計が表示される', () => {
      // Arrange
      const mockStats: PerformanceStatistics = {
        totalGames: 10,
        averageScore: 1500,
        averageChain: 5.2,
        chainSuccessRate: 0.7,
        averagePlayTime: 300000, // 5分
        gameResults: [],
      }

      const mockReport: PerformanceReport = {
        ai: {
          avgScore: 2000,
          avgChain: 6.5,
          gamesPlayed: 5,
          avgPlayTime: 250000,
          chainSuccessRate: 0.8,
        },
        human: {
          avgScore: 1000,
          avgChain: 3.9,
          gamesPlayed: 5,
          avgPlayTime: 350000,
          chainSuccessRate: 0.6,
        },
        comparison: {
          scoreRatio: 2.0,
          chainRatio: 1.67,
          playTimeRatio: 0.71,
        },
      }

      // Act
      render(
        <PerformanceAnalysis
          statistics={mockStats}
          comparisonReport={mockReport}
          onResetData={vi.fn()}
        />,
      )

      // Assert
      expect(screen.getByText('パフォーマンス分析')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument() // 総ゲーム数
      expect(screen.getByText('1,500')).toBeInTheDocument() // 平均スコア
      expect(screen.getByText('5.2')).toBeInTheDocument() // 平均連鎖数
      expect(screen.getByText('70.0%')).toBeInTheDocument() // 連鎖成功率
    })

    test('AI vs 人間の比較が表示される', () => {
      // Arrange
      const mockStats: PerformanceStatistics = {
        totalGames: 10,
        averageScore: 1500,
        averageChain: 5.2,
        chainSuccessRate: 0.7,
        averagePlayTime: 300000,
        gameResults: [],
      }

      const mockReport: PerformanceReport = {
        ai: {
          avgScore: 2000,
          avgChain: 6.5,
          gamesPlayed: 5,
          avgPlayTime: 250000,
          chainSuccessRate: 0.8,
        },
        human: {
          avgScore: 1000,
          avgChain: 3.9,
          gamesPlayed: 5,
          avgPlayTime: 350000,
          chainSuccessRate: 0.6,
        },
        comparison: {
          scoreRatio: 2.0,
          chainRatio: 1.67,
          playTimeRatio: 0.71,
        },
      }

      // Act
      render(
        <PerformanceAnalysis
          statistics={mockStats}
          comparisonReport={mockReport}
          onResetData={vi.fn()}
        />,
      )

      // Assert
      expect(screen.getByText('AI vs 人間比較')).toBeInTheDocument()
      expect(screen.getByText('2,000')).toBeInTheDocument() // AIスコア
      expect(screen.getByText('1,000')).toBeInTheDocument() // 人間スコア
      expect(screen.getByText('6.5')).toBeInTheDocument() // AI連鎖
      expect(screen.getByText('3.9')).toBeInTheDocument() // 人間連鎖
    })

    test('データが空の場合の表示', () => {
      // Arrange
      const emptyStats: PerformanceStatistics = {
        totalGames: 0,
        averageScore: 0,
        averageChain: 0,
        chainSuccessRate: 0,
        averagePlayTime: 0,
        gameResults: [],
      }

      const emptyReport: PerformanceReport = {
        ai: {
          avgScore: 0,
          avgChain: 0,
          gamesPlayed: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
        },
        human: {
          avgScore: 0,
          avgChain: 0,
          gamesPlayed: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
        },
        comparison: {
          scoreRatio: 0,
          chainRatio: 0,
          playTimeRatio: 0,
        },
      }

      // Act
      render(
        <PerformanceAnalysis
          statistics={emptyStats}
          comparisonReport={emptyReport}
          onResetData={vi.fn()}
        />,
      )

      // Assert
      expect(screen.getByText('データがありません')).toBeInTheDocument()
    })

    test('プレイ時間が分秒で表示される', () => {
      // Arrange
      const mockStats: PerformanceStatistics = {
        totalGames: 3,
        averageScore: 1200,
        averageChain: 4.5,
        chainSuccessRate: 0.6,
        averagePlayTime: 270000, // 4分30秒
        gameResults: [],
      }

      const mockReport: PerformanceReport = {
        ai: {
          avgScore: 1500,
          avgChain: 5.0,
          gamesPlayed: 1,
          avgPlayTime: 180000, // 3分
          chainSuccessRate: 0.8,
        },
        human: {
          avgScore: 900,
          avgChain: 4.0,
          gamesPlayed: 2,
          avgPlayTime: 315000, // 5分15秒
          chainSuccessRate: 0.5,
        },
        comparison: {
          scoreRatio: 1.67,
          chainRatio: 1.25,
          playTimeRatio: 0.57,
        },
      }

      // Act
      render(
        <PerformanceAnalysis
          statistics={mockStats}
          comparisonReport={mockReport}
          onResetData={vi.fn()}
        />,
      )

      // Assert
      expect(screen.getByText('4分30秒')).toBeInTheDocument() // 平均プレイ時間
      expect(screen.getByText('3分0秒')).toBeInTheDocument() // AI平均プレイ時間
      expect(screen.getByText('5分15秒')).toBeInTheDocument() // 人間平均プレイ時間
    })

    test('リセットボタンが表示される', () => {
      // Arrange
      const mockStats: PerformanceStatistics = {
        totalGames: 5,
        averageScore: 1200,
        averageChain: 4.0,
        chainSuccessRate: 0.6,
        averagePlayTime: 240000,
        gameResults: [],
      }

      const mockReport: PerformanceReport = {
        ai: {
          avgScore: 1500,
          avgChain: 5.0,
          gamesPlayed: 3,
          avgPlayTime: 200000,
          chainSuccessRate: 0.7,
        },
        human: {
          avgScore: 900,
          avgChain: 3.0,
          gamesPlayed: 2,
          avgPlayTime: 300000,
          chainSuccessRate: 0.5,
        },
        comparison: {
          scoreRatio: 1.67,
          chainRatio: 1.67,
          playTimeRatio: 0.67,
        },
      }

      // Act
      render(
        <PerformanceAnalysis
          statistics={mockStats}
          comparisonReport={mockReport}
          onResetData={vi.fn()}
        />,
      )

      // Assert
      expect(
        screen.getByRole('button', { name: 'データをリセット' }),
      ).toBeInTheDocument()
    })
  })

  describe('相互作用', () => {
    test('リセットボタンクリックでコールバックが呼ばれる', async () => {
      // Arrange
      const mockOnResetData = vi.fn()
      const mockStats: PerformanceStatistics = {
        totalGames: 5,
        averageScore: 1200,
        averageChain: 4.0,
        chainSuccessRate: 0.6,
        averagePlayTime: 240000,
        gameResults: [],
      }

      const mockReport: PerformanceReport = {
        ai: {
          avgScore: 1500,
          avgChain: 5.0,
          gamesPlayed: 3,
          avgPlayTime: 200000,
          chainSuccessRate: 0.7,
        },
        human: {
          avgScore: 900,
          avgChain: 3.0,
          gamesPlayed: 2,
          avgPlayTime: 300000,
          chainSuccessRate: 0.5,
        },
        comparison: {
          scoreRatio: 1.67,
          chainRatio: 1.67,
          playTimeRatio: 0.67,
        },
      }

      render(
        <PerformanceAnalysis
          statistics={mockStats}
          comparisonReport={mockReport}
          onResetData={mockOnResetData}
        />,
      )

      const resetButton = screen.getByRole('button', {
        name: 'データをリセット',
      })

      // Act
      resetButton.click()

      // Assert
      expect(mockOnResetData).toHaveBeenCalledOnce()
    })
  })
})
