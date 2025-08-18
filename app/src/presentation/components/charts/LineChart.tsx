/**
 * ラインチャートコンポーネント
 */
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { LineChartData } from '../../../domain/models/visualization/ChartData'

interface LineChartProps {
  data: LineChartData
  width?: number
  height?: number
  className?: string
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
 * ラインチャートコンポーネント
 */
export function LineChart({
  data,
  width,
  height = 300,
  className = '',
}: LineChartProps) {
  if (data.data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">{data.title}</p>
          <p className="text-sm mt-2">データがありません</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 px-4 pt-4">
        {data.title}
      </h3>
      <ResponsiveContainer width={width || '100%'} height={height}>
        <RechartsLineChart
          data={data.data as Array<Record<string, string | number | Date>>}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 50,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            label={
              data.xAxisLabel
                ? {
                    value: data.xAxisLabel,
                    position: 'insideBottom',
                    offset: -5,
                  }
                : undefined
            }
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            label={
              data.yAxisLabel
                ? { value: data.yAxisLabel, angle: -90, position: 'insideLeft' }
                : undefined
            }
          />
          <Tooltip content={<CustomTooltip />} />
          {data.series.map((series) => (
            <Line
              key={series.dataKey}
              type="monotone"
              dataKey={series.dataKey}
              stroke={series.color}
              strokeWidth={series.strokeWidth || 2}
              dot={{ fill: series.color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
