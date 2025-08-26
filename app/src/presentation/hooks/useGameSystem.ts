import { useCallback, useEffect, useRef, useState } from 'react'

import type { AIPort } from '../../application/ports/AIPort'
import type { GamePort } from '../../application/ports/GamePort'
import type { InputPort } from '../../application/ports/InputPort'
import type { PerformanceAnalysisService } from '../../application/services/PerformanceAnalysisService'
import type { MayahEvaluationResult } from '../../application/services/ai/MayahAIService'
import type { GameViewModel } from '../../application/viewmodels/GameViewModel'
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
