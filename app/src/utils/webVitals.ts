import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

export interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

export interface WebVitalsData {
  cls: WebVitalMetric | null
  fcp: WebVitalMetric | null
  inp: WebVitalMetric | null
  lcp: WebVitalMetric | null
  ttfb: WebVitalMetric | null
}

type MetricCallback = (metric: WebVitalMetric) => void

/**
 * Core Web Vitalsの測定とレポート
 */
export class WebVitalsReporter {
  private static instance: WebVitalsReporter
  private vitals: WebVitalsData = {
    cls: null,
    fcp: null,
    inp: null,
    lcp: null,
    ttfb: null,
  }
  private callbacks: Set<MetricCallback> = new Set()

  private constructor() {
    this.initializeMetrics()
  }

  public static getInstance(): WebVitalsReporter {
    if (!WebVitalsReporter.instance) {
      WebVitalsReporter.instance = new WebVitalsReporter()
    }
    return WebVitalsReporter.instance
  }

  private initializeMetrics(): void {
    onCLS((metric) => this.handleMetric('cls', metric))
    onFCP((metric) => this.handleMetric('fcp', metric))
    onINP((metric) => this.handleMetric('inp', metric))
    onLCP((metric) => this.handleMetric('lcp', metric))
    onTTFB((metric) => this.handleMetric('ttfb', metric))
  }

  private handleMetric(
    name: keyof WebVitalsData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metric: any
  ): void {
    const webVitalMetric: WebVitalMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    }

    this.vitals[name] = webVitalMetric
    this.notifyCallbacks(webVitalMetric)
  }

  private notifyCallbacks(metric: WebVitalMetric): void {
    this.callbacks.forEach((callback) => callback(metric))
  }

  public onMetric(callback: MetricCallback): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  public getVitals(): WebVitalsData {
    return { ...this.vitals }
  }

  public getOverallScore(): number {
    const vitals = Object.values(this.vitals).filter((v) => v !== null)
    if (vitals.length === 0) return 0

    const scores = vitals.map((vital) => {
      switch (vital.rating) {
        case 'good':
          return 100
        case 'needs-improvement':
          return 50
        case 'poor':
          return 0
        default:
          return 0
      }
    })

    return Math.round(
      scores.reduce((acc: number, score: number) => acc + score, 0) /
        scores.length
    )
  }

  public generateReport(): string {
    const vitals = this.getVitals()
    const score = this.getOverallScore()

    return `
Core Web Vitals Report
=====================
Overall Score: ${score}/100

Metrics:
--------
CLS (Cumulative Layout Shift): ${vitals.cls ? `${vitals.cls.value.toFixed(3)} (${vitals.cls.rating})` : 'Not measured'}
FCP (First Contentful Paint): ${vitals.fcp ? `${vitals.fcp.value.toFixed(0)}ms (${vitals.fcp.rating})` : 'Not measured'}
INP (Interaction to Next Paint): ${vitals.inp ? `${vitals.inp.value.toFixed(0)}ms (${vitals.inp.rating})` : 'Not measured'}
LCP (Largest Contentful Paint): ${vitals.lcp ? `${vitals.lcp.value.toFixed(0)}ms (${vitals.lcp.rating})` : 'Not measured'}
TTFB (Time to First Byte): ${vitals.ttfb ? `${vitals.ttfb.value.toFixed(0)}ms (${vitals.ttfb.rating})` : 'Not measured'}

Ratings:
- good: Green (optimal performance)
- needs-improvement: Yellow (could be better)
- poor: Red (needs attention)
    `.trim()
  }
}

export const webVitalsReporter = WebVitalsReporter.getInstance()
