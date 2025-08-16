/**
 * 入力処理のためのポートインターフェース
 * ヘキサゴナルアーキテクチャにおける内向きのポート
 */
export interface InputPort {
  /**
   * キーボード入力を処理する
   * @param keyEvent キーボードイベント
   * @returns ゲームアクション、無効な入力の場合null
   */
  processKeyboardInput(keyEvent: KeyboardInputEvent): GameInputAction | null

  /**
   * タッチ入力を処理する
   * @param touchEvent タッチイベント
   * @returns ゲームアクション、無効な入力の場合null
   */
  processTouchInput(touchEvent: TouchInputEvent): GameInputAction | null

  /**
   * 入力の妥当性を検証する
   * @param action 検証するアクション
   * @param currentGameState 現在のゲーム状態
   * @returns 有効な場合true
   */
  validateInput(action: GameInputAction, currentGameState: unknown): boolean

  /**
   * 入力設定を更新する
   * @param config 新しい入力設定
   */
  updateInputConfiguration(config: InputConfiguration): void
}

/**
 * キーボード入力イベント
 */
export interface KeyboardInputEvent {
  readonly key: string
  readonly code: string
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  readonly repeat: boolean
  readonly type: 'keydown' | 'keyup'
}

/**
 * タッチ入力イベント
 */
export interface TouchInputEvent {
  readonly type: 'touchstart' | 'touchmove' | 'touchend'
  readonly touches: TouchPoint[]
  readonly changedTouches: TouchPoint[]
  readonly targetTouches: TouchPoint[]
}

/**
 * タッチポイント情報
 */
export interface TouchPoint {
  readonly identifier: number
  readonly clientX: number
  readonly clientY: number
  readonly force: number
  readonly radiusX: number
  readonly radiusY: number
}

/**
 * ゲーム入力アクション
 */
export type GameInputAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'ROTATE_CLOCKWISE' }
  | { type: 'ROTATE_COUNTERCLOCKWISE' }
  | { type: 'SOFT_DROP' }
  | { type: 'HARD_DROP' }
  | { type: 'PAUSE' }
  | { type: 'RESTART' }
  | { type: 'QUIT' }

/**
 * 入力設定
 */
export interface InputConfiguration {
  readonly keyboard: KeyboardConfiguration
  readonly touch: TouchConfiguration
  readonly sensitivity: InputSensitivity
  readonly repeatDelay: number
  readonly repeatInterval: number
}

/**
 * キーボード設定
 */
export interface KeyboardConfiguration {
  readonly moveLeft: string[]
  readonly moveRight: string[]
  readonly rotateClockwise: string[]
  readonly rotateCounterclockwise: string[]
  readonly softDrop: string[]
  readonly hardDrop: string[]
  readonly pause: string[]
  readonly restart: string[]
}

/**
 * タッチ設定
 */
export interface TouchConfiguration {
  readonly swipeThreshold: number
  readonly tapThreshold: number
  readonly longPressThreshold: number
}

/**
 * 入力感度設定
 */
export interface InputSensitivity {
  readonly horizontal: number
  readonly vertical: number
  readonly rotation: number
}
