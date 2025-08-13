import type { Puyo } from './Puyo'

export type GameState = 'ready' | 'playing' | 'paused' | 'gameOver'

export interface Game {
  readonly id: string
  readonly state: GameState
  readonly field: Puyo[][]
  readonly score: number
  readonly level: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const createGame = (): Game => ({
  id: crypto.randomUUID(),
  state: 'ready',
  field: createEmptyField(),
  score: 0,
  level: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createEmptyField = (): Puyo[][] => {
  // 6列×12行のフィールドを作成
  return Array.from({ length: 12 }, () =>
    Array.from({ length: 6 }, () => ({
      color: null,
      position: { x: 0, y: 0 },
    })),
  )
}

export const updateGameState = (game: Game, newState: GameState): Game => ({
  ...game,
  state: newState,
  updatedAt: new Date(),
})

export const updateScore = (game: Game, newScore: number): Game => ({
  ...game,
  score: newScore,
  updatedAt: new Date(),
})
