import { useState, useEffect } from 'react'
import type { Game } from '@/game/Game'
import { PuyoType } from '@/game/Puyo'

export interface GameStatus {
  score: number
  chainCount: number
  nextPuyoPair: { mainType: PuyoType; subType: PuyoType } | null
}

/**
 * ゲームの状態を定期的に取得するカスタムフック
 * @param game Game インスタンス
 * @param interval 更新間隔（ミリ秒）デフォルトは 100ms
 * @returns ゲームの状態（スコア、連鎖数、次のぷよペア）
 */
export const useGameStatus = (game: Game | null, interval: number = 100): GameStatus => {
  const [score, setScore] = useState(0)
  const [chainCount, setChainCount] = useState(0)
  const [nextPuyoPair, setNextPuyoPair] = useState<{
    mainType: PuyoType
    subType: PuyoType
  } | null>(null)

  useEffect(() => {
    if (!game) return

    // 定期的にゲームの状態を更新
    const intervalId = window.setInterval(() => {
      setScore(game.getScore())
      setChainCount(game.getChainCount())
      setNextPuyoPair(game.getNextPuyoPair())
    }, interval)

    return () => window.clearInterval(intervalId)
  }, [game, interval])

  return { score, chainCount, nextPuyoPair }
}
