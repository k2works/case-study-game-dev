import { useEffect, useState } from 'react'

export interface KeyboardState {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
}

export const useKeyboard = () => {
  const [keys, setKeys] = useState<KeyboardState>({
    left: false,
    right: false,
    up: false,
    down: false
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setKeys((prev) => ({ ...prev, left: true }))
          break
        case 'ArrowRight':
          setKeys((prev) => ({ ...prev, right: true }))
          break
        case 'ArrowUp':
          setKeys((prev) => ({ ...prev, up: true }))
          break
        case 'ArrowDown':
          setKeys((prev) => ({ ...prev, down: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setKeys((prev) => ({ ...prev, left: false }))
          break
        case 'ArrowRight':
          setKeys((prev) => ({ ...prev, right: false }))
          break
        case 'ArrowUp':
          setKeys((prev) => ({ ...prev, up: false }))
          break
        case 'ArrowDown':
          setKeys((prev) => ({ ...prev, down: false }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return keys
}
