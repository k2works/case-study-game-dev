import React, { useEffect } from 'react'
import './DisappearEffect.css'

interface DisappearEffectProps {
  x: number
  y: number
  color: string
  duration?: number
  onComplete?: () => void
}

export const DisappearEffect: React.FC<DisappearEffectProps> = ({
  x,
  y,
  color,
  duration = 0.5,
  onComplete,
}) => {
  const cellSize = 32
  
  const style: React.CSSProperties = {
    left: `${x * cellSize}px`,
    top: `${y * cellSize}px`,
    animationDuration: `${duration}s`,
  }

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete()
      }, duration * 1000)

      return () => clearTimeout(timer)
    }
  }, [duration, onComplete])

  const handleAnimationEnd = () => {
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div
      data-testid="disappear-effect"
      className={`disappear-effect ${color} disappearing`}
      style={style}
      onAnimationEnd={handleAnimationEnd}
    />
  )
}
