import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAutoDrop } from './useAutoDrop'

// タイマー関数をモック
vi.useFakeTimers()

describe('useAutoDrop', () => {
  let mockOnDrop: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnDrop = vi.fn()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('自動落下システム', () => {
    it('有効時に指定間隔でコールバックが呼ばれる', () => {
      renderHook(() =>
        useAutoDrop({
          onDrop: mockOnDrop,
          interval: 1000,
          enabled: true,
        })
      )

      // 1秒後にコールバックが呼ばれる
      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).toHaveBeenCalledTimes(1)

      // さらに1秒後にもう一度呼ばれる
      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).toHaveBeenCalledTimes(2)
    })

    it('無効時はコールバックが呼ばれない', () => {
      renderHook(() =>
        useAutoDrop({
          onDrop: mockOnDrop,
          interval: 1000,
          enabled: false,
        })
      )

      vi.advanceTimersByTime(2000)
      expect(mockOnDrop).not.toHaveBeenCalled()
    })

    it('enabledがfalseからtrueに変わると自動落下が開始される', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useAutoDrop({
            onDrop: mockOnDrop,
            interval: 1000,
            enabled,
          }),
        { initialProps: { enabled: false } }
      )

      // 最初は呼ばれない
      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).not.toHaveBeenCalled()

      // enabledをtrueに変更
      rerender({ enabled: true })

      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).toHaveBeenCalledTimes(1)
    })

    it('enabledがtrueからfalseに変わると自動落下が停止される', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useAutoDrop({
            onDrop: mockOnDrop,
            interval: 1000,
            enabled,
          }),
        { initialProps: { enabled: true } }
      )

      // 最初は呼ばれる
      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).toHaveBeenCalledTimes(1)

      // enabledをfalseに変更
      rerender({ enabled: false })

      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).toHaveBeenCalledTimes(1) // 増加しない
    })

    it('アンマウント時にタイマーがクリアされる', () => {
      const { unmount } = renderHook(() =>
        useAutoDrop({
          onDrop: mockOnDrop,
          interval: 1000,
          enabled: true,
        })
      )

      unmount()

      // アンマウント後にタイマーが進んでもコールバックは呼ばれない
      vi.advanceTimersByTime(1000)
      expect(mockOnDrop).not.toHaveBeenCalled()
    })
  })
})
