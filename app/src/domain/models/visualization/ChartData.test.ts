/**
 * チャートデータドメインモデルのテスト
 */
import { describe, expect, test } from 'vitest'

import {
  type ChartDataPoint,
  type ChartSeries,
  type LineChartData,
  createChartDataPoint,
  createLineChartData,
  formatChartValue,
  isValidChartDataPoint,
} from './ChartData'

describe('ChartData', () => {
  describe('createChartDataPoint', () => {
    test('有効なデータポイントを作成できる', () => {
      // Arrange & Act
      const dataPoint = createChartDataPoint({
        label: 'ゲーム1',
        value: 1500,
        timestamp: new Date('2025-01-01T10:00:00Z'),
      })

      // Assert
      expect(dataPoint.label).toBe('ゲーム1')
      expect(dataPoint.value).toBe(1500)
      expect(dataPoint.timestamp).toEqual(new Date('2025-01-01T10:00:00Z'))
    })

    test('必須フィールドのみでデータポイントを作成できる', () => {
      // Arrange & Act
      const dataPoint = createChartDataPoint({
        label: 'テスト',
        value: 100,
      })

      // Assert
      expect(dataPoint.label).toBe('テスト')
      expect(dataPoint.value).toBe(100)
      expect(dataPoint.timestamp).toBeUndefined()
    })
  })

  describe('isValidChartDataPoint', () => {
    test('有効なデータポイントを正しく検証する', () => {
      // Arrange
      const validDataPoint: ChartDataPoint = {
        label: 'テスト',
        value: 100,
      }

      // Act & Assert
      expect(isValidChartDataPoint(validDataPoint)).toBe(true)
    })

    test('無効なデータポイントを正しく検証する', () => {
      // Arrange
      const invalidDataPoints = [
        { label: '', value: 100 }, // 空のラベル
        { label: 'テスト', value: NaN }, // NaN値
        { label: 'テスト', value: Infinity }, // 無限大値
      ]

      // Act & Assert
      invalidDataPoints.forEach((dataPoint) => {
        expect(isValidChartDataPoint(dataPoint)).toBe(false)
      })
    })
  })

  describe('formatChartValue', () => {
    test('数値を適切にフォーマットする', () => {
      // Arrange & Act & Assert
      expect(formatChartValue(1000)).toBe('1,000')
      expect(formatChartValue(1234.56)).toBe('1,235')
      expect(formatChartValue(0)).toBe('0')
      expect(formatChartValue(-500)).toBe('-500')
    })

    test('パーセンテージフォーマットを使用できる', () => {
      // Arrange & Act & Assert
      expect(formatChartValue(0.75, 'percentage')).toBe('75.0%')
      expect(formatChartValue(0.123, 'percentage')).toBe('12.3%')
      expect(formatChartValue(1.0, 'percentage')).toBe('100.0%')
    })

    test('時間フォーマットを使用できる', () => {
      // Arrange & Act & Assert
      expect(formatChartValue(65000, 'time')).toBe('1分5秒')
      expect(formatChartValue(3600000, 'time')).toBe('60分0秒')
      expect(formatChartValue(1500, 'time')).toBe('0分1秒')
    })
  })

  describe('createLineChartData', () => {
    test('ラインチャートデータを作成できる', () => {
      // Arrange
      const series1: ChartSeries = {
        name: 'スコア',
        dataKey: 'score',
        color: '#8884d8',
      }

      const series2: ChartSeries = {
        name: '連鎖数',
        dataKey: 'chains',
        color: '#82ca9d',
      }

      const dataPoints: ChartDataPoint[] = [
        { label: 'ゲーム1', value: 1000, score: 1000, chains: 3 },
        { label: 'ゲーム2', value: 1500, score: 1500, chains: 5 },
        { label: 'ゲーム3', value: 2000, score: 2000, chains: 7 },
      ]

      // Act
      const chartData: LineChartData = createLineChartData({
        title: 'パフォーマンス推移',
        data: dataPoints,
        series: [series1, series2],
      })

      // Assert
      expect(chartData.title).toBe('パフォーマンス推移')
      expect(chartData.data).toEqual(dataPoints)
      expect(chartData.series).toEqual([series1, series2])
      expect(chartData.xAxisLabel).toBeUndefined()
      expect(chartData.yAxisLabel).toBeUndefined()
    })

    test('軸ラベル付きでラインチャートデータを作成できる', () => {
      // Arrange
      const series: ChartSeries = {
        name: 'スコア',
        dataKey: 'score',
        color: '#8884d8',
      }

      const dataPoints: ChartDataPoint[] = [
        { label: 'ゲーム1', value: 1000 },
      ]

      // Act
      const chartData: LineChartData = createLineChartData({
        title: 'スコア推移',
        data: dataPoints,
        series: [series],
        xAxisLabel: 'ゲーム回数',
        yAxisLabel: 'スコア',
      })

      // Assert
      expect(chartData.xAxisLabel).toBe('ゲーム回数')
      expect(chartData.yAxisLabel).toBe('スコア')
    })
  })
})