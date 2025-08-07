import React from 'react'
import { Game, GameState } from '../domain/Game'
import { Puyo } from '../domain/Puyo'
import './GameBoard.css'

interface GameBoardProps {
  game: Game
}

export const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  const getFixedPuyoStyle = (puyo: Puyo | null) => {
    if (puyo) {
      return { puyoClass: 'puyo', puyoColor: puyo.color }
    }
    return null
  }

  const getCurrentPairStyle = (x: number, y: number) => {
    if (!game.currentPair || game.state !== GameState.PLAYING) {
      return null
    }

    const mainPos = game.currentPair.getMainPosition()
    const subPos = game.currentPair.getSubPosition()

    if (x === mainPos.x && y === mainPos.y) {
      return { puyoClass: 'puyo', puyoColor: game.currentPair.main.color }
    } else if (x === subPos.x && y === subPos.y) {
      return { puyoClass: 'puyo', puyoColor: game.currentPair.sub.color }
    }

    return null
  }

  const getCellStyle = (x: number, y: number) => {
    const puyo = game.field.getPuyo(x, y)

    // フィールドに固定されたぷよを表示
    const fixedStyle = getFixedPuyoStyle(puyo)
    if (fixedStyle) {
      return fixedStyle
    }

    // 現在のぷよペアを表示
    const currentStyle = getCurrentPairStyle(x, y)
    if (currentStyle) {
      return currentStyle
    }

    return { puyoClass: '', puyoColor: '' }
  }

  const renderField = () => {
    const cells = []

    // 隠しライン（y < 2）は表示しない、見えるフィールド部分のみ表示
    const visibleStartY = 2
    const visibleHeight = 14 // y=2からy=15まで（14行）を表示

    for (let y = visibleStartY; y < visibleStartY + visibleHeight; y++) {
      for (let x = 0; x < game.field.width; x++) {
        const { puyoClass, puyoColor } = getCellStyle(x, y)

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
        return '' // Playing表示を削除
      case GameState.GAME_OVER:
        return 'Game Over'
      default:
        return ''
    }
  }

  return (
    <div data-testid="game-board" className="game-board">
      {getGameStateText() && (
        <div className="game-info">
          <div className="game-status">
            <span>{getGameStateText()}</span>
          </div>
        </div>
      )}
      <div className="field">{renderField()}</div>
    </div>
  )
}

export default GameBoard
