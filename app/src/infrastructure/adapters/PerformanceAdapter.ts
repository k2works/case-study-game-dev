/**
 * パフォーマンス分析アダプター
 */
import type { PerformancePort } from '../../application/ports/PerformancePort'
import { PerformanceMetrics } from '../../domain/models/ai/PerformanceMetrics'
import type {
  GameSession,
  PerformanceData,
  PerformanceReport,
} from '../../domain/models/ai/index'

/**
 * パフォーマンス分析インフラストラクチャアダプター
 */
export class PerformanceAdapter implements PerformancePort {
  private performanceMetrics: PerformanceMetrics

  constructor() {
    this.performanceMetrics = new PerformanceMetrics()
  }

  /**
   * ゲームセッションを追加
   */
  addSession(session: GameSession): void {
    this.performanceMetrics.addSession(session)
  }

  /**
   * パフォーマンスデータを取得
   */
  getPerformanceData(): PerformanceData {
    return this.performanceMetrics.getPerformanceData()
  }

  /**
   * 平均スコアを取得
   */
  getAverageScore(): number {
    return this.performanceMetrics.getAverageScore()
  }

  /**
   * 平均連鎖数を取得
   */
  getAverageChain(): number {
    return this.performanceMetrics.getAverageChain()
  }

  /**
   * 連鎖成功率を取得
   */
  getChainSuccessRate(): number {
    return this.performanceMetrics.getChainSuccessRate()
  }

  /**
   * 平均プレイ時間を取得
   */
  getAveragePlayTime(): number {
    return this.performanceMetrics.getAveragePlayTime()
  }

  /**
   * AIと人間の比較レポートを生成
   */
  generateComparisonReport(): PerformanceReport {
    return this.performanceMetrics.generateComparisonReport()
  }

  /**
   * データをクリア
   */
  clearData(): void {
    this.performanceMetrics.clearData()
  }

  /**
   * 期間内のセッションを取得
   */
  getSessionsInPeriod(startDate: Date, endDate: Date): GameSession[] {
    return this.performanceMetrics.getSessionsInPeriod(startDate, endDate)
  }
}
