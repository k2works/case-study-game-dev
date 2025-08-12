import { Workbox } from 'workbox-window'

/**
 * PWA関連サービス
 * Service Workerの登録と更新通知を管理
 */
class PWAService {
  private wb: Workbox | null = null
  private updateAvailableCallback: (() => void) | null = null
  private offlineReadyCallback: (() => void) | null = null

  /**
   * Service Workerを登録
   */
  async registerSW(): Promise<void> {
    // 開発環境では Service Worker の登録をスキップ
    if (import.meta.env.DEV) {
      console.log(
        'PWA: Service Worker registration skipped in development mode'
      )
      return
    }

    if ('serviceWorker' in navigator) {
      try {
        this.wb = new Workbox('/sw.js')

        // オフライン準備完了
        this.wb.addEventListener('installed', (event) => {
          console.log('Service Worker installed:', event)
          if (this.offlineReadyCallback) {
            this.offlineReadyCallback()
          }
        })

        // 更新可能
        this.wb.addEventListener('waiting', (event) => {
          console.log('Service Worker waiting:', event)
          if (this.updateAvailableCallback) {
            this.updateAvailableCallback()
          }
        })

        // Service Worker登録
        const registration = await this.wb.register()
        console.log('PWA: Service Worker registered successfully', registration)
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error)
      }
    } else {
      console.warn('PWA: Service Workers are not supported in this browser')
    }
  }

  /**
   * アプリを最新版に更新
   */
  async updateApp(): Promise<void> {
    if (this.wb) {
      try {
        // 新しいService Workerを即座にアクティベート
        this.wb.addEventListener('controlling', () => {
          window.location.reload()
        })

        // 待機中のService Workerをスキップ
        this.wb.messageSkipWaiting()
      } catch (error) {
        console.error('PWA: App update failed:', error)
      }
    }
  }

  /**
   * オフライン状態チェック
   */
  isOnline(): boolean {
    return navigator.onLine
  }

  /**
   * ネットワーク状態監視
   */
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

  /**
   * 更新可能コールバック設定
   */
  onUpdateAvailable(callback: () => void): void {
    this.updateAvailableCallback = callback
  }

  /**
   * オフライン準備完了コールバック設定
   */
  onOfflineReady(callback: () => void): void {
    this.offlineReadyCallback = callback
  }

  /**
   * PWAインストール状態チェック
   */
  isPWAInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    )
  }

  /**
   * PWAインストール促進
   */
  promptPWAInstall(): Promise<boolean> {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const beforeInstallPrompt = (window as any).deferredPrompt

      if (beforeInstallPrompt) {
        beforeInstallPrompt.prompt()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeInstallPrompt.userChoice.then((choiceResult: any) => {
          console.log('PWA install choice:', choiceResult.outcome)
          resolve(choiceResult.outcome === 'accepted')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(window as any).deferredPrompt = null
        })
      } else {
        console.warn('PWA: Install prompt not available')
        resolve(false)
      }
    })
  }
}

// シングルトンとして提供
export const pwaService = new PWAService()
