import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { createGame } from '../../domain/models/Game'
import type { Game } from '../../domain/models/Game'
import type { Puyo } from '../../domain/models/Puyo'

interface GameStore {
  // State
  game: Game
  currentPuyo: Puyo | null
  score: number
  isGameOver: boolean
  isPaused: boolean

  // Actions
  initializeGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  updateScore: (newScore: number) => void
  setCurrentPuyo: (puyo: Puyo | null) => void
  setGameOver: (isOver: boolean) => void
}

// 初期状態の定義
const initialState = {
  game: createGame(),
  currentPuyo: null,
  score: 0,
  isGameOver: false,
  isPaused: false,
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set) => ({
      ...initialState,

      initializeGame: () => {
        set(
          () => ({
            ...initialState,
            game: createGame(),
          }),
          false,
          'initializeGame',
        )
      },

      pauseGame: () => {
        set((state) => ({ ...state, isPaused: true }), false, 'pauseGame')
      },

      resumeGame: () => {
        set((state) => ({ ...state, isPaused: false }), false, 'resumeGame')
      },

      resetGame: () => {
        set(() => ({ ...initialState }), false, 'resetGame')
      },

      updateScore: (newScore: number) => {
        set((state) => ({ ...state, score: newScore }), false, 'updateScore')
      },

      setCurrentPuyo: (puyo: Puyo | null) => {
        set(
          (state) => ({ ...state, currentPuyo: puyo }),
          false,
          'setCurrentPuyo',
        )
      },

      setGameOver: (isOver: boolean) => {
        set((state) => ({ ...state, isGameOver: isOver }), false, 'setGameOver')
      },
    }),
    {
      name: 'game-store',
    },
  ),
)
