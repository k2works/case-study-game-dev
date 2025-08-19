/**
 * パフォーマンス分析関連の型定義
 */

/**
 * ゲームセッション
 */
export interface GameSession {
  /** セッションID */
  id: string
  /** 開始時刻 */
  startTime: Date
  /** 終了時刻 */
  endTime: Date
  /** 最終スコア */
  finalScore: number
  /** 最大連鎖数 */
  maxChain: number
  /** 総手数 */
  totalMoves: number
  /** AIが有効だったか */
  aiEnabled: boolean
  /** プレイヤータイプ */
  playerType: 'ai' | 'human'
}

/**
 * パフォーマンスデータ
 */
export interface PerformanceData {
  /** 総ゲーム数 */
  totalGames: number
  /** 総スコア */
  totalScore: number
  /** 総連鎖数 */
  totalChains: number
  /** セッション履歴 */
  sessions: GameSession[]
}

/**
 * パフォーマンス比較レポート
 */
export interface PerformanceReport {
  /** AI統計 */
  ai: {
    avgScore: number
    avgChain: number
    gamesPlayed: number
    avgPlayTime: number
    chainSuccessRate: number
  }
  /** 人間統計 */
  human: {
    avgScore: number
    avgChain: number
    gamesPlayed: number
    avgPlayTime: number
    chainSuccessRate: number
  }
  /** 比較データ */
  comparison: {
    scoreRatio: number
    chainRatio: number
    playTimeRatio: number
  }
}
