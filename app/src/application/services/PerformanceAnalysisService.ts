/**
 * パフォーマンス分析アプリケーションサービス
 */
import type {
  GameSession,
  PerformanceReport,
} from '../../domain/models/ai/types'
import type { PerformancePort } from '../ports/PerformancePort'

/**
 * ゲームセッションデータ（入力用）
 */
export interface GameSessionData {
  gameId: string
  startTime: Date
  endTime: Date
  finalScore: number
  maxChain: number
  totalMoves: number
  aiEnabled: boolean
}

/**
 * ゲーム結果データ
 */
export interface GameResultData {
  id: string
  score: number
  chain: number
  playTime: number
  timestamp: Date
  isAI: boolean
}

/**
 * パフォーマンス統計
 */
export interface PerformanceStatistics {
  totalGames: number
  averageScore: number
  averageChain: number
  chainSuccessRate: number
  averagePlayTime: number
  gameResults: GameResultData[]
}

/**
 * 期間別パフォーマンス統計
 */
export interface PeriodPerformanceData {
  sessions: GameSession[]
  totalGames: number
  averageScore: number
  averageChain: number
}

/**
 * パフォーマンス分析アプリケーションサービス
 */
export class PerformanceAnalysisService {
  private performancePort: PerformancePort

  constructor(performancePort: PerformancePort) {
    this.performancePort = performancePort
  }

  /**
   * ゲームセッションを記録
   */
  recordGameSession(sessionData: GameSessionData): void {
    const session: GameSession = {
      id: sessionData.gameId,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      finalScore: sessionData.finalScore,
      maxChain: sessionData.maxChain,
      totalMoves: sessionData.totalMoves,
      aiEnabled: sessionData.aiEnabled,
      playerType: sessionData.aiEnabled ? 'ai' : 'human',
    }

    this.performancePort.addSession(session)
  }

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStatistics(): PerformanceStatistics {
    const data = this.performancePort.getPerformanceData()

    // ゲーム結果データを生成
    const gameResults: GameResultData[] = data.sessions.map(
      (session, index) => ({
        id: `game-${index + 1}`,
        score: session.finalScore,
        chain: session.maxChain,
        playTime: session.endTime.getTime() - session.startTime.getTime(),
        timestamp: session.endTime,
        isAI: session.aiEnabled,
      }),
    )

    try {
      return {
        totalGames: data.totalGames,
        averageScore: this.performancePort.getAverageScore(),
        averageChain: this.performancePort.getAverageChain(),
        chainSuccessRate: this.performancePort.getChainSuccessRate(),
        averagePlayTime: this.performancePort.getAveragePlayTime(),
        gameResults,
      }
    } catch (error) {
      // データが不十分な場合はデフォルト値を返す
      console.debug('Performance data insufficient:', error)
      return {
        totalGames: data.totalGames,
        averageScore: 0,
        averageChain: 0,
        chainSuccessRate: 0,
        averagePlayTime: 0,
        gameResults,
      }
    }
  }

  /**
   * AIと人間の比較レポートを取得
   */
  getAIvsHumanComparison(): PerformanceReport {
    return this.performancePort.generateComparisonReport()
  }

  /**
   * 期間内のパフォーマンス統計を取得
   */
  getPerformanceInPeriod(
    startDate: Date,
    endDate: Date,
  ): PeriodPerformanceData {
    const sessions = this.performancePort.getSessionsInPeriod(
      startDate,
      endDate,
    )

    if (sessions.length === 0) {
      return {
        sessions: [],
        totalGames: 0,
        averageScore: 0,
        averageChain: 0,
      }
    }

    const totalScore = sessions.reduce(
      (sum, session) => sum + session.finalScore,
      0,
    )
    const totalChain = sessions.reduce(
      (sum, session) => sum + session.maxChain,
      0,
    )

    return {
      sessions,
      totalGames: sessions.length,
      averageScore: totalScore / sessions.length,
      averageChain: totalChain / sessions.length,
    }
  }

  /**
   * パフォーマンスデータをリセット
   */
  resetPerformanceData(): void {
    this.performancePort.clearData()
  }
}
