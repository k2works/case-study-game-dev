import React, { useState } from 'react'
import {
  AccessibilityReport,
  AccessibilityViolation,
  accessibilityAuditor,
} from '../utils/accessibilityAuditor'
import './AccessibilityAuditDisplay.css'

interface AccessibilityAuditDisplayProps {
  isOpen: boolean
  onClose: () => void
}

const ViolationItem: React.FC<{ violation: AccessibilityViolation }> = ({
  violation,
}) => {
  const getImpactIcon = (impact: AccessibilityViolation['impact']): string => {
    switch (impact) {
      case 'critical':
        return '🔴'
      case 'serious':
        return '🟠'
      case 'moderate':
        return '🟡'
      case 'minor':
        return '🔵'
    }
  }

  return (
    <div
      key={violation.id}
      className={`accessibility-audit__violation accessibility-audit__violation--${violation.impact}`}
    >
      <div className="accessibility-audit__violation-header">
        <span className="accessibility-audit__violation-icon">
          {getImpactIcon(violation.impact)}
        </span>
        <span className="accessibility-audit__violation-title">
          {violation.help}
        </span>
        <span className="accessibility-audit__violation-impact">
          {violation.impact}
        </span>
      </div>
      <p className="accessibility-audit__violation-description">
        {violation.description}
      </p>
      <div className="accessibility-audit__violation-nodes">
        {violation.nodes.length}個の要素が該当
      </div>
      <a
        href={violation.helpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="accessibility-audit__violation-link"
      >
        詳細を確認 →
      </a>
    </div>
  )
}

interface AuditContentProps {
  report: AccessibilityReport | null
  isLoading: boolean
  error: string | null
  onRunAudit: () => void
  onDownloadReport: () => void
}

const IntroContent: React.FC<{
  onRunAudit: () => void
  isLoading: boolean
}> = ({ onRunAudit, isLoading }) => (
  <div className="accessibility-audit__intro">
    <p>このゲームのアクセシビリティを監査します。</p>
    <p>WCAG 2.1 AA基準に基づいて評価を実行します。</p>
    <button
      className="accessibility-audit__run-button"
      onClick={onRunAudit}
      disabled={isLoading}
    >
      監査を実行
    </button>
  </div>
)

const LoadingContent: React.FC = () => (
  <div className="accessibility-audit__loading">
    <div className="accessibility-audit__spinner"></div>
    <p>アクセシビリティを監査中...</p>
  </div>
)

const ErrorContent: React.FC<{ error: string; onRunAudit: () => void }> = ({
  error,
  onRunAudit,
}) => (
  <div className="accessibility-audit__error">
    <h3>エラーが発生しました</h3>
    <p>{error}</p>
    <button className="accessibility-audit__retry-button" onClick={onRunAudit}>
      再試行
    </button>
  </div>
)

const ReportContent: React.FC<{
  report: AccessibilityReport
  onRunAudit: () => void
  onDownloadReport: () => void
}> = ({ report, onRunAudit, onDownloadReport }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4caf50' // Green
    if (score >= 70) return '#ff9800' // Orange
    return '#f44336' // Red
  }

  return (
    <div className="accessibility-audit__report">
      <div className="accessibility-audit__summary">
        <div className="accessibility-audit__score">
          <div
            className="accessibility-audit__score-circle"
            style={{ borderColor: getScoreColor(report.score) }}
          >
            <span
              className="accessibility-audit__score-value"
              style={{ color: getScoreColor(report.score) }}
            >
              {report.score}
            </span>
            <span className="accessibility-audit__score-label">/100</span>
          </div>
          <p className="accessibility-audit__score-description">
            アクセシビリティスコア
          </p>
        </div>

        <div className="accessibility-audit__stats">
          <div className="accessibility-audit__stat">
            <span className="accessibility-audit__stat-value success">
              {report.passes}
            </span>
            <span className="accessibility-audit__stat-label">合格</span>
          </div>
          <div className="accessibility-audit__stat">
            <span className="accessibility-audit__stat-value error">
              {report.violations.length}
            </span>
            <span className="accessibility-audit__stat-label">違反</span>
          </div>
          <div className="accessibility-audit__stat">
            <span className="accessibility-audit__stat-value warning">
              {report.incomplete}
            </span>
            <span className="accessibility-audit__stat-label">未完了</span>
          </div>
        </div>
      </div>

      {report.violations.length > 0 && (
        <div className="accessibility-audit__violations">
          <h3>違反項目</h3>
          <div className="accessibility-audit__violations-list">
            {report.violations.map((violation) => (
              <ViolationItem key={violation.id} violation={violation} />
            ))}
          </div>
        </div>
      )}

      {report.violations.length === 0 && (
        <div className="accessibility-audit__success">
          <h3>🎉 素晴らしい結果です！</h3>
          <p>アクセシビリティ要件をすべて満たしています。</p>
        </div>
      )}

      <div className="accessibility-audit__actions">
        <button
          className="accessibility-audit__download-button"
          onClick={onDownloadReport}
        >
          レポートをダウンロード
        </button>
        <button
          className="accessibility-audit__rerun-button"
          onClick={onRunAudit}
        >
          再実行
        </button>
      </div>

      <div className="accessibility-audit__metadata">
        <p>
          実行日時: {report.timestamp.toLocaleString('ja-JP')} | 監査対象:{' '}
          {report.url}
        </p>
      </div>
    </div>
  )
}

const AuditContent: React.FC<AuditContentProps> = ({
  report,
  isLoading,
  error,
  onRunAudit,
  onDownloadReport,
}) => {
  if (!report && !isLoading) {
    return <IntroContent onRunAudit={onRunAudit} isLoading={isLoading} />
  }

  if (isLoading) {
    return <LoadingContent />
  }

  if (error) {
    return <ErrorContent error={error} onRunAudit={onRunAudit} />
  }

  if (!report) return null

  return (
    <ReportContent
      report={report}
      onRunAudit={onRunAudit}
      onDownloadReport={onDownloadReport}
    />
  )
}

const AccessibilityAuditDisplay: React.FC<AccessibilityAuditDisplayProps> = ({
  isOpen,
  onClose,
}) => {
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAudit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const auditResult = await accessibilityAuditor.auditGameSpecific()
      setReport(auditResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return

    const textReport = accessibilityAuditor.generateTextReport(report)
    const blob = new Blob([textReport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div
      className="accessibility-audit-overlay"
      role="dialog"
      aria-labelledby="accessibility-audit-title"
    >
      <div className="accessibility-audit">
        <div className="accessibility-audit__header">
          <h2
            id="accessibility-audit-title"
            className="accessibility-audit__title"
          >
            アクセシビリティ監査
          </h2>
          <button
            className="accessibility-audit__close"
            onClick={onClose}
            aria-label="アクセシビリティ監査画面を閉じる"
          >
            ×
          </button>
        </div>

        <div className="accessibility-audit__content">
          <AuditContent
            report={report}
            isLoading={isLoading}
            error={error}
            onRunAudit={runAudit}
            onDownloadReport={downloadReport}
          />
        </div>
      </div>
    </div>
  )
}

export default AccessibilityAuditDisplay
