import { curry, every, filter, flatMap, flow, groupBy, map } from 'lodash/fp'

import type { Position } from './Position'
import { getAdjacentPositions, positionToString } from './Position'
import {
  type PuyoData,
  arePuyosSameColor,
  isPuyoColor,
  isPuyoColored,
  isPuyoEmpty,
} from './Puyo'

/**
 * 関数型フィールドデータ構造
 * 実装戦略：完全にイミュータブルで凍結されたデータ構造
 */
export interface FieldData {
  readonly width: number
  readonly height: number
  readonly grid: ReadonlyArray<ReadonlyArray<PuyoData | null>>
}

/**
 * 位置とぷよのペア
 */
export interface PuyoWithPosition {
  readonly puyo: PuyoData
  readonly position: Position
}

/**
 * フィールドの変更結果
 */
export interface FieldChangeResult {
  readonly field: FieldData
  readonly changedPositions: Position[]
  readonly success: boolean
  readonly reason?: string
}

// =============================================================================
// ファクトリ関数（純粋関数 + Object.freeze）
// =============================================================================

/**
 * 空のフィールドを作成する純粋関数
 * @param width フィールドの幅
 * @param height フィールドの高さ
 * @returns 完全に凍結された不変フィールド
 */
export const createEmptyField = (width = 6, height = 12): FieldData => {
  validateFieldDimensions(width, height)

  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null),
  )

  const field = Object.freeze({
    width,
    height,
    grid: Object.freeze(grid.map((row) => Object.freeze(row))),
  })

  return field
}

/**
 * 既存のグリッドから不変フィールドを作成する純粋関数
 */
export const createFieldFromGrid = (
  grid: ReadonlyArray<ReadonlyArray<PuyoData | null>>,
): FieldData => {
  const width = grid[0]?.length ?? 0
  const height = grid.length

  validateFieldDimensions(width, height)

  return Object.freeze({
    width,
    height,
    grid: Object.freeze(grid.map((row) => Object.freeze([...row]))),
  })
}

/**
 * パターンからフィールドを作成する（テスト用）
 * @param pattern 文字列パターン配列（'R'=赤、'B'=青、'.'=空など）
 */
export const createFieldFromPattern = (pattern: string[][]): FieldData => {
  const colorMap: Record<string, PuyoData['color']> = {
    R: 'red',
    B: 'blue',
    G: 'green',
    Y: 'yellow',
    P: 'purple',
    '.': null,
  }

  const grid = pattern.map((row, y) =>
    row.map((char, x) => {
      const color = colorMap[char]
      return color ? { color, position: { x, y } } : null
    }),
  )

  return createFieldFromGrid(grid)
}

// =============================================================================
// バリデーション関数（純粋関数）
// =============================================================================

/**
 * フィールドの寸法を検証
 */
const validateFieldDimensions = (width: number, height: number): void => {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new Error('Field dimensions must be integers')
  }
  if (width <= 0 || height <= 0) {
    throw new Error('Field dimensions must be positive')
  }
  if (width > 20 || height > 30) {
    throw new Error('Field dimensions too large (max 20x30)')
  }
}

// =============================================================================
// アクセサ関数（純粋関数 + カリー化）
// =============================================================================

/**
 * フィールドの指定位置のぷよを取得する
 */
export const getPuyoAt = curry(
  (position: Position, field: FieldData): PuyoData | null => {
    if (!isValidPosition(position, field)) {
      return null
    }
    return field.grid[position.y][position.x]
  },
)

/**
 * 安全にぷよを取得する（範囲外はnullを返す）
 */
export const safeGetPuyoAt = curry(
  (position: Position, field: FieldData): PuyoData | null => {
    return isValidPosition(position, field)
      ? field.grid[position.y][position.x]
      : null
  },
)

// =============================================================================
// 変更関数（純粋関数 + カリー化）
// =============================================================================

/**
 * フィールドの指定位置にぷよを配置した新しいフィールドを返す
 */
export const placePuyoAt = curry(
  (position: Position, puyo: PuyoData, field: FieldData): FieldData => {
    if (!isValidPosition(position, field)) {
      throw new Error(`Invalid position: (${position.x}, ${position.y})`)
    }

    if (!isEmptyAt(position, field)) {
      throw new Error(
        `Position already occupied: (${position.x}, ${position.y})`,
      )
    }

    const newGrid = field.grid.map((row, y) =>
      row.map((cell, x) =>
        x === position.x && y === position.y ? puyo : cell,
      ),
    )

    return createFieldFromGrid(newGrid)
  },
)

/**
 * 強制的にぷよを配置（上書き可能）
 */
export const forcePlacePuyoAt = curry(
  (position: Position, puyo: PuyoData | null, field: FieldData): FieldData => {
    if (!isValidPosition(position, field)) {
      return field
    }

    const newGrid = field.grid.map((row, y) =>
      row.map((cell, x) =>
        x === position.x && y === position.y ? puyo : cell,
      ),
    )

    return createFieldFromGrid(newGrid)
  },
)

/**
 * フィールドの指定位置からぷよを削除した新しいフィールドを返す
 */
export const removePuyoAt = curry(
  (position: Position, field: FieldData): FieldData => {
    if (!isValidPosition(position, field)) {
      return field
    }

    const newGrid = field.grid.map((row, y) =>
      row.map((cell, x) =>
        x === position.x && y === position.y ? null : cell,
      ),
    )

    return createFieldFromGrid(newGrid)
  },
)

/**
 * 複数の位置からぷよを削除した新しいフィールドを返す
 */
export const removePuyosAt = curry(
  (positions: Position[], field: FieldData): FieldData => {
    const positionSet = new Set(positions.map(positionToString))

    const newGrid = field.grid.map((row, y) =>
      row.map((cell, x) =>
        positionSet.has(positionToString({ x, y })) ? null : cell,
      ),
    )

    return createFieldFromGrid(newGrid)
  },
)

// =============================================================================
// 述語関数（カリー化）
// =============================================================================

/**
 * 指定位置が空かどうかを判定する
 */
export const isEmptyAt = curry(
  (position: Position, field: FieldData): boolean => {
    if (!isValidPosition(position, field)) {
      return false
    }
    return field.grid[position.y][position.x] === null
  },
)

/**
 * 指定位置にぷよがあるかどうかを判定する
 */
export const hasColoredPuyoAt = curry(
  (position: Position, field: FieldData): boolean => {
    const puyo = getPuyoAt(position, field)
    return puyo !== null && isPuyoColored(puyo)
  },
)

/**
 * 指定位置に特定の色のぷよがあるかどうかを判定する
 */
export const hasColorAt = curry(
  (color: PuyoData['color'], position: Position, field: FieldData): boolean => {
    const puyo = getPuyoAt(position, field)
    return puyo !== null && isPuyoColor(color, puyo)
  },
)

/**
 * 指定位置が有効かどうかを判定する
 */
export const isValidPosition = curry(
  (position: Position, field: FieldData): boolean => {
    return (
      position.x >= 0 &&
      position.x < field.width &&
      position.y >= 0 &&
      position.y < field.height
    )
  },
)

/**
 * フィールドが完全に空かどうかを判定する
 */
export const isFieldEmpty = (field: FieldData): boolean => {
  return every((row: ReadonlyArray<PuyoData | null>) =>
    every((cell: PuyoData | null) => cell === null)(row),
  )(field.grid)
}

/**
 * フィールドが満杯かどうかを判定する
 */
export const isFieldFull = (field: FieldData): boolean => {
  return every((row: ReadonlyArray<PuyoData | null>) =>
    every((cell: PuyoData | null) => cell !== null)(row),
  )(field.grid)
}

/**
 * 指定の行が満杯かどうかを判定する
 */
export const isRowFull = curry(
  (rowIndex: number, field: FieldData): boolean => {
    if (rowIndex < 0 || rowIndex >= field.height) {
      return false
    }
    return every((cell: PuyoData | null) => cell !== null)(field.grid[rowIndex])
  },
)

/**
 * 指定の列が満杯かどうかを判定する
 */
export const isColumnFull = curry(
  (columnIndex: number, field: FieldData): boolean => {
    if (columnIndex < 0 || columnIndex >= field.width) {
      return false
    }
    return every(
      (row: ReadonlyArray<PuyoData | null>) => row[columnIndex] !== null,
    )(field.grid)
  },
)

// =============================================================================
// 検索・抽出関数（関数合成とlodash/fp活用）
// =============================================================================

/**
 * フィールドの全ての位置を取得する
 */
export const getAllPositions = (field: FieldData): Position[] => {
  const positions: Position[] = []
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      positions.push({ x, y })
    }
  }
  return positions
}

/**
 * 関数型スタイルで全ての位置を取得する
 */
export const getAllPositionsFp = (field: FieldData): Position[] => {
  return flatMap((y: number) =>
    map((x: number) => ({ x, y }))(
      Array.from({ length: field.width }, (_, x) => x),
    ),
  )(Array.from({ length: field.height }, (_, y) => y))
}

/**
 * 空の位置のみを取得する
 */
export const getEmptyPositions = (field: FieldData): Position[] => {
  return filter((pos: Position) => isEmptyAt(pos, field))(
    getAllPositions(field),
  )
}

/**
 * 色付きぷよがある位置のみを取得する
 */
export const getColoredPositions = (field: FieldData): Position[] => {
  return filter((pos: Position) => hasColoredPuyoAt(pos, field))(
    getAllPositions(field),
  )
}

/**
 * フィールドの全てのぷよとその位置を取得する
 */
export const getAllPuyosWithPositions = (
  field: FieldData,
): PuyoWithPosition[] => {
  const puyos: PuyoWithPosition[] = []
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const puyo = field.grid[y][x]
      if (puyo) {
        puyos.push({ puyo, position: { x, y } })
      }
    }
  }
  return puyos
}

/**
 * 関数型スタイルで色付きぷよとその位置を取得する
 */
export const getColoredPuyosWithPositions = (
  field: FieldData,
): PuyoWithPosition[] => {
  return flow(
    getAllPositions,
    map((position: Position) => ({
      position,
      puyo: getPuyoAt(position, field),
    })),
    filter(({ puyo }) => puyo !== null && isPuyoColored(puyo)),
    map(({ position, puyo }) => ({ position, puyo: puyo! })),
  )(field)
}

/**
 * 特定の色のぷよとその位置を取得する
 */
export const getPuyosOfColor = curry(
  (color: PuyoData['color'], field: FieldData): PuyoWithPosition[] => {
    return flow(
      getColoredPuyosWithPositions,
      filter(({ puyo }) => isPuyoColor(color, puyo)),
    )(field)
  },
)

// =============================================================================
// 高階関数とフィルタリング
// =============================================================================

/**
 * 述語関数に一致するぷよを削除した新しいフィールドを返す
 */
export const removePuyosWhere = curry(
  (
    predicate: (puyo: PuyoData, position: Position) => boolean,
    field: FieldData,
  ): FieldData => {
    const newGrid = field.grid.map((row, y) =>
      row.map((cell, x) => {
        const position = { x, y }
        return cell && predicate(cell, position) ? null : cell
      }),
    )

    return createFieldFromGrid(newGrid)
  },
)

/**
 * 特定の色のぷよをすべて削除した新しいフィールドを返す
 */
export const removeAllPuyosOfColor = curry(
  (color: PuyoData['color'], field: FieldData): FieldData => {
    return removePuyosWhere((puyo) => isPuyoColor(color, puyo), field)
  },
)

/**
 * フィールドにフィルタ関数を適用した新しいフィールドを返す
 */
export const filterField = curry(
  (
    predicate: (puyo: PuyoData | null, position: Position) => boolean,
    field: FieldData,
  ): FieldData => {
    const newGrid = field.grid.map((row, y) =>
      row.map((cell, x) => {
        const position = { x, y }
        return predicate(cell, position) ? cell : null
      }),
    )

    return createFieldFromGrid(newGrid)
  },
)

// =============================================================================
// 関数合成によるデータ変換パイプライン
// =============================================================================

/**
 * フィールドをパターン文字列に変換する（デバッグ用）
 */
export const fieldToPatternString = (field: FieldData): string => {
  const charMap = {
    red: 'R',
    blue: 'B',
    green: 'G',
    yellow: 'Y',
    purple: 'P',
  }

  return field.grid
    .map((row) =>
      row
        .map((cell) =>
          cell ? charMap[cell.color as keyof typeof charMap] || '?' : '.',
        )
        .join(''),
    )
    .join('\n')
}

/**
 * フィールドの統計情報を取得する
 */
export const getFieldStatistics = (field: FieldData) => {
  const coloredPuyos = getColoredPuyosWithPositions(field)
  const byColor = groupBy(({ puyo }: PuyoWithPosition) => puyo.color)(
    coloredPuyos,
  )

  return Object.freeze({
    totalPuyos: coloredPuyos.length,
    emptySpaces: field.width * field.height - coloredPuyos.length,
    colorCounts: Object.fromEntries(
      Object.entries(byColor).map(([color, group]) => [color, group.length]),
    ),
    isEmpty: coloredPuyos.length === 0,
    isFull: coloredPuyos.length === field.width * field.height,
  })
}

/**
 * 隣接する同色ぷよのグループを検索する（連鎖検出用）
 */
export const findConnectedPuyos = curry(
  (startPosition: Position, field: FieldData): PuyoWithPosition[] => {
    const startPuyo = getPuyoAt(startPosition, field)
    if (!startPuyo || isPuyoEmpty(startPuyo)) {
      return []
    }

    const visited = new Set<string>()
    const connected: PuyoWithPosition[] = []
    const stack = [startPosition]

    while (stack.length > 0) {
      const currentPos = stack.pop()!
      const posKey = positionToString(currentPos)

      if (visited.has(posKey)) continue

      const currentPuyo = getPuyoAt(currentPos, field)
      if (!currentPuyo || !arePuyosSameColor(startPuyo, currentPuyo)) continue

      visited.add(posKey)
      connected.push({ puyo: currentPuyo, position: currentPos })

      // 隣接位置をスタックに追加
      const adjacentPositions = getAdjacentPositions(currentPos).filter(
        (pos) =>
          isValidPosition(pos, field) && !visited.has(positionToString(pos)),
      )

      stack.push(...adjacentPositions)
    }

    return connected
  },
)

/**
 * 4個以上の連結したぷよグループを検索する
 */
export const findErasableGroups = (field: FieldData): PuyoWithPosition[][] => {
  const visited = new Set<string>()
  const erasableGroups: PuyoWithPosition[][] = []

  getAllPositions(field).forEach((position) => {
    const posKey = positionToString(position)
    if (visited.has(posKey)) return

    const connected = findConnectedPuyos(position, field)
    if (connected.length >= 4) {
      erasableGroups.push(connected)
      connected.forEach(({ position }) => {
        visited.add(positionToString(position))
      })
    } else {
      connected.forEach(({ position }) => {
        visited.add(positionToString(position))
      })
    }
  })

  return erasableGroups
}

// =============================================================================
// ユーティリティ関数
// =============================================================================

/**
 * フィールドをディープクローンする
 */
export const cloneField = (field: FieldData): FieldData =>
  createFieldFromGrid(field.grid.map((row) => [...row]))

/**
 * フィールドの内容を比較する
 */
export const areFieldsEqual = curry(
  (field1: FieldData, field2: FieldData): boolean => {
    if (field1.width !== field2.width || field1.height !== field2.height) {
      return false
    }

    return every((y: number) =>
      every((x: number) => {
        const puyo1 = field1.grid[y][x]
        const puyo2 = field2.grid[y][x]
        if (puyo1 === null && puyo2 === null) return true
        if (puyo1 === null || puyo2 === null) return false
        return puyo1.color === puyo2.color
      })(Array.from({ length: field1.width }, (_, x) => x)),
    )(Array.from({ length: field1.height }, (_, y) => y))
  },
)
