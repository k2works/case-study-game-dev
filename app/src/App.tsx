import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import { GameBoard } from './components/GameBoard'
import { ScoreDisplay } from './components/ScoreDisplay'
import { NextPuyoDisplay } from './components/NextPuyoDisplay'
import { GameOverDisplay } from './components/GameOverDisplay'
import { HighScoreDisplay } from './components/HighScoreDisplay'
import { SettingsPanel } from './components/SettingsPanel'
import { TouchControls } from './components/TouchControls'
import { PWANotification } from './components/PWANotification'
import { GameState } from './domain/Game'
import { useKeyboard } from './hooks/useKeyboard'
import { useAutoDrop } from './hooks/useAutoDrop'
import { useTouch } from './hooks/useTouch'
import { SoundType } from './services/SoundEffect'
import { MusicType } from './services/BackgroundMusic'
import { HighScoreRecord } from './services/HighScoreService'
import {
  container,
  GAME_USE_CASE,
  SOUND_EFFECT_SERVICE,
  BACKGROUND_MUSIC_SERVICE,
  HIGH_SCORE_SERVICE,
  GAME_SETTINGS_SERVICE,
} from './infrastructure/di'
import { DIConfiguration } from './application/DIConfiguration'
import { pwaService } from './services/PWAService'
import type { GameUseCase } from './application/GameUseCase'
import type {
  SoundEffectService,
  BackgroundMusicService,
  HighScoreService,
  GameSettingsService,
} from './infrastructure/di/types'

function App() {
  // DIコンテナの初期化
  useState(() => {
    DIConfiguration.initializeApplication()
    return null
  })

  const [gameUseCase] = useState(() =>
    container.resolve<GameUseCase>(GAME_USE_CASE)
  )
  const [renderKey, setRenderKey] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsKey, setSettingsKey] = useState(0) // 設定変更を反映するためのキー
  const [highScores, setHighScores] = useState<HighScoreRecord[]>([])
  const [currentScore, setCurrentScore] = useState<number | undefined>(
    undefined
  )
  const previousGameState = useRef<GameState>(GameState.READY)

  // 初期化：ハイスコアを読み込み
  useEffect(() => {
    const highScoreServiceInstance =
      container.resolve<HighScoreService>(HIGH_SCORE_SERVICE)
    const scores = highScoreServiceInstance.getHighScores()
    setHighScores(scores)

    // PWA Service Workerの登録
    pwaService.registerSW().catch(console.error)
  }, [])

  const forceRender = useCallback(() => {
    setRenderKey((prev) => prev + 1)
  }, [])

  const handleStartGame = () => {
    gameUseCase.startNewGame()
    forceRender()
  }

  const handlePause = useCallback(() => {
    gameUseCase.pauseGame()
    forceRender()
  }, [gameUseCase, forceRender])

  const handleResume = useCallback(() => {
    gameUseCase.resumeGame()
    forceRender()
  }, [gameUseCase, forceRender])

  const handleRestart = useCallback(() => {
    gameUseCase.restartGame()
    // 現在のスコアハイライトをクリア
    setCurrentScore(undefined)
    forceRender()
  }, [gameUseCase, forceRender])

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    if (settingsOpen) {
      setSettingsOpen(false)
    }
  }, [settingsOpen])

  // キーボード操作のハンドラー
  const keyboardHandlers = {
    onMoveLeft: useCallback(() => {
      if (gameUseCase.isPlaying()) {
        const moved = gameUseCase.moveLeft()
        if (moved) {
          const soundEffectService =
            container.resolve<SoundEffectService>(SOUND_EFFECT_SERVICE)
          soundEffectService.play(SoundType.PUYO_MOVE)
        }
        forceRender()
      }
    }, [gameUseCase, forceRender]),
    onMoveRight: useCallback(() => {
      if (gameUseCase.isPlaying()) {
        const moved = gameUseCase.moveRight()
        if (moved) {
          const soundEffectService =
            container.resolve<SoundEffectService>(SOUND_EFFECT_SERVICE)
          soundEffectService.play(SoundType.PUYO_MOVE)
        }
        forceRender()
      }
    }, [gameUseCase, forceRender]),
    onRotate: useCallback(() => {
      if (gameUseCase.isPlaying()) {
        const rotated = gameUseCase.rotate()
        if (rotated) {
          const soundEffectService =
            container.resolve<SoundEffectService>(SOUND_EFFECT_SERVICE)
          soundEffectService.play(SoundType.PUYO_ROTATE)
        }
        forceRender()
      }
    }, [gameUseCase, forceRender]),
    onDrop: useCallback(() => {
      if (gameUseCase.isPlaying()) {
        const dropped = gameUseCase.moveDown()
        if (!dropped) {
          // これ以上落下できない場合、ぷよを固定
          gameUseCase.getGameInstance().fixCurrentPair()
        }
        forceRender()
      }
    }, [gameUseCase, forceRender]),
    onHardDrop: useCallback(() => {
      if (gameUseCase.isPlaying()) {
        gameUseCase.hardDrop()
        forceRender()
      }
    }, [gameUseCase, forceRender]),
    onPause: useCallback(() => {
      gameUseCase.togglePause()
      forceRender()
    }, [gameUseCase, forceRender]),
    onRestart: useCallback(() => {
      handleRestart()
    }, [handleRestart]),
    onOpenSettings: handleOpenSettings,
    onCloseModal: handleCloseModal,
  }

  // ゲーム状態に応じたコントロールボタンを表示
  const renderControlButtons = () => {
    const buttons = []
    const gameState = gameUseCase.getGameState()

    if (gameState === GameState.READY) {
      buttons.push(
        <button
          key="start"
          data-testid="start-button"
          onClick={handleStartGame}
          aria-label="新しいゲームを開始します"
        >
          ゲーム開始
        </button>
      )
    }

    if (gameState === GameState.PLAYING) {
      buttons.push(
        <button
          key="pause"
          data-testid="pause-button"
          onClick={handlePause}
          aria-label="ゲームを一時停止します"
        >
          ⏸️ ポーズ
        </button>
      )
    }

    if (gameState === GameState.PAUSED) {
      buttons.push(
        <button
          key="resume"
          data-testid="resume-button"
          onClick={handleResume}
          aria-label="ゲームを再開します"
        >
          ▶️ 再開
        </button>
      )
    }

    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      buttons.push(
        <button
          key="restart"
          data-testid="restart-button"
          onClick={handleRestart}
          aria-label="ゲームをリスタートします"
        >
          🔄 リスタート
        </button>
      )
    }

    buttons.push(
      <button
        key="settings"
        data-testid="settings-button"
        onClick={() => setSettingsOpen(true)}
        className="settings-toggle"
        aria-label="ゲーム設定を開きます"
        aria-expanded={settingsOpen}
      >
        ⚙️ 設定
      </button>
    )

    return buttons
  }

  // キーボードイベントを登録
  useKeyboard(keyboardHandlers)

  // タッチ操作のハンドラー
  const touchHandlers = {
    onSwipeLeft: keyboardHandlers.onMoveLeft,
    onSwipeRight: keyboardHandlers.onMoveRight,
    onSwipeDown: keyboardHandlers.onDrop,
    onTap: keyboardHandlers.onRotate,
    onDoubleTap: keyboardHandlers.onHardDrop,
  }

  // タッチイベントを登録（ゲームフィールドに限定）
  const gameBoardRef = useRef<HTMLDivElement>(null)
  useTouch(touchHandlers, {
    element: gameBoardRef.current,
    enabled: gameUseCase.isPlaying(),
  })

  // 自動落下システム
  const handleAutoDrop = useCallback(() => {
    if (gameUseCase.isPlaying()) {
      const dropped = gameUseCase.moveDown()
      if (!dropped) {
        // これ以上落下できない場合、ぷよを固定
        gameUseCase.getGameInstance().fixCurrentPair()
      }
      forceRender()
    }
  }, [gameUseCase, forceRender])

  // 自動落下を設定（設定から取得した間隔） - ポーズ中は停止
  const gameSettingsServiceInstance = container.resolve<GameSettingsService>(
    GAME_SETTINGS_SERVICE
  )
  const autoDropSpeed = gameSettingsServiceInstance.getSetting(
    'autoDropSpeed'
  ) as number
  useAutoDrop({
    onDrop: handleAutoDrop,
    interval: autoDropSpeed,
    enabled: gameUseCase.isPlaying(),
  })

  // ゲーム開始時の処理
  const handleGameStart = () => {
    const backgroundMusicService = container.resolve<BackgroundMusicService>(
      BACKGROUND_MUSIC_SERVICE
    )
    backgroundMusicService.play(MusicType.MAIN_THEME)
  }

  // ゲームオーバー時の処理
  const handleGameOver = () => {
    const soundEffectService =
      container.resolve<SoundEffectService>(SOUND_EFFECT_SERVICE)
    const backgroundMusicService = container.resolve<BackgroundMusicService>(
      BACKGROUND_MUSIC_SERVICE
    )
    const highScoreServiceInstance =
      container.resolve<HighScoreService>(HIGH_SCORE_SERVICE)

    soundEffectService.play(SoundType.GAME_OVER)
    backgroundMusicService.fadeOut(1000).then(() => {
      backgroundMusicService.play(MusicType.GAME_OVER_THEME)
    })

    // ハイスコア処理
    const finalScore = gameUseCase.getScore().current
    if (finalScore > 0 && highScoreServiceInstance.isHighScore(finalScore)) {
      const updatedScores = highScoreServiceInstance.addScore(finalScore)
      setHighScores(updatedScores)
      setCurrentScore(finalScore)
    }
  }

  // ゲームリセット時の処理
  const handleGameReset = () => {
    const backgroundMusicService = container.resolve<BackgroundMusicService>(
      BACKGROUND_MUSIC_SERVICE
    )
    backgroundMusicService.stop()
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
    [gameUseCase]
  )

  // ゲーム状態の変化を検出してBGMと効果音を制御
  useEffect(() => {
    const currentState = gameUseCase.getGameState()
    const previousState = previousGameState.current

    if (previousState !== currentState) {
      handleGameStateChange(currentState, previousState)
      previousGameState.current = currentState
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderKey])

  return (
    <div className="app">
      <header className="app-header">
        <h1>ぷよぷよゲーム</h1>
        <p>テスト駆動開発で作るパズルゲーム</p>
      </header>
      <main className="app-main">
        <div className="game-container">
          <div className="game-play-area">
            <div className="game-board-area" ref={gameBoardRef}>
              <GameBoard
                key={`${renderKey}-${settingsKey}`}
                game={gameUseCase.getGameInstance()}
              />
            </div>
            <div className="game-info-area">
              <ScoreDisplay score={gameUseCase.getScore().current} />
              <NextPuyoDisplay
                key={settingsKey}
                nextPair={gameUseCase.getNextPairs()[0] || null}
                showShadow={
                  gameSettingsServiceInstance.getSetting(
                    'showShadow'
                  ) as boolean
                }
                colorBlindMode={
                  gameSettingsServiceInstance.getSetting(
                    'colorBlindMode'
                  ) as boolean
                }
              />
              <HighScoreDisplay
                highScores={highScores}
                currentScore={currentScore}
                maxDisplay={5}
              />
            </div>
          </div>
          <div className="controls">{renderControlButtons()}</div>
          <div className="instructions">
            <h2>操作方法</h2>
            <div className="key-instructions">
              <div>
                <kbd>←→</kbd>: 移動
              </div>
              <div>
                <kbd>↑</kbd>/<kbd>Z</kbd>: 回転
              </div>
              <div>
                <kbd>↓</kbd>: 高速落下
              </div>
              <div>
                <kbd>スペース</kbd>: ハードドロップ
              </div>
              <div>
                <kbd>P</kbd>: ポーズ/再開
              </div>
              <div>
                <kbd>R</kbd>: リスタート
              </div>
              <div>
                <kbd>S</kbd>: 設定画面
              </div>
              <div>
                <kbd>Esc</kbd>: モーダルを閉じる
              </div>
              <div>
                <kbd>Tab</kbd>: フォーカス移動
              </div>
            </div>
          </div>
          {gameUseCase.isPaused() && (
            <div className="pause-overlay" data-testid="pause-overlay">
              <div className="pause-message">
                <h2>⏸️ ポーズ中</h2>
                <p>Pキーまたは再開ボタンでゲームを再開</p>
              </div>
            </div>
          )}
          {gameUseCase.isGameOver() && (
            <GameOverDisplay
              score={gameUseCase.getScore().current}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false)
          // 設定変更後にGameBoardの再レンダリングを強制
          setSettingsKey((prev) => prev + 1)
        }}
      />

      {/* モバイル用タッチコントロール */}
      <TouchControls
        onMoveLeft={keyboardHandlers.onMoveLeft}
        onMoveRight={keyboardHandlers.onMoveRight}
        onRotate={keyboardHandlers.onRotate}
        onDrop={keyboardHandlers.onDrop}
        onHardDrop={keyboardHandlers.onHardDrop}
        isPlaying={gameUseCase.isPlaying()}
      />

      {/* PWA通知 */}
      <PWANotification />
    </div>
  )
}

export default App
