/**
 * LineChartコンポーネントのテスト
 */
import { render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import type { LineChartData } from '../../../domain/models/visualization/ChartData'

import { LineChart } from './LineChart'

describe('LineChart', () => {
  describe('データがある場合', () => {
    test('チャートタイトルが表示される', () => {
      // Arrange
      const chartData: LineChartData = {
        title: 'スコア推移',
        data: [
          { label: 'ゲーム1', value: 1000 },
          { label: 'ゲーム2', value: 1500 },
        ],
        series: [
          {
            name: 'スコア',
            dataKey: 'value',
            color: '#8884d8',
          },
        ],
      }

      // Act
      const { getByText } = render(<LineChart data={chartData} />)

      // Assert
      expect(getByText('スコア推移')).toBeInTheDocument()
    })

    test('軸ラベル付きでレンダリングされる', () => {
      // Arrange
      const chartData: LineChartData = {
        title: 'スコア推移',
        data: [
          { label: 'ゲーム1', value: 1000 },
        ],
        series: [
          {
            name: 'スコア',
            dataKey: 'value',
            color: '#8884d8',
          },
        ],
        xAxisLabel: 'ゲーム',
        yAxisLabel: 'スコア',
      }

      // Act
      const { getByText, container } = render(<LineChart data={chartData} />)

      // Assert
      expect(getByText('スコア推移')).toBeInTheDocument()
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })
  })

  describe('データが空の場合', () => {
    test('空データメッセージが表示される', () => {
      // Arrange
      const chartData: LineChartData = {
        title: 'スコア推移',
        data: [],
        series: [
          {
            name: 'スコア',
            dataKey: 'value',
            color: '#8884d8',
          },
        ],
      }

      // Act
      const { getByText } = render(<LineChart data={chartData} />)

      // Assert
      expect(getByText('データがありません')).toBeInTheDocument()
    })
  })

  describe('レスポンシブ対応', () => {
    test('ResponsiveContainerがレンダリングされる', () => {
      // Arrange
      const chartData: LineChartData = {
        title: 'テストチャート',
        data: [{ label: 'test', value: 100 }],
        series: [{ name: 'test', dataKey: 'value', color: '#8884d8' }],
      }

      // Act
      const { container } = render(<LineChart data={chartData} />)

      // Assert
      const responsiveContainer = container.querySelector('.recharts-responsive-container')
      expect(responsiveContainer).toBeInTheDocument()
    })
  })
})