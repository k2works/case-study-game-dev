import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('タイトルが表示される', () => {
    render(<App />)
    expect(screen.getByText('ぷよぷよゲーム')).toBeInTheDocument()
  })

  it('GameCanvasがレンダリングされる', () => {
    render(<App />)
    const canvas = screen.getByRole('img')
    expect(canvas).toBeInTheDocument()
  })
})
