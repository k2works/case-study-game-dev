import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@testing-library/react'

import { useKeyboard } from './useKeyboard'

// キーボードイベントをモック
const createKeyboardEvent = (
  key: string,
  type: 'keydown' | 'keyup' = 'keydown',
) => {
  return new KeyboardEvent(type, { key })
}

describe('useKeyboardフック', () => {
  beforeEach(() => {
    // イベントリスナーをクリア
    vi.clearAllMocks()
  })

  afterEach(() => {
    // テスト後のクリーンアップ
    document.removeEventListener('keydown', vi.fn())
    document.removeEventListener('keyup', vi.fn())
  })

  describe('基本的なキー入力検知', () => {
    it('左矢印キーの押下を検知する', () => {
      // Arrange
      let triggeredAction = ''
      const handleLeft = vi.fn(() => {
        triggeredAction = 'left'
      })

      renderHook(() =>
        useKeyboard({
          onLeft: handleLeft,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent('ArrowLeft')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handleLeft).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('left')
    })

    it('右矢印キーの押下を検知する', () => {
      // Arrange
      let triggeredAction = ''
      const handleRight = vi.fn(() => {
        triggeredAction = 'right'
      })

      renderHook(() =>
        useKeyboard({
          onRight: handleRight,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent('ArrowRight')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handleRight).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('right')
    })

    it('下矢印キーの押下を検知する', () => {
      // Arrange
      let triggeredAction = ''
      const handleDown = vi.fn(() => {
        triggeredAction = 'down'
      })

      renderHook(() =>
        useKeyboard({
          onDown: handleDown,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent('ArrowDown')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handleDown).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('down')
    })

    it('上矢印キーの押下を検知する（回転用）', () => {
      // Arrange
      let triggeredAction = ''
      const handleRotate = vi.fn(() => {
        triggeredAction = 'rotate'
      })

      renderHook(() =>
        useKeyboard({
          onRotate: handleRotate,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent('ArrowUp')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handleRotate).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('rotate')
    })
  })

  describe('スペースキーによる代替操作', () => {
    it('スペースキーで回転を検知する', () => {
      // Arrange
      let triggeredAction = ''
      const handleRotate = vi.fn(() => {
        triggeredAction = 'rotate'
      })

      renderHook(() =>
        useKeyboard({
          onRotate: handleRotate,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent(' ')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handleRotate).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('rotate')
    })
  })

  describe('ゲーム制御キー', () => {
    it('Pキーでポーズを検知する', () => {
      // Arrange
      let triggeredAction = ''
      const handlePause = vi.fn(() => {
        triggeredAction = 'pause'
      })

      renderHook(() =>
        useKeyboard({
          onPause: handlePause,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent('p')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handlePause).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('pause')
    })

    it('Rキーでリセットを検知する', () => {
      // Arrange
      let triggeredAction = ''
      const handleReset = vi.fn(() => {
        triggeredAction = 'reset'
      })

      renderHook(() =>
        useKeyboard({
          onReset: handleReset,
        }),
      )

      // Act
      act(() => {
        const event = createKeyboardEvent('r')
        document.dispatchEvent(event)
      })

      // Assert
      expect(handleReset).toHaveBeenCalledOnce()
      expect(triggeredAction).toBe('reset')
    })
  })

  describe('複数のハンドラー設定', () => {
    it('複数のキーハンドラーが正しく動作する', () => {
      // Arrange
      const handleLeft = vi.fn()
      const handleRight = vi.fn()
      const handleDown = vi.fn()
      const handleRotate = vi.fn()

      renderHook(() =>
        useKeyboard({
          onLeft: handleLeft,
          onRight: handleRight,
          onDown: handleDown,
          onRotate: handleRotate,
        }),
      )

      // Act
      act(() => {
        document.dispatchEvent(createKeyboardEvent('ArrowLeft'))
        document.dispatchEvent(createKeyboardEvent('ArrowRight'))
        document.dispatchEvent(createKeyboardEvent('ArrowDown'))
        document.dispatchEvent(createKeyboardEvent('ArrowUp'))
      })

      // Assert
      expect(handleLeft).toHaveBeenCalledOnce()
      expect(handleRight).toHaveBeenCalledOnce()
      expect(handleDown).toHaveBeenCalledOnce()
      expect(handleRotate).toHaveBeenCalledOnce()
    })
  })

  describe('無効なキー入力', () => {
    it('定義されていないキーは無視される', () => {
      // Arrange
      const handleLeft = vi.fn()

      renderHook(() =>
        useKeyboard({
          onLeft: handleLeft,
        }),
      )

      // Act
      act(() => {
        document.dispatchEvent(createKeyboardEvent('x'))
        document.dispatchEvent(createKeyboardEvent('Enter'))
        document.dispatchEvent(createKeyboardEvent('Escape'))
      })

      // Assert
      expect(handleLeft).not.toHaveBeenCalled()
    })
  })

  describe('フック解除時のクリーンアップ', () => {
    it('コンポーネントアンマウント時にイベントリスナーが削除される', () => {
      // Arrange
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      const handleLeft = vi.fn()

      const { unmount } = renderHook(() =>
        useKeyboard({
          onLeft: handleLeft,
        }),
      )

      // Act
      unmount()

      // Assert
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      )
    })
  })
})
