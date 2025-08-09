export interface GameSettings {
  soundVolume: number
  musicVolume: number
  autoDropSpeed: number
  showGridLines: boolean
  showShadow: boolean
  animationsEnabled: boolean
  colorBlindMode: boolean
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.7,
  musicVolume: 0.5,
  autoDropSpeed: 1000, // ミリ秒
  showGridLines: false,
  showShadow: true,
  animationsEnabled: true,
  colorBlindMode: false,
}

/**
 * ゲーム設定管理サービス
 * localStorage を使用して設定の永続化を行う
 */
class GameSettingsService {
  private readonly STORAGE_KEY = 'puyo-puyo-settings'
  private readonly MAX_VOLUME = 1.0
  private readonly MIN_VOLUME = 0.0

  /**
   * 設定を読み込み
   */
  getSettings(): GameSettings {
    try {
      const savedSettings = localStorage.getItem(this.STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as Partial<GameSettings>
        // デフォルト設定とマージして不足キーを補完
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.error('設定の読み込みに失敗:', error)
    }
    return DEFAULT_SETTINGS
  }

  /**
   * 設定を保存
   */
  saveSettings(settings: GameSettings): boolean {
    try {
      // 設定の妥当性検証
      const validatedSettings = this.validateSettings(settings)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validatedSettings))
      return true
    } catch (error) {
      console.error('設定の保存に失敗:', error)
      return false
    }
  }

  /**
   * 特定の設定項目を取得
   */
  getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    const settings = this.getSettings()
    return settings[key]
  }

  /**
   * 特定の設定項目を更新
   */
  updateSetting<K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ): boolean {
    const settings = this.getSettings()
    settings[key] = value
    return this.saveSettings(settings)
  }

  /**
   * 設定をデフォルトに戻す
   */
  resetToDefaults(): boolean {
    return this.saveSettings(DEFAULT_SETTINGS)
  }

  /**
   * 設定の妥当性を検証
   */
  private validateSettings(settings: GameSettings): GameSettings {
    return {
      soundVolume: this.clampVolume(settings.soundVolume),
      musicVolume: this.clampVolume(settings.musicVolume),
      autoDropSpeed: Math.max(100, Math.min(5000, settings.autoDropSpeed)),
      showGridLines: Boolean(settings.showGridLines),
      showShadow: Boolean(settings.showShadow),
      animationsEnabled: Boolean(settings.animationsEnabled),
      colorBlindMode: Boolean(settings.colorBlindMode),
    }
  }

  /**
   * 音量を適切な範囲にクランプ
   */
  private clampVolume(volume: number): number {
    return Math.max(this.MIN_VOLUME, Math.min(this.MAX_VOLUME, volume))
  }

  /**
   * 設定が変更されたかチェック
   */
  hasChanges(current: GameSettings, original?: GameSettings): boolean {
    const compareWith = original || this.getSettings()

    return (
      this.checkVolumeChanges(current, compareWith) ||
      this.checkDisplayChanges(current, compareWith) ||
      this.checkGameplayChanges(current, compareWith)
    )
  }

  /**
   * 音量設定の変更をチェック
   */
  private checkVolumeChanges(
    current: GameSettings,
    compareWith: GameSettings
  ): boolean {
    return (
      current.soundVolume !== compareWith.soundVolume ||
      current.musicVolume !== compareWith.musicVolume
    )
  }

  /**
   * 表示設定の変更をチェック
   */
  private checkDisplayChanges(
    current: GameSettings,
    compareWith: GameSettings
  ): boolean {
    return (
      current.showGridLines !== compareWith.showGridLines ||
      current.showShadow !== compareWith.showShadow ||
      current.animationsEnabled !== compareWith.animationsEnabled ||
      current.colorBlindMode !== compareWith.colorBlindMode
    )
  }

  /**
   * ゲームプレイ設定の変更をチェック
   */
  private checkGameplayChanges(
    current: GameSettings,
    compareWith: GameSettings
  ): boolean {
    return current.autoDropSpeed !== compareWith.autoDropSpeed
  }

  /**
   * 設定をエクスポート（JSON文字列として）
   */
  exportSettings(): string {
    const settings = this.getSettings()
    return JSON.stringify(settings, null, 2)
  }

  /**
   * 設定をインポート（JSON文字列から）
   */
  importSettings(settingsJson: string): boolean {
    try {
      const parsed = JSON.parse(settingsJson) as GameSettings
      return this.saveSettings(parsed)
    } catch (error) {
      console.error('設定のインポートに失敗:', error)
      return false
    }
  }

  /**
   * ストレージをクリア
   */
  clearSettings(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('設定のクリアに失敗:', error)
    }
  }
}

// シングルトンとして提供
export const gameSettingsService = new GameSettingsService()
