/**
 * パフォーマンスチャートコンポーネント
 * ゲーム・学習パフォーマンスデータを可視化
 */
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useState } from 'react'

import type { PerformanceReport } from '../../../domain/models/ai/index'
import type {
  LearningCurve,
  PerformanceTrend,
} from '../../../domain/models/learning/ModelPerformanceMetrics'
import type { PerformanceStatistics } from '../../../application/services/PerformanceAnalysisService'
import {
  ChartDataService,
  type PerformanceMetricType,
} from '../../../application/services/visualization/ChartDataService'

type ChartType = 'line' | 'bar' | 'area'
type DataType =
  | 'gamePerformance'
  | 'aiComparison'
  | 'learningCurve'
  | 'performanceTrend'

interface PerformanceChartProps {
  // ゲームパフォーマンスデータ
  statistics?: PerformanceStatistics
  comparisonReport?: PerformanceReport

  // 学習パフォーマンスデータ
  learningCurve?: LearningCurve
  performanceTrend?: PerformanceTrend

  // チャート設定
  dataType: DataType
  chartType?: ChartType
  metricType?: PerformanceMetricType
  className?: string
  height?: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number | string
    color: string
  }>
  label?: string
}

/**
 * チャートデータ作成ヘルパー関数
 */
function createChartData(
  dataType: DataType,
  statistics?: PerformanceStatistics,
  comparisonReport?: PerformanceReport,
  learningCurve?: LearningCurve,
  performanceTrend?: PerformanceTrend,
  selectedMetric?: PerformanceMetricType,
) {
  const dataCreators = {
    gamePerformance: () =>
      statistics && selectedMetric
        ? ChartDataService.createPerformanceLineChart(statistics, selectedMetric)
        : null,
    aiComparison: () =>
      comparisonReport ? ChartDataService.createComparisonChart(comparisonReport) : null,
    learningCurve: () =>
      learningCurve ? createLearningCurveData(learningCurve) : null,
    performanceTrend: () =>
      performanceTrend ? createPerformanceTrendData(performanceTrend) : null,
  }

  const creator = dataCreators[dataType as keyof typeof dataCreators]
  return creator ? creator() : null
}

/**
 * 学習曲線データ作成
 */
function createLearningCurveData(learningCurve: LearningCurve) {
  return {
    title: '学習曲線',
    data: learningCurve.epochs.map((epoch, index) => ({
      label: `Epoch ${epoch}`,
      value: learningCurve.trainLoss[index] || 0,
      trainLoss: learningCurve.trainLoss[index] || 0,
      validationLoss: learningCurve.validationLoss[index] || 0,
      trainAccuracy: learningCurve.trainAccuracy[index] || 0,
      validationAccuracy: learningCurve.validationAccuracy[index] || 0,
    })),
    series: [
      { name: 'Training Loss', dataKey: 'trainLoss', color: '#EF4444' },
      { name: 'Validation Loss', dataKey: 'validationLoss', color: '#F59E0B' },
      { name: 'Training Accuracy', dataKey: 'trainAccuracy', color: '#10B981' },
      {
        name: 'Validation Accuracy',
        dataKey: 'validationAccuracy',
        color: '#3B82F6',
      },
    ],
    xAxisLabel: 'Epoch',
    yAxisLabel: 'Value',
  }
}

/**
 * パフォーマンス推移データ作成
 */
function createPerformanceTrendData(performanceTrend: PerformanceTrend) {
  return {
    title: 'パフォーマンス推移',
    data: performanceTrend.timePoints.map((time, index) => ({
      label: time.toLocaleDateString(),
      value: performanceTrend.accuracyTrend[index] || 0,
      accuracy: performanceTrend.accuracyTrend[index] || 0,
      loss: performanceTrend.lossTrend[index] || 0,
      gameScore: performanceTrend.gameScoreTrend[index] || 0,
      modelSize: performanceTrend.modelSizeTrend[index] || 0,
    })),
    series: [
      { name: 'Accuracy', dataKey: 'accuracy', color: '#10B981' },
      { name: 'Loss', dataKey: 'loss', color: '#EF4444' },
      { name: 'Game Score', dataKey: 'gameScore', color: '#3B82F6' },
    ],
    xAxisLabel: 'Date',
    yAxisLabel: 'Value',
  }
}

/**
 * チャートコンポーネント作成
 */
function createChartComponent(
  chartType: ChartType,
  chartData: any,
) {
  const commonProps = {
    data: chartData.data,
    margin: { top: 5, right: 30, left: 20, bottom: 50 },
  }

  switch (chartType) {
    case 'bar':
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {chartData.series.map((series: any) => (
            <Bar
              key={series.dataKey}
              dataKey={series.dataKey}
              fill={series.color}
            />
          ))}
        </BarChart>
      )

    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {chartData.series.map((series: any) => (
            <Area
              key={series.dataKey}
              type="monotone"
              dataKey={series.dataKey}
              stroke={series.color}
              fill={series.color}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      )

    default: // line
      return (
        <RechartsLineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {chartData.series.map((series: any) => (
            <Line
              key={series.dataKey}
              type="monotone"
              dataKey={series.dataKey}
              stroke={series.color}
              strokeWidth={2}
              dot={{ fill: series.color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      )
  }
}

/**
 * カスタムツールチップコンポーネント
 */
function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}:{' '}
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/**
 * チャートヘッダー表示コンポーネント
 */
function ChartHeader({
  chartData,
  dataType,
  selectedMetric,
  chartType,
  onMetricChange,
}: {
  chartData: { title: string }
  dataType: DataType
  selectedMetric: PerformanceMetricType
  chartType: ChartType
  onMetricChange: (metric: PerformanceMetricType) => void
}) {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{chartData.title}</h3>
        <div className="flex items-center space-x-4">
          {dataType === 'gamePerformance' && (
            <select
              value={selectedMetric}
              onChange={(e) => onMetricChange(e.target.value as PerformanceMetricType)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="score">スコア</option>
              <option value="chain">連鎖数</option>
              <option value="playTime">プレイ時間</option>
            </select>
          )}
          <span className="text-xs text-gray-500 capitalize">{chartType} chart</span>
        </div>
      </div>
    </div>
  )
}

/**
 * パフォーマンスチャートコンポーネント
 */
export function PerformanceChart(props: PerformanceChartProps) {
  const {
    statistics,
    comparisonReport,
    learningCurve,
    performanceTrend,
    dataType,
    chartType = 'line',
    metricType = 'score',
    className = '',
    height = 400,
  } = props

  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetricType>(metricType)

  const chartData = createChartData(
    dataType,
    statistics,
    comparisonReport,
    learningCurve,
    performanceTrend,
    selectedMetric,
  )

  if (!chartData || chartData.data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">パフォーマンスチャート</p>
          <p className="text-sm mt-2">データがありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <ChartHeader
        chartData={chartData}
        dataType={dataType}
        selectedMetric={selectedMetric}
        chartType={chartType}
        onMetricChange={setSelectedMetric}
      />
      <div className="p-4">
        <ResponsiveContainer width="100%" height={height}>
          {createChartComponent(chartType, chartData)}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
