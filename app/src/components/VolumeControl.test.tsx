import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { VolumeControl } from './VolumeControl'

describe('VolumeControl', () => {
  const defaultProps = {
    type: 'bgm' as const,
    initialVolume: 0.5,
    onVolumeChange: vi.fn(),
    onMuteChange: vi.fn(),
  }

  it('初期状態で正しく表示される', () => {
    render(<VolumeControl {...defaultProps} />)

    // ラベルが表示される
    expect(screen.getByText('BGM')).toBeInTheDocument()

    // 音量パーセンテージが表示される
    expect(screen.getByTestId('volume-percentage-bgm')).toHaveTextContent('50%')

    // ミュートボタンが表示される
    expect(screen.getByTestId('mute-button-bgm')).toBeInTheDocument()

    // 音量スライダーが表示される
    expect(screen.getByTestId('volume-slider-bgm')).toBeInTheDocument()
  })

  it('カスタムラベルが表示される', () => {
    render(<VolumeControl {...defaultProps} label="カスタム音量" />)

    expect(screen.getByText('カスタム音量')).toBeInTheDocument()
  })

  it('効果音タイプで正しく表示される', () => {
    render(<VolumeControl {...defaultProps} type="sound" />)

    expect(screen.getByText('効果音')).toBeInTheDocument()
    expect(screen.getByTestId('volume-control-sound')).toBeInTheDocument()
  })

  it('音量スライダーの変更が正しく動作する', () => {
    const onVolumeChange = vi.fn()
    render(<VolumeControl {...defaultProps} onVolumeChange={onVolumeChange} />)

    const slider = screen.getByTestId('volume-slider-bgm')
    fireEvent.change(slider, { target: { value: '0.8' } })

    expect(onVolumeChange).toHaveBeenCalledWith(0.8)
    expect(screen.getByTestId('volume-percentage-bgm')).toHaveTextContent('80%')
  })

  it('ミュートボタンのクリックが正しく動作する', () => {
    const onMuteChange = vi.fn()
    render(<VolumeControl {...defaultProps} onMuteChange={onMuteChange} />)

    const muteButton = screen.getByTestId('mute-button-bgm')
    fireEvent.click(muteButton)

    expect(onMuteChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('volume-percentage-bgm')).toHaveTextContent(
      'ミュート'
    )
  })

  it('ミュート時にスライダーが無効になる', () => {
    render(<VolumeControl {...defaultProps} initialMuted={true} />)

    const slider = screen.getByTestId('volume-slider-bgm')
    expect(slider).toBeDisabled()
    expect(screen.getByTestId('volume-percentage-bgm')).toHaveTextContent(
      'ミュート'
    )
  })

  it('ミュート解除時に以前の音量に戻る', () => {
    const onVolumeChange = vi.fn()
    const onMuteChange = vi.fn()

    render(
      <VolumeControl
        {...defaultProps}
        initialVolume={0.7}
        onVolumeChange={onVolumeChange}
        onMuteChange={onMuteChange}
      />
    )

    const muteButton = screen.getByTestId('mute-button-bgm')

    // ミュート
    fireEvent.click(muteButton)
    expect(onMuteChange).toHaveBeenCalledWith(true)

    // ミュート解除
    fireEvent.click(muteButton)
    expect(onMuteChange).toHaveBeenCalledWith(false)
    expect(onVolumeChange).toHaveBeenCalledWith(0.7)
  })

  it('音量0でミュート解除時にデフォルト音量0.5が設定される', () => {
    const onVolumeChange = vi.fn()
    const onMuteChange = vi.fn()

    render(
      <VolumeControl
        {...defaultProps}
        initialVolume={0}
        onVolumeChange={onVolumeChange}
        onMuteChange={onMuteChange}
      />
    )

    const muteButton = screen.getByTestId('mute-button-bgm')

    // ミュート
    fireEvent.click(muteButton)

    // ミュート解除（音量0だったので0.5に設定される）
    fireEvent.click(muteButton)
    expect(onVolumeChange).toHaveBeenCalledWith(0.5)
  })

  it('音量変更時にミュートが自動解除される', () => {
    const onMuteChange = vi.fn()

    render(
      <VolumeControl
        {...defaultProps}
        initialMuted={true}
        onMuteChange={onMuteChange}
      />
    )

    const slider = screen.getByTestId('volume-slider-bgm')
    fireEvent.change(slider, { target: { value: '0.6' } })

    expect(onMuteChange).toHaveBeenCalledWith(false)
  })

  it('音量によって適切なアイコンが表示される', () => {
    // 音量0の場合
    const { unmount: unmount1 } = render(
      <VolumeControl {...defaultProps} initialVolume={0} />
    )
    expect(screen.getByTestId('mute-button-bgm')).toHaveTextContent('🔈')
    unmount1()

    // 音量0.3の場合
    const { unmount: unmount2 } = render(
      <VolumeControl {...defaultProps} initialVolume={0.3} />
    )
    expect(screen.getByTestId('mute-button-bgm')).toHaveTextContent('🔉')
    unmount2()

    // 音量0.5の場合
    const { unmount: unmount3 } = render(
      <VolumeControl {...defaultProps} initialVolume={0.5} />
    )
    expect(screen.getByTestId('mute-button-bgm')).toHaveTextContent('🔊')
    unmount3()

    // 音量0.8の場合
    const { unmount: unmount4 } = render(
      <VolumeControl {...defaultProps} initialVolume={0.8} />
    )
    expect(screen.getByTestId('mute-button-bgm')).toHaveTextContent('🔊')
    unmount4()

    // ミュート状態の場合
    render(
      <VolumeControl
        {...defaultProps}
        initialVolume={0.5}
        initialMuted={true}
      />
    )
    expect(screen.getByTestId('mute-button-bgm')).toHaveTextContent('🔇')
  })

  it('アクセシビリティ属性が正しく設定される', () => {
    render(<VolumeControl {...defaultProps} />)

    const slider = screen.getByTestId('volume-slider-bgm')
    expect(slider).toHaveAttribute('aria-label', 'BGM音量')

    const muteButton = screen.getByTestId('mute-button-bgm')
    expect(muteButton).toHaveAttribute('aria-label', 'BGMミュート')
  })
})
