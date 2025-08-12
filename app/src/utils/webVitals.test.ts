import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebVitalsReporter } from './webVitals'

// web-vitalsライブラリのモック
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onFID: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}))

describe('WebVitalsReporter', () => {
  let reporter: WebVitalsReporter

  beforeEach(() => {
    // シングルトンインスタンスをリセット
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(WebVitalsReporter as any).instance = undefined
    reporter = WebVitalsReporter.getInstance()
  })

  describe('初期化', () => {
    it('シングルトンパターンで動作する', () => {
      const instance1 = WebVitalsReporter.getInstance()
      const instance2 = WebVitalsReporter.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('メトリクス取得', () => {
    it('初期状態では全てのメトリクスがnullである', () => {
      const vitals = reporter.getVitals()
      expect(vitals.cls).toBeNull()
      expect(vitals.fcp).toBeNull()
      expect(vitals.inp).toBeNull()
      expect(vitals.lcp).toBeNull()
      expect(vitals.ttfb).toBeNull()
    })

    it('getOverallScoreは初期状態で0を返す', () => {
      expect(reporter.getOverallScore()).toBe(0)
    })
  })

  describe('メトリクス処理', () => {
    it('メトリクスが設定されると取得できる', () => {
      // プライベートメソッドのテストのため、リフレクションを使用
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      const mockMetric = {
        name: 'LCP',
        value: 1200,
        rating: 'good' as const,
        delta: 1200,
        id: 'test-id',
      }

      handleMetric('lcp', mockMetric)

      const vitals = reporter.getVitals()
      expect(vitals.lcp).toEqual({
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id',
      })
    })
  })

  describe('スコア計算', () => {
    it('goodレーティングは100点を返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      handleMetric('lcp', {
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id',
      })

      expect(reporter.getOverallScore()).toBe(100)
    })

    it('needs-improvementレーティングは50点を返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      handleMetric('lcp', {
        name: 'LCP',
        value: 3000,
        rating: 'needs-improvement',
        delta: 3000,
        id: 'test-id',
      })

      expect(reporter.getOverallScore()).toBe(50)
    })

    it('poorレーティングは0点を返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      handleMetric('lcp', {
        name: 'LCP',
        value: 5000,
        rating: 'poor',
        delta: 5000,
        id: 'test-id',
      })

      expect(reporter.getOverallScore()).toBe(0)
    })

    it('複数メトリクスの平均スコアを計算する', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      // good (100点) と poor (0点) の平均 = 50点
      handleMetric('lcp', {
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id-1',
      })

      handleMetric('fid', {
        name: 'FID',
        value: 300,
        rating: 'poor',
        delta: 300,
        id: 'test-id-2',
      })

      expect(reporter.getOverallScore()).toBe(50)
    })
  })

  describe('コールバック機能', () => {
    it('メトリクスコールバックを登録・削除できる', () => {
      const callback = vi.fn()
      const unsubscribe = reporter.onMetric(callback)

      expect(typeof unsubscribe).toBe('function')
      unsubscribe()
    })

    it('メトリクス更新時にコールバックが呼ばれる', () => {
      const callback = vi.fn()
      reporter.onMetric(callback)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)
      const mockMetric = {
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id',
      }

      handleMetric('lcp', mockMetric)

      expect(callback).toHaveBeenCalledWith({
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id',
      })
    })

    it('購読解除後はコールバックが呼ばれない', () => {
      const callback = vi.fn()
      const unsubscribe = reporter.onMetric(callback)
      unsubscribe()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)
      const mockMetric = {
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id',
      }

      handleMetric('lcp', mockMetric)

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('レポート生成', () => {
    it('メトリクスなしの状態でレポートを生成できる', () => {
      const report = reporter.generateReport()
      expect(report).toContain('Overall Score: 0/100')
      expect(report).toContain('Not measured')
    })

    it('メトリクスありの状態でレポートを生成できる', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      handleMetric('lcp', {
        name: 'LCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        id: 'test-id',
      })

      handleMetric('inp', {
        name: 'INP',
        value: 50,
        rating: 'good',
        delta: 50,
        id: 'test-id-2',
      })

      const report = reporter.generateReport()
      expect(report).toContain('Overall Score: 100/100')
      expect(report).toContain('LCP (Largest Contentful Paint): 1200ms (good)')
      expect(report).toContain('INP (Interaction to Next Paint): 50ms (good)')
    })

    it('CLSメトリクスは小数点表示される', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleMetric = (reporter as any).handleMetric.bind(reporter)

      handleMetric('cls', {
        name: 'CLS',
        value: 0.125,
        rating: 'needs-improvement',
        delta: 0.125,
        id: 'test-id',
      })

      const report = reporter.generateReport()
      expect(report).toContain(
        'CLS (Cumulative Layout Shift): 0.125 (needs-improvement)'
      )
    })
  })
})
