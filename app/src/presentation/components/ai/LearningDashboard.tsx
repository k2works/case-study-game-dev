/**
 * 学習ダッシュボードコンポーネント
 */
import { useState } from 'react'

import type {
  LearningConfig,
  LearningResult,
} from '../../../application/services/learning/LearningService'
import type { ModelPerformance } from '../../../domain/models/learning/ModelPerformanceMetrics'
import type { LineChartData } from '../../../domain/models/visualization/ChartData'
import { LineChart } from '../charts/LineChart'

export interface LearningDashboardProps {
  isLearning: boolean
  learningProgress: number
  currentModel: string
  latestPerformance: ModelPerformance | null
  learningHistory: readonly LearningResult[]
  onStartLearning: (config: LearningConfig) => void
  onStopLearning: () => void
  onModelSelect: (modelId: string) => void
}

interface LearningConfigFormData {
  epochs: number
  learningRate: number
  batchSize: number
  validationSplit: number
  modelArchitecture: 'dense' | 'cnn'
  maxSamples: number
}

const defaultConfig: LearningConfigFormData = {
  epochs: 50,
  learningRate: 0.001,
  batchSize: 32,
  validationSplit: 0.2,
  modelArchitecture: 'dense',
  maxSamples: 1000,
}

export function LearningDashboard({
  isLearning,
  learningProgress,
  currentModel,
  latestPerformance,
  learningHistory,
  onStartLearning,
  onStopLearning,
}: LearningDashboardProps) {
  const [config, setConfig] = useState<LearningConfigFormData>(defaultConfig)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleStartLearning = () => {
    const learningConfig: LearningConfig = {
      ...config,
      dataRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 過去7日間
        endDate: new Date(),
      },
      shuffle: true,
      normalizeRewards: true,
    }
    onStartLearning(learningConfig)
  }

  // 学習曲線データの生成
  const generateLearningCurveData = (): LineChartData | null => {
    if (!latestPerformance) return null

    const accuracyData = latestPerformance.trainingMetrics.accuracyHistory.map(
      (acc, index) => ({
        label: `Epoch ${index + 1}`,
        value: Number((acc * 100).toFixed(1)),
        accuracy: Number((acc * 100).toFixed(1)),
      }),
    )

    return {
      title: '学習曲線 - 精度',
      data: accuracyData,
      series: [
        {
          dataKey: 'accuracy',
          name: 'Training Accuracy',
          color: '#3B82F6',
          strokeWidth: 2,
        },
      ],
      xAxisLabel: 'エポック',
      yAxisLabel: '精度 (%)',
    }
  }

  // 損失曲線データの生成
  const generateLossCurveData = (): LineChartData | null => {
    if (!latestPerformance) return null

    const lossData = latestPerformance.trainingMetrics.lossHistory.map(
      (loss, index) => ({
        label: `Epoch ${index + 1}`,
        value: Number(loss.toFixed(4)),
        loss: Number(loss.toFixed(4)),
      }),
    )

    return {
      title: '学習曲線 - 損失',
      data: lossData,
      series: [
        {
          dataKey: 'loss',
          name: 'Training Loss',
          color: '#EF4444',
          strokeWidth: 2,
        },
      ],
      xAxisLabel: 'エポック',
      yAxisLabel: '損失',
    }
  }

  const learningCurveData = generateLearningCurveData()
  const lossCurveData = generateLossCurveData()

  return (
    <DashboardLayout currentModel={currentModel}>
      <LearningControlPanel
        isLearning={isLearning}
        learningProgress={learningProgress}
        config={config}
        showAdvanced={showAdvanced}
        onConfigChange={setConfig}
        onShowAdvancedToggle={() => setShowAdvanced(!showAdvanced)}
        onStartLearning={handleStartLearning}
        onStopLearning={onStopLearning}
      />
      <PerformanceMetricsPanel latestPerformance={latestPerformance} />
      <LearningChartsSection
        learningCurveData={learningCurveData}
        lossCurveData={lossCurveData}
      />
      <LearningHistoryTable learningHistory={learningHistory} />
    </DashboardLayout>
  )
}

// サブコンポーネント群
interface DashboardLayoutProps {
  currentModel: string
  children: React.ReactNode
}

function DashboardLayout({ currentModel, children }: DashboardLayoutProps) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🧠 AI学習ダッシュボード
          </h1>
          <p className="text-gray-600">
            現在のモデル:{' '}
            <span className="font-semibold text-blue-600">{currentModel}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{children}</div>
      </div>
    </div>
  )
}

interface LearningControlPanelProps {
  isLearning: boolean
  learningProgress: number
  config: LearningConfigFormData
  showAdvanced: boolean
  onConfigChange: (config: LearningConfigFormData) => void
  onShowAdvancedToggle: () => void
  onStartLearning: () => void
  onStopLearning: () => void
}

function LearningControlPanel({
  isLearning,
  learningProgress,
  config,
  showAdvanced,
  onConfigChange,
  onShowAdvancedToggle,
  onStartLearning,
  onStopLearning,
}: LearningControlPanelProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        ⚙️ 学習設定
      </h2>
      <LearningStatusDisplay
        isLearning={isLearning}
        learningProgress={learningProgress}
      />
      <LearningConfigForm
        config={config}
        isLearning={isLearning}
        showAdvanced={showAdvanced}
        onConfigChange={onConfigChange}
        onShowAdvancedToggle={onShowAdvancedToggle}
      />
      <LearningControlButtons
        isLearning={isLearning}
        onStartLearning={onStartLearning}
        onStopLearning={onStopLearning}
      />
    </div>
  )
}

function LearningStatusDisplay({
  isLearning,
  learningProgress,
}: {
  isLearning: boolean
  learningProgress: number
}) {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">学習状態</span>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            isLearning
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isLearning ? '学習中' : '待機中'}
        </span>
      </div>
      {isLearning && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>進捗</span>
            <span>{Math.round(learningProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${learningProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface LearningConfigFormProps {
  config: LearningConfigFormData
  isLearning: boolean
  showAdvanced: boolean
  onConfigChange: (config: LearningConfigFormData) => void
  onShowAdvancedToggle: () => void
}

function LearningConfigForm({
  config,
  isLearning,
  showAdvanced,
  onConfigChange,
  onShowAdvancedToggle,
}: LearningConfigFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="epochs"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          エポック数
        </label>
        <input
          id="epochs"
          type="number"
          min="1"
          max="1000"
          value={config.epochs}
          onChange={(e) =>
            onConfigChange({ ...config, epochs: parseInt(e.target.value) })
          }
          disabled={isLearning}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label
          htmlFor="learningRate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          学習率
        </label>
        <input
          id="learningRate"
          type="number"
          min="0.0001"
          max="1"
          step="0.0001"
          value={config.learningRate}
          onChange={(e) =>
            onConfigChange({
              ...config,
              learningRate: parseFloat(e.target.value),
            })
          }
          disabled={isLearning}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label
          htmlFor="batchSize"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          バッチサイズ
        </label>
        <select
          id="batchSize"
          value={config.batchSize}
          onChange={(e) =>
            onConfigChange({ ...config, batchSize: parseInt(e.target.value) })
          }
          disabled={isLearning}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
          <option value={128}>128</option>
        </select>
      </div>
      <button
        onClick={onShowAdvancedToggle}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {showAdvanced ? '詳細設定を隠す' : '詳細設定を表示'}
      </button>
      {showAdvanced && (
        <AdvancedConfigForm
          config={config}
          isLearning={isLearning}
          onConfigChange={onConfigChange}
        />
      )}
    </div>
  )
}

function AdvancedConfigForm({
  config,
  isLearning,
  onConfigChange,
}: {
  config: LearningConfigFormData
  isLearning: boolean
  onConfigChange: (config: LearningConfigFormData) => void
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          検証用データ分割比率
        </label>
        <input
          type="number"
          min="0.1"
          max="0.5"
          step="0.05"
          value={config.validationSplit}
          onChange={(e) =>
            onConfigChange({
              ...config,
              validationSplit: parseFloat(e.target.value),
            })
          }
          disabled={isLearning}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          モデルアーキテクチャ
        </label>
        <select
          value={config.modelArchitecture}
          onChange={(e) =>
            onConfigChange({
              ...config,
              modelArchitecture: e.target.value as 'dense' | 'cnn',
            })
          }
          disabled={isLearning}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="dense">Dense (全結合)</option>
          <option value="cnn">CNN (畳み込み)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          最大サンプル数
        </label>
        <input
          type="number"
          min="100"
          max="10000"
          step="100"
          value={config.maxSamples}
          onChange={(e) =>
            onConfigChange({ ...config, maxSamples: parseInt(e.target.value) })
          }
          disabled={isLearning}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
    </div>
  )
}

function LearningControlButtons({
  isLearning,
  onStartLearning,
  onStopLearning,
}: {
  isLearning: boolean
  onStartLearning: () => void
  onStopLearning: () => void
}) {
  return (
    <div className="mt-6 space-y-2">
      {!isLearning ? (
        <button
          onClick={onStartLearning}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
        >
          🚀 学習開始
        </button>
      ) : (
        <button
          onClick={onStopLearning}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
        >
          ⏹️ 学習停止
        </button>
      )}
    </div>
  )
}

function PerformanceMetricsPanel({
  latestPerformance,
}: {
  latestPerformance: ModelPerformance | null
}) {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        📊 現在のモデル性能
      </h2>
      {latestPerformance ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="学習メトリクス"
            bgColor="bg-blue-50"
            textColor="text-blue-800"
            accentColor="text-blue-600"
            metrics={[
              {
                label: '最終精度',
                value: `${(latestPerformance.trainingMetrics.finalAccuracy * 100).toFixed(1)}%`,
              },
              {
                label: '最終損失',
                value: latestPerformance.trainingMetrics.finalLoss.toFixed(4),
              },
              {
                label: 'エポック数',
                value: latestPerformance.trainingMetrics.epochs.toString(),
              },
              {
                label: '学習時間',
                value: `${Math.round(latestPerformance.trainingMetrics.trainingTime / 1000)}秒`,
              },
            ]}
          />
          <MetricCard
            title="検証メトリクス"
            bgColor="bg-green-50"
            textColor="text-green-800"
            accentColor="text-green-600"
            metrics={[
              {
                label: '検証精度',
                value: `${(latestPerformance.validationMetrics.validationAccuracy * 100).toFixed(1)}%`,
              },
              {
                label: '検証損失',
                value:
                  latestPerformance.validationMetrics.validationLoss.toFixed(4),
              },
              {
                label: '過学習スコア',
                value:
                  latestPerformance.validationMetrics.overfittingScore.toFixed(
                    2,
                  ),
              },
              {
                label: '安定性スコア',
                value:
                  latestPerformance.validationMetrics.stabilityScore.toFixed(2),
              },
            ]}
          />
          <MetricCard
            title="リソースメトリクス"
            bgColor="bg-purple-50"
            textColor="text-purple-800"
            accentColor="text-purple-600"
            metrics={[
              {
                label: 'モデルサイズ',
                value: `${(latestPerformance.resourceMetrics.modelSize / (1024 * 1024)).toFixed(1)} MB`,
              },
              {
                label: '推論時間',
                value: `${latestPerformance.resourceMetrics.inferenceTime}ms`,
              },
              {
                label: 'メモリ使用量',
                value: `${(latestPerformance.resourceMetrics.memoryUsage / (1024 * 1024)).toFixed(1)} MB`,
              },
              ...(latestPerformance.resourceMetrics.gpuUtilization
                ? [
                    {
                      label: 'GPU使用率',
                      value: `${(latestPerformance.resourceMetrics.gpuUtilization * 100).toFixed(1)}%`,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">モデル性能データがありません</p>
          <p className="text-sm mt-2">
            学習を実行してモデル性能を確認してください
          </p>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  bgColor: string
  textColor: string
  accentColor: string
  metrics: Array<{ label: string; value: string }>
}

function MetricCard({
  title,
  bgColor,
  textColor,
  accentColor,
  metrics,
}: MetricCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <h3 className={`text-sm font-semibold ${textColor} mb-3`}>{title}</h3>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between">
            <span className={`text-sm ${accentColor}`}>{metric.label}:</span>
            <span className={`text-sm font-medium ${textColor}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LearningChartsSection({
  learningCurveData,
  lossCurveData,
}: {
  learningCurveData: LineChartData | null
  lossCurveData: LineChartData | null
}) {
  if (!learningCurveData && !lossCurveData) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {learningCurveData && (
        <div className="bg-white rounded-lg shadow-sm">
          <LineChart data={learningCurveData} height={300} />
        </div>
      )}
      {lossCurveData && (
        <div className="bg-white rounded-lg shadow-sm">
          <LineChart data={lossCurveData} height={300} />
        </div>
      )}
    </div>
  )
}

function LearningHistoryTable({
  learningHistory,
}: {
  learningHistory: readonly LearningResult[]
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        📋 学習履歴
      </h2>
      {learningHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  モデル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  精度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サンプル数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  学習時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {learningHistory
                .slice(-10)
                .reverse()
                .map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date().toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.modelPath.split('/').pop() || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(result.statistics.validationAccuracy * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.statistics.totalSamples.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(result.statistics.trainingTime / 1000)}秒
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.success
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.success ? '成功' : '失敗'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">学習履歴がありません</p>
          <p className="text-sm mt-2">学習を実行すると履歴が表示されます</p>
        </div>
      )}
    </div>
  )
}
