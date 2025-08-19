/**
 * AI設定関連の型定義
 */

/**
 * AIの設定
 */
export interface AISettings {
  /** AIが有効かどうか */
  enabled: boolean
  /** 思考速度（ミリ秒） */
  thinkingSpeed: number
}
