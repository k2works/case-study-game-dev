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

  it('ゲーム準備中メッセージが表示されること', () => {
    render(<App />)

    expect(screen.getByText('ゲームを準備中...')).toBeInTheDocument()
  })
})
