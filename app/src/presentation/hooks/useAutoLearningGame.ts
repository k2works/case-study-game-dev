import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  AutoLearningGameConfig,
  AutoLearningGameService,
  LearningGameProcess,
} from '../../application/services/ai/AutoLearningGameService'

/**
 * 自動学習ゲームシステムのHook設定
 */
export interface UseAutoLearningGameOptions {
  autoLearningGameService: AutoLearningGameService
  enabled?: boolean
  pollingInterval?: number
}

/**
 * 自動学習ゲームシステムの統計情報
 */
export interface AutoLearningGameStats {
  totalProcesses: number
  runningProcesses: number
  completedProcesses: number
  successRate: number
  averageAccuracy: number
  totalGamesPlayed: number
  averageScore: number
  bestScore: number
}

/**
 * 完全なAI自動学習ゲームシステム用Hook
 */
export function useAutoLearningGame({
  autoLearningGameService,
  enabled = true,
  pollingInterval = 1000,
}: UseAutoLearningGameOptions) {
  // 状態管理
  const [isRunning, setIsRunning] = useState(false)
  const [currentProcess, setCurrentProcess] =
    useState<LearningGameProcess | null>(null)
  const [processHistory, setProcessHistory] = useState<
    readonly LearningGameProcess[]
  >([])
  const [stats, setStats] = useState<AutoLearningGameStats>({
    totalProcesses: 0,
    runningProcesses: 0,
    completedProcesses: 0,
    successRate: 0,
    averageAccuracy: 0,
    totalGamesPlayed: 0,
    averageScore: 0,
    bestScore: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<AutoLearningGameConfig | null>(null)

  // 内部状態
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const serviceRef = useRef(autoLearningGameService)

  // ヘルパー関数を先に定義
  const calculateSuccessRate = (
    completedWithStats: LearningGameProcess[],
  ): number => {
    return completedWithStats.length > 0
      ? completedWithStats.reduce(
          (sum, p) => sum + p.gameStats.successRate,
          0,
        ) / completedWithStats.length
      : 0
  }

  const calculateAverageAccuracy = (
    completedWithStats: LearningGameProcess[],
  ): number => {
    return completedWithStats.length > 0
      ? completedWithStats.reduce(
          (sum, p) => sum + (p.learningStats?.accuracy || 0),
          0,
        ) / completedWithStats.length
      : 0
  }

  const calculateTotalGamesPlayed = (
    history: readonly LearningGameProcess[],
    current: LearningGameProcess | null,
  ): number => {
    return (
      history.reduce((sum, p) => sum + p.gameStats.completedGames, 0) +
      (current?.gameStats.completedGames || 0)
    )
  }

  const calculateScoreStats = (
    history: readonly LearningGameProcess[],
    current: LearningGameProcess | null,
  ): { averageScore: number; bestScore: number } => {
    const allScores = history
      .filter((p) => p.gameStats.averageScore > 0)
      .map((p) => ({
        avg: p.gameStats.averageScore,
        best: p.gameStats.bestScore,
      }))

    if (current && current.gameStats.averageScore > 0) {
      allScores.push({
        avg: current.gameStats.averageScore,
        best: current.gameStats.bestScore,
      })
    }

    const averageScore =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s.avg, 0) / allScores.length
        : 0

    const bestScore =
      allScores.length > 0 ? Math.max(...allScores.map((s) => s.best)) : 0

    return { averageScore, bestScore }
  }

  /**
   * 統計情報を計算
   */
  const calculateStats = useCallback(
    (
      history: readonly LearningGameProcess[],
      current: LearningGameProcess | null,
      running: boolean,
    ): AutoLearningGameStats => {
      const totalProcesses = history.length + (current ? 1 : 0)
      const completedProcesses = history.filter(
        (p) => p.status === 'completed',
      ).length
      const runningProcesses = running ? 1 : 0

      const completedWithStats = history.filter(
        (p) => p.gameStats && p.learningStats,
      )
      const successRate = calculateSuccessRate(completedWithStats)
      const averageAccuracy = calculateAverageAccuracy(completedWithStats)
      const totalGamesPlayed = calculateTotalGamesPlayed(history, current)
      const { averageScore, bestScore } = calculateScoreStats(history, current)

      return {
        totalProcesses,
        runningProcesses,
        completedProcesses,
        successRate,
        averageAccuracy,
        totalGamesPlayed,
        averageScore,
        bestScore,
      }
    },
    [],
  )

  /**
   * 状態を更新
   */
  const updateState = useCallback(() => {
    try {
      const service = serviceRef.current
      const running = service.isAutoLearningGameRunning()
      const current = service.getCurrentProcess()
      const history = service.getProcessHistory()

      setIsRunning(running)
      setCurrentProcess(current)
      setProcessHistory(history)

      const calculatedStats = calculateStats(history, current, running)
      setStats(calculatedStats)
      setError(current?.error || null)
    } catch (err) {
      console.error('Failed to update auto learning game state:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [calculateStats])

  /**
   * 自動学習ゲームを開始
   */
  const startAutoLearningGame = useCallback(async () => {
    try {
      setError(null)
      await serviceRef.current.startAutoLearningGame()
      updateState()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to start auto learning game'
      setError(errorMessage)
      console.error('Failed to start auto learning game:', err)
    }
  }, [updateState])

  /**
   * 自動学習ゲームを停止
   */
  const stopAutoLearningGame = useCallback(() => {
    try {
      setError(null)
      serviceRef.current.stopAutoLearningGame()
      updateState()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to stop auto learning game'
      setError(errorMessage)
      console.error('Failed to stop auto learning game:', err)
    }
  }, [updateState])

  /**
   * 設定を更新
   */
  const updateConfig = useCallback(
    (newConfig: Partial<AutoLearningGameConfig>) => {
      try {
        serviceRef.current.updateConfig(newConfig)
        setConfig((prev) => (prev ? { ...prev, ...newConfig } : null))
        setError(null)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update config'
        setError(errorMessage)
        console.error('Failed to update config:', err)
      }
    },
    [],
  )

  /**
   * 設定を取得
   */
  const getConfig = useCallback((): AutoLearningGameConfig | null => {
    return config
  }, [config])

  /**
   * プロセス履歴をクリア
   */
  const clearHistory = useCallback(() => {
    // サービス側にクリア機能があれば実装
    setProcessHistory([])
  }, [])

  // ポーリング設定
  useEffect(() => {
    if (!enabled) return

    // 初期状態更新
    updateState()

    // ポーリング開始
    pollingIntervalRef.current = setInterval(() => {
      updateState()
    }, pollingInterval)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [enabled, pollingInterval, updateState])

  // サービス更新時の処理
  useEffect(() => {
    serviceRef.current = autoLearningGameService
    updateState()
  }, [autoLearningGameService, updateState])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    // 状態
    isRunning,
    currentProcess,
    processHistory,
    stats,
    error,
    config,

    // アクション
    startAutoLearningGame,
    stopAutoLearningGame,
    updateConfig,
    getConfig,
    clearHistory,

    // ユーティリティ
    isEnabled: enabled,
  } as const
}
