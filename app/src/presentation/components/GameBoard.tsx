import type {
  GameViewModel,
  PuyoViewModel,
} from '../../application/viewmodels/GameViewModel'

interface GameBoardProps {
  game: GameViewModel
}

export const GameBoard = ({ game }: GameBoardProps) => {
  const field = game.field
  const getPuyoColorClasses = (color: string): string => {
    switch (color) {
      case 'red':
        return 'bg-red-500 shadow-lg shadow-red-500/50'
      case 'blue':
        return 'bg-blue-500 shadow-lg shadow-blue-500/50'
      case 'green':
        return 'bg-green-500 shadow-lg shadow-green-500/50'
      case 'yellow':
        return 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
      case 'purple':
        return 'bg-purple-500 shadow-lg shadow-purple-500/50'
      default:
        return 'bg-gray-500'
    }
  }

  // ヘルパー関数: PuyoPairから現在位置のぷよを取得
  const getCurrentPuyoFromPair = (x: number, y: number) => {
    if (!game.currentPuyoPair) {
      return { puyo: null, isCurrentPuyo: false }
    }

    // メインぷよの位置チェック
    if (
      game.currentPuyoPair.main.x === x &&
      game.currentPuyoPair.main.y === y
    ) {
      return { puyo: game.currentPuyoPair.main, isCurrentPuyo: true }
    }

    // サブぷよの位置チェック
    if (game.currentPuyoPair.sub.x === x && game.currentPuyoPair.sub.y === y) {
      return { puyo: game.currentPuyoPair.sub, isCurrentPuyo: true }
    }

    return { puyo: null, isCurrentPuyo: false }
  }

  // ヘルパー関数: 後方互換性のためのcurrentPuyoチェック（ViewModelには存在しない）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCurrentPuyoLegacy = (_x: number, _y: number) => {
    // ViewModelではcurrentPuyoは存在しないので、常にnullを返す
    return { puyo: null, isCurrentPuyo: false }
  }

  const getCellPuyo = (x: number, y: number) => {
    // ViewModelのfield.cellsから直接ぷよを取得
    const fieldPuyo =
      field.cells[y] && field.cells[y][x] ? field.cells[y][x] : null

    // PuyoPairからの表示チェック
    const pairResult = getCurrentPuyoFromPair(x, y)
    if (pairResult.isCurrentPuyo) {
      return pairResult
    }

    // 古いcurrentPuyoとの後方互換性
    const legacyResult = getCurrentPuyoLegacy(x, y)
    if (legacyResult.isCurrentPuyo) {
      return legacyResult
    }

    return {
      puyo: fieldPuyo,
      isCurrentPuyo: false,
    }
  }

  const buildCellClasses = (
    puyo: PuyoViewModel | null,
    isCurrentPuyo: boolean,
  ) => {
    const cellClasses = [
      'cell',
      'w-8 h-8 border border-gray-300/30 flex items-center justify-center rounded-sm transition-all duration-200',
    ]

    if (puyo && puyo.color) {
      cellClasses.push(`puyo-${puyo.color}`)
      cellClasses.push(getPuyoColorClasses(puyo.color))

      if (isCurrentPuyo) {
        cellClasses.push('opacity-80 ring-2 ring-white/50')
      }
    } else {
      cellClasses.push('cell-empty', 'bg-gray-800/50 hover:bg-gray-700/50')
    }

    return cellClasses
  }

  const renderCell = (x: number, y: number) => {
    const { puyo, isCurrentPuyo } = getCellPuyo(x, y)
    const cellClasses = buildCellClasses(puyo, isCurrentPuyo)

    return (
      <div
        key={`${x}-${y}`}
        data-testid={`cell-${x}-${y}`}
        className={cellClasses.join(' ')}
      >
        {puyo && puyo.color && (
          <div className="w-6 h-6 rounded-full bg-white/20 shadow-inner"></div>
        )}
      </div>
    )
  }

  const renderField = () => {
    const rows = []

    for (let y = 0; y < field.height; y++) {
      const cells = []
      for (let x = 0; x < field.width; x++) {
        cells.push(renderCell(x, y))
      }
      rows.push(
        <div key={y} className="field-row flex">
          {cells}
        </div>,
      )
    }

    return rows
  }

  return (
    <div
      data-testid="game-board"
      className="game-board flex flex-col items-center"
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white text-center">
          ゲームフィールド
        </h2>
      </div>
      <div
        data-testid="game-field"
        className="game-field bg-gray-900/50 p-4 rounded-lg border-2 border-gray-600/50 shadow-xl"
      >
        {renderField()}
      </div>
    </div>
  )
}
