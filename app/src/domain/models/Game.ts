import { Field } from './Field'
import type { Puyo } from './Puyo'

export type GameState = 'ready' | 'playing' | 'paused' | 'gameOver'

export interface Game {
  readonly id: string
  readonly state: GameState
  readonly field: Field
  readonly score: number
  readonly level: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const createGame = (): Game => ({
  id: crypto.randomUUID(),
  state: 'ready',
  field: new Field(),
  score: 0,
  level: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
})

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
