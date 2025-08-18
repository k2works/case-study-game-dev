/**
 * AI関連の型定義
 */
import type { PuyoColor } from '../Puyo.ts'

/**
 * AIの設定
 */
export interface AISettings {
  /** AIが有効かどうか */
  enabled: boolean
  /** 思考速度（ミリ秒） */
  thinkingSpeed: number
  /** 動作モード */
  mode: 'balanced' | 'aggressive' | 'defensive'
}

/**
 * AI用フィールド状態
 */
export interface AIFieldState {
  /** フィールドの幅 */
  width: number
  /** フィールドの高さ */
  height: number
  /** セル状態（null = 空、PuyoColor = ぷよ） */
  cells: (PuyoColor | null)[][]
}

/**
 * AI用ぷよペア状態
 */
export interface AIPuyoPairState {
  /** 主ぷよの色 */
  primaryColor: PuyoColor
  /** 従ぷよの色 */
  secondaryColor: PuyoColor
  /** X座標 */
  x: number
  /** Y座標 */
  y: number
  /** 回転状態 */
  rotation: number
}

/**
 * ゲーム状態（AI用）
 */
export interface AIGameState {
  /** 現在のフィールド */
  field: AIFieldState
  /** 現在のぷよペア */
  currentPuyoPair: AIPuyoPairState | null
  /** 次のぷよペア */
  nextPuyoPair: AIPuyoPairState | null
  /** 現在のスコア */
  score: number
}

/**
 * AIの手
 */
export interface AIMove {
  /** 配置位置（列） */
  x: number
  /** 回転角度（0, 90, 180, 270） */
  rotation: number
  /** 評価スコア */
  score: number
  /** 評価詳細 */
  evaluation?: MoveEvaluation
}

/**
 * 移動可能な候補手
 */
export interface PossibleMove {
  /** 配置位置（列） */
  x: number
  /** 回転角度（0, 90, 180, 270） */
  rotation: number
  /** この手が有効かどうか */
  isValid: boolean
  /** 配置後の主ぷよ座標 */
  primaryPosition: { x: number; y: number }
  /** 配置後の従ぷよ座標 */
  secondaryPosition: { x: number; y: number }
}

/**
 * 評価結果
 */
export interface EvaluationResult {
  /** 高さバランススコア (0-100) */
  heightBalance: number
  /** 総合スコア */
  totalScore: number
}

/**
 * 手の評価詳細
 */
export interface MoveEvaluation {
  /** 高さスコア */
  heightScore: number
  /** 中央位置スコア */
  centerScore: number
  /** モード別追加スコア */
  modeScore: number
  /** 総合スコア */
  totalScore: number
  /** 平均Y座標 */
  averageY: number
  /** 平均X座標 */
  averageX: number
  /** 中央からの距離 */
  distanceFromCenter: number
  /** 評価理由 */
  reason: string
}

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

/**
 * AI戦略
 */
export interface AIStrategy {
  /** 戦略ID */
  id: string
  /** 戦略名 */
  name: string
  /** 戦略説明 */
  description: string
  /** パラメータ */
  parameters: AIStrategyParameters
}

/**
 * AI戦略パラメータ
 */
export interface AIStrategyParameters {
  /** 攻撃性 (0-100) */
  aggressiveness: number
  /** 防御性 (0-100) */
  defensiveness: number
  /** 連鎖重視度 (0-100) */
  chainFocus: number
  /** 高さ制御重要度 (0-100) */
  heightControl: number
  /** 中央配置重要度 (0-100) */
  centerPriority: number
}
