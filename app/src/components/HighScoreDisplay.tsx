import React from 'react'
import { HighScoreRecord } from '../services/HighScoreService'
import './HighScoreDisplay.css'

interface HighScoreDisplayProps {
  /**
   * ハイスコアリスト
   */
  highScores: HighScoreRecord[]

  /**
   * 現在のスコア（ハイライト用）
   */
  currentScore?: number

  /**
   * 表示するスコア数
   */
  maxDisplay?: number
}

/**
 * ハイスコア表示コンポーネント
 * ランキング形式でハイスコアを表示
 */
export const HighScoreDisplay: React.FC<HighScoreDisplayProps> = ({
  highScores,
  currentScore,
  maxDisplay = 10,
}) => {
  const displayScores = highScores.slice(0, maxDisplay)

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '不明'
      }
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    } catch {
      return '不明'
    }
  }

  const formatScore = (score: number): string => {
    return score.toLocaleString('ja-JP')
  }

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `${rank}位`
    }
  }

  const isCurrentScore = (score: number): boolean => {
    return currentScore !== undefined && currentScore === score
  }

  if (displayScores.length === 0) {
    return (
      <div
        className="high-score-display"
        data-testid="high-score-display"
        role="complementary"
        aria-labelledby="high-score-title"
      >
        <h3
          id="high-score-title"
          className="high-score-title"
          role="heading"
          aria-level={3}
        >
          ハイスコア
        </h3>
        <div
          className="no-scores"
          data-testid="no-scores"
          role="status"
          aria-live="polite"
        >
          <p>まだスコアがありません</p>
          <p className="no-scores-hint">最初のスコアを記録しましょう！</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="high-score-display"
      data-testid="high-score-display"
      role="complementary"
      aria-labelledby="high-score-title"
    >
      <h3
        id="high-score-title"
        className="high-score-title"
        role="heading"
        aria-level={3}
      >
        ハイスコア
      </h3>
      <div className="score-list" role="list" aria-label="ハイスコアランキング">
        {displayScores.map((record) => (
          <div
            key={`${record.score}-${record.date}`}
            className={`score-item ${isCurrentScore(record.score) ? 'current-score' : ''}`}
            data-testid={`score-item-${record.rank}`}
            role="listitem"
            aria-label={`第${record.rank}位: ${formatScore(record.score)}点, ${formatDate(record.date)}`}
          >
            <div
              className="rank-icon"
              data-testid={`rank-icon-${record.rank}`}
              aria-hidden="true"
            >
              {getRankIcon(record.rank)}
            </div>
            <div className="score-details">
              <div
                className="score-value"
                data-testid={`score-value-${record.rank}`}
                aria-hidden="true"
              >
                {formatScore(record.score)}
              </div>
              <div
                className="score-date"
                data-testid={`score-date-${record.rank}`}
                aria-hidden="true"
              >
                {formatDate(record.date)}
              </div>
            </div>
            {isCurrentScore(record.score) && (
              <div
                className="current-indicator"
                data-testid="current-indicator"
                role="status"
                aria-live="polite"
                aria-label="新記録達成"
              >
                NEW!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
