import { useEffect, useRef } from 'react'

interface UseFocusTrapOptions {
  isActive: boolean
  onEscape?: () => void
}

/**
 * フォーカストラップ機能を提供するカスタムフック
 * モーダルダイアログなどでフォーカスを内部に閉じ込める
 */
export const useFocusTrap = ({ isActive, onEscape }: UseFocusTrapOptions) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const container = containerRef.current
    if (!container) return

    // フォーカス可能な要素を取得
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'button',
        'input',
        'select',
        'textarea',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(',')

      return Array.from(container.querySelectorAll(selector)).filter(
        (element) => {
          const htmlElement = element as HTMLElement
          const isInput =
            htmlElement instanceof HTMLInputElement ||
            htmlElement instanceof HTMLButtonElement ||
            htmlElement instanceof HTMLSelectElement ||
            htmlElement instanceof HTMLTextAreaElement

          return (
            !(
              isInput &&
              (
                htmlElement as
                  | HTMLInputElement
                  | HTMLButtonElement
                  | HTMLSelectElement
                  | HTMLTextAreaElement
              ).disabled
            ) &&
            htmlElement.tabIndex !== -1 &&
            htmlElement.offsetParent !== null // 表示されている要素のみ
          )
        }
      ) as HTMLElement[]
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return true
      }
      return false
    }

    const handleShiftTab = (focusableElements: HTMLElement[]) => {
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const currentFocusIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      )

      if (document.activeElement === firstElement || currentFocusIndex === -1) {
        return lastElement
      }
      return null
    }

    const handleRegularTab = (focusableElements: HTMLElement[]) => {
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const currentFocusIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      )

      if (document.activeElement === lastElement || currentFocusIndex === -1) {
        return firstElement
      }
      return null
    }

    const handleTabNavigation = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return false

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return true

      const elementToFocus = event.shiftKey
        ? handleShiftTab(focusableElements)
        : handleRegularTab(focusableElements)

      if (elementToFocus) {
        event.preventDefault()
        elementToFocus.focus()
      }

      return true
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (handleEscapeKey(event)) return
      if (handleTabNavigation(event)) return
    }

    // 初期フォーカス設定
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      // autoFocus属性を持つ要素、またはfirst focusable elementにフォーカス
      const autoFocusElement = focusableElements.find(
        (element) =>
          element.hasAttribute('autoFocus') || element.hasAttribute('autofocus')
      )
      const elementToFocus = autoFocusElement || focusableElements[0]

      // 少し遅延してフォーカスを設定（レンダリング完了を待つ）
      setTimeout(() => {
        elementToFocus.focus()
      }, 100)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, onEscape])

  return containerRef
}
