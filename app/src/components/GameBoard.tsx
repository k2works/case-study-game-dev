import React, { useState, useEffect, useRef } from 'react'
import { Game, GameState } from '../domain/Game'
import { Puyo } from '../domain/Puyo'
import { AnimatedPuyo } from './AnimatedPuyo'
import { DisappearEffect } from './DisappearEffect'
// import { ChainDisplay } from './ChainDisplay' // 完全に削除 - 使用しない
import { soundEffect, SoundType } from '../services/SoundEffect'
import { gameSettingsService } from '../services/GameSettingsService'
import './GameBoard.css'

interface GameBoardProps {
  game: Game
}

interface FallingPuyo {
  id: string
  color: string
  x: number
  y: number
  targetY: number
}

interface DisappearingPuyo {
  id: string
  color: string
  x: number
  y: number
}

// 連鎖表示インターフェース - 完全に削除
// interface ChainInfo {
//   id: string
//   chainCount: number
//   x: number
//   y: number
//   timestamp: number
// }

export const GameBoard: React.FC<GameBoardProps> = ({ game }) => {
  const [fallingPuyos, setFallingPuyos] = useState<FallingPuyo[]>([])
  const [disappearingPuyos, setDisappearingPuyos] = useState<
    DisappearingPuyo[]
  >([])
  // 連鎖表示状態は完全に削除 - 使用しない
  // const [chainDisplays, setChainDisplays] = useState<ChainInfo[]>([])
  const lastProcessedScore = useRef<number>(0)
  const chainTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingChain = useRef<boolean>(false)
  
  // ゲーム設定を取得（設定変更時に再レンダリングするため、stateで管理）
  const [gameSettings, setGameSettings] = useState(() => gameSettingsService.getSettings())

  // 設定変更を監視
  useEffect(() => {
    const updateSettings = () => {
      setGameSettings(gameSettingsService.getSettings())
    }
    
    // 設定パネルが閉じられたときなどに設定を再読み込み
    window.addEventListener('storage', updateSettings)
    // 設定変更イベントをリッスン
    window.addEventListener('settingsChanged', updateSettings)
    
    return () => {
      window.removeEventListener('storage', updateSettings)
      window.removeEventListener('settingsChanged', updateSettings)
    }
  }, [])
  const [previousPairPosition, setPreviousPairPosition] = useState<{
    mainX: number
    mainY: number
    subX: number
    subY: number
  } | null>(null)
  const previousFieldState = useRef<(Puyo | null)[][]>(
    Array(game.field.width)
      .fill(null)
      .map(() => Array(game.field.height).fill(null))
  )

  const processFallingAnimation = (
    mainPos: { x: number; y: number },
    subPos: { x: number; y: number },
    prevPosition: typeof previousPairPosition
  ) => {
    if (!prevPosition || !game.currentPair) return
    
    // アニメーションが無効化されている場合は処理しない
    if (!gameSettings.animationsEnabled) return

    const newFallingPuyos: FallingPuyo[] = []

    if (mainPos.y > prevPosition.mainY) {
      newFallingPuyos.push({
        id: `main-${Date.now()}`,
        color: game.currentPair.main.color,
        x: mainPos.x,
        y: prevPosition.mainY,
        targetY: mainPos.y,
      })
    }

    if (subPos.y > prevPosition.subY) {
      newFallingPuyos.push({
        id: `sub-${Date.now()}`,
        color: game.currentPair.sub.color,
        x: subPos.x,
        y: prevPosition.subY,
        targetY: subPos.y,
      })
    }

    if (newFallingPuyos.length > 0) {
      setFallingPuyos((prev) => [...prev, ...newFallingPuyos])

      // ぷよ落下音を再生
      soundEffect.play(SoundType.PUYO_DROP)

      // アニメーション完了後にクリーンアップ
      setTimeout(() => {
        setFallingPuyos((prev) =>
          prev.filter((p) => !newFallingPuyos.some((np) => np.id === p.id))
        )
      }, 300)
    }
  }

  // ぷよペア位置の処理
  useEffect(() => {
    if (game.currentPair && game.state === GameState.PLAYING) {
      const mainPos = game.currentPair.getMainPosition()
      const subPos = game.currentPair.getSubPosition()

      if (
        previousPairPosition &&
        (mainPos.y > previousPairPosition.mainY ||
          subPos.y > previousPairPosition.subY)
      ) {
        processFallingAnimation(mainPos, subPos, previousPairPosition)
      }

      setPreviousPairPosition({
        mainX: mainPos.x,
        mainY: mainPos.y,
        subX: subPos.x,
        subY: subPos.y,
      })
    } else {
      setPreviousPairPosition(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.currentPair, game.state])

  // ゲーム状態リセット処理
  useEffect(() => {
    if (game.state === GameState.READY) {
      lastProcessedScore.current = 0
      isProcessingChain.current = false
      if (chainTimeoutRef.current) {
        clearTimeout(chainTimeoutRef.current)
        chainTimeoutRef.current = null
      }
    }
  }, [game.state])

  const getCurrentFieldState = (): (Puyo | null)[][] => {
    const fieldState: (Puyo | null)[][] = Array(game.field.width)
      .fill(null)
      .map(() => Array(game.field.height).fill(null))

    for (let x = 0; x < game.field.width; x++) {
      for (let y = 0; y < game.field.height; y++) {
        fieldState[x][y] = game.field.getPuyo(x, y)
      }
    }

    return fieldState
  }

  const detectDisappearedPuyos = (
    currentField: (Puyo | null)[][],
    previousField: (Puyo | null)[][]
  ): DisappearingPuyo[] => {
    const disappearedPuyos: DisappearingPuyo[] = []

    for (let x = 0; x < game.field.width; x++) {
      for (let y = 0; y < game.field.height; y++) {
        const prevPuyo = previousField[x][y]
        const currentPuyo = currentField[x][y]

        if (prevPuyo && !currentPuyo) {
          disappearedPuyos.push({
            id: `disappear-${x}-${y}-${Date.now()}`,
            color: prevPuyo.color,
            x,
            y,
          })
        }
      }
    }

    return disappearedPuyos
  }

  // 消去エフェクトの検出
  useEffect(() => {
    // gameまたはgame.fieldが存在しない場合は早期リターン
    if (!game || !game.field) {
      return
    }

    const currentField = getCurrentFieldState()

    const newDisappearingPuyos = detectDisappearedPuyos(
      currentField,
      previousFieldState.current
    )

    if (newDisappearingPuyos.length > 0) {
      // アニメーションが有効な場合のみエフェクト処理を実行
      if (gameSettings.animationsEnabled) {
        setDisappearingPuyos((prev) => [...prev, ...newDisappearingPuyos])

        // エフェクト完了後にクリーンアップ
        setTimeout(() => {
          setDisappearingPuyos((prev) =>
            prev.filter((p) => !newDisappearingPuyos.some((np) => np.id === p.id))
          )
        }, 500)
      }

      // ぷよ消去音を再生（アニメーション設定に関わらず）
      soundEffect.play(SoundType.PUYO_ERASE)
    }

    // 現在のフィールド状態を保存
    previousFieldState.current = currentField
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, game.field])

  // スコアリセット処理
  const handleScoreReset = () => {
    lastProcessedScore.current = 0
    isProcessingChain.current = false
    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current)
      chainTimeoutRef.current = null
    }
  }

  // 連鎖音再生処理
  const handleChainSound = (currentScore: number) => {
    const scoreDiff = currentScore - lastProcessedScore.current
    if (scoreDiff >= 40) {
      soundEffect.play(SoundType.CHAIN)
    }
    lastProcessedScore.current = currentScore
  }

  // 連鎖表示の検出（スコア変化で推測） - 完全に無効化
  useEffect(() => {
    if (!game) return

    const currentScore = game.score

    // スコアがリセットされた場合
    if (currentScore === 0 && lastProcessedScore.current > 0) {
      handleScoreReset()
      return
    }

    // スコア増加時は音のみ再生（表示は一切しない）
    if (currentScore > lastProcessedScore.current && currentScore > 0) {
      handleChainSound(currentScore)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.score])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (chainTimeoutRef.current) {
        clearTimeout(chainTimeoutRef.current)
      }
    }
  }, [])

  const getFixedPuyoStyle = (puyo: Puyo | null) => {
    if (puyo) {
      return { puyoClass: 'puyo', puyoColor: puyo.color }
    }
    return null
  }

  const getCurrentPairStyle = (x: number, y: number) => {
    if (!game.currentPair || game.state !== GameState.PLAYING) {
      return null
    }

    const mainPos = game.currentPair.getMainPosition()
    const subPos = game.currentPair.getSubPosition()

    if (x === mainPos.x && y === mainPos.y) {
      return { puyoClass: 'puyo', puyoColor: game.currentPair.main.color }
    } else if (x === subPos.x && y === subPos.y) {
      return { puyoClass: 'puyo', puyoColor: game.currentPair.sub.color }
    }

    return null
  }

  const getCellStyle = (x: number, y: number) => {
    const puyo = game.field.getPuyo(x, y)

    // フィールドに固定されたぷよを表示
    const fixedStyle = getFixedPuyoStyle(puyo)
    if (fixedStyle) {
      return fixedStyle
    }

    // 現在のぷよペアを表示
    const currentStyle = getCurrentPairStyle(x, y)
    if (currentStyle) {
      return currentStyle
    }

    return { puyoClass: '', puyoColor: '' }
  }

  const renderField = () => {
    const cells = []

    // 隠しライン（y < 2）は表示しない、見えるフィールド部分のみ表示
    const visibleStartY = 2
    const visibleHeight = 14 // y=2からy=15まで（14行）を表示

    for (let y = visibleStartY; y < visibleStartY + visibleHeight; y++) {
      for (let x = 0; x < game.field.width; x++) {
        const { puyoClass, puyoColor } = getCellStyle(x, y)

        cells.push(
          <div
            key={`${x}-${y}`}
            data-testid={`cell-${x}-${y}`}
            className={`cell ${puyoClass} ${puyoColor}`}
          />
        )
      }
    }

    return cells
  }

  const getGameStateText = () => {
    switch (game.state) {
      case GameState.READY:
        return 'Ready'
      case GameState.PLAYING:
        return '' // Playing表示を削除
      case GameState.GAME_OVER:
        return 'Game Over'
      default:
        return ''
    }
  }

  const renderAnimatedPuyos = () => {
    // アニメーションが無効化されている場合は何も表示しない
    if (!gameSettings.animationsEnabled) {
      return []
    }
    
    return fallingPuyos.map((puyo) => (
      <AnimatedPuyo
        key={puyo.id}
        color={puyo.color}
        x={puyo.x}
        y={puyo.targetY - 2} // 表示オフセットを考慮
        isFalling={true}
        fallDuration={0.3}
      />
    ))
  }

  const renderDisappearEffects = () => {
    // アニメーションが無効化されている場合は何も表示しない
    if (!gameSettings.animationsEnabled) {
      return []
    }
    
    return disappearingPuyos.map((puyo) => (
      <DisappearEffect
        key={puyo.id}
        color={puyo.color}
        x={puyo.x}
        y={puyo.y - 2} // 表示オフセットを考慮
        duration={0.5}
      />
    ))
  }

  const renderChainDisplays = () => {
    // 連鎖表示を完全に無効化 - 絶対に何も表示しない
    return []
  }

  // クラス名を動的に生成
  const gameBoardClass = `game-board ${gameSettings.showGridLines ? 'show-grid' : ''} ${gameSettings.showShadow ? 'show-shadow' : ''} ${gameSettings.animationsEnabled ? 'animations-enabled' : ''}`
  const fieldClass = `field ${gameSettings.showShadow ? 'show-shadow' : ''}`

  return (
    <div data-testid="game-board" className={gameBoardClass}>
      {getGameStateText() && (
        <div className="game-info">
          <div className="game-status">
            <span>{getGameStateText()}</span>
          </div>
        </div>
      )}
      <div className={fieldClass}>
        {renderField()}
        <div className="animated-puyos-container">
          {renderAnimatedPuyos()}
          {renderDisappearEffects()}
          {renderChainDisplays()}
        </div>
      </div>
    </div>
  )
}

export default GameBoard
