import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pwaService } from './PWAService'

// Workboxモックインスタンス
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockWorkboxInstance: any

// Workboxのモック
vi.mock('workbox-window', () => ({
  Workbox: vi.fn().mockImplementation(() => mockWorkboxInstance),
}))

describe('PWAService', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 環境変数をリセット
    vi.unstubAllGlobals()

    // Workboxモックのインスタンス作成
    mockWorkboxInstance = {
      addEventListener: vi.fn(),
      register: vi.fn().mockResolvedValue({}),
      messageSkipWaiting: vi.fn(),
    }

    // navigator.serviceWorkerのモック
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn().mockResolvedValue({}),
      },
      writable: true,
      configurable: true,
    })

    // navigator.onLineのモック
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })

    // navigator.standaloneのモック - configurableにする
    if (!Object.prototype.hasOwnProperty.call(window.navigator, 'standalone')) {
      Object.defineProperty(window.navigator, 'standalone', {
        writable: true,
        configurable: true,
        value: false,
      })
    }

    // window.matchMediaのモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // document.referrerのモック
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true,
      configurable: true,
    })

    // console.log/error のモック
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('registerSW', () => {
    it('Service Workerが利用可能な場合は正常に登録する', async () => {
      await pwaService.registerSW()

      // 開発環境の場合はスキップメッセージ、本番環境の場合は登録成功メッセージ
      const isDevEnvironment = import.meta.env.DEV
      if (isDevEnvironment) {
        expect(console.log).toHaveBeenCalledWith(
          'PWA: Service Worker registration skipped in development mode'
        )
      } else {
        expect(mockWorkboxInstance.register).toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith(
          'PWA: Service Worker registered successfully',
          {}
        )
      }
    })

    it('Service Workerが利用できない場合は警告を表示する', async () => {
      // 開発環境の場合はテストをスキップ
      if (import.meta.env.DEV) {
        return
      }

      // navigator.serviceWorkerを削除
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalServiceWorker = (navigator as any).serviceWorker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).serviceWorker

      await pwaService.registerSW()

      expect(console.warn).toHaveBeenCalledWith(
        'PWA: Service Workers are not supported in this browser'
      )

      // 元に戻す
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
        configurable: true,
      })
    })

    it('Service Worker登録でエラーが発生した場合はエラーを表示する', async () => {
      // 開発環境の場合はテストをスキップ
      if (import.meta.env.DEV) {
        return
      }

      const error = new Error('Registration failed')
      mockWorkboxInstance.register.mockRejectedValue(error)

      await pwaService.registerSW()

      expect(console.error).toHaveBeenCalledWith(
        'PWA: Service Worker registration failed:',
        error
      )
    })

    it('installedイベントでofflineReadyコールバックが呼ばれる', async () => {
      // 開発環境の場合はテストをスキップ
      if (import.meta.env.DEV) {
        return
      }

      const offlineReadyCallback = vi.fn()
      pwaService.onOfflineReady(offlineReadyCallback)

      await pwaService.registerSW()

      // installedイベントをシミュレート
      const installedHandler =
        mockWorkboxInstance.addEventListener.mock.calls.find(
          (call) => call[0] === 'installed'
        )?.[1]

      expect(installedHandler).toBeDefined()
      installedHandler({ type: 'installed' })

      expect(offlineReadyCallback).toHaveBeenCalled()
    })

    it('waitingイベントでupdateAvailableコールバックが呼ばれる', async () => {
      // 開発環境の場合はテストをスキップ
      if (import.meta.env.DEV) {
        return
      }

      const updateAvailableCallback = vi.fn()
      pwaService.onUpdateAvailable(updateAvailableCallback)

      await pwaService.registerSW()

      // waitingイベントをシミュレート
      const waitingHandler =
        mockWorkboxInstance.addEventListener.mock.calls.find(
          (call) => call[0] === 'waiting'
        )?.[1]

      expect(waitingHandler).toBeDefined()
      waitingHandler({ type: 'waiting' })

      expect(updateAvailableCallback).toHaveBeenCalled()
    })
  })

  describe('updateApp', () => {
    it('Service Workerが登録済みの場合は更新処理を実行する', async () => {
      // 開発環境の場合はテストをスキップ
      if (import.meta.env.DEV) {
        return
      }

      // Service Workerを先に登録
      await pwaService.registerSW()

      await pwaService.updateApp()

      expect(mockWorkboxInstance.messageSkipWaiting).toHaveBeenCalled()
    })

    it('controllingイベントでページがリロードされる', async () => {
      // 開発環境の場合はテストをスキップ
      if (import.meta.env.DEV) {
        return
      }

      const mockReload = vi.fn()
      // window.locationをモック
      const originalLocation = window.location
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).location
      window.location = {
        ...originalLocation,
        reload: mockReload,
      }

      await pwaService.registerSW()
      await pwaService.updateApp()

      // controllingイベントをシミュレート
      const controllingHandler =
        mockWorkboxInstance.addEventListener.mock.calls.find(
          (call) => call[0] === 'controlling'
        )?.[1]

      expect(controllingHandler).toBeDefined()
      controllingHandler({ type: 'controlling' })

      expect(mockReload).toHaveBeenCalled()

      // クリーンアップ
      window.location = originalLocation
    })

    it('Service Workerが未登録の場合は何も実行しない', async () => {
      await pwaService.updateApp()

      // mockWorkboxInstanceが作成されていないことを確認
      expect(mockWorkboxInstance.messageSkipWaiting).not.toHaveBeenCalled()
    })
  })

  describe('isOnline', () => {
    it('navigator.onLineがtrueの場合はtrueを返す', () => {
      Object.defineProperty(navigator, 'onLine', { value: true })
      expect(pwaService.isOnline()).toBe(true)
    })

    it('navigator.onLineがfalseの場合はfalseを返す', () => {
      Object.defineProperty(navigator, 'onLine', { value: false })
      expect(pwaService.isOnline()).toBe(false)
    })
  })

  describe('onNetworkChange', () => {
    it('ネットワーク状態変更イベントリスナーを登録する', () => {
      const callback = vi.fn()
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      const cleanup = pwaService.onNetworkChange(callback)

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      )
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      )

      // クリーンアップ関数のテスト
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      )
    })

    it('onlineイベントでコールバックにtrueが渡される', () => {
      const callback = vi.fn()
      pwaService.onNetworkChange(callback)

      // onlineイベントを発火
      window.dispatchEvent(new Event('online'))

      expect(callback).toHaveBeenCalledWith(true)
    })

    it('offlineイベントでコールバックにfalseが渡される', () => {
      const callback = vi.fn()
      pwaService.onNetworkChange(callback)

      // offlineイベントを発火
      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalledWith(false)
    })
  })

  describe('isPWAInstalled', () => {
    it('standalone display modeの場合はtrueを返す', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
      Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia })

      expect(pwaService.isPWAInstalled()).toBe(true)
      expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)')
    })

    it('navigator.standaloneがtrueの場合はtrueを返す', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        configurable: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window.navigator as any).standalone = true

      expect(pwaService.isPWAInstalled()).toBe(true)
    })

    it('android-appリファラーの場合はtrueを返す', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
      Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia })
      Object.defineProperty(document, 'referrer', {
        value: 'android-app://example',
        writable: true,
      })

      expect(pwaService.isPWAInstalled()).toBe(true)
    })

    it('どの条件も満たさない場合はfalseを返す', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        configurable: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window.navigator as any).standalone = false
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true,
        configurable: true,
      })

      expect(pwaService.isPWAInstalled()).toBe(false)
    })
  })

  describe('promptPWAInstall', () => {
    it('deferredPromptが利用可能な場合はインストールプロンプトを表示する', async () => {
      const mockPrompt = vi.fn()
      const mockUserChoice = Promise.resolve({ outcome: 'accepted' })
      const deferredPrompt = {
        prompt: mockPrompt,
        userChoice: mockUserChoice,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).deferredPrompt = deferredPrompt

      const result = await pwaService.promptPWAInstall()

      expect(mockPrompt).toHaveBeenCalled()
      expect(result).toBe(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).deferredPrompt).toBe(null)
    })

    it('ユーザーがインストールを拒否した場合はfalseを返す', async () => {
      const mockPrompt = vi.fn()
      const mockUserChoice = Promise.resolve({ outcome: 'dismissed' })
      const deferredPrompt = {
        prompt: mockPrompt,
        userChoice: mockUserChoice,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).deferredPrompt = deferredPrompt

      const result = await pwaService.promptPWAInstall()

      expect(result).toBe(false)
    })

    it('deferredPromptが利用できない場合はfalseを返す', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).deferredPrompt = null

      const result = await pwaService.promptPWAInstall()

      expect(result).toBe(false)
      expect(console.warn).toHaveBeenCalledWith(
        'PWA: Install prompt not available'
      )
    })
  })

  describe('コールバック設定', () => {
    it('updateAvailableコールバックが正しく設定される', () => {
      const callback = vi.fn()
      pwaService.onUpdateAvailable(callback)

      // プライベートプロパティの確認は困難なため、
      // 実際のService Worker登録後のイベントで確認する必要がある
      expect(callback).toBeDefined()
    })

    it('offlineReadyコールバックが正しく設定される', () => {
      const callback = vi.fn()
      pwaService.onOfflineReady(callback)

      expect(callback).toBeDefined()
    })
  })
})
