import type {
  TimerId,
  TimerOptions,
  TimerPort,
} from '../../application/ports/TimerPort'

/**
 * ブラウザのタイマーAPI（setTimeout, setInterval）を使用したタイマーアダプター
 * TimerPortインターフェースの具体実装
 */
export class BrowserTimerAdapter implements TimerPort {
  private activeTimers = new Map<TimerId, TimerInfo>()
  private nextId = 1

  startInterval(
    callback: () => void,
    intervalMs: number,
    options?: TimerOptions,
  ): TimerId {
    const timerId = this.generateTimerId()

    const wrappedCallback = this.createWrappedCallback(callback, timerId)
    const nativeId = setInterval(wrappedCallback, intervalMs)

    this.activeTimers.set(timerId, {
      type: 'interval',
      nativeId,
      callback: wrappedCallback,
      intervalMs,
      createdAt: Date.now(),
      executionCount: 0,
      maxExecutions: options?.maxExecutions,
    })

    // 即座に実行するオプション
    if (options?.immediate) {
      wrappedCallback()
    }

    return timerId
  }

  startTimeout(callback: () => void, delayMs: number): TimerId {
    const timerId = this.generateTimerId()

    const wrappedCallback = this.createWrappedCallback(callback, timerId)
    const nativeId = setTimeout(wrappedCallback, delayMs)

    this.activeTimers.set(timerId, {
      type: 'timeout',
      nativeId,
      callback: wrappedCallback,
      delayMs,
      createdAt: Date.now(),
      executionCount: 0,
      maxExecutions: 1, // タイムアウトは1回のみ
    })

    return timerId
  }

  stopTimer(timerId: TimerId): void {
    const timerInfo = this.activeTimers.get(timerId)
    if (!timerInfo) {
      return
    }

    if (timerInfo.type === 'interval') {
      clearInterval(timerInfo.nativeId)
    } else {
      clearTimeout(timerInfo.nativeId)
    }

    this.activeTimers.delete(timerId)
  }

  stopAllTimers(): void {
    for (const timerId of this.activeTimers.keys()) {
      this.stopTimer(timerId)
    }
  }

  getCurrentTime(): number {
    return this.isHighResolutionAvailable() ? performance.now() : Date.now()
  }

  isHighResolutionAvailable(): boolean {
    return (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    )
  }

  /**
   * アクティブなタイマーの数を取得
   * @returns アクティブタイマー数
   */
  getActiveTimerCount(): number {
    return this.activeTimers.size
  }

  /**
   * タイマーの実行統計を取得
   * @param timerId タイマーID
   * @returns 統計情報、存在しない場合null
   */
  getTimerStats(timerId: TimerId): TimerStats | null {
    const timerInfo = this.activeTimers.get(timerId)
    if (!timerInfo) {
      return null
    }

    return {
      type: timerInfo.type,
      executionCount: timerInfo.executionCount,
      createdAt: timerInfo.createdAt,
      elapsedTime: Date.now() - timerInfo.createdAt,
      maxExecutions: timerInfo.maxExecutions,
      isActive: true,
    }
  }

  /**
   * 一意のタイマーIDを生成
   * @returns 新しいタイマーID
   */
  private generateTimerId(): TimerId {
    return `timer-${this.nextId++}`
  }

  /**
   * コールバック関数をラップして実行回数制限などを処理
   * @param callback 元のコールバック関数
   * @param timerId タイマーID
   * @param options タイマーオプション
   * @returns ラップされたコールバック関数
   */
  private createWrappedCallback(
    callback: () => void,
    timerId: TimerId,
  ): () => void {
    return () => {
      const timerInfo = this.activeTimers.get(timerId)
      if (!timerInfo) {
        return
      }

      timerInfo.executionCount++

      try {
        callback()
      } catch (error) {
        console.error(`Timer callback error for ${timerId}:`, error)
      }

      // 最大実行回数に達した場合はタイマーを停止
      if (
        timerInfo.maxExecutions &&
        timerInfo.executionCount >= timerInfo.maxExecutions
      ) {
        this.stopTimer(timerId)
      }
    }
  }
}

/**
 * タイマー情報を管理する内部データ構造
 */
interface TimerInfo {
  readonly type: 'interval' | 'timeout'
  readonly nativeId: ReturnType<typeof setTimeout>
  readonly callback: () => void
  readonly intervalMs?: number
  readonly delayMs?: number
  readonly createdAt: number
  executionCount: number
  readonly maxExecutions?: number
}

/**
 * タイマー統計情報
 */
export interface TimerStats {
  readonly type: 'interval' | 'timeout'
  readonly executionCount: number
  readonly createdAt: number
  readonly elapsedTime: number
  readonly maxExecutions?: number
  readonly isActive: boolean
}
