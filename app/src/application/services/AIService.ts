/**
 * AIサービス
 * アプリケーション層のAI制御サービス
 */
import type {
  AIGameState,
  AIMove,
  AISettings,
  MoveEvaluation,
  PossibleMove,
} from '../../domain/models/ai/types'
import type { AIPort } from '../ports/AIPort.ts'
import type { MoveGeneratorPort } from '../ports/MoveGeneratorPort.ts'
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
      mode: 'balanced',
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
      const evaluation = this.evaluateMoveDetailed(move, gameState)
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
   * 手を詳細評価する
   */
  private evaluateMoveDetailed(
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

    // 高さベースの評価（下の位置ほど高スコア - y値が大きいほど良い）
    const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2
    const heightScore = avgY * 10 // y値が大きい（下の方）ほど高スコア

    // 中央付近を優遇
    const centerX = (field.width - 1) / 2 // 6列なら中央は2.5
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2
    const distanceFromCenter = Math.abs(centerX - avgX)
    const centerScore = (field.width - distanceFromCenter) * 5

    // モード別の評価調整
    let modeScore = 0
    let modeReason = ''

    switch (this.settings.mode) {
      case 'aggressive':
        // より中央寄りを優遇
        modeScore = (field.width - distanceFromCenter) * 10
        modeReason = '攻撃型: 中央重視'
        break
      case 'defensive':
        // より下の位置を優遇
        modeScore = avgY * 15
        modeReason = '防御型: 安定性重視'
        break
      case 'balanced':
      default:
        modeReason = 'バランス型: 標準評価'
        break
    }

    const totalScore = heightScore + centerScore + modeScore

    const reason = `位置(${move.x}, ${Math.round(avgY)}), ${modeReason}, スコア: ${Math.round(totalScore)}`

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
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
