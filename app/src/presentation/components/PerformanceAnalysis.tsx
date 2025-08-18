/**
 * パフォーマンス分析コンポーネント
 */
import type { PerformanceStatistics } from '../../application/services/PerformanceAnalysisService'
import type { PerformanceReport } from '../../domain/models/ai/types'

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
  // データが空の場合
  if (statistics.totalGames === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          パフォーマンス分析
        </h3>
        <div className="text-center text-gray-500 py-8">
          <p>データがありません</p>
          <p className="text-sm mt-2">
            ゲームをプレイして統計を確認してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">パフォーマンス分析</h3>
        <button
          onClick={onResetData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          データをリセット
        </button>
      </div>

      {/* 全体統計 */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">全体統計</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">総ゲーム数</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(statistics.totalGames)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">平均スコア</p>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(statistics.averageScore)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">平均連鎖数</p>
            <p className="text-2xl font-bold text-purple-600">
              {statistics.averageChain.toFixed(1)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">連鎖成功率</p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatPercentage(statistics.chainSuccessRate)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">平均プレイ時間</p>
            <p className="text-xl font-bold text-gray-700">
              {formatPlayTime(statistics.averagePlayTime)}
            </p>
          </div>
        </div>
      </div>

      {/* AI vs 人間比較 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-4">
          AI vs 人間比較
        </h4>

        {comparisonReport.ai.gamesPlayed === 0 &&
        comparisonReport.human.gamesPlayed === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>比較データがありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* スコア比較 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 mb-3">スコア比較</h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">AI</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatNumber(comparisonReport.ai.avgScore)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({comparisonReport.ai.gamesPlayed}ゲーム)
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">比率</p>
                  <p className="text-lg font-bold text-gray-700">
                    {comparisonReport.comparison.scoreRatio.toFixed(2)}:1
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">人間</p>
                  <p className="text-xl font-bold text-red-700">
                    {formatNumber(comparisonReport.human.avgScore)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({comparisonReport.human.gamesPlayed}ゲーム)
                  </p>
                </div>
              </div>
            </div>

            {/* 連鎖比較 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 mb-3">連鎖比較</h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">AI</p>
                  <p className="text-xl font-bold text-blue-700">
                    {comparisonReport.ai.avgChain.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">比率</p>
                  <p className="text-lg font-bold text-gray-700">
                    {comparisonReport.comparison.chainRatio.toFixed(2)}:1
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">人間</p>
                  <p className="text-xl font-bold text-red-700">
                    {comparisonReport.human.avgChain.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* プレイ時間比較 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 mb-3">
                プレイ時間比較
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">AI</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatPlayTime(comparisonReport.ai.avgPlayTime)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">比率</p>
                  <p className="text-lg font-bold text-gray-700">
                    {comparisonReport.comparison.playTimeRatio.toFixed(2)}:1
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">人間</p>
                  <p className="text-lg font-bold text-red-700">
                    {formatPlayTime(comparisonReport.human.avgPlayTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* 連鎖成功率比較 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-700 mb-3">
                連鎖成功率比較
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">AI</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatPercentage(comparisonReport.ai.chainSuccessRate)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">人間</p>
                  <p className="text-xl font-bold text-red-700">
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
