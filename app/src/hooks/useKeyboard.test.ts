import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboard } from './useKeyboard'

describe('useKeyboard', () => {
  let mockHandlers: {
    onMoveLeft: ReturnType<typeof vi.fn>
    onMoveRight: ReturnType<typeof vi.fn>
    onRotate: ReturnType<typeof vi.fn>
    onDrop: ReturnType<typeof vi.fn>
    onHardDrop: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockHandlers = {
      onMoveLeft: vi.fn(),
      onMoveRight: vi.fn(),
      onRotate: vi.fn(),
      onDrop: vi.fn(),
      onHardDrop: vi.fn(),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('キーボードイベントの処理', () => {
    it('左矢印キーで左移動ハンドラーが呼ばれる', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(event)

      expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(1)
    })

    it('右矢印キーで右移動ハンドラーが呼ばれる', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)

      expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(1)
    })

    it('上矢印キーで回転ハンドラーが呼ばれる', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1)
    })

    it('Zキーで回転ハンドラーが呼ばれる', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: 'z' })
      document.dispatchEvent(event)

      expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1)
    })

    it('下矢印キーで落下ハンドラーが呼ばれる', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(mockHandlers.onDrop).toHaveBeenCalledTimes(1)
    })

    it('スペースキーでハードドロップハンドラーが呼ばれる', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: ' ' })
      document.dispatchEvent(event)

      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1)
    })

    it('未定義のキーでは何も呼ばれない', () => {
      renderHook(() => useKeyboard(mockHandlers))

      const event = new KeyboardEvent('keydown', { key: 'a' })
      document.dispatchEvent(event)

      expect(mockHandlers.onMoveLeft).not.toHaveBeenCalled()
      expect(mockHandlers.onMoveRight).not.toHaveBeenCalled()
      expect(mockHandlers.onRotate).not.toHaveBeenCalled()
      expect(mockHandlers.onDrop).not.toHaveBeenCalled()
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled()
    })
  })
})
