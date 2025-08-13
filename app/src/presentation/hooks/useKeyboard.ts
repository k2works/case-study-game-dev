import { useEffect } from 'react'

export interface KeyboardHandlers {
  onLeft?: () => void
  onRight?: () => void
  onDown?: () => void
  onRotate?: () => void
  onPause?: () => void
  onReset?: () => void
}

const keyHandlerMap: Record<string, keyof KeyboardHandlers> = {
  ArrowLeft: 'onLeft',
  ArrowRight: 'onRight',
  ArrowDown: 'onDown',
  ArrowUp: 'onRotate',
  ' ': 'onRotate',
  p: 'onPause',
  P: 'onPause',
  r: 'onReset',
  R: 'onReset',
}

export const useKeyboard = (handlers: KeyboardHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const handlerKey = keyHandlerMap[event.key]
      if (handlerKey && handlers[handlerKey]) {
        handlers[handlerKey]?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlers])
}
