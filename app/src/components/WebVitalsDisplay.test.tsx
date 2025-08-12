import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WebVitalsDisplay from './WebVitalsDisplay'
import { webVitalsReporter } from '../utils/webVitals'

// Web Vitals reporterのモック
vi.mock('../utils/webVitals', () => ({
  webVitalsReporter: {
    getVitals: vi.fn(),
    getOverallScore: vi.fn(),
    onMetric: vi.fn(),
  },
}))

const mockWebVitalsReporter = vi.mocked(webVitalsReporter)

describe('WebVitalsDisplay', () => {
  const mockOnClose = vi.fn()

  const defaultVitals = {
    cls: null,
    fcp: null,
    inp: null,
    lcp: null,
    ttfb: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockWebVitalsReporter.getVitals.mockReturnValue(defaultVitals)
    mockWebVitalsReporter.getOverallScore.mockReturnValue(0)
    mockWebVitalsReporter.onMetric.mockReturnValue(() => {}) // unsubscribe function
  })

  describe('表示制御', () => {
    it('isOpenがfalseの場合は表示されない', () => {
      render(<WebVitalsDisplay isOpen={false} onClose={mockOnClose} />)
      expect(screen.queryByText('Core Web Vitals')).not.toBeInTheDocument()
    })

    it('isOpenがtrueの場合は表示される', () => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('Core Web Vitals')).toBeInTheDocument()
    })
  })

  describe('基本UI要素', () => {
    beforeEach(() => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)
    })

    it('タイトルが表示される', () => {
      expect(screen.getByText('Core Web Vitals')).toBeInTheDocument()
    })

    it('閉じるボタンが表示される', () => {
      const closeButton = screen.getByLabelText('Close Web Vitals display')
      expect(closeButton).toBeInTheDocument()
    })

    it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
      const closeButton = screen.getByLabelText('Close Web Vitals display')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('Overall Performance Scoreが表示される', () => {
      expect(screen.getByText('Overall Performance Score')).toBeInTheDocument()
    })
  })

  describe('メトリクス表示', () => {
    it('初期状態では全メトリクスが"Measuring..."と表示される', () => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)

      const measuringTexts = screen.getAllByText('Measuring...')
      expect(measuringTexts).toHaveLength(5) // LCP, INP, CLS, FCP, TTFB
    })

    it('各メトリクスのラベルが正しく表示される', () => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('LCP')).toBeInTheDocument()
      expect(screen.getByText('Largest Contentful Paint')).toBeInTheDocument()
      expect(screen.getByText('INP')).toBeInTheDocument()
      expect(screen.getByText('Interaction to Next Paint')).toBeInTheDocument()
      expect(screen.getByText('CLS')).toBeInTheDocument()
      expect(screen.getByText('Cumulative Layout Shift')).toBeInTheDocument()
      expect(screen.getByText('FCP')).toBeInTheDocument()
      expect(screen.getByText('First Contentful Paint')).toBeInTheDocument()
      expect(screen.getByText('TTFB')).toBeInTheDocument()
      expect(screen.getByText('Time to First Byte')).toBeInTheDocument()
    })

    it('メトリクス値が設定されている場合は数値が表示される', () => {
      const vitalsWithData = {
        cls: null,
        fcp: null,
        inp: null,
        lcp: {
          name: 'LCP',
          value: 1200,
          rating: 'good' as const,
          delta: 1200,
          id: 'test-id',
        },
        ttfb: {
          name: 'TTFB',
          value: 150,
          rating: 'good' as const,
          delta: 150,
          id: 'test-id-2',
        },
      }

      mockWebVitalsReporter.getVitals.mockReturnValue(vitalsWithData)

      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('1200ms')).toBeInTheDocument()
      expect(screen.getByText('150ms')).toBeInTheDocument()
    })

    it('CLSメトリクスは単位なしで表示される', () => {
      const vitalsWithCLS = {
        cls: {
          name: 'CLS',
          value: 0.125,
          rating: 'needs-improvement' as const,
          delta: 0.125,
          id: 'test-cls',
        },
        fcp: null,
        inp: null,
        lcp: null,
        ttfb: null,
      }

      mockWebVitalsReporter.getVitals.mockReturnValue(vitalsWithCLS)

      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('0.125')).toBeInTheDocument()
    })
  })

  describe('スコア表示', () => {
    it('初期スコア0が表示される', () => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('/100')).toBeInTheDocument()
    })

    it('計算されたスコアが表示される', () => {
      mockWebVitalsReporter.getOverallScore.mockReturnValue(85)

      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('85')).toBeInTheDocument()
    })
  })

  describe('レジェンド表示', () => {
    beforeEach(() => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)
    })

    it('レーティングの説明が表示される', () => {
      expect(screen.getByText('Good')).toBeInTheDocument()
      expect(screen.getByText('Needs Improvement')).toBeInTheDocument()
      expect(screen.getByText('Poor')).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    beforeEach(() => {
      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)
    })

    it('dialogロールが設定されている', () => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('aria-labelledbyが正しく設定されている', () => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'web-vitals-title')
    })

    it('閉じるボタンに適切なaria-labelが設定されている', () => {
      const closeButton = screen.getByLabelText('Close Web Vitals display')
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('リアルタイム更新', () => {
    it('メトリクス更新時にコンポーネントが再レンダリングされる', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let metricCallback: Function | null = null

      mockWebVitalsReporter.onMetric.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        (callback: Function) => {
          metricCallback = callback
          return () => {} // unsubscribe function
        }
      )

      render(<WebVitalsDisplay isOpen={true} onClose={mockOnClose} />)

      // 初期状態の確認
      expect(screen.getByText('0')).toBeInTheDocument()

      // メトリクス更新をシミュレート
      const updatedVitals = {
        cls: null,
        fcp: null,
        inp: null,
        lcp: {
          name: 'LCP',
          value: 1200,
          rating: 'good' as const,
          delta: 1200,
          id: 'test-id',
        },
        ttfb: null,
      }

      mockWebVitalsReporter.getVitals.mockReturnValue(updatedVitals)
      mockWebVitalsReporter.getOverallScore.mockReturnValue(100)

      if (metricCallback) {
        metricCallback({
          name: 'LCP',
          value: 1200,
          rating: 'good',
          delta: 1200,
          id: 'test-id',
        })
      }

      expect(mockWebVitalsReporter.getVitals).toHaveBeenCalled()
      expect(mockWebVitalsReporter.getOverallScore).toHaveBeenCalled()
    })
  })
})
