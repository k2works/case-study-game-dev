/**
 * チャートデータサービスのテスト
 */
import { describe, expect, test } from 'vitest'

import type { PerformanceReport } from '../../domain/models/ai/types'

import type { PerformanceStatistics } from './PerformanceAnalysisService'
import { ChartDataService } from './ChartDataService'

describe('ChartDataService', () => {
  describe('createPerformanceLineChart', () => {
    test('スコア推移チャートデータを作成できる', () => {
      // Arrange
      const statistics: PerformanceStatistics = {
        totalGames: 3,
        averageScore: 1500,
        averageChain: 4.5,
        averagePlayTime: 120000,
        chainSuccessRate: 0.8,
        gameResults: [
          {
            id: 'game1',
            score: 1000,
            chain: 3,
            playTime: 100000,
            timestamp: new Date('2025-01-01T10:00:00Z'),
            isAI: false,
          },
          {
            id: 'game2',
            score: 1500,
            chain: 5,
            playTime: 120000,
            timestamp: new Date('2025-01-01T10:30:00Z'),
            isAI: false,
          },
          {
            id: 'game3',
            score: 2000,
            chain: 6,
            playTime: 140000,
            timestamp: new Date('2025-01-01T11:00:00Z'),
            isAI: false,
          },
        ],
      }

      // Act
      const chartData = ChartDataService.createPerformanceLineChart(statistics, 'score')

      // Assert
      expect(chartData.title).toBe('スコア推移')
      expect(chartData.data).toHaveLength(3)
      expect(chartData.data[0]).toEqual({
        label: 'ゲーム1',
        value: 1000,
        score: 1000,
        chain: 3,
        playTime: 100000,
      })
      expect(chartData.series).toHaveLength(1)
      expect(chartData.series[0].name).toBe('スコア')
      expect(chartData.series[0].dataKey).toBe('score')
      expect(chartData.xAxisLabel).toBe('ゲーム')
      expect(chartData.yAxisLabel).toBe('スコア')
    })

    test('連鎖推移チャートデータを作成できる', () => {
      // Arrange
      const statistics: PerformanceStatistics = {
        totalGames: 2,
        averageScore: 1500,
        averageChain: 4,
        averagePlayTime: 120000,
        chainSuccessRate: 0.8,
        gameResults: [
          {
            id: 'game1',
            score: 1000,
            chain: 3,
            playTime: 100000,
            timestamp: new Date('2025-01-01T10:00:00Z'),
            isAI: false,
          },
          {
            id: 'game2',
            score: 1500,
            chain: 5,
            playTime: 120000,
            timestamp: new Date('2025-01-01T10:30:00Z'),
            isAI: false,
          },
        ],
      }

      // Act
      const chartData = ChartDataService.createPerformanceLineChart(statistics, 'chain')

      // Assert
      expect(chartData.title).toBe('連鎖数推移')
      expect(chartData.series[0].name).toBe('連鎖数')
      expect(chartData.series[0].dataKey).toBe('chain')
      expect(chartData.yAxisLabel).toBe('連鎖数')
    })

    test('プレイ時間推移チャートデータを作成できる', () => {
      // Arrange
      const statistics: PerformanceStatistics = {
        totalGames: 1,
        averageScore: 1500,
        averageChain: 4,
        averagePlayTime: 120000,
        chainSuccessRate: 0.8,
        gameResults: [
          {
            id: 'game1',
            score: 1000,
            chain: 3,
            playTime: 100000,
            timestamp: new Date('2025-01-01T10:00:00Z'),
            isAI: false,
          },
        ],
      }

      // Act
      const chartData = ChartDataService.createPerformanceLineChart(statistics, 'playTime')

      // Assert
      expect(chartData.title).toBe('プレイ時間推移')
      expect(chartData.series[0].name).toBe('プレイ時間')
      expect(chartData.series[0].dataKey).toBe('playTime')
      expect(chartData.yAxisLabel).toBe('時間')
    })
  })

  describe('createComparisonChart', () => {
    test('AI vs 人間比較チャートを作成できる', () => {
      // Arrange
      const comparisonReport: PerformanceReport = {
        ai: {
          gamesPlayed: 2,
          avgScore: 1800,
          avgChain: 5.5,
          avgPlayTime: 80000,
          chainSuccessRate: 0.9,
        },
        human: {
          gamesPlayed: 3,
          avgScore: 1200,
          avgChain: 3.5,
          avgPlayTime: 150000,
          chainSuccessRate: 0.7,
        },
        comparison: {
          scoreRatio: 1.5,
          chainRatio: 1.57,
          playTimeRatio: 0.53,
        },
      }

      // Act
      const chartData = ChartDataService.createComparisonChart(comparisonReport)

      // Assert
      expect(chartData.title).toBe('AI vs 人間 パフォーマンス比較')
      expect(chartData.data).toHaveLength(4)
      
      // スコア比較データ
      const scoreData = chartData.data.find(d => d.label === 'スコア')
      expect(scoreData?.AI).toBe(1800)
      expect(scoreData?.Human).toBe(1200)

      // 連鎖数比較データ  
      const chainData = chartData.data.find(d => d.label === '連鎖数')
      expect(chainData?.AI).toBe(5.5)
      expect(chainData?.Human).toBe(3.5)

      expect(chartData.series).toHaveLength(2)
      expect(chartData.series[0].name).toBe('AI')
      expect(chartData.series[1].name).toBe('Human')
    })

    test('データが空の場合は空のチャートデータを返す', () => {
      // Arrange
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
        comparison: {
          scoreRatio: 0,
          chainRatio: 0,
          playTimeRatio: 0,
        },
      }

      // Act
      const chartData = ChartDataService.createComparisonChart(emptyReport)

      // Assert
      expect(chartData.data).toHaveLength(0)
    })
  })
})