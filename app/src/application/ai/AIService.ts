/**
 * AIサービス
 * アプリケーション層のAI制御サービス
 */
import type { AIPort, MoveGeneratorPort } from '../../domain/ai/ports'
import type {
  AIGameState,
  AIMove,
  AISettings,
  PossibleMove,
} from '../../domain/ai/types'
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
      // デフォルトの手を返す
      return {
        x: 0,
        rotation: 0,
        score: 0,
      }
    }

    // 各手を評価
    const evaluatedMoves = possibleMoves.map((move) => ({
      ...move,
      evaluationScore: this.evaluateMove(move, gameState),
    }))

    // 最高スコアの手を選択
    const bestMove = evaluatedMoves.reduce((best, current) =>
      current.evaluationScore > best.evaluationScore ? current : best,
    )

    return {
      x: bestMove.x,
      rotation: bestMove.rotation,
      score: bestMove.evaluationScore,
    }
  }

  /**
   * 手を評価する
   */
  private evaluateMove(move: PossibleMove, gameState: AIGameState): number {
    if (!move.isValid) {
      return -1000
    }

    const field = gameState.field
    let score = 0

    // 高さベースの評価（低い位置ほど高スコア）
    const avgHeight = (move.primaryPosition.y + move.secondaryPosition.y) / 2
    score += (field.height - avgHeight) * 10

    // 中央付近を優遇
    const centerX = field.width / 2
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2
    const distanceFromCenter = Math.abs(centerX - avgX)
    score += (field.width - distanceFromCenter) * 5

    // モード別の評価調整
    switch (this.settings.mode) {
      case 'aggressive':
        // より中央寄りを優遇
        score += (field.width - distanceFromCenter) * 10
        break
      case 'defensive':
        // より低い位置を優遇
        score += (field.height - avgHeight) * 15
        break
      case 'balanced':
      default:
        // バランス重視（デフォルト評価）
        break
    }

    return score
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
