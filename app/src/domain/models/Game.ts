import { processChain } from '../services/ImmutableChainService'
import { FieldAdapter } from './FieldAdapter'
import { isEmptyAt } from './ImmutableField'
import { type PuyoColor, type PuyoData } from './Puyo'
import type { PuyoPair } from './PuyoPair'
import {
  createPuyoPair,
  movePuyoPair,
  rotatePuyoPairWithWallKick,
} from './PuyoPair'
import type { Score } from './Score'
import { createScore } from './Score'

export type GameState = 'ready' | 'playing' | 'paused' | 'gameOver'

export interface Game {
  readonly id: string
  readonly state: GameState
  readonly field: FieldAdapter
  readonly score: Score
  readonly level: number
  readonly currentPuyoPair: PuyoPair | null
  readonly nextPuyoPair: PuyoPair | null
  readonly currentPuyo: PuyoData | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export const createGame = (): Game => ({
  id: crypto.randomUUID(),
  state: 'ready',
  field: new FieldAdapter(),
  score: createScore(),
  level: 1,
  currentPuyoPair: null,
  nextPuyoPair: null,
  currentPuyo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const updateGameState = (game: Game, newState: GameState): Game => ({
  ...game,
  state: newState,
  updatedAt: new Date(),
})

export const pauseGame = (game: Game): Game => {
  if (game.state !== 'playing') {
    return game
  }
  return updateGameState(game, 'paused')
}

export const resumeGame = (game: Game): Game => {
  if (game.state !== 'paused') {
    return game
  }
  return updateGameState(game, 'playing')
}

export const resetGame = (): Game => {
  return createGame()
}

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

export const dropPuyo = (game: Game, puyo: PuyoData, column: number): Game => {
  // 指定した列でぷよを落下させる
  let dropPosition = game.field.getHeight() - 1

  // 下から上に向かって空きセルを探す
  for (let y = game.field.getHeight() - 1; y >= 0; y--) {
    if (!isEmptyAt({ x: column, y }, game.field.getImmutableField())) {
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

  // 新しいFieldAdapterを作成（イミュータブル）
  const newField = game.field.clone()

  // ぷよを配置
  newField.setPuyo(column, dropPosition, puyo)

  return {
    ...game,
    field: newField,
    updatedAt: new Date(),
  }
}

// ヘルパー関数: PuyoPairの衝突チェック
const checkPuyoPairCollision = (game: Game, puyoPair: PuyoPair): boolean => {
  const mainCollision =
    puyoPair.main.position.y >= 0 &&
    !isEmptyAt(puyoPair.main.position, game.field.getImmutableField())
  const subCollision =
    puyoPair.sub.position.y >= 0 &&
    !isEmptyAt(puyoPair.sub.position, game.field.getImmutableField())

  return mainCollision || subCollision
}

// ヘルパー関数: PuyoPairの境界チェック（垂直移動用）
const checkVerticalBounds = (
  puyoPair: PuyoPair,
  fieldHeight: number,
): boolean => {
  return (
    puyoPair.main.position.y >= fieldHeight ||
    puyoPair.sub.position.y >= fieldHeight
  )
}

// ぷよペア移動・回転ロジック
export const movePuyoLeft = (game: Game): Game => {
  if (!game.currentPuyoPair) {
    return game
  }

  const movedPair = movePuyoPair(game.currentPuyoPair, -1, 0)

  // 左端チェック
  if (movedPair.main.position.x < 0 || movedPair.sub.position.x < 0) {
    return game
  }

  // 衝突チェック
  if (checkPuyoPairCollision(game, movedPair)) {
    return game
  }

  return {
    ...game,
    currentPuyoPair: movedPair,
    updatedAt: new Date(),
  }
}

export const movePuyoRight = (game: Game): Game => {
  if (!game.currentPuyoPair) {
    return game
  }

  const movedPair = movePuyoPair(game.currentPuyoPair, 1, 0)

  // 右端チェック
  if (
    movedPair.main.position.x >= game.field.getWidth() ||
    movedPair.sub.position.x >= game.field.getWidth()
  ) {
    return game
  }

  // 衝突チェック
  if (checkPuyoPairCollision(game, movedPair)) {
    return game
  }

  return {
    ...game,
    currentPuyoPair: movedPair,
    updatedAt: new Date(),
  }
}

export const dropPuyoFast = (game: Game): Game => {
  if (!game.currentPuyoPair) {
    return game
  }

  const movedPair = movePuyoPair(game.currentPuyoPair, 0, 1)

  // 垃直境界チェック
  if (checkVerticalBounds(movedPair, game.field.getHeight())) {
    return game
  }

  // 衝突チェック
  if (checkPuyoPairCollision(game, movedPair)) {
    return game
  }

  return {
    ...game,
    currentPuyoPair: movedPair,
    updatedAt: new Date(),
  }
}

// 色の回転順序（将来の機能拡張用に保持）
// const colorRotationOrder: PuyoColor[] = [
//   'red',
//   'blue',
//   'green',
//   'yellow',
//   'purple',
// ]

export const rotatePuyo = (game: Game): Game => {
  if (!game.currentPuyoPair) {
    return game
  }

  // 壁蹴り機能付き回転を使用
  const rotatedPair = rotatePuyoPairWithWallKick(
    game.currentPuyoPair,
    'clockwise',
    game.field,
  )

  // 回転が成功した場合のみ更新（rotatePuyoPairWithWallKickは失敗時に元のpairを返す）
  if (rotatedPair === game.currentPuyoPair) {
    return game // 回転できなかった
  }

  return {
    ...game,
    currentPuyoPair: rotatedPair,
    updatedAt: new Date(),
  }
}

// ランダムな色を生成
const getRandomColor = (): PuyoColor => {
  const colors: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple']
  const randomIndex = Math.floor(Math.random() * colors.length)
  return colors[randomIndex]!
}

// ゲーム開始
export const startGame = (game: Game): Game => {
  if (game.state !== 'ready') {
    return game
  }

  // 初期ぷよペアを生成（フィールド上部中央に配置）
  const startX = Math.floor(game.field.getWidth() / 2)
  const startY = 0
  const mainColor = getRandomColor()
  const subColor = getRandomColor()
  const initialPuyoPair = createPuyoPair(mainColor, subColor, startX, startY)

  // 次のぷよペアも生成
  const nextMainColor = getRandomColor()
  const nextSubColor = getRandomColor()
  const nextPuyoPair = createPuyoPair(
    nextMainColor,
    nextSubColor,
    startX,
    startY,
  )

  return {
    ...game,
    state: 'playing',
    currentPuyoPair: initialPuyoPair,
    nextPuyoPair: nextPuyoPair,
    currentPuyo: null, // PuyoPairを使う場合はcurrentPuyoはnull
    updatedAt: new Date(),
  }
}

// 次のぷよペアを生成
export const spawnNextPuyoPair = (game: Game): Game => {
  const startX = Math.floor(game.field.getWidth() / 2)
  const startY = 0

  // 生成位置が空いているかチェック（メインのみ、サブは画面外なのでチェック不要）
  if (!isEmptyAt({ x: startX, y: startY }, game.field.getImmutableField())) {
    return {
      ...game,
      state: 'gameOver',
      currentPuyoPair: null,
      nextPuyoPair: null,
      currentPuyo: null,
      updatedAt: new Date(),
    }
  }

  // nextPuyoPairをcurrentPuyoPairに移動し、新しいnextPuyoPairを生成
  // nextPuyoPairがnullの場合は新しく生成
  const newCurrentPuyoPair =
    game.nextPuyoPair ||
    createPuyoPair(getRandomColor(), getRandomColor(), startX, startY)

  const nextMainColor = getRandomColor()
  const nextSubColor = getRandomColor()
  const newNextPuyoPair = createPuyoPair(
    nextMainColor,
    nextSubColor,
    startX,
    startY,
  )

  return {
    ...game,
    currentPuyoPair: newCurrentPuyoPair,
    nextPuyoPair: newNextPuyoPair,
    currentPuyo: null,
    updatedAt: new Date(),
  }
}

// 現在のぷよペアをフィールドに固定
export const placePuyoPair = (game: Game): Game => {
  if (!game.currentPuyoPair) {
    return game
  }

  const puyoPair = game.currentPuyoPair

  // 新しいフィールドを作成してぷよペアを配置
  const newField = game.field.clone()

  try {
    newField.setPuyo(
      puyoPair.main.position.x,
      puyoPair.main.position.y,
      puyoPair.main,
    )
    newField.setPuyo(
      puyoPair.sub.position.x,
      puyoPair.sub.position.y,
      puyoPair.sub,
    )
  } catch {
    // 配置できない場合はゲームオーバー
    return {
      ...game,
      state: 'gameOver',
      currentPuyoPair: null,
      currentPuyo: null,
      updatedAt: new Date(),
    }
  }

  // 連鎖処理を実行
  const chainResult = processChain(newField.getImmutableField())
  const fieldAfterChain = FieldAdapter.fromImmutableField(chainResult.field)

  // スコア更新
  const newScore = {
    current: game.score.current + chainResult.totalScore,
    multiplier: game.score.multiplier,
  }

  // 次のぷよペアを生成
  return spawnNextPuyoPair({
    ...game,
    field: fieldAfterChain,
    score: newScore,
    currentPuyoPair: null,
    currentPuyo: null,
    updatedAt: new Date(),
  })
}
