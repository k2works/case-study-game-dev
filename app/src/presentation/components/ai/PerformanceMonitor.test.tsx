/**
 * PerformanceMonitorコンポーネントのテスト
 */
import { describe, expect, it, vi } from 'vitest'

import { fireEvent, render, screen } from '@testing-library/react'

import { PerformanceMonitor } from './PerformanceMonitor'

interface PerformanceMetrics {
  avgEvaluationTime: number
  maxEvaluationTime: number
  minEvaluationTime: number
  totalEvaluations: number
  cacheHitRate: number
  estimatedMemoryUsage: number
  evaluationsPerSecond: number
}

describe('PerformanceMonitor', () => {
  const createMockMetrics = (
    overrides: Partial<PerformanceMetrics> = {},
  ): PerformanceMetrics => ({
    avgEvaluationTime: 25.5,
    maxEvaluationTime: 45.0,
    minEvaluationTime: 10.0,
    totalEvaluations: 150,
    cacheHitRate: 0.75,
    estimatedMemoryUsage: 12.5,
    evaluationsPerSecond: 15.8,
    ...overrides,
  })

  const defaultProps = {
    metrics: createMockMetrics(),
    isMonitoring: false,
    realTimeUpdates: false,
    onToggleMonitoring: vi.fn(),
    onResetMetrics: vi.fn(),
  }

  it('基本的なパフォーマンス情報が表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} />)

    // Assert
    expect(screen.getByText('📈 パフォーマンス監視')).toBeInTheDocument()
    const timeElements = screen.getAllByText('25.5ms')
    expect(timeElements.length).toBeGreaterThan(0) // 平均時間が表示される
    expect(screen.getByText('150')).toBeInTheDocument() // 評価回数
    const cacheElements = screen.getAllByText('75.0%')
    expect(cacheElements.length).toBeGreaterThan(0) // キャッシュ率が表示される
    expect(screen.getByText('15.8/s')).toBeInTheDocument() // 処理能力
  })

  it('監視中状態が正しく表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} isMonitoring={true} />)

    // Assert
    expect(screen.getByText('停止')).toBeInTheDocument()
    // アニメーションドットが存在することを確認
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('監視停止状態が正しく表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} isMonitoring={false} />)

    // Assert
    expect(screen.getByText('開始')).toBeInTheDocument()
  })

  it('監視開始・停止ボタンが機能する', () => {
    // Arrange
    const onToggleMonitoring = vi.fn()
    render(
      <PerformanceMonitor
        {...defaultProps}
        onToggleMonitoring={onToggleMonitoring}
      />,
    )

    // Act
    fireEvent.click(screen.getByText('開始'))

    // Assert
    expect(onToggleMonitoring).toHaveBeenCalledTimes(1)
  })

  it('リセットボタンが機能する', () => {
    // Arrange
    const onResetMetrics = vi.fn()
    render(
      <PerformanceMonitor {...defaultProps} onResetMetrics={onResetMetrics} />,
    )

    // Act
    fireEvent.click(screen.getByText('リセット'))

    // Assert
    expect(onResetMetrics).toHaveBeenCalledTimes(1)
  })

  it('パフォーマンス状態が正しく判定される - excellent', () => {
    // Arrange
    const excellentMetrics = createMockMetrics({ avgEvaluationTime: 5.0 })

    // Act
    render(<PerformanceMonitor {...defaultProps} metrics={excellentMetrics} />)

    // Assert
    expect(screen.getByText('🚀')).toBeInTheDocument()
    expect(screen.getByText('excellent')).toBeInTheDocument()
  })

  it('パフォーマンス状態が正しく判定される - good', () => {
    // Arrange
    const goodMetrics = createMockMetrics({ avgEvaluationTime: 25.0 })

    // Act
    render(<PerformanceMonitor {...defaultProps} metrics={goodMetrics} />)

    // Assert
    expect(screen.getByText('✅')).toBeInTheDocument()
    expect(screen.getByText('good')).toBeInTheDocument()
  })

  it('パフォーマンス状態が正しく判定される - warning', () => {
    // Arrange
    const warningMetrics = createMockMetrics({ avgEvaluationTime: 75.0 })

    // Act
    render(<PerformanceMonitor {...defaultProps} metrics={warningMetrics} />)

    // Assert
    expect(screen.getByText('⚠️')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('パフォーマンス状態が正しく判定される - critical', () => {
    // Arrange
    const criticalMetrics = createMockMetrics({ avgEvaluationTime: 150.0 })

    // Act
    render(<PerformanceMonitor {...defaultProps} metrics={criticalMetrics} />)

    // Assert
    expect(screen.getByText('🚨')).toBeInTheDocument()
    expect(screen.getByText('critical')).toBeInTheDocument()
  })

  it('詳細統計情報が正しく表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} />)

    // Assert
    expect(screen.getByText('⏰ 時間統計')).toBeInTheDocument()
    expect(screen.getByText('10.0ms')).toBeInTheDocument() // 最小時間
    expect(screen.getByText('45.0ms')).toBeInTheDocument() // 最大時間
    expect(screen.getByText('35.0ms')).toBeInTheDocument() // 時間範囲

    expect(screen.getByText('💾 リソース使用量')).toBeInTheDocument()
    expect(screen.getByText('12.5MB')).toBeInTheDocument() // 推定メモリ
    expect(screen.getByText('39.2 eval/s')).toBeInTheDocument() // 処理効率
    expect(screen.getByText('150 回')).toBeInTheDocument() // 総処理量
  })

  it('メトリクスがnullの場合にメッセージが表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} metrics={null} />)

    // Assert
    expect(
      screen.getByText('パフォーマンスデータがありません'),
    ).toBeInTheDocument()
  })

  it('リアルタイム更新状態が表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} realTimeUpdates={true} />)

    // Assert
    expect(screen.getByText('リアルタイム')).toBeInTheDocument()
  })

  it('パフォーマンス推移グラフが表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} />)

    // Assert
    expect(screen.getByText('📊 パフォーマンス推移')).toBeInTheDocument()
    expect(screen.getByText('データがありません')).toBeInTheDocument()
  })

  it('各メトリックカードが正しいアイコンで表示される', () => {
    // Arrange & Act
    render(<PerformanceMonitor {...defaultProps} />)

    // Assert
    expect(screen.getByText('⏱️')).toBeInTheDocument() // 平均時間
    expect(screen.getByText('🔢')).toBeInTheDocument() // 評価回数
    expect(screen.getByText('💾')).toBeInTheDocument() // キャッシュ率
    expect(screen.getByText('⚡')).toBeInTheDocument() // 処理能力
  })

  it('計算された値が正しく表示される', () => {
    // Arrange
    const metrics = createMockMetrics({
      avgEvaluationTime: 20.0,
      cacheHitRate: 0.8,
    })

    // Act
    render(<PerformanceMonitor {...defaultProps} metrics={metrics} />)

    // Assert
    const timeElements = screen.getAllByText('20.0ms')
    expect(timeElements.length).toBeGreaterThan(0) // 平均時間が表示される
    const cacheElements = screen.getAllByText('80.0%')
    expect(cacheElements.length).toBeGreaterThan(0) // キャッシュ率が表示される
    expect(screen.getByText('50.0 eval/s')).toBeInTheDocument() // 1000/20
  })
})
