import type {
  GameInputAction,
  InputConfiguration,
  InputPort,
  KeyboardInputEvent,
  TouchInputEvent,
} from '../ports/InputPort'

/**
 * 入力処理アプリケーションサービス
 * キーボード・タッチ入力をゲームアクションに変換し、入力設定を管理
 */
export class InputApplicationService implements InputPort {
  private config: InputConfiguration

  constructor(initialConfig?: Partial<InputConfiguration>) {
    this.config = {
      keyboard: {
        moveLeft: ['ArrowLeft', 'KeyA', 'KeyH'],
        moveRight: ['ArrowRight', 'KeyD', 'KeyL'],
        rotateClockwise: ['ArrowUp', 'KeyW', 'KeyK', 'Space'],
        rotateCounterclockwise: ['KeyZ', 'KeyQ'],
        softDrop: ['ArrowDown', 'KeyS', 'KeyJ'],
        hardDrop: ['Enter', 'KeyX'],
        pause: ['Escape', 'KeyP'],
        restart: ['KeyR'],
        ...initialConfig?.keyboard,
      },
      touch: {
        swipeThreshold: 30,
        tapThreshold: 10,
        longPressThreshold: 500,
        ...initialConfig?.touch,
      },
      sensitivity: {
        horizontal: 1.0,
        vertical: 1.0,
        rotation: 1.0,
        ...initialConfig?.sensitivity,
      },
      repeatDelay: 200,
      repeatInterval: 50,
      ...initialConfig,
    }
  }

  processKeyboardInput(keyEvent: KeyboardInputEvent): GameInputAction | null {
    // リピートキーの場合は特定のアクションのみ許可
    if (keyEvent.repeat && !this.isRepeatableAction(keyEvent.code)) {
      return null
    }

    // 修飾キーが押されている場合は処理をスキップ
    if (keyEvent.ctrlKey || keyEvent.altKey || keyEvent.metaKey) {
      return null
    }

    return this.mapKeyToAction(keyEvent.code, keyEvent.shiftKey)
  }

  processTouchInput(touchEvent: TouchInputEvent): GameInputAction | null {
    switch (touchEvent.type) {
      case 'touchstart':
        return this.processTouchStart(touchEvent)

      case 'touchmove':
        return this.processTouchMove()

      case 'touchend':
        return this.processTouchEnd()

      default:
        return null
    }
  }

  validateInput(action: GameInputAction): boolean {
    // 基本的な入力妥当性チェック
    if (!action || typeof action.type !== 'string') {
      return false
    }

    // ゲーム状態に基づく妥当性チェック
    // 現在の実装ではすべてのアクションを有効とする
    // 将来的にはゲーム状態に応じた詳細な検証を実装
    return true
  }

  updateInputConfiguration(config: InputConfiguration): void {
    this.config = { ...config }
  }

  /**
   * 現在の入力設定を取得
   * @returns 現在の入力設定
   */
  getInputConfiguration(): InputConfiguration {
    return { ...this.config }
  }

  /**
   * キーコードをゲームアクションにマッピング
   * @param keyCode キーコード
   * @param shiftPressed Shiftキーが押されているか
   * @returns 対応するゲームアクション、マッピングされない場合null
   */
  private mapKeyToAction(
    keyCode: string,
    shiftPressed: boolean,
  ): GameInputAction | null {
    const { keyboard } = this.config

    if (keyboard.moveLeft.includes(keyCode)) {
      return { type: 'MOVE_LEFT' }
    }

    if (keyboard.moveRight.includes(keyCode)) {
      return { type: 'MOVE_RIGHT' }
    }

    if (keyboard.rotateClockwise.includes(keyCode)) {
      // Shiftが押されている場合は反時計回り
      return shiftPressed
        ? { type: 'ROTATE_COUNTERCLOCKWISE' }
        : { type: 'ROTATE_CLOCKWISE' }
    }

    if (keyboard.rotateCounterclockwise.includes(keyCode)) {
      return { type: 'ROTATE_COUNTERCLOCKWISE' }
    }

    if (keyboard.softDrop.includes(keyCode)) {
      return { type: 'SOFT_DROP' }
    }

    if (keyboard.hardDrop.includes(keyCode)) {
      return { type: 'HARD_DROP' }
    }

    if (keyboard.pause.includes(keyCode)) {
      return { type: 'PAUSE' }
    }

    if (keyboard.restart.includes(keyCode)) {
      return { type: 'RESTART' }
    }

    return null
  }

  /**
   * リピート可能なアクションかチェック
   * @param keyCode キーコード
   * @returns リピート可能な場合true
   */
  private isRepeatableAction(keyCode: string): boolean {
    const { keyboard } = this.config
    return (
      keyboard.moveLeft.includes(keyCode) ||
      keyboard.moveRight.includes(keyCode) ||
      keyboard.softDrop.includes(keyCode)
    )
  }

  /**
   * タッチ開始イベントを処理
   * @param touchEvent タッチイベント
   * @returns ゲームアクション、該当なしの場合null
   */
  private processTouchStart(
    touchEvent: TouchInputEvent,
  ): GameInputAction | null {
    if (touchEvent.touches.length === 1) {
      // シングルタッチ - 位置に応じたアクションを決定
      const touch = touchEvent.touches[0]
      return this.determineTouchAction(touch.clientX, touch.clientY)
    } else if (touchEvent.touches.length === 2) {
      // ダブルタッチ - 回転アクション
      return { type: 'ROTATE_CLOCKWISE' }
    }

    return null
  }

  /**
   * タッチ移動イベントを処理
   * @param touchEvent タッチイベント
   * @returns ゲームアクション、該当なしの場合null
   */
  private processTouchMove(): GameInputAction | null {
    // 現在の実装では移動イベントは処理しない
    // 将来的にはスワイプジェスチャーの実装を検討
    return null
  }

  /**
   * タッチ終了イベントを処理
   * @param touchEvent タッチイベント
   * @returns ゲームアクション、該当なしの場合null
   */
  private processTouchEnd(): GameInputAction | null {
    // 現在の実装では終了イベントは処理しない
    return null
  }

  /**
   * タッチ位置に基づいてアクションを決定
   * @param clientX X座標
   * @param clientY Y座標
   * @returns 決定されたゲームアクション
   */
  private determineTouchAction(
    clientX: number,
    clientY: number,
  ): GameInputAction | null {
    // 画面を領域分割してアクションを決定
    // この実装は簡素化されており、実際の画面サイズやレイアウトに応じて調整が必要

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const leftZone = screenWidth * 0.33
    const rightZone = screenWidth * 0.67
    const topZone = screenHeight * 0.33

    if (clientX < leftZone) {
      return { type: 'MOVE_LEFT' }
    } else if (clientX > rightZone) {
      return { type: 'MOVE_RIGHT' }
    } else if (clientY < topZone) {
      return { type: 'ROTATE_CLOCKWISE' }
    } else {
      return { type: 'SOFT_DROP' }
    }
  }

  /**
   * 入力設定をデフォルト値にリセット
   */
  resetToDefault(): void {
    this.config = {
      keyboard: {
        moveLeft: ['ArrowLeft', 'KeyA', 'KeyH'],
        moveRight: ['ArrowRight', 'KeyD', 'KeyL'],
        rotateClockwise: ['ArrowUp', 'KeyW', 'KeyK', 'Space'],
        rotateCounterclockwise: ['KeyZ', 'KeyQ'],
        softDrop: ['ArrowDown', 'KeyS', 'KeyJ'],
        hardDrop: ['Enter', 'KeyX'],
        pause: ['Escape', 'KeyP'],
        restart: ['KeyR'],
      },
      touch: {
        swipeThreshold: 30,
        tapThreshold: 10,
        longPressThreshold: 500,
      },
      sensitivity: {
        horizontal: 1.0,
        vertical: 1.0,
        rotation: 1.0,
      },
      repeatDelay: 200,
      repeatInterval: 50,
    }
  }
}
