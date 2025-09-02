import type { GamePort } from './application/ports/GamePort'
import type { GameViewModel } from './application/viewmodels/GameViewModel'
import type { AISettings } from './domain/models/ai'
import { defaultContainer } from './infrastructure/di/DefaultContainer'
import { GameBoard } from './presentation/components/GameBoard'
import { GameInfo } from './presentation/components/GameInfo'
import { AIControlPanel } from './presentation/components/ai/AIControlPanel'
import { AutoLearningGameDashboard } from './presentation/components/ai/AutoLearningGameDashboard'
import { LearningDashboard } from './presentation/components/ai/LearningDashboard'
import { PerformanceAnalysis } from './presentation/components/ai/PerformanceAnalysis'
import { useAutoFall } from './presentation/hooks/useAutoFall'
import { useGameSystem } from './presentation/hooks/useGameSystem'
import { useKeyboard } from './presentation/hooks/useKeyboard'
import { useLearningSystem } from './presentation/hooks/useLearningSystem'

// ゲーム制御ボタンコンポーネント
const GameControlButtons = ({
  game,
  gameService,
  updateGame,
}: {
  game: GameViewModel
  gameService: GamePort
  updateGame: (game: GameViewModel) => void
}) => {
  return (
    <div className="mt-4 space-y-2">
      {game.state === 'ready' && (
        <button
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          onClick={() => {
            const newGame = gameService.startNewGame()
            updateGame(newGame)
          }}
        >
          ゲーム開始
        </button>
      )}
      {game.state === 'gameOver' && (
        <button
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          onClick={() => {
            const newGame = gameService.createReadyGame()
            updateGame(newGame)
          }}
        >
          リセット
        </button>
      )}
    </div>
  )
}

// タブナビゲーションコンポーネント
const TabNavigation = ({
  currentTab,
  onTabChange,
}: {
  currentTab: 'game' | 'learning' | 'autoLearning' | 'analysis'
  onTabChange: (tab: 'game' | 'learning' | 'autoLearning' | 'analysis') => void
}) => {
  return (
    <div className="mb-8">
      <nav className="flex space-x-8">
        <button
          onClick={() => onTabChange('game')}
          className={`py-4 px-6 text-lg font-semibold rounded-t-lg transition-colors ${
            currentTab === 'game'
              ? 'bg-white/20 text-white border-b-2 border-blue-400'
              : 'text-white/60 hover:text-white/80 hover:bg-white/10'
          }`}
        >
          🎮 ゲーム
        </button>
        <button
          onClick={() => onTabChange('analysis')}
          className={`py-4 px-6 text-lg font-semibold rounded-t-lg transition-colors ${
            currentTab === 'analysis'
              ? 'bg-white/20 text-white border-b-2 border-purple-400'
              : 'text-white/60 hover:text-white/80 hover:bg-white/10'
          }`}
        >
          📊 パフォーマンス分析
        </button>
        <button
          onClick={() => onTabChange('autoLearning')}
          className={`py-4 px-6 text-lg font-semibold rounded-t-lg transition-colors ${
            currentTab === 'autoLearning'
              ? 'bg-white/20 text-white border-b-2 border-green-400'
              : 'text-white/60 hover:text-white/80 hover:bg-white/10'
          }`}
        >
          🚀 学習データ
        </button>
        <button
          onClick={() => onTabChange('learning')}
          className={`py-4 px-6 text-lg font-semibold rounded-t-lg transition-colors ${
            currentTab === 'learning'
              ? 'bg-white/20 text-white border-b-2 border-blue-400'
              : 'text-white/60 hover:text-white/80 hover:bg-white/10'
          }`}
        >
          🧠 AI学習
        </button>
      </nav>
    </div>
  )
}

// ゲームレイアウトコンポーネント
const GameLayout = ({
  game,
  gameService,
  updateGame,
  handleReset,
  aiEnabled,
  aiSettings,
  onToggleAI,
  onAISettingsChange,
}: {
  game: GameViewModel
  gameService: GamePort
  updateGame: (game: GameViewModel) => void
  handleReset: () => void
  aiEnabled: boolean
  aiSettings: AISettings
  onToggleAI: () => void
  onAISettingsChange: (settings: AISettings) => void
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ゲーム情報パネル */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <GameInfo game={game} onRestart={handleReset} />

            {/* AIコントロールパネル */}
            <AIControlPanel
              aiEnabled={aiEnabled}
              aiSettings={aiSettings}
              onToggleAI={onToggleAI}
              onSettingsChange={onAISettingsChange}
            />

            {/* ゲーム制御ボタン */}
            <GameControlButtons
              game={game}
              gameService={gameService}
              updateGame={updateGame}
            />
          </div>
        </div>

        {/* ゲームボード */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <GameBoard game={game} />
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
  )
}

function App() {
  // DIコンテナからサービスを取得
  const gameService = defaultContainer.getGameService()
  const inputService = defaultContainer.getInputService()
  const aiService = defaultContainer.getAIService()
  const performanceService = defaultContainer.getPerformanceAnalysisService()
  const learningService = defaultContainer.getLearningService()
  const autoLearningGameService = defaultContainer.getAutoLearningGameService()

  // ゲームシステム
  const gameSystem = useGameSystem(
    gameService,
    inputService,
    aiService,
    performanceService,
  )

  // 学習システム
  const learningSystem = useLearningSystem(learningService)

  // デバッグ用にE2Eテストからアクセス可能にする
  if (
    typeof window !== 'undefined' &&
    import.meta.env.NODE_ENV !== 'production'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gameService = gameService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).game = gameSystem.game
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).setGame = gameSystem.updateGame
  }

  // 自動落下機能を使用
  useAutoFall({
    game: gameSystem.game,
    updateGame: gameSystem.updateGame,
    fallSpeed: 1000, // 1秒間隔で落下
  })

  // キーボード入力処理（AI無効時のみ）
  useKeyboard({
    onLeft: () => {
      if (!gameSystem.aiEnabled && gameSystem.game.state === 'playing') {
        const newGame = gameSystem.gameService.updateGameState(
          gameSystem.game,
          { type: 'MOVE_LEFT' },
        )
        gameSystem.updateGame(newGame)
      }
    },
    onRight: () => {
      if (!gameSystem.aiEnabled && gameSystem.game.state === 'playing') {
        const newGame = gameSystem.gameService.updateGameState(
          gameSystem.game,
          { type: 'MOVE_RIGHT' },
        )
        gameSystem.updateGame(newGame)
      }
    },
    onDown: () => {
      if (!gameSystem.aiEnabled && gameSystem.game.state === 'playing') {
        const newGame = gameSystem.gameService.updateGameState(
          gameSystem.game,
          { type: 'SOFT_DROP' },
        )
        gameSystem.updateGame(newGame)
      }
    },
    onRotate: () => {
      if (!gameSystem.aiEnabled && gameSystem.game.state === 'playing') {
        const newGame = gameSystem.gameService.updateGameState(
          gameSystem.game,
          { type: 'ROTATE_CLOCKWISE' },
        )
        gameSystem.updateGame(newGame)
      }
    },
    onPause: () => {
      if (gameSystem.game.state === 'playing') {
        const newGame = gameSystem.gameService.updateGameState(
          gameSystem.game,
          { type: 'PAUSE' },
        )
        gameSystem.updateGame(newGame)
      } else if (gameSystem.game.state === 'paused') {
        const newGame = gameSystem.gameService.updateGameState(
          gameSystem.game,
          { type: 'RESUME' },
        )
        gameSystem.updateGame(newGame)
      }
    },
    onReset: () => {
      gameSystem.handleReset()
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ぷよぷよ</h1>
          <p className="text-blue-200">AI対戦ぷよぷよゲーム & 学習システム</p>
        </header>

        <TabNavigation
          currentTab={learningSystem.currentTab}
          onTabChange={learningSystem.setCurrentTab}
        />

        {learningSystem.currentTab === 'game' ? (
          <GameLayout
            game={gameSystem.game}
            gameService={gameSystem.gameService}
            updateGame={gameSystem.updateGame}
            handleReset={gameSystem.handleReset}
            aiEnabled={gameSystem.aiEnabled}
            aiSettings={gameSystem.aiSettings}
            onToggleAI={gameSystem.handleToggleAI}
            onAISettingsChange={gameSystem.handleAISettingsChange}
          />
        ) : learningSystem.currentTab === 'learning' ? (
          <LearningDashboard
            isLearning={learningSystem.isLearning}
            learningProgress={learningSystem.learningProgress}
            currentModel={learningSystem.currentModel}
            latestPerformance={learningSystem.latestPerformance}
            learningHistory={learningSystem.learningHistory}
            onStartLearning={learningSystem.handleStartLearning}
            onStopLearning={learningSystem.handleStopLearning}
            onModelSelect={learningSystem.handleModelSelect}
            models={learningSystem.models}
            abTests={learningSystem.abTests}
            performanceStatistics={gameSystem.statistics}
            comparisonReport={gameSystem.comparisonReport}
            onStartABTest={learningSystem.handleStartABTest}
            onStopABTest={learningSystem.handleStopABTest}
            onCompareModels={learningSystem.handleCompareModels}
          />
        ) : learningSystem.currentTab === 'analysis' ? (
          <PerformanceAnalysis
            statistics={gameSystem.statistics}
            comparisonReport={gameSystem.comparisonReport}
            onResetData={gameSystem.resetData}
          />
        ) : (
          <AutoLearningGameDashboard
            autoLearningGameService={autoLearningGameService}
            className="max-w-7xl mx-auto"
          />
        )}
      </div>
    </div>
  )
}

export default App
