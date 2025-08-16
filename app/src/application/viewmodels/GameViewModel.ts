/**
 * ゲーム状態のView Model
 * Presentation層で使用されるゲーム状態の表現
 * Domain層の詳細を隠蔽し、UI表示に特化した情報を提供
 */
export interface GameViewModel {
  readonly id: string
  readonly state: GameStateViewModel
  readonly field: FieldViewModel
  readonly score: ScoreViewModel
  readonly level: number
  readonly currentPuyoPair: PuyoPairViewModel | null
  readonly nextPuyoPair: PuyoPairViewModel | null
  readonly createdAt: string // ISO string
  readonly updatedAt: string // ISO string
}

/**
 * ゲーム状態のView Model
 */
export type GameStateViewModel = 'ready' | 'playing' | 'paused' | 'gameOver'

/**
 * フィールドのView Model
 */
export interface FieldViewModel {
  readonly width: number
  readonly height: number
  readonly cells: (PuyoViewModel | null)[][]
}

/**
 * ぷよのView Model
 */
export interface PuyoViewModel {
  readonly id: string
  readonly color: PuyoColorViewModel
  readonly x: number
  readonly y: number
}

/**
 * ぷよ色のView Model
 */
export type PuyoColorViewModel =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | null

/**
 * ぷよペアのView Model
 */
export interface PuyoPairViewModel {
  readonly id: string
  readonly main: PuyoViewModel
  readonly sub: PuyoViewModel
  readonly x: number
  readonly y: number
  readonly rotation: number
}

/**
 * スコアのView Model
 */
export interface ScoreViewModel {
  readonly current: number
  readonly high: number
  readonly display: number
  readonly chainBonus: number
  readonly colorBonus: number
}
