import { useGameStore } from './application/stores/gameStore'
import { GameBoard } from './presentation/components/GameBoard'
import { GameInfo } from './presentation/components/GameInfo'
import { useKeyboard } from './presentation/hooks/useKeyboard'

function App() {
  const { game, pauseGame, resumeGame, resetGame } = useGameStore()

  // キーボード入力ハンドラー
  const handleLeft = () => {
    console.log('Left key pressed')
    // TODO: ぷよ移動ロジック実装
  }

  const handleRight = () => {
    console.log('Right key pressed')
    // TODO: ぷよ移動ロジック実装
  }

  const handleDown = () => {
    console.log('Down key pressed')
    // TODO: ぷよ高速落下ロジック実装
  }

  const handleRotate = () => {
    console.log('Rotate key pressed')
    // TODO: ぷよ回転ロジック実装
  }

  const handlePause = () => {
    console.log('Pause key pressed')
    if (game.state === 'playing') {
      pauseGame()
    } else if (game.state === 'paused') {
      resumeGame()
    }
  }

  const handleReset = () => {
    console.log('Reset key pressed')
    resetGame()
  }

  // キーボード入力を監視
  useKeyboard({
    onLeft: handleLeft,
    onRight: handleRight,
    onDown: handleDown,
    onRotate: handleRotate,
    onPause: handlePause,
    onReset: handleReset,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ぷよぷよ</h1>
          <p className="text-blue-200">AI対戦ぷよぷよゲーム</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ゲーム情報パネル */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <GameInfo game={game} />
            </div>
          </div>

          {/* ゲームボード */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <GameBoard field={game.field} />
            </div>
          </div>
        </div>

        <footer className="text-center mt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
            <h3 className="text-white font-semibold mb-2">キーボード操作</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
              <div>
                <p>←→: 左右移動</p>
                <p>↓: 高速落下</p>
              </div>
              <div>
                <p>↑/Space: 回転</p>
                <p>P: ポーズ/再開</p>
                <p>R: リセット</p>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm">
            テスト駆動開発で作られたぷよぷよゲーム
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
