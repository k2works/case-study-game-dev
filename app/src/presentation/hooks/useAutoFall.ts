import { useCallback, useEffect, useRef } from 'react'

import type { GamePort } from '../../application/ports/GamePort'
import type { GameViewModel } from '../../application/viewmodels/GameViewModel'
import { defaultContainer } from '../../infrastructure/di/DefaultContainer'

interface UseAutoFallProps {
  game: GameViewModel
  updateGame: (newGame: GameViewModel) => void
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
  const gameService: GamePort = defaultContainer.getGameService()

  // ぷよペアを1マス下に落下させる処理
  const handleAutoFall = useCallback(() => {
    if (game.state !== 'playing' || !game.currentPuyoPair) {
      return
    }

    // application層のサービス経由で落下処理を実行
    const updatedGame = gameService.processAutoFall(game)
    updateGame(updatedGame)
  }, [game, gameService, updateGame])

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
      const gameWithPair = gameService.spawnNewPuyoPair(game)
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
  }, [game, fallSpeed, handleAutoFall, updateGame, gameService])

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
