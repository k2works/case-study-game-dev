import React from 'react'
import { PuyoPair } from '../domain/PuyoPair'
import './NextPuyoDisplay.css'

interface NextPuyoDisplayProps {
  nextPair: PuyoPair | null
  showShadow?: boolean
}

export const NextPuyoDisplay = React.memo(
  ({ nextPair, showShadow = true }: NextPuyoDisplayProps) => {
    if (!nextPair) {
      return null
    }

    const containerClass = `next-puyo-area ${showShadow ? 'show-shadow' : ''}`

    return (
      <div data-testid="next-puyo-area" className={containerClass}>
        <div className="next-puyo-label">NEXT</div>
        <div className="next-puyo-display">
          <div
            data-testid="next-main-puyo"
            className={`puyo ${nextPair.main.color}`}
          />
          <div
            data-testid="next-sub-puyo"
            className={`puyo ${nextPair.sub.color}`}
          />
        </div>
      </div>
    )
  }
)
