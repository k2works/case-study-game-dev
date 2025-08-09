import { useEffect } from 'react'

interface KeyboardHandlers {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onDrop: () => void
  onHardDrop: () => void
  onPause: () => void
  onRestart: () => void
  onOpenSettings?: () => void
  onCloseModal?: () => void
}

const handleMoveKeys = (key: string, handlers: KeyboardHandlers) => {
  switch (key) {
    case 'ArrowLeft':
      handlers.onMoveLeft()
      break
    case 'ArrowRight':
      handlers.onMoveRight()
      break
  }
}

const handleActionKeys = (key: string, handlers: KeyboardHandlers) => {
  const actionMap: { [key: string]: () => void } = {
    ArrowUp: handlers.onRotate,
    z: handlers.onRotate,
    Z: handlers.onRotate,
    ArrowDown: handlers.onDrop,
    ' ': handlers.onHardDrop,
  }

  const handler = actionMap[key]
  if (handler) handler()
}

const handleControlKeys = (key: string, handlers: KeyboardHandlers) => {
  const controlMap: { [key: string]: (() => void) | undefined } = {
    p: handlers.onPause,
    P: handlers.onPause,
    r: handlers.onRestart,
    R: handlers.onRestart,
    s: handlers.onOpenSettings,
    S: handlers.onOpenSettings,
    Escape: handlers.onCloseModal,
  }

  const handler = controlMap[key]
  if (handler) handler()
}

interface UseKeyboardOptions {
  enabled?: boolean
  gameOnly?: boolean
}

const checkModalState = () => {
  return document.querySelector('[role="dialog"]') !== null
}

const isGameKey = (key: string) => {
  return [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    ' ',
    'z',
    'Z',
  ].includes(key)
}

// eslint-disable-next-line complexity
const isFormElementFocused = () => {
  const activeElement = document.activeElement
  return (
    activeElement?.tagName === 'INPUT' ||
    activeElement?.tagName === 'SELECT' ||
    activeElement?.tagName === 'TEXTAREA' ||
    activeElement?.tagName === 'BUTTON'
  )
}

const isControlKey = (key: string) => {
  return ['p', 'P', 'r', 'R', 's', 'S'].includes(key)
}

const isButtonSpaceKey = (key: string) => {
  return key === ' ' && document.activeElement?.tagName === 'BUTTON'
}

const shouldPreventDefault = (key: string) => {
  const gameKeys = isGameKey(key)
  const controlKeys = isControlKey(key)
  const buttonSpace = isButtonSpaceKey(key)

  return (gameKeys || controlKeys) && !buttonSpace
}

export const useKeyboard = (
  handlers: KeyboardHandlers,
  options: UseKeyboardOptions = { enabled: true, gameOnly: false }
) => {
  useEffect(() => {
    if (!options.enabled) return

    const shouldSkipForModal = (key: string) => {
      return checkModalState() && isGameKey(key) && !options.gameOnly
    }

    const shouldSkipForForm = (key: string) => {
      return isFormElementFocused() && isGameKey(key)
    }

    const shouldSkipKeyProcessing = (key: string) => {
      return (
        shouldSkipForModal(key) ||
        shouldSkipForForm(key) ||
        isButtonSpaceKey(key)
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldSkipKeyProcessing(event.key)) {
        return
      }

      // preventDefaultの適用
      if (shouldPreventDefault(event.key)) {
        event.preventDefault()
      }

      // キーハンドラーの実行
      handleMoveKeys(event.key, handlers)
      handleActionKeys(event.key, handlers)
      handleControlKeys(event.key, handlers)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlers, options.enabled, options.gameOnly])
}
