/**
 * AI関連の型定義
 */
import type { FieldAdapter } from '../models/FieldAdapter'
import type { PuyoPair } from '../models/PuyoPair'

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
 * ゲーム状態（AI用）
 */
export interface AIGameState {
  /** 現在のフィールド */
  field: FieldAdapter
  /** 現在のぷよペア */
  currentPuyoPair: PuyoPair | null
  /** 次のぷよペア */
  nextPuyoPair: PuyoPair | null
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