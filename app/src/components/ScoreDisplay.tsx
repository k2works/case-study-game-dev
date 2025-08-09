import React, { useMemo } from 'react'
import './ScoreDisplay.css'

interface ScoreDisplayProps {
  score: number
}

export const ScoreDisplay = React.memo(({ score }: ScoreDisplayProps) => {
  // スコアをカンマ区切りでフォーマット（memoization）
  const formattedScore = useMemo(() => score.toLocaleString(), [score])

  return (
    <div className="score-display" role="region" aria-labelledby="score-label">
      <div id="score-label" className="score-label" data-testid="score-label">
        スコア
      </div>
      <div
        className="score-value"
        data-testid="score-value"
        aria-live="polite"
        aria-atomic="true"
        aria-describedby="score-label"
        role="status"
      >
        {formattedScore}点
      </div>
    </div>
  )
})
