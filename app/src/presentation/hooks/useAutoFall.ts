import { useCallback, useEffect, useRef } from 'react'

import type { Game } from '../../domain/models/Game'
import {
  dropPuyoFast,
  placePuyoPair,
  spawnNextPuyoPair,
} from '../../domain/models/Game'

interface UseAutoFallProps {
  game: Game
  updateGame: (newGame: Game) => void
  fallSpeed?: number // ミリ秒単位での落下間隔
}

/**
 * 自動落下システムのカスタムフック
 * ぷよペアが時間とともに自動的に下に落ちるゲームロジックを管理
 */
export const useAutoFall = ({
  game,
  updateGame,
  fallSpeed = 1000,
}: UseAutoFallProps) => {
  const intervalRef = useRef<number | null>(null)

  // ぷよペアを1マス下に落下させる処理
  const handleAutoFall = useCallback(() => {
    if (game.state !== 'playing' || !game.currentPuyoPair) {
      return
    }

    // 下に移動を試行
    const fallenGame = dropPuyoFast(game)

    // 移動できた場合（位置が変わった場合）
    if (
      fallenGame.currentPuyoPair &&
      game.currentPuyoPair &&
      fallenGame.currentPuyoPair.main.position.y >
        game.currentPuyoPair.main.position.y
    ) {
      updateGame(fallenGame)
      return
    }

    // 移動できなかった場合（着地した場合）
    // 現在のぷよペアをフィールドに固定し、次のペアを生成
    const placedGame = placePuyoPair(game)
    updateGame(placedGame)
  }, [game, updateGame])

  useEffect(() => {
    // ゲームが進行中でない場合はタイマーをクリア
    if (game.state !== 'playing') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // currentPuyoPairが存在しない場合は新しいペアを生成
    if (!game.currentPuyoPair) {
      const gameWithPair = spawnNextPuyoPair(game)
      updateGame(gameWithPair)
      return
    }

    // 自動落下タイマーを設定
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(handleAutoFall, fallSpeed)

    // クリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [game, fallSpeed, handleAutoFall, updateGame])

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
