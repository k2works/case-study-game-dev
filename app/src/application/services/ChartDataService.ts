/**
 * チャートデータサービス
 * パフォーマンス統計からチャートデータを生成する
 */
import { createLineChartData, DEFAULT_CHART_COLORS } from '../../domain/models/visualization/ChartData'
import type { ChartDataPoint, LineChartData } from '../../domain/models/visualization/ChartData'
import type { PerformanceReport } from '../../domain/models/ai/types'

import type { GameResultData, PerformanceStatistics } from './PerformanceAnalysisService'

export type PerformanceMetricType = 'score' | 'chain' | 'playTime'

/**
 * チャートデータサービス
 */
export class ChartDataService {
  /**
   * パフォーマンス推移チャートデータを作成
   */
  static createPerformanceLineChart(
    statistics: PerformanceStatistics,
    metricType: PerformanceMetricType
  ): LineChartData {
    const dataPoints: ChartDataPoint[] = statistics.gameResults.map((result, index) => ({
      label: `ゲーム${index + 1}`,
      value: this.getMetricValue(result, metricType),
      score: result.score,
      chain: result.chain,
      playTime: result.playTime,
    }))

    const { title, yAxisLabel, seriesName, dataKey } = this.getChartConfig(metricType)

    return createLineChartData({
      title,
      data: dataPoints,
      series: [
        {
          name: seriesName,
          dataKey,
          color: DEFAULT_CHART_COLORS[0],
          strokeWidth: 3,
        },
      ],
      xAxisLabel: 'ゲーム',
      yAxisLabel,
    })
  }

  /**
   * AI vs 人間比較チャートデータを作成
   */
  static createComparisonChart(comparisonReport: PerformanceReport): LineChartData {
    if (comparisonReport.ai.gamesPlayed === 0 && comparisonReport.human.gamesPlayed === 0) {
      return createLineChartData({
        title: 'AI vs 人間 パフォーマンス比較',
        data: [],
        series: [],
      })
    }

    const dataPoints: ChartDataPoint[] = [
      {
        label: 'スコア',
        value: comparisonReport.ai.avgScore,
        AI: comparisonReport.ai.avgScore,
        Human: comparisonReport.human.avgScore,
      },
      {
        label: '連鎖数',
        value: comparisonReport.ai.avgChain,
        AI: comparisonReport.ai.avgChain,
        Human: comparisonReport.human.avgChain,
      },
      {
        label: 'プレイ時間',
        value: comparisonReport.ai.avgPlayTime,
        AI: comparisonReport.ai.avgPlayTime,
        Human: comparisonReport.human.avgPlayTime,
      },
      {
        label: '連鎖成功率',
        value: comparisonReport.ai.chainSuccessRate * 100,
        AI: comparisonReport.ai.chainSuccessRate * 100,
        Human: comparisonReport.human.chainSuccessRate * 100,
      },
    ]

    return createLineChartData({
      title: 'AI vs 人間 パフォーマンス比較',
      data: dataPoints,
      series: [
        {
          name: 'AI',
          dataKey: 'AI',
          color: DEFAULT_CHART_COLORS[0], // 青
        },
        {
          name: 'Human',
          dataKey: 'Human',
          color: DEFAULT_CHART_COLORS[3], // 赤
        },
      ],
      xAxisLabel: '指標',
      yAxisLabel: '値',
    })
  }

  /**
   * メトリック値を取得
   */
  private static getMetricValue(
    result: GameResultData,
    metricType: PerformanceMetricType
  ): number {
    switch (metricType) {
      case 'score':
        return result.score
      case 'chain':
        return result.chain
      case 'playTime':
        return result.playTime
      default:
        return result.score
    }
  }

  /**
   * チャート設定を取得
   */
  private static getChartConfig(metricType: PerformanceMetricType) {
    switch (metricType) {
      case 'score':
        return {
          title: 'スコア推移',
          yAxisLabel: 'スコア',
          seriesName: 'スコア',
          dataKey: 'score',
        }
      case 'chain':
        return {
          title: '連鎖数推移',
          yAxisLabel: '連鎖数',
          seriesName: '連鎖数',
          dataKey: 'chain',
        }
      case 'playTime':
        return {
          title: 'プレイ時間推移',
          yAxisLabel: '時間',
          seriesName: 'プレイ時間',
          dataKey: 'playTime',
        }
      default:
        return {
          title: 'スコア推移',
          yAxisLabel: 'スコア',
          seriesName: 'スコア',
          dataKey: 'score',
        }
    }
  }
}