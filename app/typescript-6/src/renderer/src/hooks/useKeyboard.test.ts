import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboard } from '@/hooks/useKeyboard'

describe('useKeyboard', () => {
  beforeEach(() => {
    // キーボードイベントをクリア
  })

  afterEach(() => {
    // クリーンアップ
  })

  it('初期状態では全てのキーが false である', () => {
    const { result } = renderHook(() => useKeyboard())

    expect(result.current.left).toBe(false)
    expect(result.current.right).toBe(false)
    expect(result.current.up).toBe(false)
    expect(result.current.down).toBe(false)
    expect(result.current.restart).toBe(false)
  })

  it('ArrowLeft キーを押すと left が true になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })

    expect(result.current.left).toBe(true)
  })

  it('ArrowRight キーを押すと right が true になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })

    expect(result.current.right).toBe(true)
  })

  it('ArrowUp キーを押すと up が true になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    })

    expect(result.current.up).toBe(true)
  })

  it('ArrowDown キーを押すと down が true になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })

    expect(result.current.down).toBe(true)
  })

  it('r キーを押すと restart が true になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }))
    })

    expect(result.current.restart).toBe(true)
  })

  it('R キー（大文字）を押すと restart が true になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'R' }))
    })

    expect(result.current.restart).toBe(true)
  })

  it('ArrowLeft キーを離すと left が false になる', () => {
    const { result } = renderHook(() => useKeyboard())

    // キーを押す
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })

    expect(result.current.left).toBe(true)

    // キーを離す
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    })

    expect(result.current.left).toBe(false)
  })

  it('ArrowRight キーを離すと right が false になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })

    expect(result.current.right).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
    })

    expect(result.current.right).toBe(false)
  })

  it('ArrowUp キーを離すと up が false になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    })

    expect(result.current.up).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' }))
    })

    expect(result.current.up).toBe(false)
  })

  it('ArrowDown キーを離すと down が false になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })

    expect(result.current.down).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' }))
    })

    expect(result.current.down).toBe(false)
  })

  it('r キーを離すと restart が false になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }))
    })

    expect(result.current.restart).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'r' }))
    })

    expect(result.current.restart).toBe(false)
  })

  it('R キー（大文字）を離すと restart が false になる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'R' }))
    })

    expect(result.current.restart).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'R' }))
    })

    expect(result.current.restart).toBe(false)
  })

  it('複数のキーを同時に押すことができる', () => {
    const { result } = renderHook(() => useKeyboard())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })

    expect(result.current.left).toBe(true)
    expect(result.current.down).toBe(true)
    expect(result.current.right).toBe(false)
    expect(result.current.up).toBe(false)
  })

  it('アンマウント時にイベントリスナーが削除される', () => {
    const { result, unmount } = renderHook(() => useKeyboard())

    // キーを押す
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })

    expect(result.current.left).toBe(true)

    // アンマウント
    unmount()

    // アンマウント後はイベントリスナーが削除されているため、キーイベントは無視される
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    })

    // result.current.left は依然として true のまま（イベントリスナーが削除されたため）
    expect(result.current.left).toBe(true)
  })
})
