import { useRef, useEffect } from 'react'
import { Game } from '../game/Game'
import { Config } from '../game/Config'
import { PuyoImage } from '../game/PuyoImage'
import { Stage } from '../game/Stage'
import { Player } from '../game/Player'
import { Score } from '../game/Score'
import { useKeyboard } from '../hooks/useKeyboard'

interface GameCanvasProps {
  width: number
  height: number
}

/**
 * GameCanvas コンポーネント
 * ゲーム画面を描画するための Canvas 要素を提供
 */
export function GameCanvas({ width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef<Player | null>(null)
  const keys = useKeyboard()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ゲームの初期化
    const cellSize = 32
    const cols = 6
    const rows = 12

    const config = new Config(cellSize, cols, rows)
    const puyoImage = new PuyoImage(config)
    const stage = new Stage(config)
    const player = new Player(config, puyoImage, stage)
    const score = new Score()

    // Player インスタンスを ref に保存
    playerRef.current = player

    const game = new Game(canvas, config, puyoImage, stage, player, score)

    // ゲーム開始
    game.start()

    // クリーンアップ：コンポーネントのアンマウント時にゲームを停止
    return () => {
      game.stop()
      playerRef.current = null
    }
  }, [])

  // キーボード入力を処理
  useEffect(() => {
    const player = playerRef.current
    if (!player) return

    const keyActions = [
      { condition: keys.left, action: () => player.moveLeft() },
      { condition: keys.right, action: () => player.moveRight() },
      { condition: keys.up, action: () => player.rotateClockwise() },
      { condition: keys.down, action: () => player.moveDown() }
    ]

    keyActions.forEach(({ condition, action }) => condition && action())
  }, [keys])

  return <canvas ref={canvasRef} className="game-canvas" width={width} height={height} role="img" />
}
