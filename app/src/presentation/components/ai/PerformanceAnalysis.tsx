/**
 * パフォーマンス分析コンポーネント
 */
import { useState } from 'react'

import type { PerformanceStatistics } from '../../../application/services/PerformanceAnalysisService'
import { ChartDataService } from '../../../application/services/visualization/ChartDataService'
import type { PerformanceMetricType } from '../../../application/services/visualization/ChartDataService'
import type { PerformanceReport } from '../../../domain/models/ai'
import { LineChart } from '../charts/LineChart'

interface PerformanceAnalysisProps {
  statistics: PerformanceStatistics
  comparisonReport: PerformanceReport
  onResetData: () => void
}

/**
 * 時間（ミリ秒）を分秒形式に変換
 */
function formatPlayTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}分${seconds}秒`
}

/**
 * 数値を3桁区切りでフォーマット
 */
function formatNumber(num: number): string {
  return Math.round(num).toLocaleString()
}

/**
 * パーセンテージをフォーマット
 */
function formatPercentage(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

/**
 * パフォーマンス分析コンポーネント
 */
export function PerformanceAnalysis({
  statistics,
  comparisonReport,
  onResetData,
}: PerformanceAnalysisProps) {
  // チャート表示設定
  const [selectedMetric, setSelectedMetric] =
    useState<PerformanceMetricType>('score')
  const [showCharts, setShowCharts] = useState(false)

  // データが空の場合
  if (statistics.totalGames === 0) {
    return (
      <div className="bg-white dark:bg-purple-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-purple-100 mb-4">
          パフォーマンス分析
        </h3>
        <div className="text-center text-gray-500 dark:text-purple-400 py-8">
          <p>データがありません</p>
          <p className="text-sm mt-2">
            ゲームをプレイして統計を確認してください
          </p>
        </div>
      </div>
    )
  }

  // チャートデータの生成
  const performanceChartData = ChartDataService.createPerformanceLineChart(
    statistics,
    selectedMetric,
  )
  const comparisonChartData =
    ChartDataService.createComparisonChart(comparisonReport)

  return (
    <div className="bg-white dark:bg-purple-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-purple-100">
          パフォーマンス分析
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="px-4 py-2 bg-blue-500 dark:bg-purple-600 text-white rounded hover:bg-blue-600 dark:hover:bg-purple-700 transition-colors"
          >
            {showCharts ? 'チャートを非表示' : 'チャートを表示'}
          </button>
          <button
            onClick={onResetData}
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
          >
            データをリセット
          </button>
        </div>
      </div>

      {/* 全体統計 */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-purple-300 mb-4">
          全体統計
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-purple-400">
              総ゲーム数
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-purple-400">
              {formatNumber(statistics.totalGames)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-purple-400">
              平均スコア
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-purple-400">
              {formatNumber(statistics.averageScore)}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-purple-400">
              平均連鎖数
            </p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {statistics.averageChain.toFixed(1)}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-purple-400">
              連鎖成功率
            </p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-purple-400">
              {formatPercentage(statistics.chainSuccessRate)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-50 dark:bg-purple-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-purple-400">
              平均プレイ時間
            </p>
            <p className="text-xl font-bold text-gray-700 dark:text-purple-300">
              {formatPlayTime(statistics.averagePlayTime)}
            </p>
          </div>
        </div>
      </div>

      {/* チャートセクション */}
      {showCharts && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-purple-300 mb-4">
            データ可視化
          </h4>

          {/* メトリック選択 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-purple-300 mb-2">
              表示メトリック
            </label>
            <select
              value={selectedMetric}
              onChange={(e) =>
                setSelectedMetric(e.target.value as PerformanceMetricType)
              }
              className="px-3 py-2 border border-gray-300 dark:border-purple-600 bg-white dark:bg-purple-700 text-gray-900 dark:text-purple-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-400"
            >
              <option value="score">スコア推移</option>
              <option value="chain">連鎖数推移</option>
              <option value="playTime">プレイ時間推移</option>
            </select>
          </div>

          {/* パフォーマンス推移チャート */}
          <div className="mb-6">
            <LineChart data={performanceChartData} height={300} />
          </div>

          {/* AI vs 人間比較チャート */}
          {comparisonChartData.data.length > 0 && (
            <div className="mb-6">
              <LineChart data={comparisonChartData} height={300} />
            </div>
          )}
        </div>
      )}

      {/* AI vs 人間比較 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 dark:text-purple-300 mb-4">
          AI vs 人間比較
        </h4>

        {comparisonReport.ai.gamesPlayed === 0 &&
        comparisonReport.human.gamesPlayed === 0 ? (
          <div className="text-center text-gray-500 dark:text-purple-400 py-4">
            <p>比較データがありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* スコア比較 */}
            <div className="bg-gray-50 dark:bg-purple-700/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 dark:text-purple-300 mb-3">
                スコア比較
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-purple-400 font-medium">
                    AI
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-purple-300">
                    {formatNumber(comparisonReport.ai.avgScore)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-purple-400">
                    ({comparisonReport.ai.gamesPlayed}ゲーム)
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-purple-400">
                    比率
                  </p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {comparisonReport.comparison.scoreRatio.toFixed(2)}:1
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    人間
                  </p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    {formatNumber(comparisonReport.human.avgScore)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-purple-400">
                    ({comparisonReport.human.gamesPlayed}ゲーム)
                  </p>
                </div>
              </div>
            </div>

            {/* 連鎖比較 */}
            <div className="bg-gray-50 dark:bg-purple-700/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 dark:text-purple-300 mb-3">
                連鎖比較
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-purple-400 font-medium">
                    AI
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-purple-300">
                    {comparisonReport.ai.avgChain.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-purple-400">
                    比率
                  </p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {comparisonReport.comparison.chainRatio.toFixed(2)}:1
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    人間
                  </p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    {comparisonReport.human.avgChain.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* プレイ時間比較 */}
            <div className="bg-gray-50 dark:bg-purple-700/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 dark:text-purple-300 mb-3">
                プレイ時間比較
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-purple-400 font-medium">
                    AI
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {formatPlayTime(comparisonReport.ai.avgPlayTime)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-purple-400">
                    比率
                  </p>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {comparisonReport.comparison.playTimeRatio.toFixed(2)}:1
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    人間
                  </p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-300">
                    {formatPlayTime(comparisonReport.human.avgPlayTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* 連鎖成功率比較 */}
            <div className="bg-gray-50 dark:bg-purple-700/50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 dark:text-purple-300 mb-3">
                連鎖成功率比較
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 dark:text-purple-400 font-medium">
                    AI
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-purple-300">
                    {formatPercentage(comparisonReport.ai.chainSuccessRate)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    人間
                  </p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    {formatPercentage(comparisonReport.human.chainSuccessRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
