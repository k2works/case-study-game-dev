import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import App from '../App'

// キーボードイベントのヘルパー関数
const pressKey = (key: string) => {
  fireEvent.keyDown(document, { key })
}

describe('ゲーム統合テスト', () => {
  beforeEach(() => {
    // 各テスト前にコンソールログをクリア
    vi.clearAllMocks()
  })

  describe('アプリケーション起動テスト', () => {
    it('アプリケーションが正常に起動する', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByText('ぷよぷよ')).toBeInTheDocument()
      expect(screen.getByText('AI対戦ぷよぷよゲーム')).toBeInTheDocument()
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-info')).toBeInTheDocument()
    })

    it('初期状態で準備中が表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByText('準備中')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // スコア
      expect(screen.getByText('1')).toBeInTheDocument() // レベル
    })

    it('キーボード操作説明が表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByText('キーボード操作')).toBeInTheDocument()
      expect(screen.getByText('←→: 左右移動')).toBeInTheDocument()
      expect(screen.getByText('↓: 高速落下')).toBeInTheDocument()
      expect(screen.getByText('↑/Space: 回転')).toBeInTheDocument()
      expect(screen.getByText('P: ポーズ/再開')).toBeInTheDocument()
      expect(screen.getByText('R: リセット')).toBeInTheDocument()
    })
  })

  describe('ゲームフィールド表示テスト', () => {
    it('6×12のフィールドが正しく表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      const gameField = screen.getByTestId('game-field')
      expect(gameField).toBeInTheDocument()

      // 全セルの存在確認（サンプル）
      expect(screen.getByTestId('cell-0-0')).toBeInTheDocument()
      expect(screen.getByTestId('cell-5-0')).toBeInTheDocument()
      expect(screen.getByTestId('cell-0-11')).toBeInTheDocument()
      expect(screen.getByTestId('cell-5-11')).toBeInTheDocument()
    })

    it('空のセルが適切なクラスを持つ', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      const emptyCell = screen.getByTestId('cell-2-5')
      expect(emptyCell).toHaveClass('cell-empty')
      expect(emptyCell).toHaveClass('bg-gray-800/50')
    })
  })

  describe('ゲーム状態管理テスト', () => {
    it('ゲーム情報が正しく表示される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByTestId('score-display')).toBeInTheDocument()
      expect(screen.getByTestId('level-display')).toBeInTheDocument()
      expect(screen.getByTestId('state-display')).toBeInTheDocument()
    })

    it('初期スコアとレベルが正しい', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByTestId('score-value')).toHaveTextContent('0')
      expect(screen.getByTestId('level-value')).toHaveTextContent('1')
    })

    it('初期状態はready状態', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      const stateValue = screen.getByTestId('state-value')
      expect(stateValue).toHaveTextContent('準備中')
      expect(stateValue).toHaveClass('state-ready')
    })
  })

  describe('キーボード操作統合テスト', () => {
    it('ready状態でのキー入力は無視される', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act
      act(() => {
        pressKey('ArrowLeft')
        pressKey('ArrowRight')
        pressKey('ArrowDown')
        pressKey('ArrowUp')
      })

      // Assert
      // ready状態なので移動コマンドは実行されるがゲーム状態は変わらない
      expect(consoleSpy).toHaveBeenCalledWith('Left key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Right key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Down key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Rotate key pressed')

      // 状態はready のまま
      expect(screen.getByText('準備中')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('リセットキー（R）が動作する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act
      act(() => {
        pressKey('r')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Reset key pressed')
      expect(screen.getByText('準備中')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('大文字のリセットキー（R）も動作する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act
      act(() => {
        pressKey('R')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Reset key pressed')

      consoleSpy.mockRestore()
    })
  })

  describe('レスポンシブデザインテスト', () => {
    it('レイアウトコンポーネントが存在する', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      // グリッドレイアウトの存在確認
      const gameInfoSection = screen
        .getByTestId('game-info')
        .closest('.lg\\:col-span-1')
      const gameBoardSection = screen
        .getByTestId('game-board')
        .closest('.lg\\:col-span-2')

      // レスポンシブクラスの確認
      expect(gameInfoSection).toBeInTheDocument()
      expect(gameBoardSection).toBeInTheDocument()
    })
  })

  describe('アクセシビリティテスト', () => {
    it('適切なdata-testid属性が設定されている', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-field')).toBeInTheDocument()
      expect(screen.getByTestId('game-info')).toBeInTheDocument()
      expect(screen.getByTestId('score-display')).toBeInTheDocument()
      expect(screen.getByTestId('level-display')).toBeInTheDocument()
      expect(screen.getByTestId('state-display')).toBeInTheDocument()
    })

    it('セマンティックなHTML構造を持つ', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument() // header
      expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

      // 複数のh2要素があるため getAllByRole を使用
      const headings = screen.getAllByRole('heading', { level: 2 })
      expect(headings).toHaveLength(2) // ゲーム情報とゲームフィールドの2つ
      expect(headings[0]).toHaveTextContent('ゲーム情報')
      expect(headings[1]).toHaveTextContent('ゲームフィールド')
    })
  })

  describe('パフォーマンステスト', () => {
    it('大量のセルを効率的にレンダリングできる', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      render(<App />)

      // 全セルの存在確認（72個のセル）
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 12; y++) {
          expect(screen.getByTestId(`cell-${x}-${y}`)).toBeInTheDocument()
        }
      }

      const endTime = performance.now()

      // Assert
      // レンダリング時間が妥当な範囲内であること（1秒以内）
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('エラーハンドリングテスト', () => {
    it('無効なキー入力を適切に処理する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act
      act(() => {
        pressKey('x') // 無効なキー
        pressKey('Enter') // 無効なキー
        pressKey('Escape') // 無効なキー
      })

      // Assert
      // 無効なキーに対してはログが出力されないこと
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('key pressed'),
      )

      consoleSpy.mockRestore()
    })
  })
})
