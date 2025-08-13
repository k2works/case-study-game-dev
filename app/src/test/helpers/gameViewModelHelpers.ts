import type {
  FieldViewModel,
  GameStateViewModel,
  GameViewModel,
  PuyoColorViewModel,
  PuyoPairViewModel,
  PuyoViewModel,
  ScoreViewModel,
} from '../../application/viewmodels/GameViewModel'

/**
 * テスト用のGameViewModelを作成するヘルパー関数群
 */

export const createTestFieldViewModel = (
  width = 6,
  height = 12,
  puyos: { x: number; y: number; color: PuyoColorViewModel }[] = [],
): FieldViewModel => {
  const cells: (PuyoViewModel | null)[][] = []

  for (let x = 0; x < width; x++) {
    cells[x] = []
    for (let y = 0; y < height; y++) {
      cells[x][y] = null
    }
  }

  // 指定されたぷよを配置
  puyos.forEach((puyo) => {
    if (puyo.x < width && puyo.y < height) {
      cells[puyo.x][puyo.y] = {
        id: `test-puyo-${puyo.x}-${puyo.y}`,
        color: puyo.color,
        x: puyo.x,
        y: puyo.y,
      }
    }
  })

  return {
    width,
    height,
    cells,
  }
}

export const createTestScoreViewModel = (current = 0): ScoreViewModel => ({
  current,
  high: 0,
  display: current,
  chainBonus: 0,
  colorBonus: 0,
})

export const createTestGameViewModel = (
  overrides: Partial<GameViewModel> = {},
): GameViewModel => ({
  id: 'test-game-id',
  state: 'ready' as GameStateViewModel,
  field: createTestFieldViewModel(),
  score: createTestScoreViewModel(),
  level: 1,
  currentPuyoPair: null,
  nextPuyoPair: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

export const createTestPuyoViewModel = (
  x: number,
  y: number,
  color: PuyoColorViewModel,
): PuyoViewModel => ({
  id: `test-puyo-${x}-${y}`,
  color,
  x,
  y,
})

export const createTestPuyoPairViewModel = (
  x = 2,
  y = 0,
  mainColor: PuyoColorViewModel = 'red',
  subColor: PuyoColorViewModel = 'blue',
): PuyoPairViewModel => ({
  id: `test-pair-${x}-${y}`,
  main: createTestPuyoViewModel(x, y, mainColor),
  sub: createTestPuyoViewModel(x, y - 1, subColor),
  x,
  y,
  rotation: 0,
})
