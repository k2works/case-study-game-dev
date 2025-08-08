import React from 'react'
import './AnimatedPuyo.css'

interface AnimatedPuyoProps {
  color: string
  x: number
  y: number
  isFalling: boolean
  fallDuration?: number
}

export const AnimatedPuyo: React.FC<AnimatedPuyoProps> = ({
  color,
  x,
  y,
  isFalling,
  fallDuration = 0.3,
}) => {
  const cellSize = 32
  const transform = `translate(${x * cellSize}px, ${y * cellSize}px)`

  const style: React.CSSProperties = {
    transform,
    transition: isFalling ? `transform ${fallDuration}s ease-in` : undefined,
  }

  const className = `animated-puyo ${color} ${isFalling ? 'falling' : ''}`

  return <div data-testid="animated-puyo" className={className} style={style} />
}
