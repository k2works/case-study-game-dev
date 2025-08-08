import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { SettingsPanel } from './SettingsPanel'

// localStorageのモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// window.confirmのモック
Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
})

// console.logとconsole.errorのモック
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

// サウンドサービスのモック
vi.mock('../services/SoundEffect', () => ({
  soundEffect: {
    setVolume: vi.fn(),
  },
}))

vi.mock('../services/BackgroundMusic', () => ({
  backgroundMusic: {
    setVolume: vi.fn(),
  },
}))

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('基本表示', () => {
    it('パネルが閉じている時は何も表示されない', () => {
      render(<SettingsPanel isOpen={false} onClose={mockOnClose} />)

      expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument()
    })

    it('パネルが開いている時は設定画面が表示される', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
      expect(screen.getByText('⚙️ ゲーム設定')).toBeInTheDocument()
    })

    it('全ての設定セクションが表示される', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('🔊 音響設定')).toBeInTheDocument()
      expect(screen.getByText('🎮 ゲームプレイ')).toBeInTheDocument()
      expect(screen.getByText('👁️ 表示設定')).toBeInTheDocument()
    })
  })

  describe('音響設定', () => {
    it('効果音とBGMの音量コントロールが表示される', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByText('効果音音量')).toBeInTheDocument()
      expect(screen.getByText('BGM音量')).toBeInTheDocument()
      expect(screen.getByTestId('volume-control-sound')).toBeInTheDocument()
      expect(screen.getByTestId('volume-control-bgm')).toBeInTheDocument()
    })

    it('音量がパーセンテージで表示される', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      // デフォルト値（70%, 50%）が表示される
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
  })

  describe('ゲームプレイ設定', () => {
    it('自動落下速度の選択肢が表示される', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const select = screen.getByTestId('auto-drop-speed')
      expect(select).toBeInTheDocument()
      expect(screen.getByText('標準 (1秒)')).toBeInTheDocument()
    })

    it('自動落下速度を変更できる', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const select = screen.getByTestId('auto-drop-speed')
      fireEvent.change(select, { target: { value: '500' } })

      expect((select as HTMLSelectElement).value).toBe('500')
    })
  })

  describe('表示設定', () => {
    it('全ての表示オプションが表示される', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('show-grid-lines')).toBeInTheDocument()
      expect(screen.getByTestId('show-shadow')).toBeInTheDocument()
      expect(screen.getByTestId('animations-enabled')).toBeInTheDocument()
      expect(screen.getByText('グリッド線を表示')).toBeInTheDocument()
      expect(screen.getByText('ぷよの影を表示')).toBeInTheDocument()
      expect(screen.getByText('アニメーションを有効化')).toBeInTheDocument()
    })

    it('チェックボックスの状態を変更できる', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const gridLinesCheckbox = screen.getByTestId('show-grid-lines')
      const shadowCheckbox = screen.getByTestId('show-shadow')
      const animationsCheckbox = screen.getByTestId('animations-enabled')

      // 初期状態の確認
      expect(gridLinesCheckbox).not.toBeChecked()
      expect(shadowCheckbox).toBeChecked()
      expect(animationsCheckbox).toBeChecked()

      // 状態変更
      fireEvent.click(gridLinesCheckbox)
      fireEvent.click(shadowCheckbox)

      expect(gridLinesCheckbox).toBeChecked()
      expect(shadowCheckbox).not.toBeChecked()
    })
  })

  describe('設定の保存・読み込み', () => {
    it('パネル表示時に設定を読み込む', () => {
      const savedSettings = {
        soundVolume: 0.8,
        musicVolume: 0.6,
        autoDropSpeed: 750,
        showGridLines: true,
        showShadow: false,
        animationsEnabled: false,
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedSettings))

      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'puyo-puyo-settings'
      )
      expect(screen.getByTestId('volume-percentage-sound')).toHaveTextContent(
        '80%'
      )
      expect(screen.getByTestId('volume-percentage-bgm')).toHaveTextContent(
        '60%'
      )
    })

    it('保存ボタンクリックで設定を保存する', async () => {
      const { soundEffect } = await import('../services/SoundEffect')
      const { backgroundMusic } = await import('../services/BackgroundMusic')

      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'puyo-puyo-settings',
          expect.stringContaining('"soundVolume":0.7')
        )
      })

      expect(soundEffect.setVolume).toHaveBeenCalledWith(0.7)
      expect(backgroundMusic.setVolume).toHaveBeenCalledWith(0.5)
      expect(mockConsoleLog).toHaveBeenCalledWith('設定を保存しました')
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('設定の読み込みエラーをハンドリングする', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(mockConsoleError).toHaveBeenCalledWith(
        '設定の読み込みに失敗しました:',
        expect.any(Error)
      )
    })

    it('設定の保存エラーをハンドリングする', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const saveButton = screen.getByTestId('save-button')
      fireEvent.click(saveButton)

      expect(mockConsoleError).toHaveBeenCalledWith(
        '設定の保存に失敗しました:',
        expect.any(Error)
      )
    })
  })

  describe('デフォルト設定', () => {
    it('デフォルトに戻すボタンで初期値に戻る', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      // 設定を変更
      const gridLinesCheckbox = screen.getByTestId('show-grid-lines')
      fireEvent.click(gridLinesCheckbox)

      // デフォルトに戻す
      const resetButton = screen.getByTestId('reset-defaults')
      fireEvent.click(resetButton)

      expect(gridLinesCheckbox).not.toBeChecked()
    })
  })

  describe('変更の検知', () => {
    it('設定変更時に保存ボタンのスタイルが変わる', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const saveButton = screen.getByTestId('save-button')
      const gridLinesCheckbox = screen.getByTestId('show-grid-lines')

      // 初期状態では変更なし
      expect(saveButton).not.toHaveClass('has-changes')

      // 設定を変更
      fireEvent.click(gridLinesCheckbox)

      // 変更ありの状態になる
      expect(saveButton).toHaveClass('has-changes')
    })
  })

  describe('パネルの閉じ方', () => {
    it('クローズボタンで変更なしの場合はそのまま閉じる', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByTestId('settings-close')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('キャンセルボタンで変更なしの場合はそのまま閉じる', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      const cancelButton = screen.getByTestId('cancel-button')
      fireEvent.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('変更がある場合に確認ダイアログを表示する', () => {
      ;(window.confirm as Mock).mockReturnValue(true)

      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      // 設定を変更
      const gridLinesCheckbox = screen.getByTestId('show-grid-lines')
      fireEvent.click(gridLinesCheckbox)

      // キャンセル
      const cancelButton = screen.getByTestId('cancel-button')
      fireEvent.click(cancelButton)

      expect(window.confirm).toHaveBeenCalledWith(
        '変更が保存されていません。破棄してもよろしいですか？'
      )
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('変更破棄を拒否した場合はパネルが閉じない', () => {
      ;(window.confirm as Mock).mockReturnValue(false)

      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      // 設定を変更
      const gridLinesCheckbox = screen.getByTestId('show-grid-lines')
      fireEvent.click(gridLinesCheckbox)

      // キャンセル
      const cancelButton = screen.getByTestId('cancel-button')
      fireEvent.click(cancelButton)

      expect(window.confirm).toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('アクセシビリティ', () => {
    it('適切なdata-testid属性が設定されている', () => {
      render(<SettingsPanel isOpen={true} onClose={mockOnClose} />)

      expect(screen.getByTestId('settings-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument()
      expect(screen.getByTestId('settings-close')).toBeInTheDocument()
      expect(screen.getByTestId('save-button')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
      expect(screen.getByTestId('reset-defaults')).toBeInTheDocument()
    })
  })
})
