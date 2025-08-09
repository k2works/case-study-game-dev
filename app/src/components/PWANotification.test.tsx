import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest'
import { PWANotification } from './PWANotification'
import { pwaService } from '../services/PWAService'

// PWAServiceのモック
vi.mock('../services/PWAService', () => ({
  pwaService: {
    registerSW: vi.fn(),
    updateApp: vi.fn(),
    isOnline: vi.fn(),
    onNetworkChange: vi.fn(),
    onUpdateAvailable: vi.fn(),
    onOfflineReady: vi.fn(),
    isPWAInstalled: vi.fn(),
    promptPWAInstall: vi.fn(),
  },
}))

describe('PWANotification', () => {
  let mockOnNetworkChange: Mock
  let mockOnUpdateAvailable: Mock
  let mockOnOfflineReady: Mock

  beforeEach(() => {
    vi.clearAllMocks()

    // navigator.onLineのモック
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    // コールバック関数のモック
    mockOnNetworkChange = vi.fn(() => {
      // cleanup関数を返す
      return () => {}
    })
    mockOnUpdateAvailable = vi.fn()
    mockOnOfflineReady = vi.fn()

    // PWAServiceメソッドのモック設定
    ;(pwaService.onNetworkChange as Mock).mockImplementation(
      mockOnNetworkChange
    )
    ;(pwaService.onUpdateAvailable as Mock).mockImplementation(
      mockOnUpdateAvailable
    )
    ;(pwaService.onOfflineReady as Mock).mockImplementation(mockOnOfflineReady)
    ;(pwaService.isPWAInstalled as Mock).mockReturnValue(false)
    ;(pwaService.updateApp as Mock).mockResolvedValue(undefined)
    ;(pwaService.promptPWAInstall as Mock).mockResolvedValue(true)
  })

  afterEach(() => {
    // window.deferredPromptをクリア
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).deferredPrompt = null
  })

  describe('初期状態', () => {
    it('通知が表示されない状態で正常にレンダリングされる', () => {
      render(<PWANotification />)

      // 通知が表示されていないことを確認
      expect(screen.queryByTestId('pwa-update-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('pwa-install-button')).not.toBeInTheDocument()
    })

    it('PWAServiceのイベントリスナーが登録される', () => {
      render(<PWANotification />)

      expect(pwaService.onUpdateAvailable).toHaveBeenCalledWith(
        expect.any(Function)
      )
      expect(pwaService.onOfflineReady).toHaveBeenCalledWith(
        expect.any(Function)
      )
      expect(pwaService.onNetworkChange).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })
  })

  describe('更新通知', () => {
    it('updateAvailableコールバックが呼ばれると更新通知が表示される', async () => {
      let updateCallback: () => void

      mockOnUpdateAvailable.mockImplementation((callback) => {
        updateCallback = callback
      })

      render(<PWANotification />)

      // コールバックを実行
      act(() => {
        updateCallback!()
      })

      await waitFor(() => {
        expect(screen.getByTestId('pwa-update-button')).toBeInTheDocument()
        expect(
          screen.getByText('新しいバージョンが利用できます')
        ).toBeInTheDocument()
      })
    })

    it('更新ボタンをクリックするとupdateAppが呼ばれる', async () => {
      let updateCallback: () => void

      mockOnUpdateAvailable.mockImplementation((callback) => {
        updateCallback = callback
      })

      render(<PWANotification />)

      // 更新通知を表示
      act(() => {
        updateCallback!()
      })

      await waitFor(() => {
        const updateButton = screen.getByTestId('pwa-update-button')
        fireEvent.click(updateButton)
      })

      expect(pwaService.updateApp).toHaveBeenCalled()
    })

    it('後でボタンをクリックすると更新通知が非表示になる', async () => {
      let updateCallback: () => void

      mockOnUpdateAvailable.mockImplementation((callback) => {
        updateCallback = callback
      })

      render(<PWANotification />)

      // 更新通知を表示
      act(() => {
        updateCallback!()
      })

      await waitFor(() => {
        const dismissButton = screen.getByTestId('pwa-dismiss-update')
        fireEvent.click(dismissButton)
      })

      expect(screen.queryByTestId('pwa-update-button')).not.toBeInTheDocument()
    })

    it('更新中は更新ボタンが無効化される', async () => {
      let updateCallback: () => void

      mockOnUpdateAvailable.mockImplementation((callback) => {
        updateCallback = callback
      })

      // updateAppが完了しないようにPromiseをpendingにする
      ;(pwaService.updateApp as Mock).mockImplementation(
        () => new Promise(() => {}) // never resolves
      )

      render(<PWANotification />)

      // 更新通知を表示
      act(() => {
        updateCallback!()
      })

      await waitFor(() => {
        const updateButton = screen.getByTestId('pwa-update-button')
        fireEvent.click(updateButton)
      })

      const updateButton = screen.getByTestId('pwa-update-button')
      expect(updateButton).toBeDisabled()
      expect(updateButton).toHaveTextContent('更新中...')
    })
  })

  describe('インストール通知', () => {
    it('beforeinstallpromptイベントでインストール通知が表示される', async () => {
      render(<PWANotification />)

      // beforeinstallpromptイベントを発火
      act(() => {
        const event = new Event('beforeinstallprompt')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).deferredPrompt = event
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(screen.getByTestId('pwa-install-button')).toBeInTheDocument()
        expect(screen.getByText('アプリをインストール')).toBeInTheDocument()
      })
    })

    it('PWAが既にインストール済みの場合はインストール通知が表示されない', async () => {
      ;(pwaService.isPWAInstalled as Mock).mockReturnValue(true)

      render(<PWANotification />)

      // beforeinstallpromptイベントを発火
      act(() => {
        const event = new Event('beforeinstallprompt')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).deferredPrompt = event
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(
          screen.queryByTestId('pwa-install-button')
        ).not.toBeInTheDocument()
      })
    })

    it('インストールボタンをクリックするとprompPWAInstallが呼ばれる', async () => {
      render(<PWANotification />)

      // beforeinstallpromptイベントを発火
      act(() => {
        const event = new Event('beforeinstallprompt')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).deferredPrompt = event
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        const installButton = screen.getByTestId('pwa-install-button')
        fireEvent.click(installButton)
      })

      expect(pwaService.promptPWAInstall).toHaveBeenCalled()
    })

    it('インストールが完了すると通知が非表示になる', async () => {
      ;(pwaService.promptPWAInstall as Mock).mockResolvedValue(true)

      render(<PWANotification />)

      // beforeinstallpromptイベントを発火
      act(() => {
        const event = new Event('beforeinstallprompt')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).deferredPrompt = event
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        const installButton = screen.getByTestId('pwa-install-button')
        fireEvent.click(installButton)
      })

      await waitFor(() => {
        expect(
          screen.queryByTestId('pwa-install-button')
        ).not.toBeInTheDocument()
      })
    })

    it('後でボタンをクリックするとインストール通知が非表示になる', async () => {
      render(<PWANotification />)

      // beforeinstallpromptイベントを発火
      act(() => {
        const event = new Event('beforeinstallprompt')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).deferredPrompt = event
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        const dismissButton = screen.getByTestId('pwa-dismiss-install')
        fireEvent.click(dismissButton)
      })

      expect(screen.queryByTestId('pwa-install-button')).not.toBeInTheDocument()
    })
  })

  describe('オフライン通知', () => {
    it('offlineReadyコールバックが呼ばれるとオフライン通知が表示される', async () => {
      let offlineCallback: () => void

      mockOnOfflineReady.mockImplementation((callback) => {
        offlineCallback = callback
      })

      render(<PWANotification />)

      // コールバックを実行
      act(() => {
        offlineCallback!()
      })

      await waitFor(() => {
        expect(screen.getByText('オフライン対応完了')).toBeInTheDocument()
      })
    })

    it('ネットワーク状態がオフラインになるとオフライン状態表示が表示される', async () => {
      let networkCallback: (isOnline: boolean) => void

      mockOnNetworkChange.mockImplementation((callback) => {
        networkCallback = callback
        return () => {} // cleanup function
      })

      render(<PWANotification />)

      // オフライン状態に変更
      act(() => {
        networkCallback!(false)
      })

      await waitFor(() => {
        expect(screen.getByText('オフライン')).toBeInTheDocument()
        expect(
          screen.getByText(
            'インターネット接続がありませんが、ゲームは引き続きプレイできます。'
          )
        ).toBeInTheDocument()
      })
    })

    it('ネットワーク状態がオンラインに戻るとオフライン状態表示が非表示になる', async () => {
      let networkCallback: (isOnline: boolean) => void

      mockOnNetworkChange.mockImplementation((callback) => {
        networkCallback = callback
        return () => {}
      })

      render(<PWANotification />)

      // オフライン状態に変更
      act(() => {
        networkCallback!(false)
      })

      await waitFor(() => {
        expect(screen.getByText('オフライン')).toBeInTheDocument()
      })

      // オンライン状態に戻す
      act(() => {
        networkCallback!(true)
      })

      await waitFor(() => {
        expect(screen.queryByText('オフライン')).not.toBeInTheDocument()
      })
    })
  })

  describe('アクセシビリティ', () => {
    it('通知にrole属性が設定されている', async () => {
      let updateCallback: () => void

      mockOnUpdateAvailable.mockImplementation((callback) => {
        updateCallback = callback
      })

      render(<PWANotification />)

      act(() => {
        updateCallback!()
      })

      await waitFor(() => {
        const notification = screen.getByRole('alert')
        expect(notification).toBeInTheDocument()
      })
    })

    it('適切なaria-live属性が設定されている', async () => {
      let updateCallback: () => void

      mockOnUpdateAvailable.mockImplementation((callback) => {
        updateCallback = callback
      })

      render(<PWANotification />)

      act(() => {
        updateCallback!()
      })

      await waitFor(() => {
        const notification = screen.getByRole('alert')
        expect(notification).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})
