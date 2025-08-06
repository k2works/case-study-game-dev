/**
 * React Hooksテストテンプレート
 *
 * 使い方:
 * 1. このファイルをコピーして新しいHooksのテストファイルを作成
 * 2. [useHookName]を実際のHook名に置換
 * 3. 必要に応じてテストケースを追加・修正
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
// import { [useHookName] } from './[useHookName]'

describe('[useHookName]', () => {
  beforeEach(() => {
    // モックのセットアップ
    vi.clearAllMocks()
  })

  afterEach(() => {
    // クリーンアップ
  })

  describe('初期状態', () => {
    it('初期値が正しく設定される', () => {
      // Arrange & Act
      const { result } = renderHook(() => {
        // return [useHookName]()
      })

      // Assert
      // expect(result.current.value).toBe(initialValue)
      // expect(result.current.loading).toBe(false)
      // expect(result.current.error).toBeNull()
    })

    it('引数付きで初期化できる', () => {
      // Arrange
      const initialConfig = { option: 'value' }

      // Act
      const { result } = renderHook(() => {
        // return [useHookName](initialConfig)
      })

      // Assert
      // expect(result.current.config).toEqual(initialConfig)
    })
  })

  describe('状態更新', () => {
    it('値を更新できる', () => {
      // Arrange
      const { result } = renderHook(() => {
        // return [useHookName]()
      })

      // Act
      act(() => {
        // result.current.setValue('new value')
      })

      // Assert
      // expect(result.current.value).toBe('new value')
    })

    it('複数の状態を同時に更新できる', () => {
      // Arrange
      const { result } = renderHook(() => {
        // return [useHookName]()
      })

      // Act
      act(() => {
        // result.current.updateMultiple({ a: 1, b: 2 })
      })

      // Assert
      // expect(result.current.a).toBe(1)
      // expect(result.current.b).toBe(2)
    })
  })

  describe('副作用', () => {
    it('マウント時に副作用が実行される', () => {
      // Arrange
      const onMount = vi.fn()

      // Act
      renderHook(() => {
        // return [useHookName]({ onMount })
      })

      // Assert
      // expect(onMount).toHaveBeenCalledTimes(1)
    })

    it('依存配列の変更で副作用が再実行される', () => {
      // Arrange
      const sideEffect = vi.fn()
      const { rerender } = renderHook(
        ({ dependency }) => {
          // return [useHookName](dependency, sideEffect)
        },
        { initialProps: { dependency: 'initial' } }
      )

      // Assert - 初回実行
      // expect(sideEffect).toHaveBeenCalledTimes(1)

      // Act - 依存値を変更
      rerender({ dependency: 'updated' })

      // Assert - 再実行
      // expect(sideEffect).toHaveBeenCalledTimes(2)
    })

    it('アンマウント時にクリーンアップが実行される', () => {
      // Arrange
      const cleanup = vi.fn()
      const { unmount } = renderHook(() => {
        // return [useHookName]({ cleanup })
      })

      // Act
      unmount()

      // Assert
      // expect(cleanup).toHaveBeenCalled()
    })
  })

  describe('非同期処理', () => {
    it('非同期データの取得が正しく処理される', async () => {
      // Arrange
      const mockFetch = vi.fn().mockResolvedValue({ data: 'test' })
      const { result } = renderHook(() => {
        // return [useHookName]({ fetcher: mockFetch })
      })

      // Assert - ローディング中
      // expect(result.current.loading).toBe(true)

      // Act & Assert - データ取得完了
      await waitFor(() => {
        // expect(result.current.loading).toBe(false)
        // expect(result.current.data).toEqual({ data: 'test' })
      })
    })

    it('エラーが適切にハンドリングされる', async () => {
      // Arrange
      const mockFetch = vi.fn().mockRejectedValue(new Error('Failed'))
      const { result } = renderHook(() => {
        // return [useHookName]({ fetcher: mockFetch })
      })

      // Act & Assert
      await waitFor(() => {
        // expect(result.current.loading).toBe(false)
        // expect(result.current.error).toEqual(new Error('Failed'))
      })
    })
  })

  describe('タイマー処理', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('インターバルが正しく設定される', () => {
      // Arrange
      const callback = vi.fn()
      renderHook(() => {
        // return [useHookName]({ interval: 1000, callback })
      })

      // Act - 時間を進める
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      // Assert
      // expect(callback).toHaveBeenCalledTimes(3)
    })

    it('デバウンスが正しく動作する', () => {
      // Arrange
      const { result } = renderHook(() => {
        // return [useHookName]({ debounce: 300 })
      })

      // Act - 連続して呼び出し
      act(() => {
        // result.current.debouncedFn('a')
        // result.current.debouncedFn('b')
        // result.current.debouncedFn('c')
      })

      // 時間を進める
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Assert - 最後の呼び出しのみ実行
      // expect(result.current.value).toBe('c')
    })
  })

  describe('カスタムロジック', () => {
    it('計算結果が正しくメモ化される', () => {
      // Arrange
      const expensiveComputation = vi.fn((n: number) => n * 2)
      const { result, rerender } = renderHook(
        ({ input }) => {
          // return [useHookName]({ input, compute: expensiveComputation })
        },
        { initialProps: { input: 5 } }
      )

      // Assert - 初回計算
      // expect(result.current.computed).toBe(10)
      // expect(expensiveComputation).toHaveBeenCalledTimes(1)

      // Act - 同じ入力で再レンダリング
      rerender({ input: 5 })

      // Assert - 再計算されない
      // expect(expensiveComputation).toHaveBeenCalledTimes(1)

      // Act - 異なる入力
      rerender({ input: 7 })

      // Assert - 再計算される
      // expect(result.current.computed).toBe(14)
      // expect(expensiveComputation).toHaveBeenCalledTimes(2)
    })

    it('条件付きロジックが正しく動作する', () => {
      // Arrange
      const { result } = renderHook(() => {
        // return [useHookName]()
      })

      // Act & Assert - 条件1
      act(() => {
        // result.current.setCondition('A')
      })
      // expect(result.current.output).toBe('Result A')

      // Act & Assert - 条件2
      act(() => {
        // result.current.setCondition('B')
      })
      // expect(result.current.output).toBe('Result B')
    })
  })
})
