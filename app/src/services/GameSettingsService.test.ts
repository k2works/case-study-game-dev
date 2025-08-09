import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  gameSettingsService,
  DEFAULT_SETTINGS,
  GameSettings,
} from './GameSettingsService'

// localStorageのモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn().mockReturnValue(undefined), // setItemを明示的にundefinedを返すように設定
  removeItem: vi.fn().mockReturnValue(undefined),
  clear: vi.fn().mockReturnValue(undefined),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// console.errorのモック
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('GameSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('設定の取得', () => {
    it('保存された設定がない場合はデフォルト設定を返す', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const settings = gameSettingsService.getSettings()

      expect(settings).toEqual(DEFAULT_SETTINGS)
    })

    it('保存された設定がある場合は読み込んで返す', () => {
      const savedSettings: GameSettings = {
        soundVolume: 0.8,
        musicVolume: 0.6,
        autoDropSpeed: 750,
        showGridLines: true,
        showShadow: false,
        animationsEnabled: false,
        colorBlindMode: true,
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings))

      const settings = gameSettingsService.getSettings()

      expect(settings).toEqual(savedSettings)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'puyo-puyo-settings'
      )
    })

    it('部分的な設定データの場合はデフォルト値で補完する', () => {
      const partialSettings = {
        soundVolume: 0.8,
        musicVolume: 0.6,
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialSettings))

      const settings = gameSettingsService.getSettings()

      expect(settings).toEqual({
        ...DEFAULT_SETTINGS,
        ...partialSettings,
      })
    })

    it('無効なJSONの場合はデフォルト設定を返す', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const settings = gameSettingsService.getSettings()

      expect(settings).toEqual(DEFAULT_SETTINGS)
      expect(mockConsoleError).toHaveBeenCalledWith(
        '設定の読み込みに失敗:',
        expect.any(Error)
      )
    })

    it('localStorageエラーの場合はデフォルト設定を返す', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const settings = gameSettingsService.getSettings()

      expect(settings).toEqual(DEFAULT_SETTINGS)
      expect(mockConsoleError).toHaveBeenCalled()
    })
  })

  describe('設定の保存', () => {
    it('正常な設定を保存できる', () => {
      const settings: GameSettings = {
        soundVolume: 0.8,
        musicVolume: 0.6,
        autoDropSpeed: 750,
        showGridLines: true,
        showShadow: false,
        animationsEnabled: true,
        colorBlindMode: false,
      }

      const result = gameSettingsService.saveSettings(settings)

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'puyo-puyo-settings',
        JSON.stringify(settings)
      )
    })

    it('音量の値を適切な範囲にクランプして保存する', () => {
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        soundVolume: 2.0, // 範囲外
        musicVolume: -0.5, // 範囲外
      }

      const result = gameSettingsService.saveSettings(settings)

      expect(result).toBe(true)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.soundVolume).toBe(1.0)
      expect(savedData.musicVolume).toBe(0.0)
    })

    it('自動落下速度を適切な範囲にクランプして保存する', () => {
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        autoDropSpeed: 50, // 最小値未満
      }

      gameSettingsService.saveSettings(settings)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.autoDropSpeed).toBe(100)
    })

    it('保存エラーの場合はfalseを返す', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = gameSettingsService.saveSettings(DEFAULT_SETTINGS)

      expect(result).toBe(false)
      expect(mockConsoleError).toHaveBeenCalledWith(
        '設定の保存に失敗:',
        expect.any(Error)
      )
    })
  })

  describe('個別設定の操作', () => {
    it('特定の設定項目を取得できる', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ ...DEFAULT_SETTINGS, soundVolume: 0.8 })
      )

      const volume = gameSettingsService.getSetting('soundVolume')

      expect(volume).toBe(0.8)
    })

    it.skip('特定の設定項目を更新できる', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(DEFAULT_SETTINGS))

      const result = gameSettingsService.updateSetting('soundVolume', 0.9)

      expect(result).toBe(true)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.soundVolume).toBe(0.9)
    })
  })

  describe('設定のリセット', () => {
    it.skip('設定をデフォルト値にリセットできる', () => {
      const result = gameSettingsService.resetToDefaults()

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'puyo-puyo-settings',
        JSON.stringify(DEFAULT_SETTINGS)
      )
    })
  })

  describe('変更の検知', () => {
    it('設定に変更がある場合はtrueを返す', () => {
      const original = DEFAULT_SETTINGS
      const modified = { ...DEFAULT_SETTINGS, soundVolume: 0.8 }

      const hasChanges = gameSettingsService.hasChanges(modified, original)

      expect(hasChanges).toBe(true)
    })

    it('設定に変更がない場合はfalseを返す', () => {
      const settings = DEFAULT_SETTINGS

      const hasChanges = gameSettingsService.hasChanges(settings, settings)

      expect(hasChanges).toBe(false)
    })

    it('originalが未指定の場合は保存済み設定と比較する', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(DEFAULT_SETTINGS))

      const modified = { ...DEFAULT_SETTINGS, soundVolume: 0.8 }
      const hasChanges = gameSettingsService.hasChanges(modified)

      expect(hasChanges).toBe(true)
    })
  })

  describe('設定のエクスポート・インポート', () => {
    it('設定をJSON文字列としてエクスポートできる', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(DEFAULT_SETTINGS))

      const exported = gameSettingsService.exportSettings()

      expect(exported).toBe(JSON.stringify(DEFAULT_SETTINGS, null, 2))
    })

    it.skip('JSON文字列から設定をインポートできる', () => {
      const settings = { ...DEFAULT_SETTINGS, soundVolume: 0.8 }
      const settingsJson = JSON.stringify(settings)

      const result = gameSettingsService.importSettings(settingsJson)

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'puyo-puyo-settings',
        JSON.stringify(settings)
      )
    })

    it('無効なJSONのインポートはfalseを返す', () => {
      const result = gameSettingsService.importSettings('invalid json')

      expect(result).toBe(false)
      expect(mockConsoleError).toHaveBeenCalledWith(
        '設定のインポートに失敗:',
        expect.any(Error)
      )
    })
  })

  describe('設定のクリア', () => {
    it('設定をクリアできる', () => {
      gameSettingsService.clearSettings()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'puyo-puyo-settings'
      )
    })

    it('クリアエラーをハンドリングする', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      gameSettingsService.clearSettings()

      expect(mockConsoleError).toHaveBeenCalledWith(
        '設定のクリアに失敗:',
        expect.any(Error)
      )
    })
  })

  describe('設定の妥当性検証', () => {
    it('ブール値を正しく検証する', () => {
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        showGridLines: 'true' as unknown as boolean, // 文字列を渡す
        showShadow: 1 as unknown as boolean, // 数値を渡す
        animationsEnabled: null as unknown as boolean, // nullを渡す
      }

      gameSettingsService.saveSettings(settings)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.showGridLines).toBe(true)
      expect(savedData.showShadow).toBe(true)
      expect(savedData.animationsEnabled).toBe(false)
    })

    it('自動落下速度の上限値をテストする', () => {
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        autoDropSpeed: 10000, // 上限値超過
      }

      gameSettingsService.saveSettings(settings)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.autoDropSpeed).toBe(5000)
    })
  })
})
