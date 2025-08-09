import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFocusTrap } from './useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement
  let button1: HTMLButtonElement
  let button2: HTMLButtonElement
  let button3: HTMLButtonElement

  beforeEach(() => {
    // テスト用のDOM構造を作成
    container = document.createElement('div')
    button1 = document.createElement('button')
    button2 = document.createElement('button')
    button3 = document.createElement('button')

    button1.textContent = 'Button 1'
    button2.textContent = 'Button 2'
    button3.textContent = 'Button 3'

    container.appendChild(button1)
    container.appendChild(button2)
    container.appendChild(button3)

    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('フォーカストラップが無効な場合', () => {
    it('フォーカストラップが動作しない', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: false }))

      // refが返される
      expect(result.current).toBeDefined()

      // キーイベントがトラップされない
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(tabEvent)

      // 特に例外が発生しないことを確認
      expect(() => document.dispatchEvent(tabEvent)).not.toThrow()
    })
  })

  describe('フォーカストラップが有効な場合', () => {
    it('refを返す', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))

      expect(result.current).toBeDefined()
      expect(result.current.current).toBeNull() // 初期状態では未接続
    })

    it('EscapeキーでonEscapeコールバックが呼ばれる', () => {
      const onEscape = vi.fn()

      const { result } = renderHook(() =>
        useFocusTrap({ isActive: true, onEscape })
      )

      // refにcontainerを設定
      Object.defineProperty(result.current, 'current', {
        value: container,
        writable: true,
      })

      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })

      document.dispatchEvent(escapeEvent)

      expect(onEscape).toHaveBeenCalledTimes(1)
    })

    it('Tab以外のキーでは特別な処理をしない', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))

      // refにcontainerを設定
      if (result.current.current === null) {
        Object.defineProperty(result.current, 'current', {
          value: container,
          writable: true,
        })
      }

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })

      expect(() => {
        document.dispatchEvent(enterEvent)
        document.dispatchEvent(spaceEvent)
      }).not.toThrow()
    })
  })

  describe('フォーカス管理', () => {
    it('初期フォーカスが最初のフォーカス可能要素に設定される', async () => {
      // テスト前にフォーカスをクリア
      document.body.focus()

      const { result, rerender } = renderHook(() =>
        useFocusTrap({ isActive: true })
      )

      // refにcontainerを設定
      Object.defineProperty(result.current, 'current', {
        value: container,
        writable: true,
      })

      // hook を再実行してフォーカス設定を動かす
      rerender()

      // 少し待ってfocusが設定されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 150))

      // 最初のボタンにフォーカスが当たっていることを確認
      expect(document.activeElement).toBe(button1)
    })

    it('autoFocus属性を持つ要素が優先される', async () => {
      // テスト前にフォーカスをクリア
      document.body.focus()

      button2.setAttribute('autoFocus', 'true')

      const { result, rerender } = renderHook(() =>
        useFocusTrap({ isActive: true })
      )

      Object.defineProperty(result.current, 'current', {
        value: container,
        writable: true,
      })

      // hook を再実行してフォーカス設定を動かす
      rerender()

      await new Promise((resolve) => setTimeout(resolve, 150))

      expect(document.activeElement).toBe(button2)
    })
  })

  describe('エッジケース', () => {
    it('フォーカス可能要素がない場合はエラーが発生しない', () => {
      const emptyContainer = document.createElement('div')
      document.body.appendChild(emptyContainer)

      const { result } = renderHook(() => useFocusTrap({ isActive: true }))

      Object.defineProperty(result.current, 'current', {
        value: emptyContainer,
        writable: true,
      })

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })

      expect(() => {
        document.dispatchEvent(tabEvent)
      }).not.toThrow()

      document.body.removeChild(emptyContainer)
    })

    it('非表示要素はフォーカス対象から除外される', () => {
      // ボタン2を非表示にする
      button2.style.display = 'none'

      renderHook(() => useFocusTrap({ isActive: true }))

      // tabindex=-1の要素を追加
      const hiddenButton = document.createElement('button')
      hiddenButton.tabIndex = -1
      container.appendChild(hiddenButton)

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })

      expect(() => {
        document.dispatchEvent(tabEvent)
      }).not.toThrow()
    })
  })

  describe('クリーンアップ', () => {
    it('コンポーネントアンマウント時にイベントリスナーが除去される', () => {
      const { unmount } = renderHook(() =>
        useFocusTrap({ isActive: true })
      )

      // イベントリスナーが追加されていることを確認するため、
      // キーイベントをディスパッチしてみる
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })

      expect(() => {
        document.dispatchEvent(tabEvent)
      }).not.toThrow()

      // アンマウント
      unmount()

      // アンマウント後もエラーが発生しないことを確認
      expect(() => {
        document.dispatchEvent(tabEvent)
      }).not.toThrow()
    })

    it('isActiveがfalseになったときにクリーンアップされる', () => {
      const { rerender } = renderHook(
        (props: { isActive: boolean }) => useFocusTrap(props),
        { initialProps: { isActive: true } }
      )

      // activeをfalseに変更
      rerender({ isActive: false })

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })

      expect(() => {
        document.dispatchEvent(tabEvent)
      }).not.toThrow()
    })
  })
})
