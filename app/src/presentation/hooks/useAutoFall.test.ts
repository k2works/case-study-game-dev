import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '@testing-library/react'

import type { GameStateViewModel } from '../../application/viewmodels/GameViewModel'
import {
  createTestGameViewModel,
  createTestPuyoPairViewModel,
} from '../../test/helpers/gameViewModelHelpers'
import { useAutoFall } from './useAutoFall'

// タイマーをモック化
vi.useFakeTimers()

describe('useAutoFall', () => {
  let mockUpdateGame: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockUpdateGame = vi.fn()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  describe('ゲーム状態によるタイマー制御', () => {
    it('ゲームがready状態の場合はタイマーが動作しない', () => {
      // Arrange
      const game = createTestGameViewModel() // ready状態

      // Act
      renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
          fallSpeed: 100,
        }),
      )

      // 100ms進める
      vi.advanceTimersByTime(100)

      // Assert
      expect(mockUpdateGame).not.toHaveBeenCalled()
    })

    it('ゲームがplaying状態でcurrentPuyoPairがnullの場合は新しいペアを生成', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
        currentPuyoPair: null,
      })

      // Act
      renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
        }),
      )

      // Assert - 初回レンダー時に新しいペア生成が呼ばれる
      expect(mockUpdateGame).toHaveBeenCalledTimes(1)
      const calledGame = mockUpdateGame.mock.calls[0][0]
      expect(calledGame.currentPuyoPair).not.toBeNull()
    })

    it('ゲームがpaused状態の場合はタイマーが停止する', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'paused' as GameStateViewModel,
        currentPuyoPair: createTestPuyoPairViewModel(),
      })

      // Act
      renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
          fallSpeed: 100,
        }),
      )

      // 100ms進める
      vi.advanceTimersByTime(100)

      // Assert
      expect(mockUpdateGame).not.toHaveBeenCalled()
    })
  })

  describe('自動落下ロジック', () => {
    it('playing状態でcurrentPuyoPairがある場合、指定間隔でupdateGameが呼ばれる', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
        currentPuyoPair: createTestPuyoPairViewModel(),
      })

      // Act
      renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
          fallSpeed: 200,
        }),
      )

      // 初回の新ペア生成をクリア
      mockUpdateGame.mockClear()

      // 200ms進める
      vi.advanceTimersByTime(200)

      // Assert
      expect(mockUpdateGame).toHaveBeenCalledTimes(1)
    })

    it('カスタムfallSpeedが正しく適用される', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
        currentPuyoPair: createTestPuyoPairViewModel(),
      })

      // Act
      renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
          fallSpeed: 500, // 500ms間隔
        }),
      )

      mockUpdateGame.mockClear()

      // 400ms進める（まだ呼ばれない）
      vi.advanceTimersByTime(400)
      expect(mockUpdateGame).not.toHaveBeenCalled()

      // さらに100ms進めて合計500ms
      vi.advanceTimersByTime(100)
      expect(mockUpdateGame).toHaveBeenCalledTimes(1)
    })

    it('デフォルトのfallSpeedは1000msである', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
        currentPuyoPair: createTestPuyoPairViewModel(),
      })

      // Act
      renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
          // fallSpeedを指定しない
        }),
      )

      mockUpdateGame.mockClear()

      // 999ms進める（まだ呼ばれない）
      vi.advanceTimersByTime(999)
      expect(mockUpdateGame).not.toHaveBeenCalled()

      // さらに1ms進めて合計1000ms
      vi.advanceTimersByTime(1)
      expect(mockUpdateGame).toHaveBeenCalledTimes(1)
    })
  })

  describe('クリーンアップ', () => {
    it('コンポーネントのアンマウント時にタイマーがクリアされる', () => {
      // Arrange
      const game = createTestGameViewModel({
        state: 'playing' as GameStateViewModel,
        currentPuyoPair: createTestPuyoPairViewModel(),
      })

      const { unmount } = renderHook(() =>
        useAutoFall({
          game,
          updateGame: mockUpdateGame,
          fallSpeed: 100,
        }),
      )

      // 初期状態での呼び出し回数を記録
      const callsBeforeUnmount = mockUpdateGame.mock.calls.length

      // Act
      unmount()

      // タイマーを進める
      vi.advanceTimersByTime(200)

      // Assert
      // アンマウント後は新しい呼び出しがないことを確認
      expect(mockUpdateGame.mock.calls.length).toBe(callsBeforeUnmount)
    })
  })
})
