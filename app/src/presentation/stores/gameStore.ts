import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import {
  createGame,
  pauseGame as pauseGameDomain,
  resumeGame as resumeGameDomain,
  startGame,
} from '../../domain/models/Game'
import type { Game } from '../../domain/models/Game'
import type { PuyoData } from '../../domain/models/Puyo'

interface GameStore {
  // State
  game: Game
  currentPuyo: PuyoData | null
  score: number
  isGameOver: boolean
  isPaused: boolean

  // Actions
  initializeGame: () => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  updateGame: (newGame: Game) => void
  updateScore: (newScore: number) => void
  setCurrentPuyo: (puyo: PuyoData | null) => void
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

      startGame: () => {
        set(
          (state) => ({
            ...state,
            game: startGame(state.game),
          }),
          false,
          'startGame',
        )
      },

      pauseGame: () => {
        set(
          (state) => ({
            ...state,
            game: pauseGameDomain(state.game),
            isPaused: true,
          }),
          false,
          'pauseGame',
        )
      },

      resumeGame: () => {
        set(
          (state) => ({
            ...state,
            game: resumeGameDomain(state.game),
            isPaused: false,
          }),
          false,
          'resumeGame',
        )
      },

      resetGame: () => {
        set(() => ({ ...initialState }), false, 'resetGame')
      },

      updateGame: (newGame: Game) => {
        set((state) => ({ ...state, game: newGame }), false, 'updateGame')
      },

      updateScore: (newScore: number) => {
        set((state) => ({ ...state, score: newScore }), false, 'updateScore')
      },

      setCurrentPuyo: (puyo: PuyoData | null) => {
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
