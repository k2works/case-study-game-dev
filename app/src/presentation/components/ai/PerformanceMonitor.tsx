/**
 * mayah AIパフォーマンス監視コンポーネント
 */
import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  /** 平均評価時間（ミリ秒） */
  avgEvaluationTime: number
  /** 最大評価時間（ミリ秒） */
  maxEvaluationTime: number
  /** 最小評価時間（ミリ秒） */
  minEvaluationTime: number
  /** 総評価回数 */
  totalEvaluations: number
  /** キャッシュヒット率 */
  cacheHitRate: number
  /** メモリ使用量推定（MB） */
  estimatedMemoryUsage: number
  /** 1秒あたりの評価回数 */
  evaluationsPerSecond: number
}

interface PerformanceMonitorProps {
  /** パフォーマンスメトリクス */
  metrics: PerformanceMetrics | null
  /** 監視中フラグ */
  isMonitoring: boolean
  /** リアルタイム更新フラグ */
  realTimeUpdates: boolean
  /** 監視開始・停止ハンドラ */
  onToggleMonitoring: () => void
  /** メトリクスリセットハンドラ */
  onResetMetrics: () => void
}

export const PerformanceMonitor = ({
  metrics,
  isMonitoring,
  realTimeUpdates,
  onToggleMonitoring,
  onResetMetrics,
}: PerformanceMonitorProps) => {
  const [historicalData, setHistoricalData] = useState<number[]>([])

  // パフォーマンス履歴の管理
  useEffect(() => {
    if (metrics && realTimeUpdates) {
      setHistoricalData((prev) => {
        const newData = [...prev, metrics.avgEvaluationTime]
        // 最新50件まで保持
        return newData.slice(-50)
      })
    }
  }, [metrics, realTimeUpdates])

  const getPerformanceStatus = ():
    | 'excellent'
    | 'good'
    | 'warning'
    | 'critical' => {
    if (!metrics) return 'good'

    const avgTime = metrics.avgEvaluationTime
    if (avgTime < 10) return 'excellent'
    if (avgTime < 50) return 'good'
    if (avgTime < 100) return 'warning'
    return 'critical'
  }

  const status = getPerformanceStatus()

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
      <PerformanceHeader
        isMonitoring={isMonitoring}
        status={status}
        onToggleMonitoring={onToggleMonitoring}
        onResetMetrics={onResetMetrics}
      />

      {metrics ? (
        <>
          <PerformanceOverview metrics={metrics} status={status} />
          <PerformanceDetails metrics={metrics} />
          <PerformanceChart
            data={historicalData}
            isRealTime={realTimeUpdates}
          />
        </>
      ) : (
        <div className="text-center text-gray-400 py-8">
          パフォーマンスデータがありません
        </div>
      )}
    </div>
  )
}

interface PerformanceHeaderProps {
  isMonitoring: boolean
  status: string
  onToggleMonitoring: () => void
  onResetMetrics: () => void
}

const PerformanceHeader = ({
  isMonitoring,
  status,
  onToggleMonitoring,
  onResetMetrics,
}: PerformanceHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400'
      case 'good':
        return 'text-blue-400'
      case 'warning':
        return 'text-yellow-400'
      case 'critical':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return '🚀'
      case 'good':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'critical':
        return '🚨'
      default:
        return '📊'
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-white flex items-center">
          📈 パフォーマンス監視
          {isMonitoring && (
            <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          )}
        </h3>
        <div
          className={`flex items-center space-x-1 ${getStatusColor(status)}`}
        >
          <span>{getStatusIcon(status)}</span>
          <span className="text-sm capitalize">{status}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onToggleMonitoring}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isMonitoring
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isMonitoring ? '停止' : '開始'}
        </button>
        <button
          onClick={onResetMetrics}
          className="px-3 py-1 rounded text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  )
}

interface PerformanceOverviewProps {
  metrics: PerformanceMetrics
  status: string
}

const PerformanceOverview = ({ metrics, status }: PerformanceOverviewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'from-green-900/30 to-green-800/30'
      case 'good':
        return 'from-blue-900/30 to-blue-800/30'
      case 'warning':
        return 'from-yellow-900/30 to-yellow-800/30'
      case 'critical':
        return 'from-red-900/30 to-red-800/30'
      default:
        return 'from-gray-900/30 to-gray-800/30'
    }
  }

  return (
    <div
      className={`bg-gradient-to-r ${getStatusColor(status)} rounded-lg p-4`}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="平均時間"
          value={`${metrics.avgEvaluationTime.toFixed(1)}ms`}
          icon="⏱️"
        />
        <MetricCard
          label="評価回数"
          value={metrics.totalEvaluations.toString()}
          icon="🔢"
        />
        <MetricCard
          label="キャッシュ率"
          value={`${(metrics.cacheHitRate * 100).toFixed(1)}%`}
          icon="💾"
        />
        <MetricCard
          label="処理能力"
          value={`${metrics.evaluationsPerSecond.toFixed(1)}/s`}
          icon="⚡"
        />
      </div>
    </div>
  )
}

interface PerformanceDetailsProps {
  metrics: PerformanceMetrics
}

const PerformanceDetails = ({ metrics }: PerformanceDetailsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="text-white font-medium mb-3">⏰ 時間統計</h4>
      <div className="space-y-2">
        <StatRow
          label="最小時間"
          value={`${metrics.minEvaluationTime.toFixed(1)}ms`}
        />
        <StatRow
          label="平均時間"
          value={`${metrics.avgEvaluationTime.toFixed(1)}ms`}
        />
        <StatRow
          label="最大時間"
          value={`${metrics.maxEvaluationTime.toFixed(1)}ms`}
        />
        <StatRow
          label="時間範囲"
          value={`${(metrics.maxEvaluationTime - metrics.minEvaluationTime).toFixed(1)}ms`}
        />
      </div>
    </div>

    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="text-white font-medium mb-3">💾 リソース使用量</h4>
      <div className="space-y-2">
        <StatRow
          label="推定メモリ"
          value={`${metrics.estimatedMemoryUsage.toFixed(1)}MB`}
        />
        <StatRow
          label="キャッシュ効率"
          value={`${(metrics.cacheHitRate * 100).toFixed(1)}%`}
        />
        <StatRow
          label="処理効率"
          value={`${(1000 / metrics.avgEvaluationTime).toFixed(1)} eval/s`}
        />
        <StatRow label="総処理量" value={`${metrics.totalEvaluations} 回`} />
      </div>
    </div>
  </div>
)

interface PerformanceChartProps {
  data: number[]
  isRealTime: boolean
}

const PerformanceChart = ({ data, isRealTime }: PerformanceChartProps) => {
  if (data.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">📊 パフォーマンス推移</h4>
        <div className="text-center text-gray-400 py-8">データがありません</div>
      </div>
    )
  }

  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">📊 パフォーマンス推移</h4>
        {isRealTime && (
          <span className="text-sm text-green-400 flex items-center">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2"></span>
            リアルタイム
          </span>
        )}
      </div>

      <div className="h-24 flex items-end space-x-1 overflow-hidden">
        {data.map((value, index) => {
          const height = ((value - minValue) / range) * 100
          return (
            <div
              key={index}
              className="bg-blue-500/60 hover:bg-blue-400/80 transition-colors min-w-[2px] flex-1"
              style={{ height: `${Math.max(height, 2)}%` }}
              title={`${value.toFixed(1)}ms`}
            />
          )
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{minValue.toFixed(1)}ms</span>
        <span>最新 {data.length} 件</span>
        <span>{maxValue.toFixed(1)}ms</span>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  icon: string
}

const MetricCard = ({ label, value, icon }: MetricCardProps) => (
  <div className="text-center">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-white font-mono text-lg">{value}</div>
    <div className="text-gray-300 text-sm">{label}</div>
  </div>
)

interface StatRowProps {
  label: string
  value: string
}

const StatRow = ({ label, value }: StatRowProps) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-300">{label}</span>
    <span className="text-sm font-mono text-white">{value}</span>
  </div>
)
