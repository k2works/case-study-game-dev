import { useState, useEffect } from 'react'
import './VolumeControl.css'

interface VolumeControlProps {
  /**
   * 音量コントローラーのタイプ
   */
  type: 'bgm' | 'sound'

  /**
   * 初期音量 (0-1)
   */
  initialVolume: number

  /**
   * 音量変更時のコールバック
   */
  onVolumeChange: (volume: number) => void

  /**
   * ミュート状態の変更コールバック
   */
  onMuteChange: (muted: boolean) => void

  /**
   * 初期ミュート状態
   */
  initialMuted?: boolean

  /**
   * 表示ラベル
   */
  label?: string
}

/**
 * 音量制御コンポーネント
 * BGMと効果音の音量を個別に制御できる
 */
export const VolumeControl: React.FC<VolumeControlProps> = ({
  type,
  initialVolume,
  onVolumeChange,
  onMuteChange,
  initialMuted = false,
  label,
}) => {
  const [volume, setVolume] = useState(initialVolume)
  const [muted, setMuted] = useState(initialMuted)
  const [previousVolume, setPreviousVolume] = useState(initialVolume)

  // 音量が上がった時のミュート解除処理
  const handleVolumeIncrease = (newVolume: number) => {
    if (newVolume > 0 && muted) {
      setMuted(false)
      onMuteChange(false)
    }
  }

  // 音量変更ハンドラー
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    onVolumeChange(newVolume)
    handleVolumeIncrease(newVolume)
  }

  // ミュート時の処理
  const handleMuteOn = () => {
    setPreviousVolume(volume)
  }

  // ミュート解除時の処理
  const handleMuteOff = () => {
    const restoreVolume = previousVolume === 0 ? 0.5 : previousVolume
    setVolume(restoreVolume)
    onVolumeChange(restoreVolume)
  }

  // ミュート切り替えハンドラー
  const handleMuteToggle = () => {
    const newMuted = !muted
    setMuted(newMuted)
    onMuteChange(newMuted)

    if (newMuted) {
      handleMuteOn()
    } else {
      handleMuteOff()
    }
  }

  // 外部からの初期音量の同期
  useEffect(() => {
    setVolume(initialVolume)
    setPreviousVolume(initialVolume)
  }, [initialVolume])

  // 外部からのミュート状態の同期
  useEffect(() => {
    setMuted(initialMuted)
  }, [initialMuted])

  return (
    <VolumeControlView
      type={type}
      label={label}
      volume={volume}
      muted={muted}
      onVolumeChange={handleVolumeChange}
      onMuteToggle={handleMuteToggle}
    />
  )
}

// 音量アイコンを取得する関数
const getVolumeIcon = (muted: boolean, volume: number): string => {
  if (muted) return '🔇'
  if (volume === 0) return '🔈'
  if (volume < 0.5) return '🔉'
  return '🔊'
}

// 表示部分を分離したコンポーネント
interface VolumeControlViewProps {
  type: 'bgm' | 'sound'
  label?: string
  volume: number
  muted: boolean
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onMuteToggle: () => void
}

const VolumeControlView: React.FC<VolumeControlViewProps> = ({
  type,
  label,
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
}) => {
  const displayLabel = label || (type === 'bgm' ? 'BGM' : '効果音')
  const volumePercentage = Math.round(volume * 100)

  return (
    <div
      className={`volume-control volume-control--${type}`}
      data-testid={`volume-control-${type}`}
    >
      <div className="volume-control__header">
        <label className="volume-control__label" htmlFor={`volume-${type}`}>
          {displayLabel}
        </label>
        <span
          className="volume-control__percentage"
          data-testid={`volume-percentage-${type}`}
        >
          {muted ? 'ミュート' : `${volumePercentage}%`}
        </span>
      </div>

      <div className="volume-control__controls">
        <button
          className={`volume-control__mute ${muted ? 'volume-control__mute--active' : ''}`}
          onClick={onMuteToggle}
          aria-label={`${displayLabel}${muted ? 'ミュート解除' : 'ミュート'}`}
          data-testid={`mute-button-${type}`}
        >
          {getVolumeIcon(muted, volume)}
        </button>

        <input
          type="range"
          id={`volume-${type}`}
          className="volume-control__slider"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={onVolumeChange}
          disabled={muted}
          aria-label={`${displayLabel}音量`}
          data-testid={`volume-slider-${type}`}
        />
      </div>
    </div>
  )
}
