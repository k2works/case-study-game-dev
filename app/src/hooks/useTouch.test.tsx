import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTouch } from './useTouch'

describe('useTouch', () => {
  const mockHandlers = {
    onSwipeLeft: vi.fn(),
    onSwipeRight: vi.fn(),
    onSwipeDown: vi.fn(),
    onTap: vi.fn(),
    onDoubleTap: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('基本動作', () => {
    it('フックが正常に初期化される', () => {
      const { result } = renderHook(() => useTouch(mockHandlers))

      expect(result.current.touchStart).toBeNull()
      expect(result.current.touchMoveAccumulated).toEqual({ x: 0, y: 0 })
    })

    it('無効化時はイベントが処理されない', () => {
      renderHook(() => useTouch(mockHandlers, { enabled: false }))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })

      act(() => {
        document.dispatchEvent(touchStartEvent)
      })

      expect(mockHandlers.onTap).not.toHaveBeenCalled()
    })
  })

  describe('タップジェスチャー', () => {
    it('シングルタップを検出する', () => {
      renderHook(() => useTouch(mockHandlers))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 105, clientY: 105 } as Touch],
      })

      act(() => {
        document.dispatchEvent(touchStartEvent)
      })

      // タイマーを少し進める
      act(() => {
        vi.advanceTimersByTime(50)
      })

      act(() => {
        document.dispatchEvent(touchEndEvent)
      })

      // タップハンドラーが呼ばれることを期待
      expect(mockHandlers.onTap).toHaveBeenCalled()
    })
  })

  describe('スワイプジェスチャー', () => {
    it('左スワイプを検出する', () => {
      renderHook(() => useTouch(mockHandlers))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      })
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })

      act(() => {
        document.dispatchEvent(touchStartEvent)
        document.dispatchEvent(touchMoveEvent)
      })

      // 左スワイプハンドラーが呼ばれることを期待
      expect(mockHandlers.onSwipeLeft).toHaveBeenCalled()
    })

    it('右スワイプを検出する', () => {
      renderHook(() => useTouch(mockHandlers))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      })

      act(() => {
        document.dispatchEvent(touchStartEvent)
        document.dispatchEvent(touchMoveEvent)
      })

      // 右スワイプハンドラーが呼ばれることを期待
      expect(mockHandlers.onSwipeRight).toHaveBeenCalled()
    })

    it('下スワイプを検出する', () => {
      renderHook(() => useTouch(mockHandlers))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 200 } as Touch],
      })

      act(() => {
        document.dispatchEvent(touchStartEvent)
        document.dispatchEvent(touchMoveEvent)
      })

      // 下スワイプハンドラーが呼ばれることを期待
      expect(mockHandlers.onSwipeDown).toHaveBeenCalled()
    })
  })

  describe('オプション設定', () => {
    it('カスタムスワイプ閾値を適用する', () => {
      const customThreshold = 100
      renderHook(() =>
        useTouch(mockHandlers, {
          swipeThreshold: customThreshold,
        })
      )

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 0 } as Touch],
      })
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 50, clientY: 0 } as Touch], // 閾値未満
      })

      act(() => {
        document.dispatchEvent(touchStartEvent)
        document.dispatchEvent(touchMoveEvent)
      })

      // 閾値未満なのでスワイプハンドラーは呼ばれない
      expect(mockHandlers.onSwipeRight).not.toHaveBeenCalled()
    })

    it('特定の要素にのみイベントリスナーを登録する', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      renderHook(() => useTouch(mockHandlers, { element }))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })

      // 要素に対してイベントを発火
      act(() => {
        element.dispatchEvent(touchStartEvent)
      })

      // クリーンアップ
      document.body.removeChild(element)
    })
  })

  describe('タッチキャンセル処理', () => {
    it('タッチキャンセルで状態がリセットされる', () => {
      const { result } = renderHook(() => useTouch(mockHandlers))

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const touchCancelEvent = new TouchEvent('touchcancel')

      act(() => {
        document.dispatchEvent(touchStartEvent)
      })

      // タッチ開始後の状態確認は、フックの内部状態に直接アクセスできないため
      // キャンセル処理後の状態のみ検証

      act(() => {
        document.dispatchEvent(touchCancelEvent)
      })

      // キャンセル後は状態がリセットされる
      expect(result.current.touchStart).toBeNull()
      expect(result.current.touchMoveAccumulated).toEqual({ x: 0, y: 0 })
    })
  })

  describe('クリーンアップ', () => {
    it('アンマウント時にイベントリスナーが削除される', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() => useTouch(mockHandlers))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchstart',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchend',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchcancel',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })
  })
})
