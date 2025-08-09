import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Game, GameState } from '../domain/Game'
import { Puyo } from '../domain/Puyo'
import { AnimatedPuyo } from './AnimatedPuyo'
import { DisappearEffect } from './DisappearEffect'
import { ChainDisplay } from './ChainDisplay'
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

// 連鎖表示インターフェース
interface ChainInfo {
  id: string
  chainCount: number
  x: number
  y: number
  timestamp: number
}

export const GameBoard: React.FC<GameBoardProps> = React.memo(({ game }) => {
  const [fallingPuyos, setFallingPuyos] = useState<FallingPuyo[]>([])
  const [disappearingPuyos, setDisappearingPuyos] = useState<
    DisappearingPuyo[]
  >([])
  const [chainDisplays, setChainDisplays] = useState<ChainInfo[]>([])
  const lastProcessedChainId = useRef<string | null>(null)
  const chainTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // タイマーIDを保持してメモリリークを防ぐ
  const animationTimersRef = useRef<Set<NodeJS.Timeout>>(new Set())

  // ゲーム設定を取得（設定変更時に再レンダリングするため、stateで管理）
  const [gameSettings, setGameSettings] = useState(() =>
    gameSettingsService.getSettings()
  )

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

      // アニメーション完了後にクリーンアップ（メモリリーク防止）
      const timer = setTimeout(() => {
        setFallingPuyos((prev) =>
          prev.filter((p) => !newFallingPuyos.some((np) => np.id === p.id))
        )
        animationTimersRef.current.delete(timer)
      }, 300)
      animationTimersRef.current.add(timer)
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
      lastProcessedChainId.current = null
      setChainDisplays([]) // 連鎖表示をクリア
      if (chainTimeoutRef.current) {
        clearTimeout(chainTimeoutRef.current)
        chainTimeoutRef.current = null
      }
    }
  }, [game.state])

  const getCurrentFieldState = useCallback((): (Puyo | null)[][] => {
    const fieldState: (Puyo | null)[][] = Array(game.field.width)
      .fill(null)
      .map(() => Array(game.field.height).fill(null))

    for (let x = 0; x < game.field.width; x++) {
      for (let y = 0; y < game.field.height; y++) {
        fieldState[x][y] = game.field.getPuyo(x, y)
      }
    }

    return fieldState
  }, [game.field])

  const detectDisappearedPuyos = useCallback(
    (
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
    },
    [game.field]
  )

  // フィールドの状態を文字列化して変化を検出（memoization）
  const fieldSignature = useMemo(() => {
    let signature = ''
    for (let x = 0; x < game.field.width; x++) {
      for (let y = 0; y < game.field.height; y++) {
        const puyo = game.field.getPuyo(x, y)
        signature += puyo ? puyo.color[0] : '-'
      }
    }
    return signature
  }, [game.field])

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

        // エフェクト完了後にクリーンアップ（メモリリーク防止）
        const timer = setTimeout(() => {
          setDisappearingPuyos((prev) =>
            prev.filter(
              (p) => !newDisappearingPuyos.some((np) => np.id === p.id)
            )
          )
          animationTimersRef.current.delete(timer)
        }, 1000)
        animationTimersRef.current.add(timer)
      }

      // ぷよ消去音を再生（アニメーション設定に関わらず）
      soundEffect.play(SoundType.PUYO_ERASE)
    }

    // 現在のフィールド状態を保存
    previousFieldState.current = currentField
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldSignature])

  // 新しい連鎖結果ベースの連鎖表示検出
  useEffect(() => {
    if (!game || !game.lastChainResult) return

    const chainResult = game.lastChainResult
    const chainId = `${chainResult.chainCount}-${chainResult.score}-${chainResult.totalErasedCount}`

    // 同じ連鎖結果を重複処理しないようにチェック
    if (lastProcessedChainId.current === chainId) return

    // 音響効果を再生
    if (chainResult.chainCount >= 2) {
      soundEffect.play(SoundType.CHAIN)
    }

    // アニメーションが有効で連鎖が発生した場合
    if (gameSettings.animationsEnabled && chainResult.chainCount > 0) {
      // フィールドの中央付近に連鎖表示を追加
      const chainInfo: ChainInfo = {
        id: `chain-${chainId}`,
        chainCount: chainResult.chainCount,
        x: Math.floor(game.field.width / 2),
        y: Math.floor(game.field.height / 2) - 2,
        timestamp: Date.now(),
      }

      setChainDisplays((prev) => [...prev, chainInfo])

      // 2秒後にクリーンアップ（メモリリーク防止）
      const timer = setTimeout(() => {
        setChainDisplays((prev) =>
          prev.filter((chain) => chain.id !== chainInfo.id)
        )
        animationTimersRef.current.delete(timer)
      }, 2000)
      animationTimersRef.current.add(timer)
    }

    // 処理済みIDを更新
    lastProcessedChainId.current = chainId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.lastChainResult, gameSettings.animationsEnabled])

  // コンポーネントアンマウント時の総合的なクリーンアップ（メモリリーク防止）
  useEffect(() => {
    const animationTimers = animationTimersRef.current
    const chainTimeout = chainTimeoutRef.current

    return () => {
      // 全アニメーションタイマーのクリアアップ
      animationTimers.forEach((timer) => {
        clearTimeout(timer)
      })
      animationTimers.clear()

      // チェーン用タイマーのクリーンアップ
      if (chainTimeout) {
        clearTimeout(chainTimeout)
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

  // フィールド描画の最適化（memoization）
  const renderedField = useMemo(() => {
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
    // getCellStyleは毎回同じロジックなので依存関係から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.field, game.currentPair, game.state])

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
        duration={0.8}
      />
    ))
  }

  const renderChainDisplays = () => {
    // アニメーションが無効化されている場合は何も表示しない
    if (!gameSettings.animationsEnabled) {
      return []
    }

    return chainDisplays.map((chain) => (
      <ChainDisplay
        key={chain.id}
        chainCount={chain.chainCount}
        x={chain.x}
        y={chain.y - 2} // 表示オフセットを考慮
      />
    ))
  }

  // クラス名を動的に生成
  const gameBoardClass = `game-board ${gameSettings.showGridLines ? 'show-grid' : ''} ${gameSettings.showShadow ? 'show-shadow' : ''} ${gameSettings.animationsEnabled ? 'animations-enabled' : ''}`
  const fieldClass = `field ${gameSettings.showShadow ? 'show-shadow' : ''}`

  return (
    <div
      data-testid="game-board"
      className={gameBoardClass}
      role="application"
      aria-label="ぷよぷよゲームフィールド"
      aria-describedby="game-instructions"
    >
      {getGameStateText() && (
        <div
          className="game-info"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="game-status">
            <span>{getGameStateText()}</span>
          </div>
        </div>
      )}
      <div
        className={fieldClass}
        role="grid"
        aria-label="ぷよぷよゲームフィールド (6列 × 14行)"
        aria-readonly="true"
      >
        {renderedField}
        <div
          className="animated-puyos-container"
          aria-live="assertive"
          aria-label="アニメーション表示エリア"
        >
          {renderAnimatedPuyos()}
          {renderDisappearEffects()}
          {renderChainDisplays()}
        </div>
      </div>

      {/* スクリーンリーダー用の隠しテキスト */}
      <div id="game-instructions" className="sr-only" aria-hidden="false">
        矢印キーでぷよを移動、上キーまたはZキーで回転、スペースキーでハードドロップ、Pキーでポーズ
      </div>
    </div>
  )
})

export default GameBoard
