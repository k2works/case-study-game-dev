import type { Game, GameState } from '../../domain/models/Game'

interface GameInfoProps {
  game: Game
}

const getStateLabel = (state: GameState): string => {
  const stateLabels: Record<GameState, string> = {
    ready: '準備中',
    playing: 'プレイ中',
    paused: '一時停止',
    gameOver: 'ゲームオーバー',
  }
  return stateLabels[state]
}

export const GameInfo = ({ game }: GameInfoProps) => {
  return (
    <div data-testid="game-info" className="game-info">
      <div data-testid="score-display" className="info-section">
        <div className="info-label">スコア</div>
        <div data-testid="score-value" className="info-value">
          {game.score}
        </div>
      </div>

      <div data-testid="level-display" className="info-section">
        <div className="info-label">レベル</div>
        <div data-testid="level-value" className="info-value">
          {game.level}
        </div>
      </div>

      <div data-testid="state-display" className="info-section">
        <div className="info-label">状態</div>
        <div
          data-testid="state-value"
          className={`info-value state-${game.state}`}
        >
          {getStateLabel(game.state)}
        </div>
      </div>
    </div>
  )
}
