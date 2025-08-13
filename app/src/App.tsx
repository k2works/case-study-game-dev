import { useGameStore } from './application/stores/gameStore'
import { GameBoard } from './presentation/components/GameBoard'
import { GameInfo } from './presentation/components/GameInfo'

function App() {
  const { game } = useGameStore()

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
          <p className="text-white/60 text-sm">
            テスト駆動開発で作られたぷよぷよゲーム
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
