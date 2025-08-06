import React from 'react'
import { Game, GameState } from '../domain/Game'
import './GameBoard.css'

interface GameBoardProps {
  game: Game
}

export const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  const renderField = () => {
    const cells = []

    for (let y = 0; y < game.field.height; y++) {
      for (let x = 0; x < game.field.width; x++) {
        const puyo = game.field.getPuyo(x, y)
        let puyoClass = ''
        let puyoColor = ''

        // フィールドに固定されたぷよを表示
        if (puyo) {
          puyoClass = 'puyo'
          puyoColor = puyo.color
        }

        // 現在のぷよペアを表示
        if (game.currentPair && game.state === GameState.PLAYING) {
          const mainPos = game.currentPair.getMainPosition()
          const subPos = game.currentPair.getSubPosition()

          if (x === mainPos.x && y === mainPos.y) {
            puyoClass = 'puyo'
            puyoColor = game.currentPair.main.color
          } else if (x === subPos.x && y === subPos.y) {
            puyoClass = 'puyo'
            puyoColor = game.currentPair.sub.color
          }
        }

        cells.push(
          <div
            key={`${x}-${y}`}
            data-testid={`cell-${x}-${y}`}
            className={`cell ${puyoClass} ${puyoColor}`}
          />
        )
      }
    }

    return cells
  }

  const getGameStateText = () => {
    switch (game.state) {
      case GameState.READY:
        return 'Ready'
      case GameState.PLAYING:
        return 'Playing'
      case GameState.GAME_OVER:
        return 'Game Over'
      default:
        return ''
    }
  }

  return (
    <div data-testid="game-board" className="game-board">
      <div className="game-status">
        <span>{getGameStateText()}</span>
        <span>Score: {game.score}</span>
      </div>
      <div className="field">{renderField()}</div>
    </div>
  )
}

export default GameBoard
