import type { Field } from '../../domain/models/Field'

interface GameBoardProps {
  field: Field
}

export const GameBoard = ({ field }: GameBoardProps) => {
  const renderCell = (x: number, y: number) => {
    const puyo = field.getPuyo(x, y)
    const cellClasses = ['cell']

    if (puyo) {
      cellClasses.push(`puyo-${puyo.color}`)
    } else {
      cellClasses.push('cell-empty')
    }

    return (
      <div
        key={`${x}-${y}`}
        data-testid={`cell-${x}-${y}`}
        className={cellClasses.join(' ')}
      />
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
        <div key={y} className="field-row">
          {cells}
        </div>,
      )
    }

    return rows
  }

  return (
    <div data-testid="game-board" className="game-board">
      <div data-testid="game-field" className="game-field">
        {renderField()}
      </div>
    </div>
  )
}
