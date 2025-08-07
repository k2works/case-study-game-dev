import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextPuyoDisplay } from './NextPuyoDisplay'
import { PuyoPair } from '../domain/PuyoPair'
import { Puyo, PuyoColor } from '../domain/Puyo'

describe('NextPuyoDisplay', () => {
  describe('NEXTぷよ表示機能', () => {
    it('NEXTぷよが表示される', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const nextPair = new PuyoPair(mainPuyo, subPuyo, 0, 0)

      render(<NextPuyoDisplay nextPair={nextPair} />)

      expect(screen.getByText('NEXT')).toBeInTheDocument()
      expect(screen.getByTestId('next-puyo-area')).toBeInTheDocument()
    })

    it('メインぷよとサブぷよが表示される', () => {
      const mainPuyo = new Puyo(PuyoColor.GREEN)
      const subPuyo = new Puyo(PuyoColor.YELLOW)
      const nextPair = new PuyoPair(mainPuyo, subPuyo, 0, 0)

      render(<NextPuyoDisplay nextPair={nextPair} />)

      const mainElement = screen.getByTestId('next-main-puyo')
      const subElement = screen.getByTestId('next-sub-puyo')

      expect(mainElement).toBeInTheDocument()
      expect(subElement).toBeInTheDocument()
      expect(mainElement).toHaveClass('puyo', 'green')
      expect(subElement).toHaveClass('puyo', 'yellow')
    })

    it('NEXTぷよがnullの場合は表示されない', () => {
      render(<NextPuyoDisplay nextPair={null} />)

      expect(screen.queryByTestId('next-puyo-area')).not.toBeInTheDocument()
      expect(screen.queryByText('NEXT')).not.toBeInTheDocument()
    })
  })

  describe('スタイリング確認', () => {
    it('適切なCSSクラスが適用される', () => {
      const mainPuyo = new Puyo(PuyoColor.RED)
      const subPuyo = new Puyo(PuyoColor.BLUE)
      const nextPair = new PuyoPair(mainPuyo, subPuyo, 0, 0)

      render(<NextPuyoDisplay nextPair={nextPair} />)

      const area = screen.getByTestId('next-puyo-area')
      expect(area).toHaveClass('next-puyo-area')

      const display = area.querySelector('.next-puyo-display')
      expect(display).toBeInTheDocument()
    })
  })
})
