import './GameOverDisplay.css'

interface GameOverDisplayProps {
  score: number
  onRestart: () => void
}

export const GameOverDisplay = ({ score, onRestart }: GameOverDisplayProps) => {
  const formattedScore = score.toLocaleString()

  return (
    <div
      className="game-over-overlay"
      data-testid="game-over-display"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      aria-describedby="final-score-section"
    >
      <div className="game-over-content">
        <h2
          id="game-over-title"
          className="game-over-title"
          role="heading"
          aria-level={2}
        >
          ゲームオーバー
        </h2>
        <div
          id="final-score-section"
          className="final-score-section"
          role="status"
          aria-live="polite"
        >
          <div className="final-score-label" aria-hidden="true">
            最終スコア
          </div>
          <div
            className="final-score-value"
            data-testid="final-score"
            aria-label={`最終スコア: ${formattedScore}点`}
          >
            {formattedScore}
          </div>
        </div>
        <button
          className="restart-button"
          data-testid="restart-button"
          onClick={onRestart}
          aria-label="ゲームを再開してもう一度プレイします"
          autoFocus
        >
          もう一度プレイ
        </button>
      </div>
    </div>
  )
}
