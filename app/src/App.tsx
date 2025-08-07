import { useState, useCallback } from 'react'
import './App.css'
import { GameBoard } from './components/GameBoard'
import { ScoreDisplay } from './components/ScoreDisplay'
import { Game, GameState } from './domain/Game'
import { useKeyboard } from './hooks/useKeyboard'
import { useAutoDrop } from './hooks/useAutoDrop'

function App() {
  const [game] = useState(() => new Game())
  const [renderKey, setRenderKey] = useState(0)

  const forceRender = useCallback(() => {
    setRenderKey((prev) => prev + 1)
  }, [])

  const handleStartGame = () => {
    game.start()
    forceRender()
  }

  // キーボード操作のハンドラー
  const keyboardHandlers = {
    onMoveLeft: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        game.moveLeft()
        forceRender()
      }
    }, [game, forceRender]),
    onMoveRight: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        game.moveRight()
        forceRender()
      }
    }, [game, forceRender]),
    onRotate: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        game.rotate()
        forceRender()
      }
    }, [game, forceRender]),
    onDrop: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        const dropped = game.drop()
        if (!dropped) {
          // これ以上落下できない場合、ぷよを固定
          game.fixCurrentPair()
        }
        forceRender()
      }
    }, [game, forceRender]),
    onHardDrop: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        // 落ちるところまで一気に落下
        while (game.drop()) {
          // 落下し続ける
        }
        // 固定
        game.fixCurrentPair()
        forceRender()
      }
    }, [game, forceRender]),
  }

  // キーボードイベントを登録
  useKeyboard(keyboardHandlers)

  // 自動落下システム
  const handleAutoDrop = useCallback(() => {
    if (game.state === GameState.PLAYING) {
      const dropped = game.drop()
      if (!dropped) {
        // これ以上落下できない場合、ぷよを固定
        game.fixCurrentPair()
      }
      forceRender()
    }
  }, [game, forceRender])

  // 自動落下を設定（1秒間隔）
  useAutoDrop({
    onDrop: handleAutoDrop,
    interval: 1000,
    enabled: game.state === GameState.PLAYING,
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1>ぷよぷよゲーム</h1>
        <p>テスト駆動開発で作るパズルゲーム</p>
      </header>
      <main className="app-main">
        <div className="game-container">
          <div className="game-play-area">
            <div className="game-board-area">
              <GameBoard key={renderKey} game={game} />
            </div>
            <div className="game-info-area">
              <ScoreDisplay score={game.score} />
            </div>
          </div>
          <div className="controls">
            <button data-testid="start-button" onClick={handleStartGame}>
              ゲーム開始
            </button>
          </div>
          <div className="instructions">
            <h3>操作方法</h3>
            <div className="key-instructions">
              <div>←→: 移動</div>
              <div>↑/Z: 回転</div>
              <div>↓: 高速落下</div>
              <div>スペース: ハードドロップ</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
