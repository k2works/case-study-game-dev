/**
 * AI用ゲーム状態関連の型定義
 */
import type { PuyoColor } from '../Puyo.ts'

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
  /** 連鎖回数 */
  chainCount: number
  /** ターン数 */
  turn: number
  /** ゲーム終了フラグ */
  isGameOver: boolean
}
