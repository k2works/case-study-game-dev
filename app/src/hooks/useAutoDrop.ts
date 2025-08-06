import { useEffect, useRef } from 'react'

interface UseAutoDropOptions {
  onDrop: () => void
  interval: number
  enabled: boolean
}

export const useAutoDrop = ({
  onDrop,
  interval,
  enabled,
}: UseAutoDropOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onDropRef = useRef(onDrop)

  // コールバックを最新に保つ
  useEffect(() => {
    onDropRef.current = onDrop
  }, [onDrop])

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        onDropRef.current()
      }, interval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval])
}
