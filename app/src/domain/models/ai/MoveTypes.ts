/**
 * AI移動と評価関連の型定義
 */

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
