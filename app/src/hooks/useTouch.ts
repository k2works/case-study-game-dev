import { useEffect, useRef, useCallback } from 'react'

/**
 * タッチ操作の種類
 */
export enum TouchGesture {
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right',
  SWIPE_DOWN = 'swipe_down',
  TAP = 'tap',
  DOUBLE_TAP = 'double_tap',
}

/**
 * タッチ操作のハンドラー
 */
export interface TouchHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
}

/**
 * タッチ座標
 */
interface TouchPosition {
  x: number
  y: number
  timestamp: number
}

/**
 * useTouch フックのオプション
 */
interface UseTouchOptions {
  element?: HTMLElement | null
  enabled?: boolean
  swipeThreshold?: number // スワイプと判定する最小距離（ピクセル）
  swipeVelocity?: number // スワイプと判定する最小速度（ピクセル/ms）
  doubleTapDelay?: number // ダブルタップの最大間隔（ミリ秒）
}

/**
 * タッチ操作を処理するカスタムフック
 * モバイルデバイスでのタッチジェスチャーを検出して対応するハンドラーを実行
 */
export const useTouch = (
  handlers: TouchHandlers,
  options: UseTouchOptions = {}
) => {
  const {
    element = null,
    enabled = true,
    swipeThreshold = 50,
    swipeVelocity = 0.3,
    doubleTapDelay = 300,
  } = options

  const touchStart = useRef<TouchPosition | null>(null)
  const lastTap = useRef<number>(0)
  const touchMoveAccumulated = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  /**
   * タップジェスチャーを判定
   */
  const detectTap = useCallback(
    (distance: number, deltaTime: number): TouchGesture | null => {
      if (distance < 10 && deltaTime < 200) {
        const now = Date.now()
        if (now - lastTap.current < doubleTapDelay) {
          lastTap.current = 0
          return TouchGesture.DOUBLE_TAP
        }
        lastTap.current = now
        return TouchGesture.TAP
      }
      return null
    },
    [doubleTapDelay]
  )

  /**
   * スワイプジェスチャーを判定
   */
  const detectSwipe = useCallback(
    (
      deltaX: number,
      deltaY: number,
      distance: number,
      deltaTime: number
    ): TouchGesture | null => {
      const velocity = distance / deltaTime
      if (distance >= swipeThreshold && velocity >= swipeVelocity) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (absX > absY) {
          return deltaX > 0 ? TouchGesture.SWIPE_RIGHT : TouchGesture.SWIPE_LEFT
        } else if (deltaY > 0) {
          return TouchGesture.SWIPE_DOWN
        }
      }
      return null
    },
    [swipeThreshold, swipeVelocity]
  )

  /**
   * ジェスチャーを判定
   */
  const detectGesture = useCallback(
    (start: TouchPosition, end: TouchPosition): TouchGesture | null => {
      const deltaX = end.x - start.x
      const deltaY = end.y - start.y
      const deltaTime = end.timestamp - start.timestamp
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // タップ判定
      const tapGesture = detectTap(distance, deltaTime)
      if (tapGesture) return tapGesture

      // スワイプ判定
      return detectSwipe(deltaX, deltaY, distance, deltaTime)
    },
    [detectTap, detectSwipe]
  )

  /**
   * タッチ開始処理
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      }
      touchMoveAccumulated.current = { x: 0, y: 0 }
    }
  }, [])

  /**
   * 水平方向のスワイプ処理
   */
  const processHorizontalSwipe = useCallback(
    (deltaX: number, touch: Touch) => {
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight()
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft()
        }
        // 処理後はリセット
        touchStart.current = {
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
        }
      }
    },
    [handlers, swipeThreshold]
  )

  /**
   * 垂直方向のスワイプ処理
   */
  const processVerticalSwipe = useCallback(
    (deltaY: number, touch: Touch) => {
      if (deltaY > swipeThreshold && handlers.onSwipeDown) {
        handlers.onSwipeDown()
        touchStart.current = {
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
        }
      }
    },
    [handlers, swipeThreshold]
  )

  /**
   * タッチ移動処理（継続的な移動を追跡）
   */
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchStart.current && e.touches.length === 1) {
        const touch = e.touches[0]
        const deltaX = touch.clientX - touchStart.current.x
        const deltaY = touch.clientY - touchStart.current.y

        // 累積移動量を更新
        touchMoveAccumulated.current = { x: deltaX, y: deltaY }

        // 水平方向のスワイプ処理
        processHorizontalSwipe(deltaX, touch)

        // 垂直方向のスワイプ処理
        processVerticalSwipe(deltaY, touch)
      }
    },
    [processHorizontalSwipe, processVerticalSwipe]
  )

  /**
   * ジェスチャーハンドラーを実行
   */
  const executeGestureHandler = useCallback(
    (gesture: TouchGesture | null) => {
      if (!gesture) return

      const handlerMap = {
        [TouchGesture.SWIPE_LEFT]: handlers.onSwipeLeft,
        [TouchGesture.SWIPE_RIGHT]: handlers.onSwipeRight,
        [TouchGesture.SWIPE_DOWN]: handlers.onSwipeDown,
        [TouchGesture.TAP]: handlers.onTap,
        [TouchGesture.DOUBLE_TAP]: handlers.onDoubleTap,
      }

      handlerMap[gesture]?.()
    },
    [handlers]
  )

  /**
   * タッチ終了処理
   */
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStart.current && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0]
        const touchEnd: TouchPosition = {
          x: touch.clientX,
          y: touch.clientY,
          timestamp: Date.now(),
        }

        const gesture = detectGesture(touchStart.current, touchEnd)
        executeGestureHandler(gesture)

        touchStart.current = null
      }
    },
    [detectGesture, executeGestureHandler]
  )

  /**
   * タッチキャンセル処理
   */
  const handleTouchCancel = useCallback(() => {
    touchStart.current = null
    touchMoveAccumulated.current = { x: 0, y: 0 }
  }, [])

  /**
   * イベントリスナーの登録と解除
   */
  useEffect(() => {
    if (!enabled) return

    const target = element || document

    // パッシブリスナーオプション（スクロールパフォーマンス向上）
    const options = { passive: true }

    target.addEventListener(
      'touchstart',
      handleTouchStart as EventListener,
      options
    )
    target.addEventListener(
      'touchmove',
      handleTouchMove as EventListener,
      options
    )
    target.addEventListener(
      'touchend',
      handleTouchEnd as EventListener,
      options
    )
    target.addEventListener(
      'touchcancel',
      handleTouchCancel as EventListener,
      options
    )

    return () => {
      target.removeEventListener(
        'touchstart',
        handleTouchStart as EventListener
      )
      target.removeEventListener('touchmove', handleTouchMove as EventListener)
      target.removeEventListener('touchend', handleTouchEnd as EventListener)
      target.removeEventListener(
        'touchcancel',
        handleTouchCancel as EventListener
      )
    }
  }, [
    element,
    enabled,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  ])

  return {
    touchStart: touchStart.current,
    touchMoveAccumulated: touchMoveAccumulated.current,
  }
}
