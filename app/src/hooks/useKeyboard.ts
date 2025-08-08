import { useEffect } from 'react'

interface KeyboardHandlers {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onDrop: () => void
  onHardDrop: () => void
  onPause: () => void
  onRestart: () => void
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
  switch (key) {
    case 'ArrowUp':
    case 'z':
    case 'Z':
      handlers.onRotate()
      break
    case 'ArrowDown':
      handlers.onDrop()
      break
    case ' ': // スペースキー
      handlers.onHardDrop()
      break
  }
}

const handleControlKeys = (key: string, handlers: KeyboardHandlers) => {
  switch (key) {
    case 'p':
    case 'P':
      handlers.onPause()
      break
    case 'r':
    case 'R':
      handlers.onRestart()
      break
  }
}

export const useKeyboard = (handlers: KeyboardHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      handleMoveKeys(event.key, handlers)
      handleActionKeys(event.key, handlers)
      handleControlKeys(event.key, handlers)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlers])
}
