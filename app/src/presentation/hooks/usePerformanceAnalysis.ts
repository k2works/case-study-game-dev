/**
 * パフォーマンス分析フック
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PerformanceAnalysisService } from '../../application/services/PerformanceAnalysisService'
import type { PerformanceStatistics } from '../../application/services/PerformanceAnalysisService'
import type { GameViewModel } from '../../application/viewmodels/GameViewModel'
import type { PerformanceReport } from '../../domain/models/ai/index'

interface UsePerformanceAnalysisProps {
  performanceService: PerformanceAnalysisService
  game: GameViewModel
  aiEnabled: boolean
}

interface GameSessionTracker {
  gameId: string
  startTime: Date
  startScore: number
  maxChain: number
  moveCount: number
}

export function usePerformanceAnalysis({
  performanceService,
  game,
  aiEnabled,
}: UsePerformanceAnalysisProps) {
  const [statistics, setStatistics] = useState<PerformanceStatistics>({
    totalGames: 0,
    averageScore: 0,
    averageChain: 0,
    chainSuccessRate: 0,
    averagePlayTime: 0,
    gameResults: [],
  })

  const [comparisonReport, setComparisonReport] = useState<PerformanceReport>({
    ai: {
      avgScore: 0,
      avgChain: 0,
      gamesPlayed: 0,
      avgPlayTime: 0,
      chainSuccessRate: 0,
    },
    human: {
      avgScore: 0,
      avgChain: 0,
      gamesPlayed: 0,
      avgPlayTime: 0,
      chainSuccessRate: 0,
    },
    comparison: {
      scoreRatio: 0,
      chainRatio: 0,
      playTimeRatio: 0,
    },
  })

  const currentSessionRef = useRef<GameSessionTracker | null>(null)

  // 統計データを更新
  const updateStatistics = useCallback(() => {
    try {
      const stats = performanceService.getPerformanceStatistics()
      const report = performanceService.getAIvsHumanComparison()

      setStatistics(stats)
      setComparisonReport(report)
    } catch (error) {
      console.debug('Statistics update failed:', error)
      // エラー時は初期値に設定
      setStatistics({
        totalGames: 0,
        averageScore: 0,
        averageChain: 0,
        chainSuccessRate: 0,
        averagePlayTime: 0,
        gameResults: [],
      })
      setComparisonReport({
        ai: {
          avgScore: 0,
          avgChain: 0,
          gamesPlayed: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
        },
        human: {
          avgScore: 0,
          avgChain: 0,
          gamesPlayed: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
        },
        comparison: {
          scoreRatio: 1.0,
          chainRatio: 1.0,
          playTimeRatio: 1.0,
        },
      })
    }
  }, [performanceService])

  // ゲーム開始時の処理
  useEffect(() => {
    if (game.state === 'playing' && !currentSessionRef.current) {
      const sessionId = `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newSession: GameSessionTracker = {
        gameId: sessionId,
        startTime: new Date(),
        startScore: game.score.current,
        maxChain: 0,
        moveCount: 0,
      }
      currentSessionRef.current = newSession
    }
  }, [game.state, game.score])

  // 連鎖数の追跡
  useEffect(() => {
    if (currentSessionRef.current && game.lastChain > 0) {
      currentSessionRef.current = {
        ...currentSessionRef.current,
        maxChain: Math.max(currentSessionRef.current.maxChain, game.lastChain),
      }
    }
  }, [game.lastChain])

  // ゲーム終了時の処理
  useEffect(() => {
    if (game.state === 'gameOver' && currentSessionRef.current) {
      const endTime = new Date()
      const sessionData = {
        gameId: currentSessionRef.current.gameId,
        startTime: currentSessionRef.current.startTime,
        endTime,
        finalScore: game.score.current,
        maxChain: Math.max(currentSessionRef.current.maxChain, game.lastChain),
        totalMoves: currentSessionRef.current.moveCount + 1, // 概算
        aiEnabled,
      }

      performanceService.recordGameSession(sessionData)
      currentSessionRef.current = null
      updateStatistics()
    }
  }, [
    game.state,
    game.score,
    game.lastChain,
    aiEnabled,
    performanceService,
    updateStatistics,
  ])

  // データリセット
  const resetData = useCallback(() => {
    performanceService.resetPerformanceData()
    updateStatistics()
    currentSessionRef.current = null
  }, [performanceService, updateStatistics])

  // 初回統計読み込み
  useEffect(() => {
    updateStatistics()
  }, [updateStatistics])

  return {
    statistics,
    comparisonReport,
    resetData,
    isRecording: currentSessionRef.current !== null,
  }
}
