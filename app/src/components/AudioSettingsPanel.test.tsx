import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AudioSettingsPanel } from './AudioSettingsPanel'
import { soundEffect } from '../services/SoundEffect'
import { backgroundMusic } from '../services/BackgroundMusic'

// 音響サービスをモック化
vi.mock('../services/SoundEffect', () => ({
  soundEffect: {
    getInstance: vi.fn(() => ({
      isMuted: vi.fn(() => false),
    })),
    setVolume: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
  },
}))

vi.mock('../services/BackgroundMusic', () => ({
  backgroundMusic: {
    getInstance: vi.fn(() => ({
      isMuted: vi.fn(() => false),
    })),
    setVolume: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
  },
}))

describe('AudioSettingsPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // document.body.style.overflow のリセット
    document.body.style.overflow = ''
  })

  afterEach(() => {
    // クリーンアップ
    document.body.style.overflow = ''
  })

  it('パネルが開いている時に表示される', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    expect(screen.getByTestId('audio-settings-panel')).toBeInTheDocument()
    expect(screen.getByText('音響設定')).toBeInTheDocument()
  })

  it('パネルが閉じている時は表示されない', () => {
    render(<AudioSettingsPanel {...defaultProps} isOpen={false} />)

    expect(screen.queryByTestId('audio-settings-panel')).not.toBeInTheDocument()
  })

  it('BGMと効果音の音量制御が表示される', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    expect(screen.getByTestId('volume-control-bgm')).toBeInTheDocument()
    expect(screen.getByTestId('volume-control-sound')).toBeInTheDocument()
  })

  it('閉じるボタンクリックで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<AudioSettingsPanel {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByTestId('close-button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('オーバーレイクリックで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<AudioSettingsPanel {...defaultProps} onClose={onClose} />)

    const overlay = screen.getByTestId('audio-settings-overlay')
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('パネル内クリックでは onClose が呼ばれない', () => {
    const onClose = vi.fn()
    render(<AudioSettingsPanel {...defaultProps} onClose={onClose} />)

    const panel = screen.getByTestId('audio-settings-panel')
    fireEvent.click(panel)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('ESCキーで onClose が呼ばれる', () => {
    const onClose = vi.fn()
    render(<AudioSettingsPanel {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('パネルが開いている時にボディのスクロールが無効になる', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('パネルが閉じた時にボディのスクロールが復元される', () => {
    const { rerender } = render(<AudioSettingsPanel {...defaultProps} />)

    // パネルを閉じる
    rerender(<AudioSettingsPanel {...defaultProps} isOpen={false} />)

    expect(document.body.style.overflow).toBe('')
  })

  it('BGM音量変更が backgroundMusic.setVolume を呼ぶ', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    const bgmSlider = screen.getByTestId('volume-slider-bgm')
    fireEvent.change(bgmSlider, { target: { value: '0.8' } })

    expect(backgroundMusic.setVolume).toHaveBeenCalledWith(0.8)
  })

  it('効果音音量変更が soundEffect.setVolume を呼ぶ', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    const soundSlider = screen.getByTestId('volume-slider-sound')
    fireEvent.change(soundSlider, { target: { value: '0.6' } })

    expect(soundEffect.setVolume).toHaveBeenCalledWith(0.6)
  })

  it('BGMミュート変更が backgroundMusic.mute/unmute を呼ぶ', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    const bgmMuteButton = screen.getByTestId('mute-button-bgm')

    // ミュート
    fireEvent.click(bgmMuteButton)
    expect(backgroundMusic.mute).toHaveBeenCalledOnce()

    // ミュート解除
    fireEvent.click(bgmMuteButton)
    expect(backgroundMusic.unmute).toHaveBeenCalledOnce()
  })

  it('効果音ミュート変更が soundEffect.mute/unmute を呼ぶ', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    const soundMuteButton = screen.getByTestId('mute-button-sound')

    // ミュート
    fireEvent.click(soundMuteButton)
    expect(soundEffect.mute).toHaveBeenCalledOnce()

    // ミュート解除
    fireEvent.click(soundMuteButton)
    expect(soundEffect.unmute).toHaveBeenCalledOnce()
  })

  it('初期化時に現在のミュート状態を取得する', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    expect(backgroundMusic.getInstance).toHaveBeenCalled()
    expect(soundEffect.getInstance).toHaveBeenCalled()
  })

  it('情報メッセージが表示される', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    expect(
      screen.getByText('音量設定は自動的に保存されます')
    ).toBeInTheDocument()
  })

  it('アクセシビリティ属性が正しく設定される', () => {
    render(<AudioSettingsPanel {...defaultProps} />)

    const closeButton = screen.getByTestId('close-button')
    expect(closeButton).toHaveAttribute('aria-label', '音響設定を閉じる')
  })
})
