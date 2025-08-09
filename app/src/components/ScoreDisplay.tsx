import React, { useMemo } from 'react'
import './ScoreDisplay.css'

interface ScoreDisplayProps {
  score: number
}

export const ScoreDisplay = React.memo(({ score }: ScoreDisplayProps) => {
  // スコアをカンマ区切りでフォーマット（memoization）
  const formattedScore = useMemo(() => score.toLocaleString(), [score])

  return (
    <div className="score-display">
      <div className="score-label" data-testid="score-label">
        スコア
      </div>
      <div className="score-value" data-testid="score-value">
        {formattedScore}
      </div>
    </div>
  )
})
