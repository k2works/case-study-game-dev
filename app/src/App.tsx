import { useCallback, useEffect, useRef, useState } from 'react'

import type { GamePort } from './application/ports/GamePort'
import type { InputPort } from './application/ports/InputPort'
import type { PerformanceAnalysisService } from './application/services/PerformanceAnalysisService'
import type { GameViewModel } from './application/viewmodels/GameViewModel'
import type { PuyoColor } from './domain/models/Puyo'
import type { AIMove, AISettings } from './domain/models/ai'
import type { OptimizedEvaluationResult } from './domain/services/ai/OptimizedEvaluationService'
import { defaultContainer } from './infrastructure/di/DefaultContainer'
import { GameBoard } from './presentation/components/GameBoard'
import { GameInfo } from './presentation/components/GameInfo'
import { AIControlPanel } from './presentation/components/ai/AIControlPanel'
import { MayahEvaluationDisplay } from './presentation/components/ai/MayahEvaluationDisplay'
import { MoveEvaluationRanking } from './presentation/components/ai/MoveEvaluationRanking'
import { PerformanceAnalysis } from './presentation/components/ai/PerformanceAnalysis'
import { PerformanceMonitor } from './presentation/components/ai/PerformanceMonitor'
import { useAutoFall } from './presentation/hooks/useAutoFall'
import { useKeyboard } from './presentation/hooks/useKeyboard'
import { usePerformanceAnalysis } from './presentation/hooks/usePerformanceAnalysis'

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
  game: GameViewModel,
  gameService: GamePort,
  inputService: InputPort,
  updateGame: (newGame: GameViewModel) => void,
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
  lastAIMove,
  isAIThinking,
  performanceService,
  evaluationResult,
  candidateMoves,
  performanceMetrics,
  isMonitoring,
  handleToggleMonitoring,
  handleResetMetrics,
}: {
  game: GameViewModel
  gameService: GamePort
  updateGame: (game: GameViewModel) => void
  handleReset: () => void
  aiEnabled: boolean
  aiSettings: AISettings
  onToggleAI: () => void
  onAISettingsChange: (settings: AISettings) => void
  lastAIMove: AIMove | null
  isAIThinking: boolean
  performanceService: PerformanceAnalysisService
  evaluationResult: OptimizedEvaluationResult | null
  candidateMoves: Array<{
    move: AIMove
    evaluation: OptimizedEvaluationResult
    rank: number
  }>
  performanceMetrics: {
    avgEvaluationTime: number
    maxEvaluationTime: number
    minEvaluationTime: number
    totalEvaluations: number
    cacheHitRate: number
    estimatedMemoryUsage: number
    evaluationsPerSecond: number
  } | null
  isMonitoring: boolean
  handleToggleMonitoring: () => void
  handleResetMetrics: () => void
}) => {
  const { statistics, comparisonReport, resetData } = usePerformanceAnalysis({
    performanceService,
    game,
    aiEnabled,
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

        {/* mayah AI評価可視化パネル */}
        {aiEnabled && (
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* mayah評価結果表示 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <MayahEvaluationDisplay
                evaluationResult={evaluationResult}
                isEvaluating={isAIThinking}
              />
            </div>

            {/* パフォーマンス監視 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <PerformanceMonitor
                metrics={performanceMetrics}
                isMonitoring={isMonitoring}
                realTimeUpdates={aiEnabled && isMonitoring}
                onToggleMonitoring={handleToggleMonitoring}
                onResetMetrics={handleResetMetrics}
              />
            </div>

            {/* 候補手ランキング */}
            {candidateMoves.length > 0 && (
              <div className="xl:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <MoveEvaluationRanking
                  evaluatedMoves={candidateMoves}
                  selectedMove={lastAIMove}
                  isEvaluating={isAIThinking}
                  onMoveSelect={(move) => {
                    console.log('手動で選択された手:', move)
                    // 必要に応じて手動実行機能を実装
                  }}
                  maxDisplay={8}
                />
              </div>
            )}
          </div>
        )}

        {/* パフォーマンス分析パネル */}
        <div className="mt-8">
          <PerformanceAnalysis
            statistics={statistics}
            comparisonReport={comparisonReport}
            onResetData={resetData}
          />
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
  const aiService = defaultContainer.getAIService()
  const performanceService = defaultContainer.getPerformanceAnalysisService()

  // ゲーム状態を管理（Reactの状態として）
  const [game, setGame] = useState<GameViewModel>(() => {
    // 初期状態では準備状態の新しいゲームを作成
    return gameService.createReadyGame()
  })

  // AI状態管理
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiSettings, setAiSettings] = useState<AISettings>({
    enabled: false,
    thinkingSpeed: 1000,
  })
  const [lastAIMove, setLastAIMove] = useState<AIMove | null>(null)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [evaluationResult, setEvaluationResult] =
    useState<OptimizedEvaluationResult | null>(null)
  const [candidateMoves, setCandidateMoves] = useState<
    Array<{ move: AIMove; evaluation: OptimizedEvaluationResult; rank: number }>
  >([])
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    avgEvaluationTime: number
    maxEvaluationTime: number
    minEvaluationTime: number
    totalEvaluations: number
    cacheHitRate: number
    estimatedMemoryUsage: number
    evaluationsPerSecond: number
  } | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const aiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const updateGame = useCallback((newGame: GameViewModel) => {
    setGame(newGame)
  }, [])

  // AIService初期化
  useEffect(() => {
    aiService.updateSettings(aiSettings)
    aiService.setEnabled(aiEnabled)
  }, [aiService, aiSettings, aiEnabled])

  // キーボード入力を作成するヘルパー関数
  const createKeyboardInput = useCallback(
    (code: string, key: string) => ({
      code,
      key,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
      type: 'keydown' as const,
    }),
    [],
  )

  // AI移動操作を実行するヘルパー関数
  const executeHorizontalMoves = useCallback(
    (game: GameViewModel, currentX: number, targetX: number): GameViewModel => {
      const moveCount = Math.abs(targetX - currentX)
      const direction = targetX < currentX ? 'ArrowLeft' : 'ArrowRight'

      let updatedGame = game
      for (let i = 0; i < moveCount; i++) {
        const input = createKeyboardInput(direction, direction)
        const action = inputService.processKeyboardInput(input)
        if (action) {
          updatedGame = gameService.updateGameState(updatedGame, action)
        }
      }
      return updatedGame
    },
    [createKeyboardInput, inputService, gameService],
  )

  // GameViewModelをAIGameStateに変換するヘルパー関数
  const convertToAIGameState = useCallback((game: GameViewModel) => {
    // GameViewModelのcellsは[x][y]形式なので、[y][x]形式に変換する
    const cells: (PuyoColor | null)[][] = []
    for (let y = 0; y < game.field.height; y++) {
      cells[y] = []
      for (let x = 0; x < game.field.width; x++) {
        const cell = game.field.cells[x] ? game.field.cells[x][y] : null
        cells[y][x] = cell ? (cell.color as PuyoColor) : null
      }
    }

    return {
      field: {
        width: game.field.width,
        height: game.field.height,
        cells,
      },
      currentPuyoPair: game.currentPuyoPair
        ? {
            primaryColor: game.currentPuyoPair.main.color,
            secondaryColor: game.currentPuyoPair.sub.color,
            x: game.currentPuyoPair.x,
            y: game.currentPuyoPair.y,
            rotation: game.currentPuyoPair.rotation,
          }
        : null,
      nextPuyoPair: game.nextPuyoPair
        ? {
            primaryColor: game.nextPuyoPair.main.color,
            secondaryColor: game.nextPuyoPair.sub.color,
            x: game.nextPuyoPair.x,
            y: game.nextPuyoPair.y,
            rotation: game.nextPuyoPair.rotation,
          }
        : null,
      score: game.score.current,
    }
  }, [])

  // AI手の実行ヘルパー関数
  const executeAIMoveActions = useCallback(
    (game: GameViewModel, aiMove: AIMove) => {
      // 回転実行
      const currentRotation = game.currentPuyoPair!.rotation
      const targetRotation = aiMove.rotation
      let updatedGame = game

      const rotationSteps =
        ((targetRotation - currentRotation + 360) % 360) / 90
      for (let i = 0; i < rotationSteps; i++) {
        const rotateInput = createKeyboardInput('ArrowUp', 'ArrowUp')
        const rotateAction = inputService.processKeyboardInput(rotateInput)
        if (rotateAction) {
          updatedGame = gameService.updateGameState(updatedGame, rotateAction)
        }
      }

      // 横移動実行
      const currentX = updatedGame.currentPuyoPair?.x || 0
      updatedGame = executeHorizontalMoves(updatedGame, currentX, aiMove.x)

      // ドロップ実行
      const dropInput = createKeyboardInput('ArrowDown', 'ArrowDown')
      const dropAction = inputService.processKeyboardInput(dropInput)
      if (dropAction) {
        updatedGame = gameService.updateGameState(updatedGame, dropAction)
      }

      return updatedGame
    },
    [createKeyboardInput, inputService, gameService, executeHorizontalMoves],
  )

  // mayah AI評価データ取得ヘルパー
  const fetchEvaluationData = useCallback(async () => {
    // mayah AI評価結果を取得（AIServiceが対応している場合）
    if ('getLastEvaluationResult' in aiService) {
      try {
        const result = await (
          aiService as {
            getLastEvaluationResult: () => Promise<OptimizedEvaluationResult>
          }
        ).getLastEvaluationResult()
        setEvaluationResult(result)
      } catch (error) {
        console.warn('評価結果の取得に失敗:', error)
      }
    }

    // 候補手ランキングを取得（AIServiceが対応している場合）
    if ('getCandidateMovesWithEvaluation' in aiService) {
      try {
        const candidates = await (
          aiService as {
            getCandidateMovesWithEvaluation: () => Promise<
              Array<{
                move: AIMove
                evaluation: OptimizedEvaluationResult
                rank: number
              }>
            >
          }
        ).getCandidateMovesWithEvaluation()
        setCandidateMoves(candidates)
      } catch (error) {
        console.warn('候補手の取得に失敗:', error)
      }
    }
  }, [aiService])

  // AI自動プレイのロジック
  const executeAIMove = useCallback(async () => {
    if (!aiEnabled || game.state !== 'playing' || !game.currentPuyoPair) {
      return
    }

    if (!aiService.isEnabled()) {
      console.warn('AI is not enabled in AIService')
      return
    }

    try {
      setIsAIThinking(true)
      const aiGameState = convertToAIGameState(game)
      const aiMove = await aiService.decideMove(aiGameState)

      // mayah AI評価データ取得
      await fetchEvaluationData()

      // パフォーマンスメトリクスを更新
      if (isMonitoring) {
        // ダミーデータ生成（実際の実装では AIService から取得）
        const avgTime = Math.random() * 50 + 10
        setPerformanceMetrics({
          avgEvaluationTime: avgTime,
          maxEvaluationTime: avgTime * 2,
          minEvaluationTime: avgTime * 0.5,
          totalEvaluations: Math.floor(Math.random() * 1000) + 100,
          cacheHitRate: Math.random() * 0.8 + 0.2,
          estimatedMemoryUsage: Math.random() * 20 + 5,
          evaluationsPerSecond: 1000 / avgTime,
        })
      }

      // AI判断の詳細を記録
      setLastAIMove(aiMove)
      setIsAIThinking(false)

      const updatedGame = executeAIMoveActions(game, aiMove)
      updateGame(updatedGame)
    } catch (error) {
      console.error('AI move execution failed:', error)
      setIsAIThinking(false)
    }
  }, [
    aiEnabled,
    game,
    aiService,
    convertToAIGameState,
    executeAIMoveActions,
    updateGame,
    fetchEvaluationData,
    isMonitoring,
  ])

  // AI自動プレイのタイマー管理
  useEffect(() => {
    if (aiEnabled && game.state === 'playing') {
      aiTimerRef.current = setInterval(executeAIMove, aiSettings.thinkingSpeed)
    } else {
      if (aiTimerRef.current) {
        clearInterval(aiTimerRef.current)
        aiTimerRef.current = null
      }
    }

    return () => {
      if (aiTimerRef.current) {
        clearInterval(aiTimerRef.current)
        aiTimerRef.current = null
      }
    }
  }, [aiEnabled, game.state, aiSettings.thinkingSpeed, executeAIMove])

  // キーボードハンドラー
  const {
    handleLeft,
    handleRight,
    handleDown,
    handleRotate,
    handlePause,
    handleReset,
  } = useKeyboardHandlers(game, gameService, inputService, updateGame)

  // AI設定ハンドラー
  const handleToggleAI = useCallback(() => {
    const newEnabled = !aiEnabled
    const newSettings = { ...aiSettings, enabled: newEnabled }
    setAiEnabled(newEnabled)
    setAiSettings(newSettings)
    aiService.updateSettings(newSettings)
    aiService.setEnabled(newEnabled)

    // AIを有効にしたときにゲームが開始状態でなければ自動開始
    if (newEnabled && game.state !== 'playing') {
      const newGame = gameService.startNewGame()
      updateGame(newGame)
    }
  }, [aiEnabled, aiSettings, aiService, game.state, gameService, updateGame])

  const handleAISettingsChange = useCallback(
    (newSettings: AISettings) => {
      setAiSettings(newSettings)
      setAiEnabled(newSettings.enabled)
      aiService.updateSettings(newSettings)
      aiService.setEnabled(newSettings.enabled)
    },
    [aiService],
  )

  // パフォーマンスメトリクス更新関数
  const updatePerformanceMetrics = useCallback(() => {
    // ダミーデータ生成（実際の実装では AIService から取得）
    const avgTime = Math.random() * 50 + 10
    setPerformanceMetrics({
      avgEvaluationTime: avgTime,
      maxEvaluationTime: avgTime * 2,
      minEvaluationTime: avgTime * 0.5,
      totalEvaluations: Math.floor(Math.random() * 1000) + 100,
      cacheHitRate: Math.random() * 0.8 + 0.2,
      estimatedMemoryUsage: Math.random() * 20 + 5,
      evaluationsPerSecond: 1000 / avgTime,
    })
  }, [])

  // 監視開始・停止ハンドラー
  const handleToggleMonitoring = useCallback(() => {
    const newMonitoring = !isMonitoring
    setIsMonitoring(newMonitoring)
    if (newMonitoring) {
      updatePerformanceMetrics()
    }
  }, [isMonitoring, updatePerformanceMetrics])

  // メトリクスリセットハンドラー
  const handleResetMetrics = useCallback(() => {
    setPerformanceMetrics(null)
    setEvaluationResult(null)
    setCandidateMoves([])
  }, [])

  // キーボード入力を監視（AI有効時は無効化）
  useKeyboard({
    onLeft: aiEnabled ? () => {} : handleLeft,
    onRight: aiEnabled ? () => {} : handleRight,
    onDown: aiEnabled ? () => {} : handleDown,
    onRotate: aiEnabled ? () => {} : handleRotate,
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
      aiEnabled={aiEnabled}
      aiSettings={aiSettings}
      onToggleAI={handleToggleAI}
      onAISettingsChange={handleAISettingsChange}
      lastAIMove={lastAIMove}
      isAIThinking={isAIThinking}
      performanceService={performanceService}
      evaluationResult={evaluationResult}
      candidateMoves={candidateMoves}
      performanceMetrics={performanceMetrics}
      isMonitoring={isMonitoring}
      handleToggleMonitoring={handleToggleMonitoring}
      handleResetMetrics={handleResetMetrics}
    />
  )
}

export default App
