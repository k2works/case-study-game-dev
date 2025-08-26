import type { LearningConfig, LearningResult } from './LearningService'

export interface WorkerLearningConfig {
  epochs: number
  learningRate: number
  batchSize: number
  validationSplit: number
  modelArchitecture: 'dense' | 'cnn'
  dataRange: {
    startDate: string
    endDate: string
  }
  maxSamples: number
  shuffle: boolean
  normalizeRewards: boolean
  crossValidation?: boolean
  kFolds?: number
}

export interface WorkerLearningResult {
  success: boolean
  modelPath: string
  statistics: {
    totalSamples: number
    trainingAccuracy: number
    validationAccuracy: number
    trainingTime: number
    modelSize: number
  }
}

export interface WorkerMessage {
  type: 'start' | 'stop' | 'progress' | 'complete' | 'error' | 'stopped'
  config?: WorkerLearningConfig
  progress?: number
  result?: WorkerLearningResult
  error?: string
}

export interface LearningWorkerCallbacks {
  onProgress: (progress: number) => void
  onComplete: (result: LearningResult) => void
  onError: (error: Error) => void
}

interface QueuedLearningRequest {
  config: LearningConfig
  resolve: (result: LearningResult) => void
  reject: (error: Error) => void
}

export class LearningWorkerService {
  private worker: Worker
  private isLearningActive = false
  private currentLearningResolve: ((result: LearningResult) => void) | null =
    null
  private currentLearningReject: ((error: Error) => void) | null = null
  private learningQueue: QueuedLearningRequest[] = []
  private onProgressCallback?: (progress: number) => void
  private onCompleteCallback?: (result: LearningResult) => void
  private onErrorCallback?: (error: Error) => void

  constructor(callbacks?: LearningWorkerCallbacks) {
    this.worker = new Worker('/learning-worker.js')
    this.setupWorkerListeners()

    if (callbacks) {
      this.setupCallbacks(callbacks)
    }
  }

  async startLearning(config: LearningConfig): Promise<LearningResult> {
    this.validateLearningConfig(config)

    return new Promise<LearningResult>((resolve, reject) => {
      const request: QueuedLearningRequest = { config, resolve, reject }

      if (this.isLearningActive) {
        this.learningQueue.push(request)
        return
      }

      this.startLearningRequest(request)
    })
  }

  stopLearning(): void {
    if (this.isLearningActive) {
      this.worker.postMessage({ type: 'stop' } as WorkerMessage)
    }
  }

  isLearning(): boolean {
    return this.isLearningActive
  }

  dispose(): void {
    if (this.isLearningActive && this.currentLearningReject) {
      this.currentLearningReject(new Error('Worker terminated'))
    }

    this.clearQueue()
    this.worker.terminate()
    this.isLearningActive = false
  }

  private setupWorkerListeners(): void {
    this.worker.addEventListener(
      'message',
      (event: MessageEvent<WorkerMessage>) => {
        this.handleWorkerMessage(event.data)
      },
    )

    this.worker.addEventListener('error', (event: ErrorEvent) => {
      this.handleWorkerError(event)
    })
  }

  private setupCallbacks(callbacks: LearningWorkerCallbacks): void {
    this.onProgressCallback = callbacks.onProgress
    this.onCompleteCallback = callbacks.onComplete
    this.onErrorCallback = callbacks.onError
  }

  private handleWorkerMessage(message: WorkerMessage): void {
    switch (message.type) {
      case 'progress':
        this.handleProgressMessage(message)
        break
      case 'complete':
        this.handleCompleteMessage(message)
        break
      case 'error':
        this.handleErrorMessage(message)
        break
      case 'stopped':
        this.handleLearningStopped()
        break
    }
  }

  private handleProgressMessage(message: WorkerMessage): void {
    if (message.progress !== undefined) {
      this.handleProgress(message.progress)
    }
  }

  private handleCompleteMessage(message: WorkerMessage): void {
    if (message.result) {
      this.handleLearningComplete(this.convertWorkerResult(message.result))
    }
  }

  private handleErrorMessage(message: WorkerMessage): void {
    if (message.error) {
      this.handleLearningError(new Error(message.error))
    }
  }

  private handleWorkerError(event: ErrorEvent): void {
    const error = new Error(event.message)
    this.handleLearningError(error)
  }

  private handleProgress(progress: number): void {
    if (this.onProgressCallback) {
      this.onProgressCallback(progress)
    }
  }

  private handleLearningComplete(result: LearningResult): void {
    if (this.currentLearningResolve) {
      this.currentLearningResolve(result)
    }

    if (this.onCompleteCallback) {
      this.onCompleteCallback(result)
    }

    this.finishCurrentLearning()
    this.processNextInQueue()
  }

  private handleLearningError(error: Error): void {
    if (this.currentLearningReject) {
      this.currentLearningReject(error)
    }

    if (this.onErrorCallback) {
      this.onErrorCallback(error)
    }

    this.finishCurrentLearning()
    this.processNextInQueue()
  }

  private handleLearningStopped(): void {
    if (this.currentLearningReject) {
      this.currentLearningReject(new Error('Learning stopped'))
    }

    this.finishCurrentLearning()
  }

  private startLearningRequest(request: QueuedLearningRequest): void {
    this.isLearningActive = true
    this.currentLearningResolve = request.resolve
    this.currentLearningReject = request.reject

    const workerConfig = this.convertToWorkerConfig(request.config)

    this.worker.postMessage({
      type: 'start',
      config: workerConfig,
    } as WorkerMessage)
  }

  private finishCurrentLearning(): void {
    this.isLearningActive = false
    this.currentLearningResolve = null
    this.currentLearningReject = null
  }

  private processNextInQueue(): void {
    if (this.learningQueue.length > 0) {
      const nextRequest = this.learningQueue.shift()!
      this.startLearningRequest(nextRequest)
    }
  }

  private clearQueue(): void {
    this.learningQueue.forEach((request) => {
      request.reject(new Error('Worker terminated'))
    })
    this.learningQueue = []
  }

  private convertToWorkerConfig(config: LearningConfig): WorkerLearningConfig {
    return {
      epochs: config.epochs,
      learningRate: config.learningRate,
      batchSize: config.batchSize,
      validationSplit: config.validationSplit,
      modelArchitecture: config.modelArchitecture,
      dataRange: {
        startDate: config.dataRange.startDate.toISOString(),
        endDate: config.dataRange.endDate.toISOString(),
      },
      maxSamples: config.maxSamples,
      shuffle: config.shuffle,
      normalizeRewards: config.normalizeRewards,
      crossValidation: config.crossValidation,
      kFolds: config.kFolds,
    }
  }

  private convertWorkerResult(
    workerResult: WorkerLearningResult,
  ): LearningResult {
    return {
      success: workerResult.success,
      modelPath: workerResult.modelPath,
      statistics: Object.freeze({
        totalSamples: workerResult.statistics.totalSamples,
        trainingAccuracy: workerResult.statistics.trainingAccuracy,
        validationAccuracy: workerResult.statistics.validationAccuracy,
        trainingTime: workerResult.statistics.trainingTime,
        modelSize: workerResult.statistics.modelSize,
      }),
    }
  }

  private validateLearningConfig(config: LearningConfig): void {
    this.validateBasicParams(config)
    this.validateDataRange(config)
    this.validateSampleParams(config)
  }

  private validateBasicParams(config: LearningConfig): void {
    if (config.epochs <= 0) {
      throw new Error('Invalid learning configuration: epochs must be positive')
    }

    if (config.learningRate <= 0 || config.learningRate > 1) {
      throw new Error(
        'Invalid learning configuration: learning rate must be between 0 and 1',
      )
    }

    if (config.batchSize <= 0) {
      throw new Error(
        'Invalid learning configuration: batch size must be positive',
      )
    }
  }

  private validateDataRange(config: LearningConfig): void {
    if (config.validationSplit < 0 || config.validationSplit >= 1) {
      throw new Error(
        'Invalid learning configuration: validation split must be between 0 and 1',
      )
    }

    if (config.dataRange.startDate >= config.dataRange.endDate) {
      throw new Error(
        'Invalid learning configuration: start date must be before end date',
      )
    }
  }

  private validateSampleParams(config: LearningConfig): void {
    if (config.maxSamples <= 0) {
      throw new Error(
        'Invalid learning configuration: max samples must be positive',
      )
    }
  }
}

export const createLearningWorkerService = (
  callbacks?: LearningWorkerCallbacks,
): LearningWorkerService => {
  return new LearningWorkerService(callbacks)
}
