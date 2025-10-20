import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameCanvas } from '@/components/GameCanvas'

describe('GameCanvas', () => {
  it('canvas要素がレンダリングされる', () => {
    render(<GameCanvas width={600} height={800} />)

    const canvas = screen.getByRole('img')
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('width', '600')
    expect(canvas).toHaveAttribute('height', '800')
  })

  it('canvas要素にgame-canvasクラスが設定される', () => {
    render(<GameCanvas width={600} height={800} />)

    const canvas = screen.getByRole('img')
    expect(canvas).toHaveClass('game-canvas')
  })
})
