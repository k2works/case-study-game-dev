import './ScoreDisplay.css'

interface ScoreDisplayProps {
  score: number
}

export const ScoreDisplay = ({ score }: ScoreDisplayProps) => {
  // スコアをカンマ区切りでフォーマット
  const formattedScore = score.toLocaleString()

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
}
