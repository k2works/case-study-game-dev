import { useEffect } from 'react'

interface KeyboardHandlers {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onDrop: () => void
  onHardDrop: () => void
}

export const useKeyboard = (handlers: KeyboardHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handlers.onMoveLeft()
          break
        case 'ArrowRight':
          event.preventDefault()
          handlers.onMoveRight()
          break
        case 'ArrowUp':
        case 'z':
        case 'Z':
          event.preventDefault()
          handlers.onRotate()
          break
        case 'ArrowDown':
          event.preventDefault()
          handlers.onDrop()
          break
        case ' ': // スペースキー
          event.preventDefault()
          handlers.onHardDrop()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlers])
}
