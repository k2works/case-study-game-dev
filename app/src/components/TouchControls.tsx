import React, { useCallback } from 'react'
import './TouchControls.css'

interface TouchControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onDrop: () => void
  onHardDrop: () => void
  isPlaying: boolean
}

/**
 * モバイル用タッチコントロールコンポーネント
 * 画面下部に配置される仮想ボタンでゲーム操作を提供
 */
export const TouchControls: React.FC<TouchControlsProps> = React.memo(
  ({ onMoveLeft, onMoveRight, onRotate, onDrop, onHardDrop, isPlaying }) => {
    // タッチイベントの処理（preventDefault付き）
    const handleTouchStart = useCallback((handler: () => void) => {
      return (e: React.TouchEvent) => {
        e.preventDefault()
        handler()
      }
    }, [])

    // ボタンの無効化状態
    const disabled = !isPlaying

    return (
      <div
        className="touch-controls"
        role="toolbar"
        aria-label="タッチ操作コントロール"
      >
        <div className="touch-controls-group movement">
          <button
            className="touch-button left"
            onTouchStart={handleTouchStart(onMoveLeft)}
            onClick={onMoveLeft}
            disabled={disabled}
            aria-label="左に移動"
            data-testid="touch-left"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <path
                d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            className="touch-button right"
            onTouchStart={handleTouchStart(onMoveRight)}
            onClick={onMoveRight}
            disabled={disabled}
            aria-label="右に移動"
            data-testid="touch-right"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <path
                d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="touch-controls-group actions">
          <button
            className="touch-button rotate"
            onTouchStart={handleTouchStart(onRotate)}
            onClick={onRotate}
            disabled={disabled}
            aria-label="回転"
            data-testid="touch-rotate"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <path
                d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            className="touch-button drop"
            onTouchStart={handleTouchStart(onDrop)}
            onClick={onDrop}
            disabled={disabled}
            aria-label="高速落下"
            data-testid="touch-drop"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <path
                d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            className="touch-button hard-drop"
            onTouchStart={handleTouchStart(onHardDrop)}
            onClick={onHardDrop}
            disabled={disabled}
            aria-label="ハードドロップ"
            data-testid="touch-hard-drop"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <path
                d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }
)

TouchControls.displayName = 'TouchControls'
