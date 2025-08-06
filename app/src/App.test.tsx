import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('アプリケーションタイトルが表示されること', () => {
    render(<App />)

    expect(screen.getByText('ぷよぷよゲーム')).toBeInTheDocument()
  })

  it('サブタイトルが表示されること', () => {
    render(<App />)

    expect(
      screen.getByText('テスト駆動開発で作るパズルゲーム')
    ).toBeInTheDocument()
  })

  it('GameBoardとコントロールが表示されること', () => {
    render(<App />)

    expect(screen.getByTestId('game-board')).toBeInTheDocument()
    expect(screen.getByText('ゲーム開始')).toBeInTheDocument()
  })
})
