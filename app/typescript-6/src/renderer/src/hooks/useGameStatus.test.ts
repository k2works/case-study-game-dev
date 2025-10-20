import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameStatus } from '@/hooks/useGameStatus'
import type { Game } from '@/game/Game'
import { PuyoType } from '@/game/Puyo'

describe('useGameStatus', () => {
  let mockGame: Game

  beforeEach(() => {
    // Game インスタンスのモック
    mockGame = {
      getScore: vi.fn(() => 1000),
      getChainCount: vi.fn(() => 5),
      getNextPuyoPair: vi.fn(() => ({
        mainType: PuyoType.Red,
        subType: PuyoType.Blue
      }))
    } as unknown as Game

    // タイマーをモック化
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('Game が null の場合、初期状態を返す', () => {
    const { result } = renderHook(() => useGameStatus(null))

    expect(result.current.score).toBe(0)
    expect(result.current.chainCount).toBe(0)
    expect(result.current.nextPuyoPair).toBe(null)
  })

  it('Game インスタンスから状態を取得する', () => {
    const { result } = renderHook(() => useGameStatus(mockGame))

    // 初期状態は 0/null
    expect(result.current.score).toBe(0)
    expect(result.current.chainCount).toBe(0)
    expect(result.current.nextPuyoPair).toBe(null)

    // タイマーを進める（100ms）
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // 状態が更新される
    expect(result.current.score).toBe(1000)
    expect(result.current.chainCount).toBe(5)
    expect(result.current.nextPuyoPair).toEqual({
      mainType: PuyoType.Red,
      subType: PuyoType.Blue
    })
  })

  it('カスタム interval で状態を更新する', () => {
    const { result } = renderHook(() => useGameStatus(mockGame, 200))

    // 100ms 経過（デフォルトの間隔）
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // まだ更新されていない
    expect(result.current.score).toBe(0)

    // さらに 100ms 経過（合計 200ms）
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // 状態が更新される
    expect(result.current.score).toBe(1000)
  })

  it('Game インスタンスが変更されたら状態を更新する', () => {
    const { result, rerender } = renderHook(({ game }) => useGameStatus(game), {
      initialProps: { game: mockGame }
    })

    // 初期状態を更新
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.score).toBe(1000)

    // 新しい Game インスタンスのモック
    const newMockGame = {
      getScore: vi.fn(() => 2000),
      getChainCount: vi.fn(() => 10),
      getNextPuyoPair: vi.fn(() => ({
        mainType: PuyoType.Green,
        subType: PuyoType.Yellow
      }))
    } as unknown as Game

    // Game インスタンスを変更
    rerender({ game: newMockGame })

    // タイマーを進める
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // 新しい状態が取得される
    expect(result.current.score).toBe(2000)
    expect(result.current.chainCount).toBe(10)
    expect(result.current.nextPuyoPair).toEqual({
      mainType: PuyoType.Green,
      subType: PuyoType.Yellow
    })
  })

  it('アンマウント時にタイマーがクリアされる', () => {
    const { unmount } = renderHook(() => useGameStatus(mockGame))

    // タイマーが設定されている
    expect(vi.getTimerCount()).toBe(1)

    // アンマウント
    unmount()

    // タイマーがクリアされている
    expect(vi.getTimerCount()).toBe(0)
  })

  it('Game が null になったらタイマーがクリアされる', () => {
    const { rerender } = renderHook(({ game }) => useGameStatus(game), {
      initialProps: { game: mockGame }
    })

    // タイマーが設定されている
    expect(vi.getTimerCount()).toBe(1)

    // Game を null に変更
    rerender({ game: null })

    // タイマーがクリアされている
    expect(vi.getTimerCount()).toBe(0)
  })

  it('定期的に状態が更新される', () => {
    let scoreValue = 0
    const dynamicMockGame = {
      getScore: vi.fn(() => scoreValue),
      getChainCount: vi.fn(() => 0),
      getNextPuyoPair: vi.fn(() => null)
    } as unknown as Game

    const { result } = renderHook(() => useGameStatus(dynamicMockGame))

    // 1回目の更新
    scoreValue = 100
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.score).toBe(100)

    // 2回目の更新
    scoreValue = 200
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.score).toBe(200)

    // 3回目の更新
    scoreValue = 300
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.score).toBe(300)
  })
})
