/**
 * AIサービス
 * アプリケーション層のAI制御サービス
 */
import type {
  AIGameState,
  AIMove,
  AISettings,
  PossibleMove,
} from '../../../domain/models/ai/index'
import { evaluateMove } from '../../../domain/services/ai/EvaluationService'
import type { AIPort } from '../../ports/AIPort.ts'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort.ts'
import { MoveGenerator } from './MoveGenerator'

/**
 * AIサービス実装
 */
export class AIService implements AIPort {
  private settings: AISettings
  private enabled = false
  private moveGenerator: MoveGeneratorPort

  constructor() {
    this.settings = {
      enabled: false,
      thinkingSpeed: 1000,
    }
    this.moveGenerator = new MoveGenerator()
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
    const bestMove = this.selectBestMove(possibleMoves, gameState)
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
   * 可能な手から最適な手を選択
   */
  private selectBestMove(
    possibleMoves: PossibleMove[],
    gameState: AIGameState,
  ): AIMove {
    if (possibleMoves.length === 0) {
      console.warn('No possible moves available')
      return {
        x: 0,
        rotation: 0,
        score: 0,
      }
    }

    // 各手を評価
    const evaluatedMoves = possibleMoves.map((move) => {
      const evaluation = evaluateMove(move, gameState)
      return {
        ...move,
        evaluationScore: evaluation.totalScore,
        evaluation,
      }
    })

    // 最高スコアの手を選択
    const bestMove = evaluatedMoves.reduce((best, current) =>
      current.evaluationScore > best.evaluationScore ? current : best,
    )

    return {
      x: bestMove.x,
      rotation: bestMove.rotation,
      score: bestMove.evaluationScore,
      evaluation: bestMove.evaluation,
    }
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
