import './GameOverDisplay.css'

interface GameOverDisplayProps {
  score: number
  onRestart: () => void
}

export const GameOverDisplay = ({ score, onRestart }: GameOverDisplayProps) => {
  const formattedScore = score.toLocaleString()

  return (
    <div className="game-over-overlay" data-testid="game-over-display">
      <div className="game-over-content">
        <h2 className="game-over-title">ゲームオーバー</h2>
        <div className="final-score-section">
          <div className="final-score-label">最終スコア</div>
          <div className="final-score-value" data-testid="final-score">
            {formattedScore}
          </div>
        </div>
        <button
          className="restart-button"
          data-testid="restart-button"
          onClick={onRestart}
        >
          もう一度プレイ
        </button>
      </div>
    </div>
  )
}
