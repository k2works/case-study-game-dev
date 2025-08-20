/**
 * パフォーマンスメトリクスドメインモデル
 */
import type { GameSession, PerformanceData, PerformanceReport } from './index'

/**
 * パフォーマンス分析機能
 */
export class PerformanceMetrics {
  private sessions: GameSession[] = []

  /**
   * ゲームセッションを追加
   */
  addSession(session: GameSession): void {
    this.sessions.push(session)
  }

  /**
   * パフォーマンスデータを取得
   */
  getPerformanceData(): PerformanceData {
    return {
      totalGames: this.sessions.length,
      totalScore: this.sessions.reduce(
        (sum, session) => sum + session.finalScore,
        0,
      ),
      totalChains: this.sessions.reduce(
        (sum, session) => sum + session.maxChain,
        0,
      ),
      sessions: [...this.sessions],
    }
  }

  /**
   * 平均スコアを取得
   */
  getAverageScore(): number {
    if (this.sessions.length === 0) {
      return 0
    }
    return (
      this.sessions.reduce((sum, session) => sum + session.finalScore, 0) /
      this.sessions.length
    )
  }

  /**
   * 平均連鎖数を取得
   */
  getAverageChain(): number {
    if (this.sessions.length === 0) {
      return 0
    }
    return (
      this.sessions.reduce((sum, session) => sum + session.maxChain, 0) /
      this.sessions.length
    )
  }

  /**
   * 連鎖成功率を取得
   * 4連鎖以上を成功とする
   */
  getChainSuccessRate(): number {
    if (this.sessions.length === 0) {
      return 0
    }
    const successfulChains = this.sessions.filter(
      (session) => session.maxChain >= 4,
    ).length
    return successfulChains / this.sessions.length
  }

  /**
   * 平均プレイ時間を取得（ミリ秒）
   */
  getAveragePlayTime(): number {
    if (this.sessions.length === 0) {
      return 0
    }
    const totalTime = this.sessions.reduce((sum, session) => {
      return sum + (session.endTime.getTime() - session.startTime.getTime())
    }, 0)
    return totalTime / this.sessions.length
  }

  /**
   * AIと人間の比較レポートを生成
   */
  generateComparisonReport(): PerformanceReport {
    const aiSessions = this.sessions.filter(
      (session) => session.playerType === 'ai',
    )
    const humanSessions = this.sessions.filter(
      (session) => session.playerType === 'human',
    )

    const calculateStats = (sessions: GameSession[]) => {
      if (sessions.length === 0) {
        return {
          avgScore: 0,
          avgChain: 0,
          gamesPlayed: 0,
          avgPlayTime: 0,
          chainSuccessRate: 0,
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
      const totalTime = sessions.reduce(
        (sum, session) =>
          sum + (session.endTime.getTime() - session.startTime.getTime()),
        0,
      )
      const successfulChains = sessions.filter(
        (session) => session.maxChain >= 4,
      ).length

      return {
        avgScore: totalScore / sessions.length,
        avgChain: totalChain / sessions.length,
        gamesPlayed: sessions.length,
        avgPlayTime: totalTime / sessions.length,
        chainSuccessRate: successfulChains / sessions.length,
      }
    }

    const aiStats = calculateStats(aiSessions)
    const humanStats = calculateStats(humanSessions)

    return {
      ai: aiStats,
      human: humanStats,
      comparison: {
        scoreRatio:
          humanStats.avgScore > 0 ? aiStats.avgScore / humanStats.avgScore : 0,
        chainRatio:
          humanStats.avgChain > 0 ? aiStats.avgChain / humanStats.avgChain : 0,
        playTimeRatio:
          humanStats.avgPlayTime > 0
            ? aiStats.avgPlayTime / humanStats.avgPlayTime
            : 0,
      },
    }
  }

  /**
   * データをクリア
   */
  clearData(): void {
    this.sessions = []
  }

  /**
   * 期間内のセッションを取得
   */
  getSessionsInPeriod(startDate: Date, endDate: Date): GameSession[] {
    return this.sessions.filter(
      (session) =>
        session.startTime >= startDate && session.startTime <= endDate,
    )
  }
}
