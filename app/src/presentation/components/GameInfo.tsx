import type { Game, GameState } from '../../domain/models/Game'
import { getDisplayScore } from '../../domain/models/Score'
import { NextPuyoPair } from './NextPuyoPair'

interface GameInfoProps {
  game: Game
  onRestart?: () => void
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

export const GameInfo = ({ game, onRestart }: GameInfoProps) => {
  const getStateColor = (state: GameState): string => {
    switch (state) {
      case 'ready':
        return 'text-blue-400 bg-blue-900/30'
      case 'playing':
        return 'text-green-400 bg-green-900/30'
      case 'paused':
        return 'text-yellow-400 bg-yellow-900/30'
      case 'gameOver':
        return 'text-red-400 bg-red-900/30'
      default:
        return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div data-testid="game-info" className="game-info space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-white">ゲーム情報</h2>
      </div>

      <div
        data-testid="score-display"
        className="info-section bg-white/5 rounded-lg p-4 border border-white/10"
      >
        <div className="info-label text-sm text-gray-300 mb-2">スコア</div>
        <div
          data-testid="score-value"
          className="info-value text-2xl font-bold text-white"
        >
          {getDisplayScore(game.score).toLocaleString()}
        </div>
      </div>

      <div
        data-testid="level-display"
        className="info-section bg-white/5 rounded-lg p-4 border border-white/10"
      >
        <div className="info-label text-sm text-gray-300 mb-2">レベル</div>
        <div
          data-testid="level-value"
          className="info-value text-2xl font-bold text-white"
        >
          {game.level}
        </div>
      </div>

      <div
        data-testid="state-display"
        className="info-section bg-white/5 rounded-lg p-4 border border-white/10"
      >
        <div className="info-label text-sm text-gray-300 mb-2">状態</div>
        <div
          data-testid="state-value"
          className={`info-value state-${game.state} px-3 py-2 rounded-md text-center font-semibold ${getStateColor(game.state)}`}
        >
          {getStateLabel(game.state)}
        </div>
      </div>

      <div
        data-testid="next-puyo-display"
        className="info-section bg-white/5 rounded-lg p-4 border border-white/10"
      >
        <div className="info-label text-sm text-gray-300 mb-3">次のぷよ</div>
        <div className="flex justify-center">
          <NextPuyoPair puyoPair={game.nextPuyoPair} />
        </div>
      </div>

      {game.state === 'gameOver' && onRestart && (
        <div className="info-section bg-white/5 rounded-lg p-4 border border-white/10">
          <button
            data-testid="restart-button"
            onClick={onRestart}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            リスタート
          </button>
        </div>
      )}
    </div>
  )
}
