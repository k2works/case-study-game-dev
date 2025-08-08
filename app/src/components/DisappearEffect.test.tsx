import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { DisappearEffect } from './DisappearEffect'

describe('DisappearEffect', () => {
  describe('消去エフェクトの表示', () => {
    it('消去位置にエフェクトが表示される', () => {
      // Arrange & Act
      render(<DisappearEffect x={2} y={5} color="red" />)

      // Assert
      const effect = screen.getByTestId('disappear-effect')
      expect(effect).toBeInTheDocument()
      expect(effect).toHaveClass('disappear-effect')
      expect(effect).toHaveClass('red')
    })

    it('複数の消去エフェクトが同時に表示される', () => {
      // Arrange & Act
      const { container } = render(
        <>
          <DisappearEffect x={1} y={3} color="blue" />
          <DisappearEffect x={2} y={3} color="blue" />
          <DisappearEffect x={3} y={3} color="blue" />
        </>
      )

      // Assert
      const effects = container.querySelectorAll('.disappear-effect')
      expect(effects).toHaveLength(3)
      effects.forEach((effect) => {
        expect(effect).toHaveClass('blue')
      })
    })
  })

  describe('エフェクトの位置', () => {
    it('指定された座標にエフェクトが配置される', () => {
      // Arrange & Act
      render(<DisappearEffect x={3} y={7} color="green" />)

      // Assert
      const effect = screen.getByTestId('disappear-effect')
      expect(effect).toHaveStyle({
        left: '96px',
        top: '224px',
      })
    })

    it('異なる位置に複数のエフェクトが配置される', () => {
      // Arrange & Act
      const { container } = render(
        <>
          <DisappearEffect x={0} y={10} color="yellow" />
          <DisappearEffect x={5} y={15} color="yellow" />
        </>
      )

      // Assert
      const effects = container.querySelectorAll('.disappear-effect')
      expect(effects[0]).toHaveStyle({
        left: '0px',
        top: '320px',
      })
      expect(effects[1]).toHaveStyle({
        left: '160px',
        top: '480px',
      })
    })
  })

  describe('アニメーション', () => {
    it('消去アニメーションクラスが適用される', () => {
      // Arrange & Act
      render(<DisappearEffect x={2} y={4} color="red" />)

      // Assert
      const effect = screen.getByTestId('disappear-effect')
      expect(effect).toHaveClass('disappearing')
    })

    it('アニメーション時間が設定される', () => {
      // Arrange & Act
      render(<DisappearEffect x={1} y={2} color="blue" duration={0.8} />)

      // Assert
      const effect = screen.getByTestId('disappear-effect')
      expect(effect).toHaveStyle({
        animationDuration: '0.8s',
      })
    })

    it('デフォルトアニメーション時間が適用される', () => {
      // Arrange & Act
      render(<DisappearEffect x={3} y={5} color="green" />)

      // Assert
      const effect = screen.getByTestId('disappear-effect')
      expect(effect).toHaveStyle({
        animationDuration: '0.5s',
      })
    })
  })

  describe('エフェクトの完了コールバック', () => {
    it('アニメーション完了時にコールバックが呼ばれる', () => {
      // Arrange
      const onComplete = vi.fn()
      const { container } = render(
        <DisappearEffect x={2} y={3} color="red" onComplete={onComplete} />
      )

      // Act - アニメーションイベントを発火
      const effect = container.querySelector('.disappear-effect')
      const animationEndEvent = new Event('animationend', { bubbles: true })
      effect?.dispatchEvent(animationEndEvent)

      // Assert
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })
})
