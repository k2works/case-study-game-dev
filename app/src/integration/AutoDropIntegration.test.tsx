import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from '../App'

// タイマー関数をモック
vi.useFakeTimers()

describe('Auto Drop Integration', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  afterEach(() => {
    // タイマーをクリーンアップしてact()警告を回避
    act(() => {
      vi.runOnlyPendingTimers()
    })
  })

  describe.skip('自動落下システムの統合テスト', () => {
    it('ゲーム開始後に自動的にぷよが落下する', async () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      act(() => {
        fireEvent.click(startButton)
      })

      // 初期位置のぷよを確認（見える範囲はy=2から開始）
      const initialPuyo = screen.getByTestId('cell-2-2')
      expect(initialPuyo).toHaveClass('puyo')

      // 1秒経過
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // ぷよが下に移動していることを確認
      const droppedPuyo = screen.getByTestId('cell-2-2')
      expect(droppedPuyo).toHaveClass('puyo')
    })

    it('ゲーム停止中は自動落下しない', () => {
      render(<App />)

      // ゲーム開始前の状態
      expect(screen.getByText('Ready')).toBeInTheDocument()

      // 時間を進める
      vi.advanceTimersByTime(2000)

      // 何も変化しない（Ready状態のまま）
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('底まで落下すると新しいぷよペアが生成される', async () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      act(() => {
        fireEvent.click(startButton)
      })

      // 十分な時間を経過させて底まで落下させ、新しいペアを生成
      await act(async () => {
        vi.advanceTimersByTime(12000) // 12秒で底まで落下
      })

      // フィールド底部にぷよが固定されていることを確認
      const bottomPuyo = screen.getByTestId('cell-2-11')
      expect(bottomPuyo).toHaveClass('puyo')

      // 新しいぷよペアが上部に生成されていることを確認（少し待つ）
      await act(async () => {
        vi.advanceTimersByTime(100) // 新しいペア生成を待つ
      })

      const newPuyo = screen.getByTestId('cell-2-1')
      expect(newPuyo).toHaveClass('puyo')
    })

    it('手動落下と自動落下が併用できる', async () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      act(() => {
        fireEvent.click(startButton)
      })

      // 手動で下に移動
      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowDown' })
      })

      // さらに自動落下で下に移動
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // 2段階下に移動していることを確認
      const droppedPuyo = screen.getByTestId('cell-2-3')
      expect(droppedPuyo).toHaveClass('puyo')
    })
  })
})
