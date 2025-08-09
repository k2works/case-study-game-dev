import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TouchControls } from './TouchControls'

describe('TouchControls', () => {
  const mockHandlers = {
    onMoveLeft: vi.fn(),
    onMoveRight: vi.fn(),
    onRotate: vi.fn(),
    onDrop: vi.fn(),
    onHardDrop: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本表示', () => {
    it('すべてのコントロールボタンが表示される', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      expect(screen.getByTestId('touch-left')).toBeInTheDocument()
      expect(screen.getByTestId('touch-right')).toBeInTheDocument()
      expect(screen.getByTestId('touch-rotate')).toBeInTheDocument()
      expect(screen.getByTestId('touch-drop')).toBeInTheDocument()
      expect(screen.getByTestId('touch-hard-drop')).toBeInTheDocument()
    })

    it('適切なARIA属性が設定されている', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveAttribute('aria-label', 'タッチ操作コントロール')

      expect(screen.getByLabelText('左に移動')).toBeInTheDocument()
      expect(screen.getByLabelText('右に移動')).toBeInTheDocument()
      expect(screen.getByLabelText('回転')).toBeInTheDocument()
      expect(screen.getByLabelText('高速落下')).toBeInTheDocument()
      expect(screen.getByLabelText('ハードドロップ')).toBeInTheDocument()
    })
  })

  describe('クリック操作', () => {
    it('左移動ボタンのクリックでonMoveLeftが呼ばれる', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      fireEvent.click(screen.getByTestId('touch-left'))
      expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(1)
    })

    it('右移動ボタンのクリックでonMoveRightが呼ばれる', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      fireEvent.click(screen.getByTestId('touch-right'))
      expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(1)
    })

    it('回転ボタンのクリックでonRotateが呼ばれる', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      fireEvent.click(screen.getByTestId('touch-rotate'))
      expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1)
    })

    it('落下ボタンのクリックでonDropが呼ばれる', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      fireEvent.click(screen.getByTestId('touch-drop'))
      expect(mockHandlers.onDrop).toHaveBeenCalledTimes(1)
    })

    it('ハードドロップボタンのクリックでonHardDropが呼ばれる', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      fireEvent.click(screen.getByTestId('touch-hard-drop'))
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1)
    })
  })

  describe('タッチ操作', () => {
    it('タッチ開始でハンドラーが呼ばれる', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      const leftButton = screen.getByTestId('touch-left')

      // タッチイベントをシミュレート
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 0 } as Touch],
        bubbles: true,
        cancelable: true,
      })

      fireEvent(leftButton, touchEvent)
      expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(1)
    })

    it('タッチイベントのデフォルト動作が防止される', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      const leftButton = screen.getByTestId('touch-left')

      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 0, clientY: 0 } as Touch],
        bubbles: true,
        cancelable: true,
      })

      const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault')

      fireEvent(leftButton, touchEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('無効化状態', () => {
    it('isPlaying=falseの時、すべてのボタンが無効化される', () => {
      render(<TouchControls {...mockHandlers} isPlaying={false} />)

      expect(screen.getByTestId('touch-left')).toBeDisabled()
      expect(screen.getByTestId('touch-right')).toBeDisabled()
      expect(screen.getByTestId('touch-rotate')).toBeDisabled()
      expect(screen.getByTestId('touch-drop')).toBeDisabled()
      expect(screen.getByTestId('touch-hard-drop')).toBeDisabled()
    })

    it('無効化されたボタンはクリックしてもハンドラーを呼ばない', () => {
      render(<TouchControls {...mockHandlers} isPlaying={false} />)

      fireEvent.click(screen.getByTestId('touch-left'))
      fireEvent.click(screen.getByTestId('touch-right'))
      fireEvent.click(screen.getByTestId('touch-rotate'))
      fireEvent.click(screen.getByTestId('touch-drop'))
      fireEvent.click(screen.getByTestId('touch-hard-drop'))

      expect(mockHandlers.onMoveLeft).not.toHaveBeenCalled()
      expect(mockHandlers.onMoveRight).not.toHaveBeenCalled()
      expect(mockHandlers.onRotate).not.toHaveBeenCalled()
      expect(mockHandlers.onDrop).not.toHaveBeenCalled()
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled()
    })
  })

  describe('メモ化', () => {
    it('propsが変わらない限り再レンダリングされない', () => {
      const { rerender } = render(
        <TouchControls {...mockHandlers} isPlaying={true} />
      )

      const leftButton = screen.getByTestId('touch-left')
      const initialButton = leftButton

      // 同じpropsで再レンダリング
      rerender(<TouchControls {...mockHandlers} isPlaying={true} />)

      // DOM要素が同じインスタンスであることを確認
      expect(screen.getByTestId('touch-left')).toBe(initialButton)
    })
  })

  describe('アイコン表示', () => {
    it('各ボタンにSVGアイコンが表示される', () => {
      render(<TouchControls {...mockHandlers} isPlaying={true} />)

      const buttons = [
        screen.getByTestId('touch-left'),
        screen.getByTestId('touch-right'),
        screen.getByTestId('touch-rotate'),
        screen.getByTestId('touch-drop'),
        screen.getByTestId('touch-hard-drop'),
      ]

      buttons.forEach((button) => {
        const svg = button.querySelector('svg')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })
})
