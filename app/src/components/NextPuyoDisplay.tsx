import { PuyoPair } from '../domain/PuyoPair'
import './NextPuyoDisplay.css'

interface NextPuyoDisplayProps {
  nextPair: PuyoPair | null
}

export const NextPuyoDisplay = ({ nextPair }: NextPuyoDisplayProps) => {
  if (!nextPair) {
    return null
  }

  return (
    <div data-testid="next-puyo-area" className="next-puyo-area">
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
