import { PuyoColor } from '../models/PuyoColor'

export interface Position {
  x: number
  y: number
}

/**
 * 指定位置から接続された同じ色のぷよを再帰的に探索する
 * @param grid ぷよグリッド
 * @param x 探索開始位置のx座標
 * @param y 探索開始位置のy座標
 * @returns 接続されたぷよの位置の配列
 */
export const findConnectedPuyo = (grid: PuyoColor[][], x: number, y: number): Position[] => {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  // プレイ領域は row 0 から rows-2 まで（rows-1 は床の下で使用されない）
  const playAreaBottom = rows - 2

  // グリッドの範囲外、またはプレイ領域外
  if (y < 0 || y > playAreaBottom || x < 0 || x >= columns) {
    return []
  }

  const targetColor = grid[y][x]

  // 空のマス
  if (targetColor === PuyoColor.EMPTY) {
    return []
  }

  const visited = new Set<string>()
  const connected: Position[] = []

  const explore = (currentX: number, currentY: number) => {
    // 範囲外チェック（プレイ領域のみ）
    if (currentY < 0 || currentY > playAreaBottom || currentX < 0 || currentX >= columns) {
      return
    }

    // 訪問済みチェック
    const key = `${currentX},${currentY}`
    if (visited.has(key)) {
      return
    }

    // 色が異なる、または空のマス
    if (grid[currentY][currentX] !== targetColor) {
      return
    }

    // 訪問済みとしてマーク
    visited.add(key)
    connected.push({ x: currentX, y: currentY })

    // 上下左右を再帰的に探索
    explore(currentX, currentY - 1) // 上
    explore(currentX, currentY + 1) // 下
    explore(currentX - 1, currentY) // 左
    explore(currentX + 1, currentY) // 右
  }

  explore(x, y)

  return connected
}

/**
 * グリッド全体をスキャンして4つ以上つながったぷよのグループを検出する
 * @param grid ぷよグリッド
 * @returns 消去対象のぷよグループの配列
 */
export const checkErasePuyo = (grid: PuyoColor[][]): Position[][] => {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const visited = new Set<string>()
  const eraseGroups: Position[][] = []

  // プレイ領域は row 0 から rows-2 まで（rows-1 は床の下で使用されない）
  const playAreaBottom = rows - 2

  for (let y = 0; y <= playAreaBottom; y++) {
    for (let x = 0; x < columns; x++) {
      const key = `${x},${y}`

      // 既に訪問済み、または空のマス
      if (visited.has(key) || grid[y][x] === PuyoColor.EMPTY) {
        continue
      }

      // 接続されたぷよを探索
      const connected = findConnectedPuyo(grid, x, y)

      // 訪問済みとしてマーク
      connected.forEach((pos) => {
        visited.add(`${pos.x},${pos.y}`)
      })

      // 4つ以上つながっている場合は消去対象
      if (connected.length >= 4) {
        eraseGroups.push(connected)
      }
    }
  }

  return eraseGroups
}

/**
 * 指定されたぷよグループをグリッドから消去する
 * @param grid ぷよグリッド
 * @param eraseGroups 消去対象のぷよグループ
 * @returns 消去後の新しいグリッド
 */
export const erasePuyoFromGrid = (
  grid: PuyoColor[][],
  eraseGroups: Position[][]
): PuyoColor[][] => {
  const newGrid = grid.map((row) => [...row])

  eraseGroups.forEach((group) => {
    group.forEach((pos) => {
      newGrid[pos.y][pos.x] = PuyoColor.EMPTY
    })
  })

  return newGrid
}

/**
 * 消去後にぷよを落下させる
 * @param grid ぷよグリッド
 * @returns 落下処理後の新しいグリッド
 */
export const fallPuyo = (grid: PuyoColor[][]): PuyoColor[][] => {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const newGrid = grid.map((row) => [...row])

  // 下から上に向かって各列を処理
  // ぷよぷよゲームでは、実際のプレイ領域は row 0 から rows-2 まで
  // 最下行（rows-1）は使用されない
  const playAreaBottom = rows - 2

  for (let x = 0; x < columns; x++) {
    let writeY = playAreaBottom // 書き込み位置（プレイ領域の最下行から）

    // プレイ領域の下から上にスキャンして、ぷよを詰める
    for (let y = playAreaBottom; y >= 0; y--) {
      if (newGrid[y][x] !== PuyoColor.EMPTY) {
        if (y !== writeY) {
          newGrid[writeY][x] = newGrid[y][x]
          newGrid[y][x] = PuyoColor.EMPTY
        }
        writeY--
      }
    }
  }

  return newGrid
}
