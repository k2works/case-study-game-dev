export interface Score {
  readonly current: number
  readonly multiplier: number
}

export const createScore = (current = 0, multiplier = 1): Score => ({
  current,
  multiplier,
})

export const addScore = (score: Score, points: number): Score =>
  createScore(score.current + points, score.multiplier)

export const applyMultiplier = (score: Score, factor: number): Score =>
  createScore(score.current * factor, score.multiplier * factor)

export const resetScore = (): Score => createScore()

export const getDisplayScore = (score: Score): number =>
  score.current * score.multiplier
