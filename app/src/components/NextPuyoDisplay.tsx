import React from 'react'
import { PuyoPair } from '../domain/PuyoPair'
import './NextPuyoDisplay.css'

interface NextPuyoDisplayProps {
  nextPair: PuyoPair | null
  showShadow?: boolean
  colorBlindMode?: boolean
}

export const NextPuyoDisplay = React.memo(
  ({
    nextPair,
    showShadow = true,
    colorBlindMode = false,
  }: NextPuyoDisplayProps) => {
    if (!nextPair) {
      return null
    }

    const containerClass = `next-puyo-area ${showShadow ? 'show-shadow' : ''} ${colorBlindMode ? 'color-blind-mode' : ''}`

    return (
      <div
        data-testid="next-puyo-area"
        className={containerClass}
        role="complementary"
        aria-labelledby="next-puyo-label"
      >
        <div
          id="next-puyo-label"
          className="next-puyo-label"
          role="heading"
          aria-level={3}
        >
          NEXT
        </div>
        <div
          className="next-puyo-display"
          role="img"
          aria-describedby="next-puyo-label"
          aria-label={`次のぷよペア: ${nextPair.main.color}のぷよと${nextPair.sub.color}のぷよ`}
        >
          <div
            data-testid="next-main-puyo"
            className={`puyo ${nextPair.main.color}`}
            role="presentation"
            aria-hidden="true"
          />
          <div
            data-testid="next-sub-puyo"
            className={`puyo ${nextPair.sub.color}`}
            role="presentation"
            aria-hidden="true"
          />
        </div>
      </div>
    )
  }
)
