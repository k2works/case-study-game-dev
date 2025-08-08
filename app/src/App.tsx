import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import { GameBoard } from './components/GameBoard'
import { ScoreDisplay } from './components/ScoreDisplay'
import { NextPuyoDisplay } from './components/NextPuyoDisplay'
import { GameOverDisplay } from './components/GameOverDisplay'
import { HighScoreDisplay } from './components/HighScoreDisplay'
import { AudioSettingsPanel } from './components/AudioSettingsPanel'
import { Game, GameState } from './domain/Game'
import { useKeyboard } from './hooks/useKeyboard'
import { useAutoDrop } from './hooks/useAutoDrop'
import { soundEffect, SoundType } from './services/SoundEffect'
import { backgroundMusic, MusicType } from './services/BackgroundMusic'
import { highScoreService, HighScoreRecord } from './services/HighScoreService'

function App() {
  const [game] = useState(() => new Game())
  const [renderKey, setRenderKey] = useState(0)
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false)
  const [highScores, setHighScores] = useState<HighScoreRecord[]>([])
  const [currentScore, setCurrentScore] = useState<number | undefined>(
    undefined
  )
  const previousGameState = useRef<GameState>(GameState.READY)

  // 初期化：ハイスコアを読み込み
  useEffect(() => {
    const scores = highScoreService.getHighScores()
    setHighScores(scores)
  }, [])

  const forceRender = useCallback(() => {
    setRenderKey((prev) => prev + 1)
  }, [])

  const handleStartGame = () => {
    game.start()
    forceRender()
  }

  const handlePause = useCallback(() => {
    game.pause()
    forceRender()
  }, [game, forceRender])

  const handleResume = useCallback(() => {
    game.resume()
    forceRender()
  }, [game, forceRender])

  const handleRestart = useCallback(() => {
    // 新しいゲームインスタンスを作成してリスタート
    Object.assign(game, new Game())
    game.start()
    // 現在のスコアハイライトをクリア
    setCurrentScore(undefined)
    forceRender()
  }, [game, forceRender])

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
    onPause: useCallback(() => {
      if (game.state === GameState.PLAYING) {
        handlePause()
      } else if (game.state === GameState.PAUSED) {
        handleResume()
      }
    }, [game, handlePause, handleResume]),
    onRestart: useCallback(() => {
      handleRestart()
    }, [handleRestart]),
  }

  // ゲーム状態に応じたコントロールボタンを表示
  const renderControlButtons = () => {
    const buttons = []

    if (game.state === GameState.READY) {
      buttons.push(
        <button
          key="start"
          data-testid="start-button"
          onClick={handleStartGame}
        >
          ゲーム開始
        </button>
      )
    }

    if (game.state === GameState.PLAYING) {
      buttons.push(
        <button key="pause" data-testid="pause-button" onClick={handlePause}>
          ⏸️ ポーズ
        </button>
      )
    }

    if (game.state === GameState.PAUSED) {
      buttons.push(
        <button key="resume" data-testid="resume-button" onClick={handleResume}>
          ▶️ 再開
        </button>
      )
    }

    if (game.state === GameState.PLAYING || game.state === GameState.PAUSED) {
      buttons.push(
        <button
          key="restart"
          data-testid="restart-button"
          onClick={handleRestart}
        >
          🔄 リスタート
        </button>
      )
    }

    buttons.push(
      <button
        key="audio"
        data-testid="audio-settings-button"
        onClick={() => setAudioSettingsOpen(true)}
        className="audio-settings-toggle"
      >
        🔊 音響設定
      </button>
    )

    return buttons
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

  // 自動落下を設定（1秒間隔） - ポーズ中は停止
  useAutoDrop({
    onDrop: handleAutoDrop,
    interval: 1000,
    enabled: game.state === GameState.PLAYING,
  })

  // ゲーム開始時の処理
  const handleGameStart = () => {
    backgroundMusic.play(MusicType.MAIN_THEME)
  }

  // ゲームオーバー時の処理
  const handleGameOver = () => {
    soundEffect.play(SoundType.GAME_OVER)
    backgroundMusic.fadeOut(1000).then(() => {
      backgroundMusic.play(MusicType.GAME_OVER_THEME)
    })

    // ハイスコア処理
    const finalScore = game.score
    if (finalScore > 0 && highScoreService.isHighScore(finalScore)) {
      const updatedScores = highScoreService.addScore(finalScore)
      setHighScores(updatedScores)
      setCurrentScore(finalScore)
    }
  }

  // ゲームリセット時の処理
  const handleGameReset = () => {
    backgroundMusic.stop()
  }

  // ゲーム状態変化時のBGM制御処理を分離
  const handleGameStateChange = useCallback(
    (currentState: GameState, previousState: GameState) => {
      switch (currentState) {
        case GameState.PLAYING:
          if (previousState === GameState.READY) {
            handleGameStart()
          }
          break
        case GameState.GAME_OVER:
          if (previousState !== GameState.GAME_OVER) {
            handleGameOver()
          }
          break
        case GameState.READY:
          if (previousState === GameState.GAME_OVER) {
            handleGameReset()
          }
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.score]
  )

  // ゲーム状態の変化を検出してBGMと効果音を制御
  useEffect(() => {
    const currentState = game.state
    const previousState = previousGameState.current

    if (previousState !== currentState) {
      handleGameStateChange(currentState, previousState)
      previousGameState.current = currentState
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <HighScoreDisplay
                highScores={highScores}
                currentScore={currentScore}
                maxDisplay={5}
              />
            </div>
          </div>
          <div className="controls">{renderControlButtons()}</div>
          <div className="instructions">
            <h3>操作方法</h3>
            <div className="key-instructions">
              <div>←→: 移動</div>
              <div>↑/Z: 回転</div>
              <div>↓: 高速落下</div>
              <div>スペース: ハードドロップ</div>
              <div>P: ポーズ/再開</div>
              <div>R: リスタート</div>
            </div>
          </div>
          {game.state === GameState.PAUSED && (
            <div className="pause-overlay" data-testid="pause-overlay">
              <div className="pause-message">
                <h2>⏸️ ポーズ中</h2>
                <p>Pキーまたは再開ボタンでゲームを再開</p>
              </div>
            </div>
          )}
          {game.state === GameState.GAME_OVER && (
            <GameOverDisplay score={game.score} onRestart={handleRestart} />
          )}
        </div>
      </main>

      <AudioSettingsPanel
        isOpen={audioSettingsOpen}
        onClose={() => setAudioSettingsOpen(false)}
      />
    </div>
  )
}

export default App
