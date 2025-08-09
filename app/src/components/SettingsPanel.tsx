import React, { useState, useEffect } from 'react'
import { VolumeControl } from './VolumeControl'
import { soundEffect } from '../services/SoundEffect'
import { backgroundMusic } from '../services/BackgroundMusic'
import { useFocusTrap } from '../hooks/useFocusTrap'
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
  colorBlindMode: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.7,
  musicVolume: 0.5,
  autoDropSpeed: 1000, // ミリ秒
  showGridLines: false,
  showShadow: true,
  animationsEnabled: true,
  colorBlindMode: false,
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
    // 設定変更を通知するために設定更新イベントを発行
    window.dispatchEvent(new Event('settingsChanged'))
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

  // フォーカストラップを設定
  const focusTrapRef = useFocusTrap({
    isActive: isOpen,
    onEscape: handleCancel,
  })

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="settings-overlay"
      data-testid="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        ref={focusTrapRef}
        className="settings-panel"
        data-testid="settings-panel"
      >
        <div className="settings-header">
          <h2 id="settings-title" role="heading" aria-level={2}>
            ⚙️ ゲーム設定
          </h2>
          <button
            className="settings-close"
            onClick={handleCancel}
            data-testid="settings-close"
            aria-label="設定パネルを閉じます"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* 音響設定 */}
          <section
            className="settings-section"
            role="group"
            aria-labelledby="sound-settings-title"
          >
            <h3 id="sound-settings-title" role="heading" aria-level={3}>
              🔊 音響設定
            </h3>
            <div className="setting-item">
              <label htmlFor="sound-volume">効果音音量</label>
              <VolumeControl
                type="sound"
                initialVolume={settings.soundVolume}
                onVolumeChange={(volume: number) =>
                  handleSettingChange('soundVolume', volume)
                }
                onMuteChange={() => {}}
              />
            </div>
            <div className="setting-item">
              <label htmlFor="music-volume">BGM音量</label>
              <VolumeControl
                type="bgm"
                initialVolume={settings.musicVolume}
                onVolumeChange={(volume: number) =>
                  handleSettingChange('musicVolume', volume)
                }
                onMuteChange={() => {}}
              />
            </div>
          </section>

          {/* ゲームプレイ設定 */}
          <section
            className="settings-section"
            role="group"
            aria-labelledby="gameplay-settings-title"
          >
            <h3 id="gameplay-settings-title" role="heading" aria-level={3}>
              🎮 ゲームプレイ
            </h3>
            <div className="setting-item">
              <label htmlFor="auto-drop-speed">自動落下速度</label>
              <select
                id="auto-drop-speed"
                value={settings.autoDropSpeed}
                onChange={(e) =>
                  handleSettingChange('autoDropSpeed', parseInt(e.target.value))
                }
                data-testid="auto-drop-speed"
                aria-describedby="auto-drop-speed-desc"
              >
                <option value={2000}>遅い (2秒)</option>
                <option value={1500}>やや遅い (1.5秒)</option>
                <option value={1000}>標準 (1秒)</option>
                <option value={750}>やや速い (0.75秒)</option>
                <option value={500}>速い (0.5秒)</option>
              </select>
              <div id="auto-drop-speed-desc" className="sr-only">
                ぷよが自動的に落下する速度を設定します
              </div>
            </div>
          </section>

          {/* 表示設定 */}
          <section
            className="settings-section"
            role="group"
            aria-labelledby="display-settings-title"
          >
            <h3 id="display-settings-title" role="heading" aria-level={3}>
              👁️ 表示設定
            </h3>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showGridLines}
                  onChange={(e) =>
                    handleSettingChange('showGridLines', e.target.checked)
                  }
                  data-testid="show-grid-lines"
                  aria-describedby="grid-lines-desc"
                />
                グリッド線を表示
              </label>
              <div id="grid-lines-desc" className="sr-only">
                ゲームフィールドにグリッド線を表示して、セルの区切りを明確にします
              </div>
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
                  aria-describedby="shadow-desc"
                />
                ぷよの影を表示
              </label>
              <div id="shadow-desc" className="sr-only">
                ぷよに影効果を追加して、立体的な表示にします
              </div>
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
                  aria-describedby="animations-desc"
                />
                アニメーションを有効化
              </label>
              <div id="animations-desc" className="sr-only">
                ぷよの落下や消去のアニメーションを有効にします
              </div>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.colorBlindMode}
                  onChange={(e) =>
                    handleSettingChange('colorBlindMode', e.target.checked)
                  }
                  data-testid="color-blind-mode"
                  aria-describedby="color-blind-desc"
                />
                色覚多様性対応（パターン表示）
              </label>
              <div id="color-blind-desc" className="sr-only">
                ぷよにパターンを追加して、色での区別が困難な方でもゲームを楽しめるようにします
              </div>
            </div>
          </section>
        </div>

        <div
          className="settings-footer"
          role="group"
          aria-label="設定アクション"
        >
          <button
            className="settings-button secondary"
            onClick={resetToDefaults}
            data-testid="reset-defaults"
            aria-label="すべての設定をデフォルト値にリセットします"
          >
            デフォルトに戻す
          </button>
          <div className="settings-actions">
            <button
              className="settings-button secondary"
              onClick={handleCancel}
              data-testid="cancel-button"
              aria-label="変更を破棄して設定パネルを閉じます"
            >
              キャンセル
            </button>
            <button
              className={`settings-button primary ${hasChanges ? 'has-changes' : ''}`}
              onClick={handleSave}
              data-testid="save-button"
              aria-label="変更した設定を保存します"
              aria-describedby={hasChanges ? 'changes-indicator' : undefined}
            >
              保存
              {hasChanges && (
                <span
                  id="changes-indicator"
                  className="sr-only"
                  aria-live="polite"
                >
                  未保存の変更があります
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
