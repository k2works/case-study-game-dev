import type { Field } from '../../domain/models/Field'

interface GameBoardProps {
  field: Field
}

export const GameBoard = ({ field }: GameBoardProps) => {
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

  const renderCell = (x: number, y: number) => {
    const puyo = field.getPuyo(x, y)
    const cellClasses = [
      'cell',
      'w-8 h-8 border border-gray-300/30 flex items-center justify-center rounded-sm transition-all duration-200',
    ]

    if (puyo && puyo.color) {
      cellClasses.push(`puyo-${puyo.color}`)
      cellClasses.push(getPuyoColorClasses(puyo.color))
    } else {
      cellClasses.push('cell-empty', 'bg-gray-800/50 hover:bg-gray-700/50')
    }

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
