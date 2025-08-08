import React, { useState, useEffect } from 'react'
import { Game, GameState } from '../domain/Game'
import { Puyo } from '../domain/Puyo'
import { AnimatedPuyo } from './AnimatedPuyo'
import './GameBoard.css'

interface GameBoardProps {
  game: Game
}

interface FallingPuyo {
  id: string
  color: string
  x: number
  y: number
  targetY: number
}

export const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  const [fallingPuyos, setFallingPuyos] = useState<FallingPuyo[]>([])
  const [previousPairPosition, setPreviousPairPosition] = useState<{
    mainX: number
    mainY: number
    subX: number
    subY: number
  } | null>(null)

  const processFallingAnimation = (
    mainPos: { x: number; y: number },
    subPos: { x: number; y: number },
    prevPosition: typeof previousPairPosition
  ) => {
    if (!prevPosition || !game.currentPair) return

    const newFallingPuyos: FallingPuyo[] = []

    if (mainPos.y > prevPosition.mainY) {
      newFallingPuyos.push({
        id: `main-${Date.now()}`,
        color: game.currentPair.main.color,
        x: mainPos.x,
        y: prevPosition.mainY,
        targetY: mainPos.y,
      })
    }

    if (subPos.y > prevPosition.subY) {
      newFallingPuyos.push({
        id: `sub-${Date.now()}`,
        color: game.currentPair.sub.color,
        x: subPos.x,
        y: prevPosition.subY,
        targetY: subPos.y,
      })
    }

    if (newFallingPuyos.length > 0) {
      setFallingPuyos((prev) => [...prev, ...newFallingPuyos])

      // アニメーション完了後にクリーンアップ
      setTimeout(() => {
        setFallingPuyos((prev) =>
          prev.filter((p) => !newFallingPuyos.some((np) => np.id === p.id))
        )
      }, 300)
    }
  }

  useEffect(() => {
    if (game.currentPair && game.state === GameState.PLAYING) {
      const mainPos = game.currentPair.getMainPosition()
      const subPos = game.currentPair.getSubPosition()

      if (
        previousPairPosition &&
        (mainPos.y > previousPairPosition.mainY ||
          subPos.y > previousPairPosition.subY)
      ) {
        processFallingAnimation(mainPos, subPos, previousPairPosition)
      }

      setPreviousPairPosition({
        mainX: mainPos.x,
        mainY: mainPos.y,
        subX: subPos.x,
        subY: subPos.y,
      })
    } else {
      setPreviousPairPosition(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.currentPair, game.state])

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

  const renderAnimatedPuyos = () => {
    return fallingPuyos.map((puyo) => (
      <AnimatedPuyo
        key={puyo.id}
        color={puyo.color}
        x={puyo.x}
        y={puyo.targetY - 2} // 表示オフセットを考慮
        isFalling={true}
        fallDuration={0.3}
      />
    ))
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
      <div className="field">
        {renderField()}
        <div className="animated-puyos-container">{renderAnimatedPuyos()}</div>
      </div>
    </div>
  )
}

export default GameBoard
