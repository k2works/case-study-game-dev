import { useState, useEffect } from 'react'
import { VolumeControl } from './VolumeControl'
import { soundEffect } from '../services/SoundEffect'
import { backgroundMusic } from '../services/BackgroundMusic'
import './AudioSettingsPanel.css'

interface AudioSettingsPanelProps {
  /**
   * パネルの表示状態
   */
  isOpen: boolean

  /**
   * パネルを閉じる際のコールバック
   */
  onClose: () => void
}

/**
 * 音響設定パネルコンポーネント
 * BGMと効果音の音量制御機能を提供
 */
export const AudioSettingsPanel: React.FC<AudioSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [bgmVolume, setBgmVolume] = useState(0.5)
  const [soundVolume, setSoundVolume] = useState(1.0)
  const [bgmMuted, setBgmMuted] = useState(false)
  const [soundMuted, setSoundMuted] = useState(false)

  // 初期化時に音響システムから現在の状態を取得
  useEffect(() => {
    const bgmInstance = backgroundMusic.getInstance()
    const soundInstance = soundEffect.getInstance()

    // 現在のミュート状態を取得
    setBgmMuted(bgmInstance.isMuted())
    setSoundMuted(soundInstance.isMuted())
  }, [])

  // BGM音量変更ハンドラー
  const handleBgmVolumeChange = (volume: number) => {
    setBgmVolume(volume)
    backgroundMusic.setVolume(volume)
  }

  // 効果音音量変更ハンドラー
  const handleSoundVolumeChange = (volume: number) => {
    setSoundVolume(volume)
    soundEffect.setVolume(volume)
  }

  // BGMミュート変更ハンドラー
  const handleBgmMuteChange = (muted: boolean) => {
    setBgmMuted(muted)
    if (muted) {
      backgroundMusic.mute()
    } else {
      backgroundMusic.unmute()
    }
  }

  // 効果音ミュート変更ハンドラー
  const handleSoundMuteChange = (muted: boolean) => {
    setSoundMuted(muted)
    if (muted) {
      soundEffect.mute()
    } else {
      soundEffect.unmute()
    }
  }

  // パネル外クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      // ボディのスクロールを防ぐ
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="audio-settings-overlay"
      onClick={handleBackdropClick}
      data-testid="audio-settings-overlay"
    >
      <div className="audio-settings-panel" data-testid="audio-settings-panel">
        <div className="audio-settings-panel__header">
          <h2 className="audio-settings-panel__title">音響設定</h2>
          <button
            className="audio-settings-panel__close"
            onClick={onClose}
            aria-label="音響設定を閉じる"
            data-testid="close-button"
          >
            ✕
          </button>
        </div>

        <div className="audio-settings-panel__content">
          <div className="audio-settings-panel__controls">
            <VolumeControl
              type="bgm"
              initialVolume={bgmVolume}
              initialMuted={bgmMuted}
              onVolumeChange={handleBgmVolumeChange}
              onMuteChange={handleBgmMuteChange}
            />

            <VolumeControl
              type="sound"
              initialVolume={soundVolume}
              initialMuted={soundMuted}
              onVolumeChange={handleSoundVolumeChange}
              onMuteChange={handleSoundMuteChange}
            />
          </div>

          <div className="audio-settings-panel__footer">
            <p className="audio-settings-panel__info">
              音量設定は自動的に保存されます
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
