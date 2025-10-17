import { useState, useCallback, useEffect, useRef } from 'react'
import { Config } from '../models/Config'
import { PuyoColor } from '../models/PuyoColor'
import { checkErasePuyo, erasePuyoFromGrid, fallPuyo } from '../utils/erasePuyo'

interface PuyoUnit {
  color: PuyoColor
  dx: number
  dy: number
}

export interface FallingPuyo {
  x: number
  y: number
  main: PuyoUnit
  sub: PuyoUnit
}

export interface GameState {
  grid: PuyoColor[][]
  fallingPuyo: FallingPuyo
  score: number
  chainCount: number
  isGameOver: boolean
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  drop: () => void
  restart: () => void
}

const createEmptyGrid = (rows: number, columns: number): PuyoColor[][] => {
  return Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(PuyoColor.EMPTY))
}

const getRandomColor = (): PuyoColor => {
  const colors = [PuyoColor.RED, PuyoColor.BLUE, PuyoColor.GREEN, PuyoColor.YELLOW]
  return colors[Math.floor(Math.random() * colors.length)]
}

const createRandomPuyo = (columns: number): FallingPuyo => {
  return {
    x: Math.floor(columns / 2),
    y: 1, // 子ぷよが画面内（y=0）になるように、軸ぷよをy=1から開始
    main: {
      color: getRandomColor(),
      dx: 0,
      dy: 0,
    },
    sub: {
      color: getRandomColor(),
      dx: 0,
      dy: -1,
    },
  }
}

// 指定位置にぷよが存在するかチェック
const isPositionOccupied = (
  grid: PuyoColor[][],
  y: number,
  x: number,
  rows: number,
  columns: number
): boolean => {
  // 範囲外はfalse
  if (y < 0 || y >= rows || x < 0 || x >= columns) {
    return false
  }
  // グリッドにぷよが存在するか
  return grid[y][x] !== PuyoColor.EMPTY
}

// 軸ぷよが配置可能かチェック
const canPlaceMainPuyo = (
  grid: PuyoColor[][],
  y: number,
  x: number,
  rows: number,
  columns: number
): boolean => {
  // プレイ領域は row 0 から rows-2 まで（rows-1 は床の下で使用されない）
  const playAreaBottom = rows - 2
  if (y < 0 || y > playAreaBottom || x < 0 || x >= columns) {
    return false
  }
  return !isPositionOccupied(grid, y, x, rows, columns)
}

// 子ぷよが配置可能かチェック
const canPlaceSubPuyo = (
  grid: PuyoColor[][],
  subY: number,
  subX: number,
  rows: number,
  columns: number
): boolean => {
  // 子ぷよが画面上部（y < 0）にある場合は許容（まだ画面外）
  if (subY < 0) {
    return subX >= 0 && subX < columns
  }

  // プレイ領域は row 0 から rows-2 まで（rows-1 は床の下で使用されない）
  const playAreaBottom = rows - 2

  // 子ぷよがプレイ領域を超えている、または左右範囲外の場合は配置不可
  if (subY > playAreaBottom || subX < 0 || subX >= columns) {
    return false
  }

  // 子ぷよの位置に既存のぷよがある場合は配置不可
  return !isPositionOccupied(grid, subY, subX, rows, columns)
}

// 落下中のぷよが指定位置に配置可能かチェック
const canPlacePuyo = (
  grid: PuyoColor[][],
  puyo: FallingPuyo,
  y: number,
  x: number,
  rows: number,
  columns: number
): boolean => {
  // 軸ぷよが配置可能かチェック
  if (!canPlaceMainPuyo(grid, y, x, rows, columns)) {
    return false
  }

  // 子ぷよの位置を計算
  const subY = y + puyo.sub.dy
  const subX = x + puyo.sub.dx

  // 子ぷよが配置可能かチェック
  return canPlaceSubPuyo(grid, subY, subX, rows, columns)
}

export const useGameState = (config: Config): GameState => {
  const [grid, setGrid] = useState(() => createEmptyGrid(config.stageRows, config.stageColumns))
  const [fallingPuyo, setFallingPuyo] = useState(() => createRandomPuyo(config.stageColumns))
  const [score, setScore] = useState(0)
  const [chainCount, setChainCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false) // 消去処理中フラグ
  const [isGameOver, setIsGameOver] = useState(false) // ゲームオーバーフラグ
  const gridRef = useRef(grid)

  // gridが更新されたらrefも更新
  useEffect(() => {
    gridRef.current = grid
  }, [grid])

  // プレイ領域内かチェック
  const isWithinPlayArea = useCallback(
    (y: number, x: number): boolean => {
      const playAreaBottom = config.stageRows - 2
      return y >= 0 && y <= playAreaBottom && x >= 0 && x < config.stageColumns
    },
    [config.stageRows, config.stageColumns]
  )

  // ぷよをグリッドに固定
  const fixPuyoToGrid = useCallback(
    (puyo: FallingPuyo, grid: PuyoColor[][]): PuyoColor[][] => {
      const newGrid = grid.map((row) => [...row])

      // 軸ぷよをプレイ領域内に配置
      if (isWithinPlayArea(puyo.y, puyo.x)) {
        newGrid[puyo.y][puyo.x] = puyo.main.color
      }

      // 子ぷよをプレイ領域内に配置
      const subX = puyo.x + puyo.sub.dx
      const subY = puyo.y + puyo.sub.dy
      if (isWithinPlayArea(subY, subX)) {
        newGrid[subY][subX] = puyo.sub.color
      }

      return newGrid
    },
    [config.stageColumns, isWithinPlayArea]
  )

  // 連鎖処理を実行（1連鎖目のみ処理、2連鎖目以降は呼び出し側で処理）
  const processChain = useCallback(
    (
      grid: PuyoColor[][]
    ): { grid: PuyoColor[][]; chainCount: number; score: number; hasMore: boolean } => {
      let currentGrid = grid
      let currentChain = 0
      let totalScore = 0

      // 1連鎖目のみ処理
      const eraseGroups = checkErasePuyo(currentGrid)

      if (eraseGroups.length > 0) {
        currentChain = 1

        // スコア計算（消去したぷよの数 × 連鎖倍率）
        const erasedCount = eraseGroups.reduce((sum, group) => sum + group.length, 0)
        const chainBonus = currentChain * 10
        totalScore = erasedCount * chainBonus

        // 消去実行
        currentGrid = erasePuyoFromGrid(currentGrid, eraseGroups)
      }

      // 消去の有無にかかわらず、常に重力を適用
      currentGrid = fallPuyo(currentGrid)

      // 2連鎖目以降があるかチェック
      const hasMore = checkErasePuyo(currentGrid).length > 0

      return { grid: currentGrid, chainCount: currentChain, score: totalScore, hasMore }
    },
    []
  )

  // 2連鎖目以降を再帰的に処理（瞬時に実行）
  const processContinuousChain = useCallback(
    (grid: PuyoColor[][], chainNumber: number, accumulatedScore: number): void => {
      const eraseGroups = checkErasePuyo(grid)

      if (eraseGroups.length === 0) {
        // 連鎖終了
        setFallingPuyo(createRandomPuyo(config.stageColumns))
        setIsProcessing(false)
        return
      }

      // 消去処理
      const erasedCount = eraseGroups.reduce((sum, group) => sum + group.length, 0)
      const chainBonus = chainNumber * 10
      const chainScore = erasedCount * chainBonus

      let currentGrid = erasePuyoFromGrid(grid, eraseGroups)
      currentGrid = fallPuyo(currentGrid)

      // 状態更新
      setGrid(currentGrid)
      setScore((prev) => prev + chainScore)
      setChainCount(chainNumber)

      // 次の連鎖を瞬時に処理
      processContinuousChain(currentGrid, chainNumber + 1, accumulatedScore + chainScore)
    },
    [config.stageColumns]
  )

  // ぷよをグリッドに固定して消去判定と連鎖処理
  const fixPuyoAndProcess = useCallback(
    (puyo: FallingPuyo) => {
      setIsProcessing(true) // 処理中フラグをON

      // グリッドにぷよを固定
      const fixedGrid = fixPuyoToGrid(puyo, gridRef.current)

      // ゲームオーバー判定（画面上部 y=0 にぷよが存在する場合）
      if (fixedGrid[0].some((cell) => cell !== PuyoColor.EMPTY)) {
        setIsGameOver(true)
        setIsProcessing(false)
        return
      }

      // 1連鎖目のみ処理
      const {
        grid: processedGrid,
        chainCount: currentChain,
        score: totalScore,
        hasMore,
      } = processChain(fixedGrid)

      // 状態更新
      setGrid(processedGrid)
      if (currentChain > 0) {
        setScore((prev) => prev + totalScore)
        setChainCount(currentChain)

        // 1連鎖目の後に短い遅延（300ms）
        setTimeout(() => {
          if (hasMore) {
            // 2連鎖目以降を瞬時に処理
            processContinuousChain(processedGrid, 2, totalScore)
          } else {
            // 連鎖なし、新しいぷよを生成
            setFallingPuyo(createRandomPuyo(config.stageColumns))
            setIsProcessing(false)
          }
        }, 300)
      } else {
        setChainCount(0)
        // 消去がない場合は即座に新しいぷよを生成
        setFallingPuyo(createRandomPuyo(config.stageColumns))
        setIsProcessing(false) // 処理完了
      }
    },
    [config.stageColumns, fixPuyoToGrid, processChain, processContinuousChain]
  )

  // 自動落下処理
  useEffect(() => {
    const fallInterval = setInterval(() => {
      // 消去処理中またはゲームオーバー時は自動落下をスキップ
      if (isProcessing || isGameOver) {
        return
      }

      setFallingPuyo((prev) => {
        const newY = prev.y + 1

        // 次の位置に配置可能かチェック（gridRefから最新のgridを取得）
        const canMove = canPlacePuyo(
          gridRef.current,
          prev,
          newY,
          prev.x,
          config.stageRows,
          config.stageColumns
        )

        if (!canMove) {
          // ぷよを固定して消去判定・連鎖処理
          fixPuyoAndProcess(prev)
          return prev // この値は使われない（fixPuyoAndProcessで新しいぷよが生成される）
        }

        return { ...prev, y: newY }
      })
    }, 1000) // 1秒ごとに落下

    return () => clearInterval(fallInterval)
  }, [config.stageRows, config.stageColumns, fixPuyoAndProcess, isProcessing, isGameOver])

  const moveLeft = useCallback(() => {
    if (isProcessing || isGameOver) return // 処理中またはゲームオーバー時は操作無効
    setFallingPuyo((prev) => {
      const newX = prev.x - 1
      const canMove = canPlacePuyo(
        gridRef.current,
        prev,
        prev.y,
        newX,
        config.stageRows,
        config.stageColumns
      )

      if (canMove) {
        return { ...prev, x: newX }
      }
      return prev
    })
  }, [config.stageRows, config.stageColumns, isProcessing, isGameOver])

  const moveRight = useCallback(() => {
    if (isProcessing || isGameOver) return // 処理中またはゲームオーバー時は操作無効
    setFallingPuyo((prev) => {
      const newX = prev.x + 1
      const canMove = canPlacePuyo(
        gridRef.current,
        prev,
        prev.y,
        newX,
        config.stageRows,
        config.stageColumns
      )

      if (canMove) {
        return { ...prev, x: newX }
      }
      return prev
    })
  }, [config.stageRows, config.stageColumns, isProcessing, isGameOver])

  const rotate = useCallback(() => {
    if (isProcessing || isGameOver) return // 処理中またはゲームオーバー時は操作無効
    setFallingPuyo((prev) => {
      // 時計回りに90度回転: (dx, dy) → (-dy, dx)
      const newDx = -prev.sub.dy || 0
      const newDy = prev.sub.dx || 0

      // 回転後のぷよを作成
      const rotatedPuyo: FallingPuyo = {
        ...prev,
        sub: {
          ...prev.sub,
          dx: newDx,
          dy: newDy,
        },
      }

      // 回転後の位置に配置可能かチェック
      const canRotate = canPlacePuyo(
        gridRef.current,
        rotatedPuyo,
        prev.y,
        prev.x,
        config.stageRows,
        config.stageColumns
      )

      if (canRotate) {
        return rotatedPuyo
      }

      // 壁キックを試みる（左右にずらして回転可能か試す）
      for (const offset of [-1, 1]) {
        const kickedX = prev.x + offset
        const canKick = canPlacePuyo(
          gridRef.current,
          rotatedPuyo,
          prev.y,
          kickedX,
          config.stageRows,
          config.stageColumns
        )

        if (canKick) {
          return {
            ...rotatedPuyo,
            x: kickedX,
          }
        }
      }

      return prev
    })
  }, [config.stageRows, config.stageColumns, isProcessing, isGameOver])

  const drop = useCallback(() => {
    if (isProcessing || isGameOver) return // 処理中またはゲームオーバー時は操作無効
    setFallingPuyo((prev) => {
      // 配置可能な最下位置を探す
      let newY = prev.y
      while (
        canPlacePuyo(gridRef.current, prev, newY + 1, prev.x, config.stageRows, config.stageColumns)
      ) {
        newY++
      }

      // ぷよを固定して消去判定・連鎖処理
      const droppedPuyo = {
        ...prev,
        y: newY,
      }
      fixPuyoAndProcess(droppedPuyo)

      return droppedPuyo // この値は使われない
    })
  }, [config.stageRows, config.stageColumns, fixPuyoAndProcess, isProcessing, isGameOver])

  const restart = useCallback(() => {
    // 全ての状態を初期化
    setGrid(createEmptyGrid(config.stageRows, config.stageColumns))
    setFallingPuyo(createRandomPuyo(config.stageColumns))
    setScore(0)
    setChainCount(0)
    setIsGameOver(false)
    setIsProcessing(false)
  }, [config.stageRows, config.stageColumns])

  return {
    grid,
    fallingPuyo,
    score,
    chainCount,
    isGameOver,
    moveLeft,
    moveRight,
    rotate,
    drop,
    restart,
  }
}
