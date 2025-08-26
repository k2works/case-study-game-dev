import type {
  LearningConfig,
  LearningResult,
  LearningStatistics,
} from './LearningService'
import type { LearningWorkerService } from './LearningWorkerService'

export type LearningStatusType =
  | 'idle'
  | 'running'
  | 'stopping'
  | 'completed'
  | 'error'

export interface LearningProgress {
  progress: number
  currentEpoch: number
  totalEpochs: number
  estimatedTimeRemaining: number
}

export interface LearningProgressHistory extends LearningProgress {
  timestamp: Date
}

export interface AsyncLearningCallbacks {
  onProgress?: (progress: LearningProgress) => void
  onStatusChange?: (status: LearningStatusType) => void
  onComplete?: (result: LearningResult) => void
  onError?: (error: Error) => void
}

export class AsyncLearningService {
  private status: LearningStatusType = 'idle'
  private currentProgress: LearningProgress = {
    progress: 0,
    currentEpoch: 0,
    totalEpochs: 0,
    estimatedTimeRemaining: 0,
  }
  private progressHistory: LearningProgressHistory[] = []
  private currentConfig: LearningConfig | null = null
  private lastResult: LearningResult | null = null
  private lastError: Error | null = null
  private startTime: number | null = null
  private readonly callbacks: AsyncLearningCallbacks

  private readonly workerService: LearningWorkerService

  constructor(
    workerService: LearningWorkerService,
    callbacks: AsyncLearningCallbacks = {},
  ) {
    this.workerService = workerService
    this.callbacks = callbacks
  }

  async startAsyncLearning(config: LearningConfig): Promise<void> {
    this.resetState()
    this.currentConfig = config
    this.setStatus('running')
    this.startTime = Date.now()

    try {
      const result = await this.workerService.startLearning(config)
      this.lastResult = result
      this.setStatus('completed')

      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(result)
      }
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  stopAsyncLearning(): void {
    if (this.status === 'running') {
      this.setStatus('stopping')
      this.workerService.stopLearning()
    }
  }

  updateProgress(
    progress: number,
    currentEpoch: number,
    totalEpochs: number,
  ): void {
    const now = Date.now()

    // 推定残り時間を計算
    let estimatedTimeRemaining = 0
    if (this.startTime && progress > 0 && progress < 1) {
      const elapsedTime = now - this.startTime
      const estimatedTotalTime = elapsedTime / progress
      estimatedTimeRemaining = Math.max(0, estimatedTotalTime - elapsedTime)
    }

    const newProgress: LearningProgress = {
      progress: Math.max(0, Math.min(1, progress)),
      currentEpoch,
      totalEpochs,
      estimatedTimeRemaining,
    }

    this.currentProgress = newProgress

    // 履歴に追加
    this.progressHistory.push({
      ...newProgress,
      timestamp: new Date(now),
    })

    // 履歴サイズを制限（最新100件まで）
    if (this.progressHistory.length > 100) {
      this.progressHistory = this.progressHistory.slice(-100)
    }

    if (this.callbacks.onProgress) {
      this.callbacks.onProgress(newProgress)
    }
  }

  resetProgress(): void {
    this.currentProgress = {
      progress: 0,
      currentEpoch: 0,
      totalEpochs: 0,
      estimatedTimeRemaining: 0,
    }
    this.progressHistory = []
    this.startTime = null
  }

  resetError(): void {
    if (this.status === 'error') {
      this.lastError = null
      this.setStatus('idle')
    }
  }

  getLearningStatus(): LearningStatusType {
    return this.status
  }

  getLearningProgress(): LearningProgress {
    return { ...this.currentProgress }
  }

  getProgressHistory(): readonly LearningProgressHistory[] {
    return Object.freeze([...this.progressHistory])
  }

  getCurrentConfig(): LearningConfig | null {
    return this.currentConfig
  }

  getLearningStatistics(): LearningStatistics | null {
    return this.lastResult?.statistics || null
  }

  getLastError(): Error | null {
    return this.lastError
  }

  isLearning(): boolean {
    return this.status === 'running' || this.status === 'stopping'
  }

  dispose(): void {
    this.workerService.dispose()
    this.resetState()
  }

  private resetState(): void {
    this.lastError = null
    this.lastResult = null
    this.resetProgress()

    if (this.status !== 'idle') {
      this.setStatus('idle')
    }
  }

  private setStatus(status: LearningStatusType): void {
    this.status = status

    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status)
    }
  }

  private handleError(error: Error): void {
    this.lastError = error
    this.setStatus('error')

    if (this.callbacks.onError) {
      this.callbacks.onError(error)
    }
  }
}

export const createAsyncLearningService = (
  workerService: LearningWorkerService,
  callbacks?: AsyncLearningCallbacks,
): AsyncLearningService => {
  return new AsyncLearningService(workerService, callbacks)
}
