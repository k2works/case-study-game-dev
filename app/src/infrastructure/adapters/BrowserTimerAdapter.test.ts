import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BrowserTimerAdapter } from './BrowserTimerAdapter'

describe('BrowserTimerAdapter', () => {
  let adapter: BrowserTimerAdapter

  beforeEach(() => {
    adapter = new BrowserTimerAdapter()
    vi.useFakeTimers()
  })

  afterEach(() => {
    adapter.stopAllTimers()
    vi.useRealTimers()
  })

  describe('startInterval', () => {
    it('インターバルタイマーを開始できる', () => {
      const callback = vi.fn()
      const timerId = adapter.startInterval(callback, 100)

      expect(timerId).toMatch(/^timer-\d+$/)
      expect(adapter.getActiveTimerCount()).toBe(1)
    })

    it('指定した間隔でコールバックが実行される', () => {
      const callback = vi.fn()
      adapter.startInterval(callback, 100)

      vi.advanceTimersByTime(300)
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('immediateオプションで即座にコールバックが実行される', () => {
      const callback = vi.fn()
      adapter.startInterval(callback, 100, { immediate: true })

      expect(callback).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('maxExecutionsオプションで実行回数を制限できる', () => {
      const callback = vi.fn()
      adapter.startInterval(callback, 100, { maxExecutions: 2 })

      vi.advanceTimersByTime(300)
      expect(callback).toHaveBeenCalledTimes(2)
      expect(adapter.getActiveTimerCount()).toBe(0)
    })
  })

  describe('startTimeout', () => {
    it('タイムアウトタイマーを開始できる', () => {
      const callback = vi.fn()
      const timerId = adapter.startTimeout(callback, 100)

      expect(timerId).toMatch(/^timer-\d+$/)
      expect(adapter.getActiveTimerCount()).toBe(1)
    })

    it('指定した遅延後にコールバックが1回だけ実行される', () => {
      const callback = vi.fn()
      adapter.startTimeout(callback, 100)

      vi.advanceTimersByTime(50)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(callback).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(adapter.getActiveTimerCount()).toBe(0)
    })
  })

  describe('stopTimer', () => {
    it('指定したタイマーを停止できる', () => {
      const callback = vi.fn()
      const timerId = adapter.startInterval(callback, 100)

      adapter.stopTimer(timerId)
      expect(adapter.getActiveTimerCount()).toBe(0)

      vi.advanceTimersByTime(200)
      expect(callback).not.toHaveBeenCalled()
    })

    it('存在しないタイマーIDを指定してもエラーにならない', () => {
      expect(() => adapter.stopTimer('nonexistent')).not.toThrow()
    })
  })

  describe('stopAllTimers', () => {
    it('すべてのアクティブタイマーを停止できる', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      adapter.startInterval(callback1, 100)
      adapter.startTimeout(callback2, 200)

      expect(adapter.getActiveTimerCount()).toBe(2)

      adapter.stopAllTimers()
      expect(adapter.getActiveTimerCount()).toBe(0)

      vi.advanceTimersByTime(300)
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('getCurrentTime', () => {
    it('現在の時刻を取得できる', () => {
      vi.useRealTimers() // 実際の時間を使用
      const time = adapter.getCurrentTime()
      expect(typeof time).toBe('number')
      expect(time).toBeGreaterThan(0)
      vi.useFakeTimers() // フェイクタイマーに戻す
    })
  })

  describe('isHighResolutionAvailable', () => {
    it('高解像度タイマーの利用可能性を判定できる', () => {
      const available = adapter.isHighResolutionAvailable()
      expect(typeof available).toBe('boolean')
    })
  })

  describe('getActiveTimerCount', () => {
    it('アクティブなタイマー数を正しく返す', () => {
      expect(adapter.getActiveTimerCount()).toBe(0)

      adapter.startInterval(() => {}, 100)
      expect(adapter.getActiveTimerCount()).toBe(1)

      adapter.startTimeout(() => {}, 100)
      expect(adapter.getActiveTimerCount()).toBe(2)

      adapter.stopAllTimers()
      expect(adapter.getActiveTimerCount()).toBe(0)
    })
  })

  describe('getTimerStats', () => {
    it('タイマーの統計情報を取得できる', () => {
      const callback = vi.fn()
      const timerId = adapter.startInterval(callback, 100)

      vi.advanceTimersByTime(250)

      const stats = adapter.getTimerStats(timerId)
      expect(stats).toEqual({
        type: 'interval',
        executionCount: 2,
        createdAt: expect.any(Number),
        elapsedTime: expect.any(Number),
        maxExecutions: undefined,
        isActive: true,
      })
    })

    it('存在しないタイマーの統計情報はnullを返す', () => {
      const stats = adapter.getTimerStats('nonexistent')
      expect(stats).toBeNull()
    })

    it('maxExecutionsが設定されたタイマーの統計情報', () => {
      const callback = vi.fn()
      const timerId = adapter.startInterval(callback, 100, { maxExecutions: 3 })

      const stats = adapter.getTimerStats(timerId)
      expect(stats?.maxExecutions).toBe(3)
    })
  })

  describe('コールバックエラー処理', () => {
    it('コールバックでエラーが発生してもタイマーは継続する', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const errorCallback = vi.fn(() => {
        throw new Error('Test error')
      })

      adapter.startInterval(errorCallback, 100)

      vi.advanceTimersByTime(300)

      expect(errorCallback).toHaveBeenCalledTimes(3)
      expect(consoleError).toHaveBeenCalledTimes(3)
      expect(adapter.getActiveTimerCount()).toBe(1)

      consoleError.mockRestore()
    })
  })

  describe('タイマーID生成', () => {
    it('一意のタイマーIDが生成される', () => {
      const id1 = adapter.startTimeout(() => {}, 100)
      const id2 = adapter.startTimeout(() => {}, 100)
      const id3 = adapter.startInterval(() => {}, 100)

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(id1).not.toBe(id3)
    })
  })
})
