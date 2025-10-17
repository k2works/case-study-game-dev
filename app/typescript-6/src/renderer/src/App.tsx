import React from 'react'
import { GameCanvas } from './components/GameCanvas'

function App() {
  return (
    <div className="App">
      <h1>ぷよぷよゲーム</h1>
      <GameCanvas width={192} height={384} />
    </div>
  )
}

export default App
