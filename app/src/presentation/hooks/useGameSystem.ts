import { useCallback, useEffect, useRef, useState } from 'react'

import type { AIPort } from '../../application/ports/AIPort'
import type { GamePort } from '../../application/ports/GamePort'
import type { InputPort } from '../../application/ports/InputPort'
import type { PerformanceAnalysisService } from '../../application/services/PerformanceAnalysisService'
import type { MayahEvaluationResult } from '../../application/services/ai/MayahAIService'
import type {
  FieldViewModel,
  GameViewModel,
  PuyoPairViewModel,
  PuyoViewModel,
} from '../../application/viewmodels/GameViewModel'
import type { AIMove, AISettings } from '../../domain/models/ai'
import { usePerformanceAnalysis } from './usePerformanceAnalysis'

/**
 * ゲームシステムの状態と操作を管理するカスタムフック
 */
export const useGameSystem = (
  gameService: GamePort,
  _inputService: InputPort,
  aiService: AIPort,
  performanceService: PerformanceAnalysisService,
) => {
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
  // AIの状態管理は今後の機能で使用予定
  void lastAIMove
  void isAIThinking
  const aiTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Mayah AI評価状態管理
  const [mayahEvaluationResult, setMayahEvaluationResult] =
    useState<MayahEvaluationResult | null>(null)
  const [candidateMoves, setCandidateMoves] = useState<
    Array<{
      move: { x: number; rotation: number; score: number }
      evaluation: MayahEvaluationResult
      rank: number
    }>
  >([])
  const [currentPhase] = useState<'Phase 4a' | 'Phase 4b' | 'Phase 4c'>(
    'Phase 4c',
  )

  const updateGame = useCallback((newGame: GameViewModel) => {
    setGame(newGame)
  }, [])

  // AIService初期化
  useEffect(() => {
    aiService.updateSettings(aiSettings)
    aiService.setEnabled(aiEnabled)
  }, [aiService, aiSettings, aiEnabled])

  // AI自動プレイの実行
  useEffect(() => {
    if (!aiEnabled || game.state !== 'playing' || !game.currentPuyoPair) {
      return
    }

    const executeAIMove = async () => {
      try {
        setIsAIThinking(true)

        // GameViewModelをAIGameStateに変換
        const convertFieldToAIFormat = (fieldViewModel: FieldViewModel) => {
          return {
            width: fieldViewModel.width,
            height: fieldViewModel.height,
            cells: fieldViewModel.cells.map((row: (PuyoViewModel | null)[]) =>
              row.map((cell: PuyoViewModel | null) =>
                cell ? cell.color : null,
              ),
            ),
            isEmpty: (x: number, y: number) => {
              if (
                x < 0 ||
                x >= fieldViewModel.width ||
                y < 0 ||
                y >= fieldViewModel.height
              ) {
                return false
              }
              return fieldViewModel.cells[y][x] === null
            },
            isValidPosition: (x: number, y: number) => {
              return (
                x >= 0 &&
                x < fieldViewModel.width &&
                y >= 0 &&
                y < fieldViewModel.height
              )
            },
            getPuyo: (x: number, y: number) => {
              if (
                x < 0 ||
                x >= fieldViewModel.width ||
                y < 0 ||
                y >= fieldViewModel.height
              ) {
                return null
              }
              return fieldViewModel.cells[y][x]
            },
          }
        }

        const convertPuyoPairToAIFormat = (
          puyoPairVM: PuyoPairViewModel | null,
        ) => {
          if (!puyoPairVM) return null
          return {
            primaryColor: puyoPairVM.main.color,
            secondaryColor: puyoPairVM.sub.color,
            x: puyoPairVM.x,
            y: puyoPairVM.y,
            rotation: puyoPairVM.rotation,
          }
        }

        const aiGameState = {
          field: convertFieldToAIFormat(game.field),
          currentPuyoPair: convertPuyoPairToAIFormat(game.currentPuyoPair),
          nextPuyoPair: convertPuyoPairToAIFormat(game.nextPuyoPair),
          score: game.score.current,
          chainCount: 0, // ゲーム状態から取得する場合は適切に設定
          turn: 1, // ゲーム状態から取得する場合は適切に設定
          isGameOver: game.state === 'gameOver',
        }

        const move = await aiService.decideMove(aiGameState)
        setLastAIMove(move)

        // Mayah AI評価結果を取得（MayahAIServiceから）
        if (
          'getLastEvaluationResult' in aiService &&
          'getCandidateMovesWithEvaluation' in aiService
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mayahService = aiService as any
          const evaluationResult = mayahService.getLastEvaluationResult()
          if (evaluationResult) {
            setMayahEvaluationResult(evaluationResult)
          }

          // 候補手を取得
          const candidates = mayahService.getCandidateMovesWithEvaluation()
          if (candidates && candidates.length > 0) {
            // AIMove形式から表示用形式に変換
            const displayCandidates = candidates.map(
              (candidate: {
                move: AIMove
                evaluation: MayahEvaluationResult
                rank: number
              }) => ({
                move: {
                  x: candidate.move.x,
                  rotation: candidate.move.rotation,
                  score: candidate.evaluation.score,
                },
                evaluation: candidate.evaluation,
                rank: candidate.rank,
              }),
            )
            setCandidateMoves(displayCandidates)
          }
        }

        // 実際にゲーム状態を更新
        // TODO: ゲームサービスにAIの手を適用する処理を実装
      } catch (error) {
        console.error('AI move execution failed:', error)
      } finally {
        setIsAIThinking(false)
      }
    }

    const timer = setTimeout(executeAIMove, aiSettings.thinkingSpeed)
    aiTimerRef.current = timer

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [aiEnabled, game, aiService, aiSettings.thinkingSpeed])

  // リセット処理
  const handleReset = useCallback(() => {
    // タイマーをクリアしてから新しいゲームを開始
    if (aiTimerRef.current) {
      clearInterval(aiTimerRef.current)
      aiTimerRef.current = null
    }
    setIsAIThinking(false)
    setLastAIMove(null)

    const newGame = gameService.createReadyGame()
    setGame(newGame)
    setMayahEvaluationResult(null)
    setCandidateMoves([])
  }, [gameService])

  // AI切り替えハンドラー
  const handleToggleAI = useCallback(() => {
    const newEnabled = !aiEnabled
    setAiEnabled(newEnabled)
    aiService.setEnabled(newEnabled)

    if (!newEnabled && aiTimerRef.current) {
      clearInterval(aiTimerRef.current)
      aiTimerRef.current = null
      setIsAIThinking(false)
    }
  }, [aiEnabled, aiService])

  // AI設定変更ハンドラー
  const handleAISettingsChange = useCallback(
    (newSettings: AISettings) => {
      setAiSettings(newSettings)
      setAiEnabled(newSettings.enabled)
      aiService.updateSettings(newSettings)
      aiService.setEnabled(newSettings.enabled)
    },
    [aiService],
  )

  // パフォーマンス分析を使用
  const { statistics, comparisonReport, resetData } = usePerformanceAnalysis({
    performanceService,
    game,
    aiEnabled,
  })

  return {
    // 状態
    game,
    updateGame,
    aiEnabled,
    aiSettings,
    mayahEvaluationResult,
    candidateMoves,
    currentPhase,
    statistics,
    comparisonReport,
    // ハンドラー
    handleReset,
    handleToggleAI,
    handleAISettingsChange,
    resetData,
    // その他
    gameService,
    performanceService,
  }
}
