/**
 * mayah AI評価システムを使用するAIサービス
 * FunctionalOptimizedEvaluationServiceベースの高度な評価を提供（関数型）
 */
import type { GamePhase } from '../../../domain/models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../../domain/models/ai/MayahEvaluation'
import type {
  AIGameState,
  AIMove,
  AISettings,
  PossibleMove,
} from '../../../domain/models/ai/index'
import {
  type CacheState,
  DEFAULT_OPTIMIZATION_SETTINGS,
  type EvaluationContext,
  type OptimizedEvaluationResult,
  createCacheState,
  evaluateProgressive,
} from '../../../domain/services/ai/OptimizedEvaluationService'
import { determineGamePhase } from '../../../domain/services/ai/PhaseManagementService'
import type { AIPort } from '../../ports/AIPort.ts'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort.ts'
import { MoveGenerator } from './MoveGenerator'

/**
 * mayah AI評価システムサービス実装（関数型）
 */
export class MayahAIService implements AIPort {
  private settings: AISettings
  private enabled = false
  private moveGenerator: MoveGeneratorPort
  private cacheState: CacheState
  private lastEvaluationResult: OptimizedEvaluationResult | null = null
  private candidateMovesWithEvaluation: Array<{
    move: AIMove
    evaluation: OptimizedEvaluationResult
    rank: number
  }> = []

  constructor() {
    this.settings = {
      enabled: false,
      thinkingSpeed: 1000,
    }
    this.moveGenerator = new MoveGenerator()
    this.cacheState = createCacheState(DEFAULT_OPTIMIZATION_SETTINGS)
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

    // 最適な手を選択
    const bestMove = await this.selectBestMove(possibleMoves, gameState)
    return bestMove
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
   * 最後の評価結果を取得
   */
  async getLastEvaluationResult(): Promise<OptimizedEvaluationResult | null> {
    return this.lastEvaluationResult
  }

  /**
   * 候補手とその評価を取得
   */
  async getCandidateMovesWithEvaluation(): Promise<
    Array<{
      move: AIMove
      evaluation: OptimizedEvaluationResult
      rank: number
    }>
  > {
    return this.candidateMovesWithEvaluation
  }

  /**
   * 可能な手から最適な手を選択
   */
  private async selectBestMove(
    possibleMoves: PossibleMove[],
    gameState: AIGameState,
  ): Promise<AIMove> {
    if (possibleMoves.length === 0) {
      console.warn('No possible moves available')
      return {
        x: 0,
        rotation: 0,
        score: 0,
      }
    }

    // ゲームフェーズを判定
    const gamePhase = this.determineGamePhase(gameState)

    // 各手をmayah AI評価システムで評価（関数型）
    const evaluatedMoves = possibleMoves.map((move, index) => {
      // ゲーム状態を作成（手を適用後の状態をシミュレーション）
      const myGameState = this.createValidGameState(gameState)

      // 相手は空の状態として仮定
      const opponentGameState = this.createEmptyOpponentState(gameState)

      // 評価コンテキストを作成
      const context: EvaluationContext = {
        myGameState,
        opponentGameState,
        gamePhase,
        settings: DEFAULT_MAYAH_SETTINGS,
        optimizationSettings: DEFAULT_OPTIMIZATION_SETTINGS,
      }

      // 関数型評価を実行
      const { result: evaluation, newCacheState } = evaluateProgressive(
        context,
        this.cacheState,
      )

      // キャッシュ状態を更新
      this.cacheState = newCacheState

      return {
        move: {
          x: move.x,
          rotation: move.rotation,
          score: evaluation.basic.score,
        },
        evaluation,
        rank: index + 1,
      }
    })

    // スコア順にソート
    evaluatedMoves.sort(
      (a, b) => b.evaluation.basic.score - a.evaluation.basic.score,
    )

    // ランクを更新
    evaluatedMoves.forEach((item, index) => {
      item.rank = index + 1
    })

    // 候補手ランキングを保存
    this.candidateMovesWithEvaluation = evaluatedMoves

    // 最高スコアの手を選択
    const bestMove = evaluatedMoves[0]

    // 最後の評価結果を保存
    this.lastEvaluationResult = bestMove.evaluation

    return bestMove.move
  }

  /**
   * ゲームフェーズを判定
   */
  private determineGamePhase(gameState: AIGameState): GamePhase {
    // スコアを基に簡易的な手数を計算（スコア/100で近似）
    const estimatedMoveCount = Math.floor(gameState.score / 100)
    return determineGamePhase(gameState, estimatedMoveCount)
  }

  /**
   * 有効なゲーム状態を作成
   */
  private createValidGameState(gameState: AIGameState): AIGameState {
    // フィールド構造を確認し、必要に応じて変換
    const fieldCells = gameState.field.cells || []
    const validCells =
      Array.isArray(fieldCells) && fieldCells.length > 0
        ? fieldCells
        : Array(gameState.field.height)
            .fill(null)
            .map(() => Array(gameState.field.width).fill(null))

    return {
      field: {
        width: gameState.field.width,
        height: gameState.field.height,
        cells: validCells,
      },
      currentPuyoPair: gameState.currentPuyoPair,
      nextPuyoPair: gameState.nextPuyoPair,
      score: gameState.score,
    }
  }

  /**
   * 空の相手状態を作成
   */
  private createEmptyOpponentState(gameState: AIGameState): AIGameState {
    return {
      field: {
        width: gameState.field.width,
        height: gameState.field.height,
        cells: Array(gameState.field.height)
          .fill(null)
          .map(() => Array(gameState.field.width).fill(null)),
      },
      currentPuyoPair: null,
      nextPuyoPair: null,
      score: 0,
    }
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
