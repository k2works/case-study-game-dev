import React, { useState, useEffect, useCallback } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameInfo } from './components/GameInfo'
import type { Game } from './game/Game'
import { PuyoType } from './game/Puyo'

function App() {
  const [game, setGame] = useState<Game | null>(null)
  const [score, setScore] = useState(0)
  const [chainCount, setChainCount] = useState(0)
  const [nextPuyoPair, setNextPuyoPair] = useState<{
    mainType: PuyoType
    subType: PuyoType
  } | null>(null)

  const handleGameReady = useCallback((game: Game) => {
    setGame(game)
  }, [])

  useEffect(() => {
    if (!game) return

    // 定期的にゲームの状態を更新
    const interval = window.setInterval(() => {
      setScore(game.getScore())
      setChainCount(game.getChainCount())
      setNextPuyoPair(game.getNextPuyoPair())
    }, 100)

    return () => window.clearInterval(interval)
  }, [game])

  return (
    <div className="App">
      <h1>ぷよぷよゲーム</h1>
      <div className="game-container">
        <GameCanvas width={192} height={384} onGameReady={handleGameReady} />
        <GameInfo score={score} chainCount={chainCount} nextPuyoPair={nextPuyoPair} />
      </div>
    </div>
  )
}

export default App
