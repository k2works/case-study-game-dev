import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import { GameBoard } from './components/GameBoard'
import { ScoreDisplay } from './components/ScoreDisplay'
import { NextPuyoDisplay } from './components/NextPuyoDisplay'
import { GameOverDisplay } from './components/GameOverDisplay'
import { Game, GameState } from './domain/Game'
import { useKeyboard } from './hooks/useKeyboard'
import { useAutoDrop } from './hooks/useAutoDrop'
import { soundEffect, SoundType } from './services/SoundEffect'
import { backgroundMusic, MusicType } from './services/BackgroundMusic'

function App() {
  const [game] = useState(() => new Game())
  const [renderKey, setRenderKey] = useState(0)
  const previousGameState = useRef<GameState>(GameState.READY)

  const forceRender = useCallback(() => {
    setRenderKey((prev) => prev + 1)
  }, [])

  const handleStartGame = () => {
    game.start()
    forceRender()
  }

  const handleRestart = () => {
    // 新しいゲームインスタンスを作成してリスタート
    Object.assign(game, new Game())
    game.start()
    forceRender()
  }

  // キーボード操作のハンドラー
  const keyboardHandlers = {
    onMoveLeft: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        const moved = game.moveLeft()
        if (moved) {
          soundEffect.play(SoundType.PUYO_MOVE)
        }
        forceRender()
      }
    }, [game, forceRender]),
    onMoveRight: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        const moved = game.moveRight()
        if (moved) {
          soundEffect.play(SoundType.PUYO_MOVE)
        }
        forceRender()
      }
    }, [game, forceRender]),
    onRotate: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        const rotated = game.rotate()
        if (rotated) {
          soundEffect.play(SoundType.PUYO_ROTATE)
        }
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

  // ゲーム状態変化時のBGM制御処理を分離
  const handleGameStateChange = (currentState: GameState, previousState: GameState) => {
    switch (currentState) {
      case GameState.PLAYING:
        if (previousState === GameState.READY) {
          backgroundMusic.play(MusicType.MAIN_THEME)
        }
        break
      case GameState.GAME_OVER:
        if (previousState !== GameState.GAME_OVER) {
          soundEffect.play(SoundType.GAME_OVER)
          backgroundMusic.fadeOut(1000).then(() => {
            backgroundMusic.play(MusicType.GAME_OVER_THEME)
          })
        }
        break
      case GameState.READY:
        if (previousState === GameState.GAME_OVER) {
          backgroundMusic.stop()
        }
        break
    }
  }

  // ゲーム状態の変化を検出してBGMと効果音を制御
  useEffect(() => {
    const currentState = game.state
    const previousState = previousGameState.current

    if (previousState !== currentState) {
      handleGameStateChange(currentState, previousState)
      previousGameState.current = currentState
    }
  }, [game.state])

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
              <NextPuyoDisplay nextPair={game.nextPair} />
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
          {game.state === GameState.GAME_OVER && (
            <GameOverDisplay score={game.score} onRestart={handleRestart} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
