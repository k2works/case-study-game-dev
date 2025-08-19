/**
 * Web Worker統合AIサービス
 * AIワーカーと連携してメインスレッドをブロックしない処理を実現
 */
import type {
  AIGameState,
  AIMove,
  AISettings,
  MoveEvaluation,
  PossibleMove,
} from '../../../domain/models/ai/index'
import type { AIPort } from '../../ports/AIPort'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort'
import { MoveGenerator } from './MoveGenerator'

interface WorkerMessage {
  type: string
  payload: unknown
}

interface ModelStatusPayload {
  ready: boolean
}

interface ModelErrorPayload {
  error: string
}

interface EvaluationErrorPayload {
  requestId: string
  error: string
}

interface EvaluationResult {
  requestId: string
  move: PossibleMove
  evaluation: MoveEvaluation
  score: number
}

/**
 * Web Worker統合AIサービス
 */
export class WorkerAIService implements AIPort {
  private settings: AISettings
  private enabled = false
  private moveGenerator: MoveGeneratorPort
  private worker: Worker | null = null
  private workerReady = false
  private pendingRequests = new Map<
    string,
    {
      resolve: (result: EvaluationResult) => void
      reject: (error: Error) => void
    }
  >()

  constructor() {
    this.settings = {
      enabled: false,
      thinkingSpeed: 1000,
    }
    this.moveGenerator = new MoveGenerator()
    this.initializeWorker()
  }

  /**
   * Web Workerの初期化
   */
  private initializeWorker(): void {
    try {
      // Web Worker が利用可能かチェック
      if (typeof Worker === 'undefined') {
        console.warn('Web Workers are not supported in this environment')
        this.worker = null
        this.workerReady = false
        return
      }

      this.worker = new Worker('/ai-worker.js')

      this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        this.handleWorkerMessage(event.data)
      }

      this.worker.onerror = (error) => {
        console.error('Worker error:', error)
        this.workerReady = false
      }

      // モデルの準備状況を確認
      this.checkWorkerStatus()
    } catch (error) {
      console.warn('Failed to initialize worker:', error)
      this.worker = null
      this.workerReady = false
    }
  }

  /**
   * Workerからのメッセージを処理
   */
  private handleWorkerMessage(message: WorkerMessage): void {
    const { type, payload } = message

    switch (type) {
      case 'MODEL_READY':
        this.workerReady = true
        console.log('AI Worker is ready')
        break

      case 'MODEL_ERROR':
        this.workerReady = false
        console.error(
          'AI Worker model error:',
          (payload as ModelErrorPayload).error,
        )
        break

      case 'MODEL_STATUS':
        this.workerReady = (payload as ModelStatusPayload).ready
        break

      case 'MOVE_EVALUATED':
        this.handleEvaluationResult(payload as EvaluationResult)
        break

      case 'EVALUATION_ERROR':
        this.handleEvaluationError(payload as EvaluationErrorPayload)
        break

      default:
        console.warn('Unknown worker message type:', type)
    }
  }

  /**
   * 評価結果の処理
   */
  private handleEvaluationResult(payload: EvaluationResult): void {
    const request = this.pendingRequests.get(payload.requestId)
    if (request) {
      request.resolve(payload)
      this.pendingRequests.delete(payload.requestId)
    }
  }

  /**
   * 評価エラーの処理
   */
  private handleEvaluationError(payload: EvaluationErrorPayload): void {
    const request = this.pendingRequests.get(payload.requestId)
    if (request) {
      request.reject(new Error(payload.error))
      this.pendingRequests.delete(payload.requestId)
    }
  }

  /**
   * Workerの状態確認
   */
  private checkWorkerStatus(): void {
    if (this.worker) {
      this.worker.postMessage({
        type: 'CHECK_MODEL_STATUS',
        payload: {},
      })
    }
  }

  /**
   * Workerで手を評価
   */
  private evaluateWithWorker(
    move: PossibleMove,
    gameState: AIGameState,
  ): Promise<EvaluationResult> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.workerReady) {
        reject(new Error('Worker not ready'))
        return
      }

      const requestId = `eval_${Date.now()}_${Math.random()}`
      this.pendingRequests.set(requestId, { resolve, reject })

      // 評価リクエストをWorkerに送信
      this.worker.postMessage({
        type: 'EVALUATE_MOVE',
        payload: {
          requestId,
          move,
          gameState,
        },
      })

      // タイムアウト設定（5秒）
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId)
          reject(new Error('Worker evaluation timeout'))
        }
      }, 5000)
    })
  }

  /**
   * フォールバック評価（Workerが使用できない場合）
   */
  private fallbackEvaluation(
    move: PossibleMove,
    gameState: AIGameState,
  ): MoveEvaluation {
    if (!move.isValid) {
      return {
        heightScore: -1000,
        centerScore: 0,
        modeScore: 0,
        totalScore: -1000,
        averageY: -1,
        averageX: -1,
        distanceFromCenter: 0,
        reason: '無効な手',
      }
    }

    const field = gameState.field
    const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2
    const centerX = (field.width - 1) / 2
    const distanceFromCenter = Math.abs(centerX - avgX)

    const heightScore = avgY * 10
    const centerScore = (field.width - distanceFromCenter) * 5
    const modeScore = 0 // Worker使用不可のためML補正なし

    const totalScore = heightScore + centerScore + modeScore

    const reason = `位置(${move.x}, ${Math.round(avgY)}), フォールバック判定, スコア: ${Math.round(totalScore)}`

    return {
      heightScore,
      centerScore,
      modeScore,
      totalScore,
      averageY: avgY,
      averageX: avgX,
      distanceFromCenter,
      reason,
    }
  }

  /**
   * 次の手を決定
   */
  async decideMove(gameState: AIGameState): Promise<AIMove> {
    if (!this.enabled || !gameState.currentPuyoPair) {
      throw new Error('AI is not enabled or no current puyo pair')
    }

    // 思考速度の遅延をシミュレート
    await this.delay(this.settings.thinkingSpeed)

    // 可能な手を生成
    const possibleMoves = this.moveGenerator.generateMoves(gameState)

    let evaluatedMoves: Array<{
      move: PossibleMove
      evaluation: MoveEvaluation
      evaluationScore: number
    }> = []

    if (this.worker && this.workerReady) {
      // Workerを使用して並列評価
      try {
        const evaluationPromises = possibleMoves.map(async (move) => {
          try {
            const result = await this.evaluateWithWorker(move, gameState)
            return {
              move: result.move,
              evaluation: result.evaluation,
              evaluationScore: result.score,
            }
          } catch {
            // Worker評価失敗時はフォールバック
            const evaluation = this.fallbackEvaluation(move, gameState)
            return {
              move,
              evaluation,
              evaluationScore: evaluation.totalScore,
            }
          }
        })

        evaluatedMoves = await Promise.all(evaluationPromises)
      } catch (error) {
        console.warn(
          'Worker evaluation failed, using fallback for all moves:',
          error,
        )
        // 全てフォールバック評価
        evaluatedMoves = possibleMoves.map((move) => {
          const evaluation = this.fallbackEvaluation(move, gameState)
          return {
            move,
            evaluation,
            evaluationScore: evaluation.totalScore,
          }
        })
      }
    } else {
      // Workerが使用できない場合はフォールバック評価
      evaluatedMoves = possibleMoves.map((move) => {
        const evaluation = this.fallbackEvaluation(move, gameState)
        return {
          move,
          evaluation,
          evaluationScore: evaluation.totalScore,
        }
      })
    }

    // 最高スコアの手を選択
    const bestMove = evaluatedMoves.reduce((best, current) =>
      current.evaluationScore > best.evaluationScore ? current : best,
    )

    return {
      x: bestMove.move.x,
      rotation: bestMove.move.rotation,
      score: bestMove.evaluationScore,
      evaluation: bestMove.evaluation,
    }
  }

  /**
   * AI設定を更新
   */
  updateSettings(settings: AISettings): void {
    this.settings = { ...settings }
    this.enabled = settings.enabled
  }

  /**
   * AIが動作中かどうか
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * AIを有効化/無効化
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.settings.enabled = enabled
  }

  /**
   * Workerの準備状態を取得
   */
  isWorkerReady(): boolean {
    return this.workerReady
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * リソースのクリーンアップ
   */
  dispose(): void {
    // 未完了のリクエストをクリア
    this.pendingRequests.forEach((request) => {
      request.reject(new Error('Service disposed'))
    })
    this.pendingRequests.clear()

    // Workerを終了
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.workerReady = false
  }
}
