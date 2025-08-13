import type { PuyoPair } from '../../domain/models/PuyoPair'
import { PuyoDisplay } from './PuyoDisplay'

interface NextPuyoPairProps {
  puyoPair: PuyoPair | null
}

export const NextPuyoPair = ({ puyoPair }: NextPuyoPairProps) => {
  if (!puyoPair) {
    return (
      <div
        data-testid="next-puyo-pair-empty"
        className="flex flex-col items-center gap-1"
      >
        <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-500" />
        <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-500" />
      </div>
    )
  }

  return (
    <div
      data-testid="next-puyo-pair"
      className="flex flex-col items-center gap-1"
    >
      <PuyoDisplay
        color={puyoPair.sub.color}
        size="medium"
        data-testid="next-puyo-sub"
      />
      <PuyoDisplay
        color={puyoPair.main.color}
        size="medium"
        data-testid="next-puyo-main"
      />
    </div>
  )
}
