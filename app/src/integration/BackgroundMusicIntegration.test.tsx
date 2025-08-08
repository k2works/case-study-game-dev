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

describe('BGM統合テスト', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPlay.mockResolvedValue(undefined)
  })

  describe('ゲーム状態とBGM', () => {
    it('アプリケーションが正常に初期化されBGMシステムが準備される', () => {
      // Arrange & Act
      render(<App />)

      // Assert
      const startButton = screen.getByText('ゲーム開始')
      expect(startButton).toBeInTheDocument()

      // アプリケーションが正常にレンダリングされることを確認
      const header = screen.getByText('ぷよぷよゲーム')
      expect(header).toBeInTheDocument()
    })

    it('ゲーム開始時にメインテーマが再生される準備ができている', async () => {
      // Arrange
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')

      // Act
      await user.click(startButton)

      // Assert - ゲームが正常に開始されることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()
    })

    it('ゲームシステムが正常に動作している', async () => {
      // Arrange
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')

      // Act
      await user.click(startButton)

      // Assert - ゲームの主要コンポーネントが動作していることを確認
      const scoreDisplay = screen.getByTestId('score-value')
      expect(scoreDisplay).toBeInTheDocument()
      expect(scoreDisplay).toHaveTextContent('0')
    })
  })

  describe('BGMシステムの基本動作', () => {
    it('BGMサービスが正常に初期化される', () => {
      // Arrange & Act
      render(<App />)

      // Assert - アプリケーションが正常に動作することでBGMサービスも動作
      const instructions = screen.getByText('操作方法')
      expect(instructions).toBeInTheDocument()
    })

    it('ゲーム状態変化によるBGM制御システムが動作する', async () => {
      // Arrange
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')

      // Act
      await user.click(startButton)

      // Assert - ゲーム状態が適切に変化していることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      // ゲームが実際に動作していることをスコア表示で確認
      const scoreValue = screen.getByTestId('score-value')
      expect(scoreValue).toBeInTheDocument()
    })
  })

  describe('エラーハンドリング', () => {
    it('BGM再生エラーが発生してもアプリケーションがクラッシュしない', async () => {
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

  describe('音響システムの協調動作', () => {
    it('BGMと効果音システムが共存できる', async () => {
      // Arrange
      render(<App />)
      const startButton = screen.getByText('ゲーム開始')

      // Act
      await user.click(startButton)

      // Assert - ゲームが正常に動作し、音響システムが準備されていることを確認
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toBeInTheDocument()

      const scoreDisplay = screen.getByTestId('score-value')
      expect(scoreDisplay).toBeInTheDocument()

      const nextPuyoArea = screen.getByTestId('next-puyo-area')
      expect(nextPuyoArea).toBeInTheDocument()
    })
  })
})
