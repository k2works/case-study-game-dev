/**
 * パフォーマンス分析ポート
 */
import type {
  GameSession,
  PerformanceData,
  PerformanceReport,
} from '../../domain/models/ai/types'

/**
 * パフォーマンス分析の出力ポート
 */
export interface PerformancePort {
  /**
   * ゲームセッションを追加
   */
  addSession(session: GameSession): void

  /**
   * パフォーマンスデータを取得
   */
  getPerformanceData(): PerformanceData

  /**
   * 平均スコアを取得
   */
  getAverageScore(): number

  /**
   * 平均連鎖数を取得
   */
  getAverageChain(): number

  /**
   * 連鎖成功率を取得
   */
  getChainSuccessRate(): number

  /**
   * 平均プレイ時間を取得
   */
  getAveragePlayTime(): number

  /**
   * AIと人間の比較レポートを生成
   */
  generateComparisonReport(): PerformanceReport

  /**
   * データをクリア
   */
  clearData(): void

  /**
   * 期間内のセッションを取得
   */
  getSessionsInPeriod(startDate: Date, endDate: Date): GameSession[]
}
