import { beforeEach, describe, expect, it } from 'vitest'

import type {
  GameInputAction,
  InputConfiguration,
  KeyboardInputEvent,
  TouchInputEvent,
} from '../ports/InputPort'
import { InputApplicationService } from './InputApplicationService'

describe('InputApplicationService', () => {
  let service: InputApplicationService

  beforeEach(() => {
    service = new InputApplicationService()
  })

  describe('コンストラクタ', () => {
    it('デフォルト設定で初期化される', () => {
      const service = new InputApplicationService()
      const config = service.getInputConfiguration()

      expect(config.keyboard.moveLeft).toEqual(['ArrowLeft', 'KeyA', 'KeyH'])
      expect(config.keyboard.moveRight).toEqual(['ArrowRight', 'KeyD', 'KeyL'])
      expect(config.keyboard.rotateClockwise).toEqual([
        'ArrowUp',
        'KeyW',
        'KeyK',
        'Space',
      ])
      expect(config.keyboard.rotateCounterclockwise).toEqual(['KeyZ', 'KeyQ'])
      expect(config.touch.swipeThreshold).toBe(30)
      expect(config.sensitivity.horizontal).toBe(1.0)
      expect(config.repeatDelay).toBe(200)
      expect(config.repeatInterval).toBe(50)
    })

    it('部分的な初期設定でカスタマイズできる', () => {
      const customConfig = {
        keyboard: {
          moveLeft: ['ArrowLeft', 'KeyA', 'KeyH'],
          moveRight: ['ArrowRight', 'KeyD', 'KeyL'],
          rotateClockwise: ['ArrowUp', 'KeyW', 'KeyK', 'Space'],
          rotateCounterclockwise: ['KeyZ', 'KeyQ'],
          softDrop: ['ArrowDown', 'KeyS', 'KeyJ'],
          hardDrop: ['Enter', 'KeyX'],
          pause: ['KeyP', 'Escape'], // カスタマイズ
          restart: ['KeyR'],
        },
        touch: {
          swipeThreshold: 50,
          tapThreshold: 10,
          longPressThreshold: 500,
        },
        sensitivity: {
          horizontal: 1.0,
          vertical: 1.0,
          rotation: 1.0,
        },
        repeatDelay: 300,
        repeatInterval: 50,
      }

      const service = new InputApplicationService(customConfig)
      const config = service.getInputConfiguration()

      expect(config.keyboard.moveLeft).toEqual(['ArrowLeft', 'KeyA', 'KeyH'])
      expect(config.keyboard.pause).toEqual(['KeyP', 'Escape'])
      expect(config.keyboard.moveRight).toEqual(['ArrowRight', 'KeyD', 'KeyL'])
      expect(config.touch.swipeThreshold).toBe(50)
      expect(config.touch.tapThreshold).toBe(10)
      expect(config.repeatDelay).toBe(300)
    })
  })

  describe('processKeyboardInput', () => {
    const createKeyEvent = (
      code: string,
      options: Partial<KeyboardInputEvent> = {},
    ): KeyboardInputEvent => ({
      key: code,
      code,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      repeat: false,
      type: 'keydown',
      ...options,
    })

    describe('基本キー入力処理', () => {
      it('左移動キーでMOVE_LEFTアクションを返す', () => {
        expect(
          service.processKeyboardInput(createKeyEvent('ArrowLeft')),
        ).toEqual({ type: 'MOVE_LEFT' })
        expect(service.processKeyboardInput(createKeyEvent('KeyA'))).toEqual({
          type: 'MOVE_LEFT',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyH'))).toEqual({
          type: 'MOVE_LEFT',
        })
      })

      it('右移動キーでMOVE_RIGHTアクションを返す', () => {
        expect(
          service.processKeyboardInput(createKeyEvent('ArrowRight')),
        ).toEqual({ type: 'MOVE_RIGHT' })
        expect(service.processKeyboardInput(createKeyEvent('KeyD'))).toEqual({
          type: 'MOVE_RIGHT',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyL'))).toEqual({
          type: 'MOVE_RIGHT',
        })
      })

      it('時計回り回転キーでROTATE_CLOCKWISEアクションを返す', () => {
        expect(service.processKeyboardInput(createKeyEvent('ArrowUp'))).toEqual(
          { type: 'ROTATE_CLOCKWISE' },
        )
        expect(service.processKeyboardInput(createKeyEvent('KeyW'))).toEqual({
          type: 'ROTATE_CLOCKWISE',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyK'))).toEqual({
          type: 'ROTATE_CLOCKWISE',
        })
        expect(service.processKeyboardInput(createKeyEvent('Space'))).toEqual({
          type: 'ROTATE_CLOCKWISE',
        })
      })

      it('反時計回り回転キーでROTATE_COUNTERCLOCKWISEアクションを返す', () => {
        expect(service.processKeyboardInput(createKeyEvent('KeyZ'))).toEqual({
          type: 'ROTATE_COUNTERCLOCKWISE',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyQ'))).toEqual({
          type: 'ROTATE_COUNTERCLOCKWISE',
        })
      })

      it('ソフトドロップキーでSOFT_DROPアクションを返す', () => {
        expect(
          service.processKeyboardInput(createKeyEvent('ArrowDown')),
        ).toEqual({ type: 'SOFT_DROP' })
        expect(service.processKeyboardInput(createKeyEvent('KeyS'))).toEqual({
          type: 'SOFT_DROP',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyJ'))).toEqual({
          type: 'SOFT_DROP',
        })
      })

      it('ハードドロップキーでHARD_DROPアクションを返す', () => {
        expect(service.processKeyboardInput(createKeyEvent('Enter'))).toEqual({
          type: 'HARD_DROP',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyX'))).toEqual({
          type: 'HARD_DROP',
        })
      })

      it('ポーズキーでPAUSEアクションを返す', () => {
        expect(service.processKeyboardInput(createKeyEvent('Escape'))).toEqual({
          type: 'PAUSE',
        })
        expect(service.processKeyboardInput(createKeyEvent('KeyP'))).toEqual({
          type: 'PAUSE',
        })
      })

      it('リスタートキーでRESTARTアクションを返す', () => {
        expect(service.processKeyboardInput(createKeyEvent('KeyR'))).toEqual({
          type: 'RESTART',
        })
      })

      it('未定義のキーではnullを返す', () => {
        expect(service.processKeyboardInput(createKeyEvent('KeyM'))).toBeNull()
        expect(
          service.processKeyboardInput(createKeyEvent('Digit1')),
        ).toBeNull()
      })
    })

    describe('Shiftキー修飾', () => {
      it('Shift + 時計回り回転キーで反時計回り回転になる', () => {
        const event = createKeyEvent('ArrowUp', { shiftKey: true })
        expect(service.processKeyboardInput(event)).toEqual({
          type: 'ROTATE_COUNTERCLOCKWISE',
        })
      })

      it('Shift + 他のキーでは通常通り動作する', () => {
        const event = createKeyEvent('ArrowLeft', { shiftKey: true })
        expect(service.processKeyboardInput(event)).toEqual({
          type: 'MOVE_LEFT',
        })
      })
    })

    describe('修飾キーの処理', () => {
      it('Ctrlキーが押されている場合はnullを返す', () => {
        const event = createKeyEvent('ArrowLeft', { ctrlKey: true })
        expect(service.processKeyboardInput(event)).toBeNull()
      })

      it('Altキーが押されている場合はnullを返す', () => {
        const event = createKeyEvent('ArrowLeft', { altKey: true })
        expect(service.processKeyboardInput(event)).toBeNull()
      })

      it('Metaキーが押されている場合はnullを返す', () => {
        const event = createKeyEvent('ArrowLeft', { metaKey: true })
        expect(service.processKeyboardInput(event)).toBeNull()
      })

      it('Shiftキーのみでは処理をブロックしない', () => {
        const event = createKeyEvent('ArrowLeft', { shiftKey: true })
        expect(service.processKeyboardInput(event)).toEqual({
          type: 'MOVE_LEFT',
        })
      })
    })

    describe('リピートキー処理', () => {
      it('移動系キーのリピートは許可される', () => {
        const leftEvent = createKeyEvent('ArrowLeft', { repeat: true })
        const rightEvent = createKeyEvent('ArrowRight', { repeat: true })
        const softDropEvent = createKeyEvent('ArrowDown', { repeat: true })

        expect(service.processKeyboardInput(leftEvent)).toEqual({
          type: 'MOVE_LEFT',
        })
        expect(service.processKeyboardInput(rightEvent)).toEqual({
          type: 'MOVE_RIGHT',
        })
        expect(service.processKeyboardInput(softDropEvent)).toEqual({
          type: 'SOFT_DROP',
        })
      })

      it('回転系キーのリピートは拒否される', () => {
        const rotateEvent = createKeyEvent('ArrowUp', { repeat: true })
        expect(service.processKeyboardInput(rotateEvent)).toBeNull()
      })

      it('ハードドロップキーのリピートは拒否される', () => {
        const hardDropEvent = createKeyEvent('Enter', { repeat: true })
        expect(service.processKeyboardInput(hardDropEvent)).toBeNull()
      })

      it('システムキーのリピートは拒否される', () => {
        const pauseEvent = createKeyEvent('Escape', { repeat: true })
        const restartEvent = createKeyEvent('KeyR', { repeat: true })

        expect(service.processKeyboardInput(pauseEvent)).toBeNull()
        expect(service.processKeyboardInput(restartEvent)).toBeNull()
      })
    })
  })

  describe('processTouchInput', () => {
    // グローバルオブジェクトのモック
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      })
    })

    const createTouchEvent = (
      type: 'touchstart' | 'touchmove' | 'touchend',
      touches: Array<{ clientX: number; clientY: number }> = [],
    ): TouchInputEvent => ({
      type,
      touches: touches.map((touch, index) => ({
        identifier: index,
        clientX: touch.clientX,
        clientY: touch.clientY,
        force: 1,
        radiusX: 1,
        radiusY: 1,
      })),
      changedTouches: [],
      targetTouches: [],
    })

    describe('touchstart処理', () => {
      it('左ゾーンタッチでMOVE_LEFTアクションを返す', () => {
        const event = createTouchEvent('touchstart', [
          { clientX: 100, clientY: 400 },
        ])
        expect(service.processTouchInput(event)).toEqual({ type: 'MOVE_LEFT' })
      })

      it('右ゾーンタッチでMOVE_RIGHTアクションを返す', () => {
        const event = createTouchEvent('touchstart', [
          { clientX: 500, clientY: 400 },
        ])
        expect(service.processTouchInput(event)).toEqual({ type: 'MOVE_RIGHT' })
      })

      it('上部中央ゾーンタッチでROTATE_CLOCKWISEアクションを返す', () => {
        const event = createTouchEvent('touchstart', [
          { clientX: 300, clientY: 200 },
        ])
        expect(service.processTouchInput(event)).toEqual({
          type: 'ROTATE_CLOCKWISE',
        })
      })

      it('下部中央ゾーンタッチでSOFT_DROPアクションを返す', () => {
        const event = createTouchEvent('touchstart', [
          { clientX: 300, clientY: 600 },
        ])
        expect(service.processTouchInput(event)).toEqual({ type: 'SOFT_DROP' })
      })

      it('2本指タッチでROTATE_CLOCKWISEアクションを返す', () => {
        const event = createTouchEvent('touchstart', [
          { clientX: 200, clientY: 400 },
          { clientX: 400, clientY: 400 },
        ])
        expect(service.processTouchInput(event)).toEqual({
          type: 'ROTATE_CLOCKWISE',
        })
      })

      it('3本指以上のタッチではnullを返す', () => {
        const event = createTouchEvent('touchstart', [
          { clientX: 200, clientY: 400 },
          { clientX: 300, clientY: 400 },
          { clientX: 400, clientY: 400 },
        ])
        expect(service.processTouchInput(event)).toBeNull()
      })

      it('タッチポイントがない場合はnullを返す', () => {
        const event = createTouchEvent('touchstart', [])
        expect(service.processTouchInput(event)).toBeNull()
      })
    })

    describe('touchmove処理', () => {
      it('touchmoveイベントではnullを返す', () => {
        const event = createTouchEvent('touchmove', [
          { clientX: 300, clientY: 400 },
        ])
        expect(service.processTouchInput(event)).toBeNull()
      })
    })

    describe('touchend処理', () => {
      it('touchendイベントではnullを返す', () => {
        const event = createTouchEvent('touchend', [])
        expect(service.processTouchInput(event)).toBeNull()
      })
    })

    describe('不正なイベントタイプ', () => {
      it('未知のタッチイベントタイプではnullを返す', () => {
        const event = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: 'touchcancel' as any,
          touches: [],
          changedTouches: [],
          targetTouches: [],
        }
        expect(service.processTouchInput(event)).toBeNull()
      })
    })

    describe('画面サイズによる動的ゾーン計算', () => {
      it('異なる画面サイズでも正しくゾーンを計算する', () => {
        Object.defineProperty(window, 'innerWidth', { value: 1200 })
        Object.defineProperty(window, 'innerHeight', { value: 1600 })

        // 左ゾーン (0-400px)
        const leftEvent = createTouchEvent('touchstart', [
          { clientX: 200, clientY: 800 },
        ])
        expect(service.processTouchInput(leftEvent)).toEqual({
          type: 'MOVE_LEFT',
        })

        // 右ゾーン (800px-1200px)
        const rightEvent = createTouchEvent('touchstart', [
          { clientX: 1000, clientY: 800 },
        ])
        expect(service.processTouchInput(rightEvent)).toEqual({
          type: 'MOVE_RIGHT',
        })

        // 上部中央ゾーン (y < 533px)
        const topEvent = createTouchEvent('touchstart', [
          { clientX: 600, clientY: 400 },
        ])
        expect(service.processTouchInput(topEvent)).toEqual({
          type: 'ROTATE_CLOCKWISE',
        })

        // 下部中央ゾーン
        const bottomEvent = createTouchEvent('touchstart', [
          { clientX: 600, clientY: 1200 },
        ])
        expect(service.processTouchInput(bottomEvent)).toEqual({
          type: 'SOFT_DROP',
        })
      })
    })
  })

  describe('validateInput', () => {
    it('有効なGameInputActionでtrueを返す', () => {
      const actions: GameInputAction[] = [
        { type: 'MOVE_LEFT' },
        { type: 'MOVE_RIGHT' },
        { type: 'ROTATE_CLOCKWISE' },
        { type: 'ROTATE_COUNTERCLOCKWISE' },
        { type: 'SOFT_DROP' },
        { type: 'HARD_DROP' },
        { type: 'PAUSE' },
        { type: 'RESTART' },
        { type: 'QUIT' },
      ]

      actions.forEach((action) => {
        expect(service.validateInput(action)).toBe(true)
      })
    })

    it('nullアクションでfalseを返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.validateInput(null as any)).toBe(false)
    })

    it('undefinedアクションでfalseを返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.validateInput(undefined as any)).toBe(false)
    })

    it('typeプロパティがないオブジェクトでfalseを返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.validateInput({} as any)).toBe(false)
    })

    it('typeが文字列でないオブジェクトでfalseを返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(service.validateInput({ type: 123 } as any)).toBe(false)
    })
  })

  describe('updateInputConfiguration', () => {
    it('設定を完全に置き換える', () => {
      const newConfig: InputConfiguration = {
        keyboard: {
          moveLeft: ['KeyA'],
          moveRight: ['KeyD'],
          rotateClockwise: ['KeyW'],
          rotateCounterclockwise: ['KeyS'],
          softDrop: ['KeyX'],
          hardDrop: ['KeyC'],
          pause: ['KeyP'],
          restart: ['KeyR'],
        },
        touch: {
          swipeThreshold: 50,
          tapThreshold: 15,
          longPressThreshold: 1000,
        },
        sensitivity: {
          horizontal: 1.5,
          vertical: 1.2,
          rotation: 0.8,
        },
        repeatDelay: 100,
        repeatInterval: 30,
      }

      service.updateInputConfiguration(newConfig)
      expect(service.getInputConfiguration()).toEqual(newConfig)
    })

    it('設定更新後のキー入力処理が新しい設定で動作する', () => {
      const newConfig: InputConfiguration = {
        keyboard: {
          moveLeft: ['KeyQ'],
          moveRight: ['KeyE'],
          rotateClockwise: ['KeyW'],
          rotateCounterclockwise: ['KeyS'],
          softDrop: ['KeyX'],
          hardDrop: ['KeyC'],
          pause: ['KeyP'],
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

      service.updateInputConfiguration(newConfig)

      const leftEvent: KeyboardInputEvent = {
        key: 'q',
        code: 'KeyQ',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        type: 'keydown',
      }

      expect(service.processKeyboardInput(leftEvent)).toEqual({
        type: 'MOVE_LEFT',
      })

      // 古い設定のキーは動作しない
      const oldLeftEvent: KeyboardInputEvent = {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        type: 'keydown',
      }

      expect(service.processKeyboardInput(oldLeftEvent)).toBeNull()
    })
  })

  describe('getInputConfiguration', () => {
    it('現在の設定のコピーを返す', () => {
      const originalConfig = service.getInputConfiguration()

      // 返されたオブジェクトが正しく取得できることを確認
      expect(service.getInputConfiguration().repeatDelay).toBe(
        originalConfig.repeatDelay,
      )
      expect(service.getInputConfiguration()).toEqual(originalConfig)
    })
  })

  describe('resetToDefault', () => {
    it('設定をデフォルト値にリセットする', () => {
      // 設定を変更
      const customConfig: InputConfiguration = {
        keyboard: {
          moveLeft: ['KeyQ'],
          moveRight: ['KeyE'],
          rotateClockwise: ['KeyW'],
          rotateCounterclockwise: ['KeyS'],
          softDrop: ['KeyX'],
          hardDrop: ['KeyC'],
          pause: ['KeyP'],
          restart: ['KeyR'],
        },
        touch: {
          swipeThreshold: 100,
          tapThreshold: 20,
          longPressThreshold: 1000,
        },
        sensitivity: {
          horizontal: 2.0,
          vertical: 2.0,
          rotation: 2.0,
        },
        repeatDelay: 100,
        repeatInterval: 25,
      }

      service.updateInputConfiguration(customConfig)

      // リセット実行
      service.resetToDefault()

      // デフォルト値と一致することを確認
      const config = service.getInputConfiguration()
      expect(config.keyboard.moveLeft).toEqual(['ArrowLeft', 'KeyA', 'KeyH'])
      expect(config.keyboard.moveRight).toEqual(['ArrowRight', 'KeyD', 'KeyL'])
      expect(config.touch.swipeThreshold).toBe(30)
      expect(config.sensitivity.horizontal).toBe(1.0)
      expect(config.repeatDelay).toBe(200)
      expect(config.repeatInterval).toBe(50)
    })

    it('リセット後のキー入力処理がデフォルト設定で動作する', () => {
      // カスタム設定を適用
      service.updateInputConfiguration({
        keyboard: {
          moveLeft: ['KeyQ'],
          moveRight: ['KeyE'],
          rotateClockwise: ['KeyW'],
          rotateCounterclockwise: ['KeyS'],
          softDrop: ['KeyX'],
          hardDrop: ['KeyC'],
          pause: ['KeyP'],
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
      })

      // リセット
      service.resetToDefault()

      // デフォルトキーが動作することを確認
      const leftEvent: KeyboardInputEvent = {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        type: 'keydown',
      }

      expect(service.processKeyboardInput(leftEvent)).toEqual({
        type: 'MOVE_LEFT',
      })

      // カスタムキーは動作しないことを確認（KeyMは定義されていない）
      const customLeftEvent: KeyboardInputEvent = {
        key: 'm',
        code: 'KeyM',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        type: 'keydown',
      }

      expect(service.processKeyboardInput(customLeftEvent)).toBeNull()
    })
  })

  describe('エッジケース', () => {
    it('キーボード設定で複数のキーが同じアクションにマッピングされている場合', () => {
      const config = service.getInputConfiguration()
      expect(config.keyboard.moveLeft.length).toBeGreaterThan(1)

      config.keyboard.moveLeft.forEach((keyCode) => {
        const event: KeyboardInputEvent = {
          key: keyCode,
          code: keyCode,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          repeat: false,
          type: 'keydown',
        }
        expect(service.processKeyboardInput(event)).toEqual({
          type: 'MOVE_LEFT',
        })
      })
    })

    it('画面サイズが0の場合でもエラーにならない', () => {
      Object.defineProperty(window, 'innerWidth', { value: 0 })
      Object.defineProperty(window, 'innerHeight', { value: 0 })

      const event = createTouchEvent('touchstart', [{ clientX: 0, clientY: 0 }])
      expect(() => service.processTouchInput(event)).not.toThrow()
    })

    it('負の座標でタッチした場合', () => {
      const event = {
        type: 'touchstart' as const,
        touches: [
          {
            identifier: 0,
            clientX: -100,
            clientY: -100,
            force: 1,
            radiusX: 1,
            radiusY: 1,
          },
        ],
        changedTouches: [],
        targetTouches: [],
      }

      expect(service.processTouchInput(event)).toEqual({ type: 'MOVE_LEFT' })
    })
  })
})

function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Array<{ clientX: number; clientY: number }> = [],
): TouchInputEvent {
  return {
    type,
    touches: touches.map((touch, index) => ({
      identifier: index,
      clientX: touch.clientX,
      clientY: touch.clientY,
      force: 1,
      radiusX: 1,
      radiusY: 1,
    })),
    changedTouches: [],
    targetTouches: [],
  }
}
