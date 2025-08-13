import type { Game } from '../../domain/models/Game'
import type { Puyo } from '../../domain/models/Puyo'

interface GameBoardProps {
  game: Game
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

  const getCellPuyo = (x: number, y: number) => {
    const fieldPuyo = field.getPuyo(x, y)

    // PuyoPairからの表示チェック
    let currentPuyo = null
    let isCurrentPuyo = false

    if (game.currentPuyoPair) {
      // メインぷよの位置チェック
      if (
        game.currentPuyoPair.main.position.x === x &&
        game.currentPuyoPair.main.position.y === y
      ) {
        currentPuyo = game.currentPuyoPair.main
        isCurrentPuyo = true
      }
      // サブぷよの位置チェック
      else if (
        game.currentPuyoPair.sub.position.x === x &&
        game.currentPuyoPair.sub.position.y === y
      ) {
        currentPuyo = game.currentPuyoPair.sub
        isCurrentPuyo = true
      }
    }

    // 古いcurrentPuyoとの後方互換性（一応残しておく）
    if (
      !isCurrentPuyo &&
      game.currentPuyo &&
      game.currentPuyo.position.x === x &&
      game.currentPuyo.position.y === y
    ) {
      currentPuyo = game.currentPuyo
      isCurrentPuyo = true
    }

    return {
      puyo: isCurrentPuyo ? currentPuyo : fieldPuyo,
      isCurrentPuyo,
    }
  }

  const buildCellClasses = (puyo: Puyo | null, isCurrentPuyo: boolean) => {
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

    for (let y = 0; y < field.getHeight(); y++) {
      const cells = []
      for (let x = 0; x < field.getWidth(); x++) {
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
