import { Field } from './Field'
import { type Puyo, type PuyoColor, movePuyo } from './Puyo'
import type { PuyoPair } from './PuyoPair'
import type { Score } from './Score'
import { createScore } from './Score'

export type GameState = 'ready' | 'playing' | 'paused' | 'gameOver'

export interface Game {
  readonly id: string
  readonly state: GameState
  readonly field: Field
  readonly score: Score
  readonly level: number
  readonly currentPuyoPair: PuyoPair | null
  readonly currentPuyo: Puyo | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const createGame = (): Game => ({
  id: crypto.randomUUID(),
  state: 'ready',
  field: new Field(),
  score: createScore(),
  level: 1,
  currentPuyoPair: null,
  currentPuyo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const updateGameState = (game: Game, newState: GameState): Game => ({
  ...game,
  state: newState,
  updatedAt: new Date(),
})

export const updateGameScore = (game: Game, newScore: Score): Game => ({
  ...game,
  score: newScore,
  updatedAt: new Date(),
})

export const updateCurrentPuyoPair = (
  game: Game,
  puyoPair: PuyoPair | null,
): Game => ({
  ...game,
  currentPuyoPair: puyoPair,
  updatedAt: new Date(),
})

export const dropPuyo = (game: Game, puyo: Puyo, column: number): Game => {
  // 指定した列でぷよを落下させる
  let dropPosition = game.field.getHeight() - 1

  // 下から上に向かって空きセルを探す
  for (let y = game.field.getHeight() - 1; y >= 0; y--) {
    if (!game.field.isEmpty(column, y)) {
      dropPosition = y - 1
      break
    }
  }

  // 列が満杯でゲームオーバー
  if (dropPosition < 0) {
    return {
      ...game,
      state: 'gameOver',
      updatedAt: new Date(),
    }
  }

  // 新しいFieldを作成（イミュータブル）
  const newField = new Field()

  // 現在のフィールドの状態をコピー
  for (let x = 0; x < game.field.getWidth(); x++) {
    for (let y = 0; y < game.field.getHeight(); y++) {
      const existingPuyo = game.field.getPuyo(x, y)
      if (existingPuyo) {
        newField.setPuyo(x, y, existingPuyo)
      }
    }
  }

  // ぷよを配置
  newField.setPuyo(column, dropPosition, puyo)

  return {
    ...game,
    field: newField,
    updatedAt: new Date(),
  }
}

// ぷよ移動・回転ロジック
export const movePuyoLeft = (game: Game): Game => {
  if (!game.currentPuyo) {
    return game
  }

  const newX = game.currentPuyo.position.x - 1

  // 左端チェック
  if (newX < 0) {
    return game
  }

  // 衝突チェック
  if (!game.field.isEmpty(newX, game.currentPuyo.position.y)) {
    return game
  }

  // 移動実行
  const newPosition = { x: newX, y: game.currentPuyo.position.y }
  const movedPuyo = movePuyo(game.currentPuyo, newPosition)

  return {
    ...game,
    currentPuyo: movedPuyo,
    updatedAt: new Date(),
  }
}

export const movePuyoRight = (game: Game): Game => {
  if (!game.currentPuyo) {
    return game
  }

  const newX = game.currentPuyo.position.x + 1

  // 右端チェック
  if (newX >= game.field.getWidth()) {
    return game
  }

  // 衝突チェック
  if (!game.field.isEmpty(newX, game.currentPuyo.position.y)) {
    return game
  }

  // 移動実行
  const newPosition = { x: newX, y: game.currentPuyo.position.y }
  const movedPuyo = movePuyo(game.currentPuyo, newPosition)

  return {
    ...game,
    currentPuyo: movedPuyo,
    updatedAt: new Date(),
  }
}

export const dropPuyoFast = (game: Game): Game => {
  if (!game.currentPuyo) {
    return game
  }

  const newY = game.currentPuyo.position.y + 1

  // 最下段チェック
  if (newY >= game.field.getHeight()) {
    return game
  }

  // 衝突チェック
  if (!game.field.isEmpty(game.currentPuyo.position.x, newY)) {
    return game
  }

  // 移動実行
  const newPosition = { x: game.currentPuyo.position.x, y: newY }
  const movedPuyo = movePuyo(game.currentPuyo, newPosition)

  return {
    ...game,
    currentPuyo: movedPuyo,
    updatedAt: new Date(),
  }
}

// 色の回転順序
const colorRotationOrder: PuyoColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
]

export const rotatePuyo = (game: Game): Game => {
  if (!game.currentPuyo || !game.currentPuyo.color) {
    return game
  }

  const currentColorIndex = colorRotationOrder.indexOf(game.currentPuyo.color)
  const nextColorIndex = (currentColorIndex + 1) % colorRotationOrder.length
  const nextColor = colorRotationOrder[nextColorIndex]

  const rotatedPuyo = {
    ...game.currentPuyo,
    color: nextColor,
  }

  return {
    ...game,
    currentPuyo: rotatedPuyo,
    updatedAt: new Date(),
  }
}
