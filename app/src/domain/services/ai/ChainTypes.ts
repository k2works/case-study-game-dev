/**
 * 連鎖評価関連の型定義
 * 循環参照を避けるため、型定義を分離
 */

/**
 * 連鎖パターンの種類
 */
export const ChainPatternType = {
  /** GTR（ぷよぷよ通でよく使われる定跡） */
  GTR: 'gtr',
  /** 階段積み */
  STAIRS: 'stairs',
  /** 挟み込み */
  SANDWICH: 'sandwich',
  /** 鶴亀連鎖 */
  TSURUKAME: 'tsurukame',
  /** 底上げ */
  BOTTOM_UP: 'bottom_up',
  /** カウンター */
  COUNTER: 'counter',
  /** 副砲台 */
  SUB_TOWER: 'sub_tower',
  /** 不明/その他 */
  UNKNOWN: 'unknown',
} as const

export type ChainPatternType =
  (typeof ChainPatternType)[keyof typeof ChainPatternType]

/**
 * GTR定跡の具体的な形
 */
export const GTRVariant = {
  /** 標準GTR */
  STANDARD: 'standard',
  /** 新GTR */
  NEW: 'new',
  /** LST積み */
  LST: 'lst',
  /** DT砲 */
  DT: 'dt',
  /** TSD */
  TSD: 'tsd',
} as const

export type GTRVariant = (typeof GTRVariant)[keyof typeof GTRVariant]

/**
 * 連鎖パターン情報
 */
export interface ChainPattern {
  /** パターンの種類 */
  type: ChainPatternType
  /** 信頼度 (0-1) */
  confidence: number
  /** パターンの位置 */
  position: { x: number; y: number }
  /** パターンのサイズ */
  size: { width: number; height: number }
  /** 推定連鎖長 */
  estimatedChainLength: number
  /** パターン固有の詳細情報 */
  details: Record<string, unknown>
}

/**
 * GTR定跡評価
 */
export interface GTREvaluation {
  /** GTRの種類 */
  variant: GTRVariant
  /** 完成度 (0-1) */
  completeness: number
  /** 理想形との一致度 */
  idealMatch: number
  /** 発火可能性 */
  triggerability: number
  /** 土台の安定性 */
  foundationStability: number
  /** 拡張性 */
  extensionPotential: number
  /** 詳細評価 */
  details: {
    /** 土台評価 */
    foundation: number
    /** 連鎖尻評価 */
    chainTail: number
    /** 伸ばし評価 */
    extension: number
    /** 催促評価 */
    pressure: number
  }
}
