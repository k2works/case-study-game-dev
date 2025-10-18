import React, { useState, useCallback } from 'react'
import { GameCanvas } from '@/components/GameCanvas'
import { GameInfo } from '@/components/GameInfo'
import type { Game } from '@/game/Game'
import { useGameStatus } from '@/hooks/useGameStatus'

function App() {
  const [game, setGame] = useState<Game | null>(null)

  const handleGameReady = useCallback((game: Game) => {
    setGame(game)
  }, [])

  const { score, chainCount, nextPuyoPair } = useGameStatus(game)

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
