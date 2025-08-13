import { useState } from 'react'

import type { GamePort } from './application/ports/GamePort'
import type { InputPort } from './application/ports/InputPort'
import type { Game } from './domain/models/Game'
import { defaultContainer } from './infrastructure/di/DefaultContainer'
import { GameBoard } from './presentation/components/GameBoard'
import { GameInfo } from './presentation/components/GameInfo'
import { useAutoFall } from './presentation/hooks/useAutoFall'
import { useKeyboard } from './presentation/hooks/useKeyboard'

// キーボードハンドラーの型定義
interface KeyboardHandlers {
  handleLeft: () => void
  handleRight: () => void
  handleDown: () => void
  handleRotate: () => void
  handlePause: () => void
  handleReset: () => void
}

// キーボード操作ハンドラーを生成するフック
const useKeyboardHandlers = (
  game: Game,
  gameService: GamePort,
  inputService: InputPort,
  updateGame: (newGame: Game) => void,
): KeyboardHandlers => {
  return {
    handleLeft: () => {
      console.log('Left key pressed')
      if (game.state === 'playing') {
        const action = inputService.processKeyboardInput({
          code: 'ArrowLeft',
          key: 'ArrowLeft',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          repeat: false,
          type: 'keydown',
        })
        if (action) {
          const updatedGame = gameService.updateGameState(game, action)
          updateGame(updatedGame)
        }
      }
    },
    handleRight: () => {
      console.log('Right key pressed')
      if (game.state === 'playing') {
        const action = inputService.processKeyboardInput({
          code: 'ArrowRight',
          key: 'ArrowRight',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          repeat: false,
          type: 'keydown',
        })
        if (action) {
          const updatedGame = gameService.updateGameState(game, action)
          updateGame(updatedGame)
        }
      }
    },
    handleDown: () => {
      console.log('Down key pressed')
      if (game.state === 'playing') {
        const action = inputService.processKeyboardInput({
          code: 'ArrowDown',
          key: 'ArrowDown',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          repeat: false,
          type: 'keydown',
        })
        if (action) {
          const updatedGame = gameService.updateGameState(game, action)
          updateGame(updatedGame)
        }
      }
    },
    handleRotate: () => {
      console.log('Rotate key pressed')
      if (game.state === 'playing') {
        const action = inputService.processKeyboardInput({
          code: 'ArrowUp',
          key: 'ArrowUp',
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          repeat: false,
          type: 'keydown',
        })
        if (action) {
          const updatedGame = gameService.updateGameState(game, action)
          updateGame(updatedGame)
        }
      }
    },
    handlePause: () => {
      console.log('Pause key pressed')
      const action = inputService.processKeyboardInput({
        code: 'KeyP',
        key: 'p',
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        repeat: false,
        type: 'keydown',
      })
      if (action) {
        const updatedGame = gameService.updateGameState(game, action)
        updateGame(updatedGame)
      }
    },
    handleReset: () => {
      console.log('Reset key pressed')
      const action = inputService.processKeyboardInput({
        code: 'KeyR',
        key: 'r',
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        repeat: false,
        type: 'keydown',
      })
      if (action) {
        const updatedGame = gameService.updateGameState(game, action)
        updateGame(updatedGame)
      }
    },
  }
}

// ゲームレイアウトコンポーネント
const GameLayout = ({
  game,
  gameService,
  updateGame,
  handleReset,
}: {
  game: Game
  gameService: GamePort
  updateGame: (game: Game) => void
  handleReset: () => void
}) => {
  const startGame = () => {
    const newGame = gameService.startNewGame()
    updateGame(newGame)
  }

  const pauseGame = () => {
    const updatedGame = gameService.updateGameState(game, { type: 'PAUSE' })
    updateGame(updatedGame)
  }

  const resumeGame = () => {
    const updatedGame = gameService.updateGameState(game, { type: 'RESUME' })
    updateGame(updatedGame)
  }

  const resetGame = () => {
    const newGame = gameService.createReadyGame()
    updateGame(newGame)
  }

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
              <GameInfo game={game} onRestart={handleReset} />

              {/* ゲーム制御ボタン */}
              <div className="mt-6 space-y-3">
                {game.state === 'ready' && (
                  <button
                    onClick={startGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    ゲーム開始
                  </button>
                )}

                {game.state === 'playing' && (
                  <button
                    onClick={pauseGame}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    一時停止
                  </button>
                )}

                {game.state === 'paused' && (
                  <button
                    onClick={resumeGame}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    再開
                  </button>
                )}

                {(game.state === 'gameOver' || game.state === 'paused') && (
                  <button
                    onClick={resetGame}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    リセット
                  </button>
                )}
              </div>
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
    </div>
  )
}

function App() {
  // DIコンテナからサービスを取得
  const gameService = defaultContainer.getGameService()
  const inputService = defaultContainer.getInputService()

  // ゲーム状態を管理（Reactの状態として）
  const [game, setGame] = useState<Game>(() => {
    // 初期状態では準備状態の新しいゲームを作成
    return gameService.createReadyGame()
  })

  // デバッグ用にE2Eテストからアクセス可能にする
  if (
    typeof window !== 'undefined' &&
    import.meta.env.NODE_ENV !== 'production'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).gameService = gameService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).game = game
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).setGame = setGame
  }

  const updateGame = (newGame: Game) => {
    setGame(newGame)
  }

  // キーボードハンドラー
  const {
    handleLeft,
    handleRight,
    handleDown,
    handleRotate,
    handlePause,
    handleReset,
  } = useKeyboardHandlers(game, gameService, inputService, updateGame)

  // キーボード入力を監視
  useKeyboard({
    onLeft: handleLeft,
    onRight: handleRight,
    onDown: handleDown,
    onRotate: handleRotate,
    onPause: handlePause,
    onReset: handleReset,
  })

  // 自動落下システム
  useAutoFall({
    game,
    updateGame,
    fallSpeed: 1000, // 1秒間隔で落下
  })

  return (
    <GameLayout
      game={game}
      gameService={gameService}
      updateGame={updateGame}
      handleReset={handleReset}
    />
  )
}

export default App
