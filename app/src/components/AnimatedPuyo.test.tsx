import React from 'react'
import { render, screen } from '@testing-library/react'
import { AnimatedPuyo } from './AnimatedPuyo'

describe('AnimatedPuyo', () => {
  describe('ぷよの表示', () => {
    it('赤いぷよが表示される', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="red" x={0} y={0} isFalling={false} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveClass('animated-puyo')
      expect(puyo).toHaveClass('red')
    })

    it('青いぷよが表示される', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="blue" x={1} y={1} isFalling={false} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveClass('animated-puyo')
      expect(puyo).toHaveClass('blue')
    })
  })

  describe('位置の設定', () => {
    it('指定された位置にぷよが配置される', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="green" x={3} y={5} isFalling={false} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveStyle({
        transform: 'translate(96px, 160px)',
      })
    })

    it('異なる位置にぷよが配置される', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="yellow" x={5} y={10} isFalling={false} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveStyle({
        transform: 'translate(160px, 320px)',
      })
    })
  })

  describe('落下アニメーション', () => {
    it('落下中のぷよにアニメーションクラスが付与される', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="red" x={2} y={3} isFalling={true} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveClass('falling')
    })

    it('落下していないぷよにはアニメーションクラスが付与されない', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="blue" x={1} y={2} isFalling={false} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).not.toHaveClass('falling')
    })
  })

  describe('落下速度の設定', () => {
    it('カスタム落下速度が設定される', () => {
      // Arrange & Act
      render(
        <AnimatedPuyo
          color="green"
          x={2}
          y={5}
          isFalling={true}
          fallDuration={0.5}
        />
      )

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveStyle({
        transition: 'transform 0.5s ease-in',
      })
    })

    it('デフォルト落下速度が設定される', () => {
      // Arrange & Act
      render(<AnimatedPuyo color="yellow" x={3} y={7} isFalling={true} />)

      // Assert
      const puyo = screen.getByTestId('animated-puyo')
      expect(puyo).toHaveStyle({
        transition: 'transform 0.3s ease-in',
      })
    })
  })
})
