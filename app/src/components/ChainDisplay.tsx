import React, { useEffect, useState } from 'react'
import './ChainDisplay.css'

interface ChainDisplayProps {
  chainCount: number
  x?: number
  y?: number
  duration?: number
  onComplete?: () => void
}

export const ChainDisplay: React.FC<ChainDisplayProps> = ({
  chainCount,
  x,
  y,
  duration = 1500,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (chainCount > 0) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onComplete) {
          onComplete()
        }
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [chainCount, duration, onComplete])

  if (chainCount === 0 || !isVisible) {
    return null
  }

  const getChainClass = () => {
    let classes = 'chain-display chain-animation'

    if (x === undefined || y === undefined) {
      classes += ' center-position'
    }

    if (chainCount >= 10) {
      classes += ' super-chain'
    } else if (chainCount >= 7) {
      classes += ' large-chain'
    }

    return classes
  }

  const style: React.CSSProperties = {}
  if (x !== undefined && y !== undefined) {
    const cellSize = 32
    style.left = `${x * cellSize}px`
    style.top = `${y * cellSize}px`
    style.position = 'absolute'
  }

  return (
    <div data-testid="chain-display" className={getChainClass()} style={style}>
      <span className="chain-text">{chainCount}連鎖!</span>
    </div>
  )
}
