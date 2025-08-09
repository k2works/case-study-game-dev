import React, { useState, useEffect } from 'react'
import {
  webVitalsReporter,
  WebVitalMetric,
  WebVitalsData,
} from '../utils/webVitals'
import './WebVitalsDisplay.css'

interface WebVitalsDisplayProps {
  isOpen: boolean
  onClose: () => void
}

const WebVitalsDisplay: React.FC<WebVitalsDisplayProps> = ({
  isOpen,
  onClose,
}) => {
  const [vitals, setVitals] = useState<WebVitalsData>(
    webVitalsReporter.getVitals()
  )
  const [overallScore, setOverallScore] = useState<number>(0)

  useEffect(() => {
    const unsubscribe = webVitalsReporter.onMetric(() => {
      setVitals(webVitalsReporter.getVitals())
      setOverallScore(webVitalsReporter.getOverallScore())
    })

    // 初期値を設定
    setVitals(webVitalsReporter.getVitals())
    setOverallScore(webVitalsReporter.getOverallScore())

    return unsubscribe
  }, [])

  const getRatingClass = (rating: string): string => {
    switch (rating) {
      case 'good':
        return 'web-vitals__metric--good'
      case 'needs-improvement':
        return 'web-vitals__metric--needs-improvement'
      case 'poor':
        return 'web-vitals__metric--poor'
      default:
        return ''
    }
  }

  const formatValue = (metric: WebVitalMetric | null, unit: string): string => {
    if (!metric) return 'Measuring...'
    return `${metric.value.toFixed(unit === 'ms' ? 0 : 3)}${unit}`
  }

  if (!isOpen) return null

  return (
    <div
      className="web-vitals-overlay"
      role="dialog"
      aria-labelledby="web-vitals-title"
    >
      <div className="web-vitals">
        <div className="web-vitals__header">
          <h2 id="web-vitals-title" className="web-vitals__title">
            Core Web Vitals
          </h2>
          <button
            className="web-vitals__close"
            onClick={onClose}
            aria-label="Close Web Vitals display"
          >
            ×
          </button>
        </div>

        <div className="web-vitals__score">
          <div className="web-vitals__score-circle">
            <span className="web-vitals__score-value">{overallScore}</span>
            <span className="web-vitals__score-label">/100</span>
          </div>
          <p className="web-vitals__score-description">
            Overall Performance Score
          </p>
        </div>

        <div className="web-vitals__metrics">
          <div
            className={`web-vitals__metric ${vitals.lcp ? getRatingClass(vitals.lcp.rating) : ''}`}
          >
            <div className="web-vitals__metric-name">
              <span>LCP</span>
              <span className="web-vitals__metric-description">
                Largest Contentful Paint
              </span>
            </div>
            <div className="web-vitals__metric-value">
              {formatValue(vitals.lcp, 'ms')}
            </div>
          </div>

          <div
            className={`web-vitals__metric ${vitals.inp ? getRatingClass(vitals.inp.rating) : ''}`}
          >
            <div className="web-vitals__metric-name">
              <span>INP</span>
              <span className="web-vitals__metric-description">
                Interaction to Next Paint
              </span>
            </div>
            <div className="web-vitals__metric-value">
              {formatValue(vitals.inp, 'ms')}
            </div>
          </div>

          <div
            className={`web-vitals__metric ${vitals.cls ? getRatingClass(vitals.cls.rating) : ''}`}
          >
            <div className="web-vitals__metric-name">
              <span>CLS</span>
              <span className="web-vitals__metric-description">
                Cumulative Layout Shift
              </span>
            </div>
            <div className="web-vitals__metric-value">
              {formatValue(vitals.cls, '')}
            </div>
          </div>

          <div
            className={`web-vitals__metric ${vitals.fcp ? getRatingClass(vitals.fcp.rating) : ''}`}
          >
            <div className="web-vitals__metric-name">
              <span>FCP</span>
              <span className="web-vitals__metric-description">
                First Contentful Paint
              </span>
            </div>
            <div className="web-vitals__metric-value">
              {formatValue(vitals.fcp, 'ms')}
            </div>
          </div>

          <div
            className={`web-vitals__metric ${vitals.ttfb ? getRatingClass(vitals.ttfb.rating) : ''}`}
          >
            <div className="web-vitals__metric-name">
              <span>TTFB</span>
              <span className="web-vitals__metric-description">
                Time to First Byte
              </span>
            </div>
            <div className="web-vitals__metric-value">
              {formatValue(vitals.ttfb, 'ms')}
            </div>
          </div>
        </div>

        <div className="web-vitals__legend">
          <div className="web-vitals__legend-item">
            <span className="web-vitals__legend-color web-vitals__legend-color--good"></span>
            <span>Good</span>
          </div>
          <div className="web-vitals__legend-item">
            <span className="web-vitals__legend-color web-vitals__legend-color--needs-improvement"></span>
            <span>Needs Improvement</span>
          </div>
          <div className="web-vitals__legend-item">
            <span className="web-vitals__legend-color web-vitals__legend-color--poor"></span>
            <span>Poor</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebVitalsDisplay
