import React, { useState, useEffect } from 'react'
import { pwaService } from '../services/PWAService'
import './PWANotification.css'

interface PWANotificationProps {
  className?: string
}

/**
 * PWA関連の通知を表示するコンポーネント
 * - アプリ更新通知
 * - オフライン対応通知
 * - インストール促進
 */
export const PWANotification: React.FC<PWANotificationProps> = ({
  className = '',
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // PWA更新通知
    pwaService.onUpdateAvailable(() => {
      setUpdateAvailable(true)
    })

    // オフライン準備完了通知
    pwaService.onOfflineReady(() => {
      setOfflineReady(true)
      setTimeout(() => setOfflineReady(false), 5000) // 5秒後に自動非表示
    })

    // ネットワーク状態監視
    const unsubscribeNetwork = pwaService.onNetworkChange(setIsOnline)

    // PWAインストール促進チェック
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).deferredPrompt = e

      // PWAがインストールされていない場合のみ表示
      if (!pwaService.isPWAInstalled()) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      unsubscribeNetwork()
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await pwaService.updateApp()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  const handleInstall = async () => {
    const installed = await pwaService.promptPWAInstall()
    if (installed) {
      setShowInstallPrompt(false)
    }
  }

  const dismissUpdate = () => {
    setUpdateAvailable(false)
  }

  const dismissInstall = () => {
    setShowInstallPrompt(false)
  }

  return (
    <div className={`pwa-notifications ${className}`}>
      {/* アプリ更新通知 */}
      {updateAvailable && (
        <div
          className="pwa-notification update-notification"
          role="alert"
          aria-live="polite"
        >
          <div className="notification-content">
            <span className="notification-icon">🔄</span>
            <div className="notification-text">
              <strong>新しいバージョンが利用できます</strong>
              <p>アプリを更新して最新機能を利用しましょう。</p>
            </div>
            <div className="notification-actions">
              <button
                className="btn-update"
                onClick={handleUpdate}
                disabled={isUpdating}
                data-testid="pwa-update-button"
              >
                {isUpdating ? '更新中...' : '更新'}
              </button>
              <button
                className="btn-dismiss"
                onClick={dismissUpdate}
                data-testid="pwa-dismiss-update"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* オフライン準備完了通知 */}
      {offlineReady && (
        <div
          className="pwa-notification offline-notification"
          role="alert"
          aria-live="polite"
        >
          <div className="notification-content">
            <span className="notification-icon">📱</span>
            <div className="notification-text">
              <strong>オフライン対応完了</strong>
              <p>インターネットに接続されていなくてもゲームを楽しめます。</p>
            </div>
          </div>
        </div>
      )}

      {/* インストール促進通知 */}
      {showInstallPrompt && (
        <div
          className="pwa-notification install-notification"
          role="alert"
          aria-live="polite"
        >
          <div className="notification-content">
            <span className="notification-icon">⬇️</span>
            <div className="notification-text">
              <strong>アプリをインストール</strong>
              <p>ホーム画面に追加して、より快適にゲームを楽しみましょう。</p>
            </div>
            <div className="notification-actions">
              <button
                className="btn-install"
                onClick={handleInstall}
                data-testid="pwa-install-button"
              >
                インストール
              </button>
              <button
                className="btn-dismiss"
                onClick={dismissInstall}
                data-testid="pwa-dismiss-install"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* オフライン状態表示 */}
      {!isOnline && (
        <div
          className="pwa-notification offline-status"
          role="status"
          aria-live="polite"
        >
          <div className="notification-content">
            <span className="notification-icon">📶</span>
            <div className="notification-text">
              <strong>オフライン</strong>
              <p>
                インターネット接続がありませんが、ゲームは引き続きプレイできます。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

PWANotification.displayName = 'PWANotification'
