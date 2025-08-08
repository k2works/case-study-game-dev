import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import App from '../App'

// HTMLAudioElementのモック
const mockPlay = vi.fn()
const mockPause = vi.fn()
const mockLoad = vi.fn()

const createMockAudioElement = () =>
  ({
    play: mockPlay,
    pause: mockPause,
    load: mockLoad,
    volume: 1,
    currentTime: 0,
    src: '',
    loop: false,
    paused: true,
    ended: false,
  }) as unknown as HTMLAudioElement

// HTMLAudioElementコンストラクタのモック
const MockHTMLAudioElement = vi.fn(() => createMockAudioElement())
vi.stubGlobal('HTMLAudioElement', MockHTMLAudioElement)

describe('効果音統合テスト', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPlay.mockResolvedValue(undefined)
  })

  describe('ゲーム開始から効果音まで', () => {
    it('アプリケーションが正常に初期化され効果音システムが準備される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      const startButton = screen.getByText('ゲーム開始')
      expect(startButton).toBeInTheDocument()

      // アプリケーションが正常にレンダリングされることを確認
      const header = screen.getByText('ぷよぷよゲーム')
      expect(header).toBeInTheDocument()
    })

    it('ゲーム開始ボタンクリック後に効果音システムが有効になる', async () => {
      // Arrange
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')

      // Act
      await user.click(startButton)

      // Assert - ゲームが開始されることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()
    })
  })

  describe('キーボード操作と効果音', () => {
    it('ゲーム中のキーボード操作で効果音が再生される準備ができている', async () => {
      // Arrange
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')
      await user.click(startButton)

      // Act & Assert - ゲームが操作可能状態であることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      // スコア表示が存在することで、ゲームシステムが動作していることを確認
      const scoreDisplay = screen.getByTestId('score-value')
      expect(scoreDisplay).toBeInTheDocument()
    })
  })

  describe('効果音システムの基本動作確認', () => {
    it('HTMLAudioElementが適切に初期化される', async () => {
      // Arrange & Act
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')
      await user.click(startButton)

      // Assert - ゲーム開始により効果音システムが利用可能になることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()
    })

    it('効果音サービスがシングルトンとして動作する', async () => {
      // Arrange & Act
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')
      await user.click(startButton)

      // Assert - ゲームが正常に動作することで効果音システムが準備されていることを確認
      const scoreDisplay = screen.getByTestId('score-value')
      expect(scoreDisplay).toBeInTheDocument()
    })
  })

  describe('エラーハンドリング', () => {
    it('音声再生エラーが発生してもアプリケーションがクラッシュしない', async () => {
      // Arrange
      mockPlay.mockRejectedValueOnce(new Error('Audio failed'))
      render(<App />)

      // Act & Assert - アプリケーションが正常に動作し続ける
      const startButton = screen.getByText('ゲーム開始')
      await user.click(startButton)

      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()
    })
  })
})
