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

  describe('自動落下システムの統合テスト', () => {
    it('ゲーム開始後に自動的にぷよが落下する', async () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      act(() => {
        fireEvent.click(startButton)
      })

      // 初期位置のぷよを確認（見える範囲はy=2から開始）
      let currentPuyo = screen.getByTestId('cell-2-2')
      expect(currentPuyo).toHaveClass('puyo')

      // 1秒経過
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // ぷよが下に移動したことを確認（y=3に移動）
      const droppedPuyo = screen.getByTestId('cell-2-3')
      expect(droppedPuyo).toHaveClass('puyo')

      // 元の位置にはぷよがないことを確認
      currentPuyo = screen.getByTestId('cell-2-2')
      expect(currentPuyo).not.toHaveClass('puyo')
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
        vi.advanceTimersByTime(15000) // 15秒で底まで落下（余裕をもって）
      })

      // 新しいぷよペアが上部に生成されていることを確認
      // 底まで落下後は自動的に新しいペアが生成される
      const cells = screen.getAllByTestId(/cell-\d+-\d+/)
      const puyoCells = cells.filter((cell) => cell.classList.contains('puyo'))
      expect(puyoCells.length).toBeGreaterThanOrEqual(2) // 最低でも新しいペア分（2個）はある

      // フィールド底部にぷよが固定されていることを確認（新しい表示範囲: y=15が底）
      const bottomPuyo = screen.getByTestId('cell-2-15')
      expect(bottomPuyo).toHaveClass('puyo')
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
      const droppedPuyo = screen.getByTestId('cell-2-4')
      expect(droppedPuyo).toHaveClass('puyo')
    })
  })
})
