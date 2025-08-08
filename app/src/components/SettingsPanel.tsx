import React, { useState, useEffect } from 'react'
import { VolumeControl } from './VolumeControl'
import { soundEffect } from '../services/SoundEffect'
import { backgroundMusic } from '../services/BackgroundMusic'
import './SettingsPanel.css'

interface SettingsPanelProps {
  /**
   * パネルの表示状態
   */
  isOpen: boolean
  
  /**
   * パネルを閉じるコールバック
   */
  onClose: () => void
}

export interface GameSettings {
  soundVolume: number
  musicVolume: number
  autoDropSpeed: number
  showGridLines: boolean
  showShadow: boolean
  animationsEnabled: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.7,
  musicVolume: 0.5,
  autoDropSpeed: 1000, // ミリ秒
  showGridLines: false,
  showShadow: true,
  animationsEnabled: true,
}

/**
 * ゲーム設定パネルコンポーネント
 * 音響設定、ゲーム設定、表示設定を管理
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)

  // 設定の読み込み
  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('puyo-puyo-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as GameSettings
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
      setHasChanges(false)
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error)
      setSettings(DEFAULT_SETTINGS)
    }
  }

  const saveSettings = () => {
    try {
      localStorage.setItem('puyo-puyo-settings', JSON.stringify(settings))
      
      // 音量設定を即座に適用
      soundEffect.setVolume(settings.soundVolume)
      backgroundMusic.setVolume(settings.musicVolume)
      
      setHasChanges(false)
      
      // 設定保存完了の通知
      console.log('設定を保存しました')
    } catch (error) {
      console.error('設定の保存に失敗しました:', error)
    }
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasChanges(true)
  }

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    saveSettings()
    onClose()
  }

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm(
        '変更が保存されていません。破棄してもよろしいですか？'
      )
      if (confirmDiscard) {
        loadSettings()
        onClose()
      }
    } else {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="settings-overlay" data-testid="settings-overlay">
      <div className="settings-panel" data-testid="settings-panel">
        <div className="settings-header">
          <h2>⚙️ ゲーム設定</h2>
          <button
            className="settings-close"
            onClick={handleCancel}
            data-testid="settings-close"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* 音響設定 */}
          <section className="settings-section">
            <h3>🔊 音響設定</h3>
            <div className="setting-item">
              <label htmlFor="sound-volume">効果音音量</label>
              <VolumeControl
                type="sound"
                initialVolume={settings.soundVolume}
                onVolumeChange={(volume: number) => handleSettingChange('soundVolume', volume)}
                onMuteChange={() => {}}
              />
              <span className="volume-value">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <div className="setting-item">
              <label htmlFor="music-volume">BGM音量</label>
              <VolumeControl
                type="bgm"
                initialVolume={settings.musicVolume}
                onVolumeChange={(volume: number) => handleSettingChange('musicVolume', volume)}
                onMuteChange={() => {}}
              />
              <span className="volume-value">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
          </section>

          {/* ゲームプレイ設定 */}
          <section className="settings-section">
            <h3>🎮 ゲームプレイ</h3>
            <div className="setting-item">
              <label htmlFor="auto-drop-speed">自動落下速度</label>
              <select
                id="auto-drop-speed"
                value={settings.autoDropSpeed}
                onChange={(e) =>
                  handleSettingChange('autoDropSpeed', parseInt(e.target.value))
                }
                data-testid="auto-drop-speed"
              >
                <option value={2000}>遅い (2秒)</option>
                <option value={1500}>やや遅い (1.5秒)</option>
                <option value={1000}>標準 (1秒)</option>
                <option value={750}>やや速い (0.75秒)</option>
                <option value={500}>速い (0.5秒)</option>
              </select>
            </div>
          </section>

          {/* 表示設定 */}
          <section className="settings-section">
            <h3>👁️ 表示設定</h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showGridLines}
                  onChange={(e) =>
                    handleSettingChange('showGridLines', e.target.checked)
                  }
                  data-testid="show-grid-lines"
                />
                グリッド線を表示
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showShadow}
                  onChange={(e) =>
                    handleSettingChange('showShadow', e.target.checked)
                  }
                  data-testid="show-shadow"
                />
                ぷよの影を表示
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={(e) =>
                    handleSettingChange('animationsEnabled', e.target.checked)
                  }
                  data-testid="animations-enabled"
                />
                アニメーションを有効化
              </label>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button
            className="settings-button secondary"
            onClick={resetToDefaults}
            data-testid="reset-defaults"
          >
            デフォルトに戻す
          </button>
          <div className="settings-actions">
            <button
              className="settings-button secondary"
              onClick={handleCancel}
              data-testid="cancel-button"
            >
              キャンセル
            </button>
            <button
              className={`settings-button primary ${hasChanges ? 'has-changes' : ''}`}
              onClick={handleSave}
              data-testid="save-button"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}