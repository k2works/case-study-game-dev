import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('Game Integration', () => {
  describe('基本的なゲーム操作の統合テスト', () => {
    it('ゲーム開始後にキーボードでぷよを操作できる', async () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // Playing状態になることを確認
      expect(screen.getByText('Playing')).toBeInTheDocument()

      // 現在のぷよペアの位置を取得
      const currentPuyoMain = screen.getByTestId('cell-2-1')
      expect(currentPuyoMain).toHaveClass('puyo')

      // 左移動キーを押す
      fireEvent.keyDown(document, { key: 'ArrowLeft' })

      // ぷよが左に移動したことを確認
      const movedPuyoMain = screen.getByTestId('cell-1-1')
      expect(movedPuyoMain).toHaveClass('puyo')

      // mainの位置が移動したことを確認
      expect(movedPuyoMain).toHaveClass('puyo')
    })

    it('回転キーでぷよペアを回転できる', () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // Zキーで回転
      fireEvent.keyDown(document, { key: 'z' })

      // 回転後の位置にぷよがあることを確認（回転後はsub puyoが右に移動）
      const rotatedSubPuyo = screen.getByTestId('cell-3-1')
      expect(rotatedSubPuyo).toHaveClass('puyo')
    })

    it('下矢印キーで高速落下できる', () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // 下矢印キーを押す
      fireEvent.keyDown(document, { key: 'ArrowDown' })

      // ぷよが下に移動したことを確認
      const droppedPuyo = screen.getByTestId('cell-2-2')
      expect(droppedPuyo).toHaveClass('puyo')
    })

    it('スペースキーでハードドロップできる', () => {
      render(<App />)

      // ゲーム開始
      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // スペースキーでハードドロップ
      fireEvent.keyDown(document, { key: ' ' })

      // 新しいぷよペアが生成されていることを確認（前のぷよは底まで落ちて固定済み）
      // 新しいペアは初期位置(2,1)に生成される
      const newPuyoPair = screen.getByTestId('cell-2-1')
      expect(newPuyoPair).toHaveClass('puyo')

      // フィールド底部に前のぷよが固定されていることを確認
      // 底は11行目なので、main puyoは(2,11)、sub puyoは(2,10)に固定される
      const fixedMainPuyo = screen.getByTestId('cell-2-11')
      expect(fixedMainPuyo).toHaveClass('puyo')

      const fixedSubPuyo = screen.getByTestId('cell-2-10')
      expect(fixedSubPuyo).toHaveClass('puyo')
    })
  })

  describe('操作方法の表示', () => {
    it('キーボード操作の説明が表示される', () => {
      render(<App />)

      expect(screen.getByText('操作方法')).toBeInTheDocument()
      expect(screen.getByText('←→: 移動')).toBeInTheDocument()
      expect(screen.getByText('↑/Z: 回転')).toBeInTheDocument()
      expect(screen.getByText('↓: 高速落下')).toBeInTheDocument()
      expect(screen.getByText('スペース: ハードドロップ')).toBeInTheDocument()
    })
  })

  describe('NEXTぷよ機能の統合テスト', () => {
    it('ゲーム開始後にNEXTぷよが表示される', () => {
      render(<App />)

      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // NEXTぷよエリアが表示される
      expect(screen.getByTestId('next-puyo-area')).toBeInTheDocument()
      expect(screen.getByText('NEXT')).toBeInTheDocument()

      // NEXTぷよのメインとサブが表示される
      expect(screen.getByTestId('next-main-puyo')).toBeInTheDocument()
      expect(screen.getByTestId('next-sub-puyo')).toBeInTheDocument()

      // 色クラスが設定されている
      const nextMainPuyo = screen.getByTestId('next-main-puyo')
      const nextSubPuyo = screen.getByTestId('next-sub-puyo')
      expect(nextMainPuyo).toHaveClass('puyo')
      expect(nextSubPuyo).toHaveClass('puyo')
    })

    it('ハードドロップ後にNEXTぷよが現在のぷよペアになる', () => {
      render(<App />)

      const startButton = screen.getByText('ゲーム開始')
      fireEvent.click(startButton)

      // NEXTぷよの色を記録
      const nextMainElement = screen.getByTestId('next-main-puyo')
      const nextSubElement = screen.getByTestId('next-sub-puyo')

      const nextMainColor = Array.from(nextMainElement.classList).find((cls) =>
        ['red', 'blue', 'green', 'yellow'].includes(cls)
      )
      const nextSubColor = Array.from(nextSubElement.classList).find((cls) =>
        ['red', 'blue', 'green', 'yellow'].includes(cls)
      )

      // ハードドロップを実行
      fireEvent.keyDown(document, { key: ' ' })

      // 新しい現在のぷよペアの色を確認
      const currentMainElement = screen.getByTestId('cell-2-1')
      const currentSubElement = screen.getByTestId('cell-2-0')

      // 元のNEXTぷよの色と一致することを確認
      expect(currentMainElement).toHaveClass(nextMainColor!)
      expect(currentSubElement).toHaveClass(nextSubColor!)

      // 新しいNEXTぷよが生成されていることを確認
      expect(screen.getByTestId('next-puyo-area')).toBeInTheDocument()
      expect(screen.getByTestId('next-main-puyo')).toBeInTheDocument()
      expect(screen.getByTestId('next-sub-puyo')).toBeInTheDocument()
    })
  })
})
