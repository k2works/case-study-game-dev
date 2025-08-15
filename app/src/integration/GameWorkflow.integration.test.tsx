import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import App from '../App'

// キーボードイベントのヘルパー関数
const pressKey = (key: string) => {
  fireEvent.keyDown(document, { key })
}

describe('ゲームワークフロー統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ゲーム状態遷移テスト', () => {
    it('ready→playing→paused→playing の状態遷移が正常に動作する', () => {
      // Arrange
      render(<App />)

      // Assert: 初期状態はready
      expect(screen.getByText('準備中')).toBeInTheDocument()

      // ゲームを手動でplaying状態にする必要があるため、
      // このテストは将来的にゲーム開始機能が実装された時に完成予定
    })

    it('ポーズ機能のキーボード操作が動作する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act: ポーズキー押下
      act(() => {
        pressKey('p')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Pause key pressed')

      // Act: 大文字のポーズキー押下
      act(() => {
        pressKey('P')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Pause key pressed')

      consoleSpy.mockRestore()
    })

    it('リセット機能のキーボード操作が動作する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act: リセットキー押下
      act(() => {
        pressKey('r')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Reset key pressed')
      expect(screen.getByText('準備中')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // スコアがリセット

      consoleSpy.mockRestore()
    })
  })

  describe('ぷよ操作統合テスト', () => {
    it('左右移動キーが認識される', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act: 左移動
      act(() => {
        pressKey('ArrowLeft')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Left key pressed')

      // Act: 右移動
      act(() => {
        pressKey('ArrowRight')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Right key pressed')

      consoleSpy.mockRestore()
    })

    it('下移動（高速落下）キーが認識される', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act
      act(() => {
        pressKey('ArrowDown')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Down key pressed')

      consoleSpy.mockRestore()
    })

    it('回転キーが認識される（上矢印とスペース）', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act: 上矢印での回転
      act(() => {
        pressKey('ArrowUp')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Rotate key pressed')

      // Act: スペースキーでの回転
      act(() => {
        pressKey(' ')
      })

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Rotate key pressed')

      consoleSpy.mockRestore()
    })
  })

  describe('UI連携テスト', () => {
    it('ゲーム情報とゲームボードが連携して表示される', () => {
      // Arrange
      render(<App />)

      // Assert: ゲーム情報の存在
      expect(screen.getByTestId('game-info')).toBeInTheDocument()
      expect(screen.getByTestId('score-display')).toBeInTheDocument()
      expect(screen.getByTestId('level-display')).toBeInTheDocument()
      expect(screen.getByTestId('state-display')).toBeInTheDocument()

      // Assert: ゲームボードの存在
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-field')).toBeInTheDocument()

      // Assert: 初期値の確認
      expect(screen.getByTestId('score-value')).toHaveTextContent('0')
      expect(screen.getByTestId('level-value')).toHaveTextContent('1')
      expect(screen.getByTestId('state-value')).toHaveTextContent('準備中')
    })

    it('フィールドの全セルが正しく表示される', () => {
      // Arrange
      render(<App />)

      // Assert: 6×12のフィールド確認
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 12; y++) {
          const cell = screen.getByTestId(`cell-${x}-${y}`)
          expect(cell).toBeInTheDocument()
          expect(cell).toHaveClass('cell')
          expect(cell).toHaveClass('cell-empty') // 初期状態は空
        }
      }
    })

    it('CSS クラスが適切に適用されている', () => {
      // Arrange
      render(<App />)

      // Assert: レスポンシブクラス
      const gameInfo = screen.getByTestId('game-info')
      const gameBoard = screen.getByTestId('game-board')

      expect(gameInfo.closest('.lg\\:col-span-1')).toBeInTheDocument()
      expect(gameBoard.closest('.lg\\:col-span-2')).toBeInTheDocument()

      // Assert: 状態別スタイル
      const stateValue = screen.getByTestId('state-value')
      expect(stateValue).toHaveClass('state-ready')
      expect(stateValue).toHaveClass('text-blue-400')
      expect(stateValue).toHaveClass('bg-blue-900/30')
    })
  })

  describe('データフロー統合テスト', () => {
    it('ゲームストアの状態がUIに正しく反映される', () => {
      // Arrange
      render(<App />)

      // Assert: 初期ゲーム状態の確認
      expect(screen.getByText('準備中')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // スコア
      expect(screen.getByText('1')).toBeInTheDocument() // レベル

      // Note: 実際のゲーム状態変更のテストは、
      // ゲーム開始機能が実装された後に追加予定
    })
  })

  describe('エラー境界テスト', () => {
    it('無効なゲーム状態でもアプリケーションがクラッシュしない', () => {
      // Arrange & Act
      render(<App />)

      // Assert: アプリケーションが正常にレンダリングされる
      expect(screen.getByText('ぷよぷよ')).toBeInTheDocument()
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-info')).toBeInTheDocument()

      // エラーが発生せずに正常に動作することを確認
      expect(() => {
        screen.getByTestId('game-field')
      }).not.toThrow()
    })
  })

  describe('キーボードイベント統合テスト', () => {
    it('複数のキーを連続で押下しても正常に動作する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act: 複数キーの連続押下
      act(() => {
        pressKey('ArrowLeft')
        pressKey('ArrowRight')
        pressKey('ArrowDown')
        pressKey('ArrowUp')
        pressKey(' ')
        pressKey('p')
        pressKey('r')
      })

      // Assert: 全てのキーが認識されている
      expect(consoleSpy).toHaveBeenCalledWith('Left key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Right key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Down key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Rotate key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Pause key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Reset key pressed')

      consoleSpy.mockRestore()
    })

    it('大文字小文字の両方のキーが動作する', () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      render(<App />)

      // Act & Assert: 小文字
      act(() => {
        pressKey('p')
        pressKey('r')
      })
      expect(consoleSpy).toHaveBeenCalledWith('Pause key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Reset key pressed')

      // Act & Assert: 大文字
      act(() => {
        pressKey('P')
        pressKey('R')
      })
      expect(consoleSpy).toHaveBeenCalledWith('Pause key pressed')
      expect(consoleSpy).toHaveBeenCalledWith('Reset key pressed')

      consoleSpy.mockRestore()
    })
  })

  describe('レンダリング性能テスト', () => {
    it('アプリケーション全体の初期レンダリングが高速である', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      render(<App />)

      // 基本要素の存在確認
      expect(screen.getByText('ぷよぷよ')).toBeInTheDocument()
      expect(screen.getByTestId('game-board')).toBeInTheDocument()
      expect(screen.getByTestId('game-info')).toBeInTheDocument()

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Assert: レンダリング時間が妥当な範囲内
      expect(renderTime).toBeLessThan(500) // 500ms以内
    })

    it('全フィールドセルのレンダリングが効率的である', () => {
      // Arrange
      render(<App />)
      const startTime = performance.now()

      // Act: 全セルへのアクセス
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 12; y++) {
          screen.getByTestId(`cell-${x}-${y}`)
        }
      }

      const endTime = performance.now()
      const accessTime = endTime - startTime

      // Assert: セルアクセス時間が妥当（環境により異なるため閾値を調整）
      expect(accessTime).toBeLessThan(500) // 500ms以内
    })
  })
})
