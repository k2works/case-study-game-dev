/**
 * mayah AI評価システムサービス
 * Phase 4a-4c段階的実装による高度なAI評価システム
 */
import type {
  AIGameState,
  AIMove,
  AISettings,
  PossibleMove,
} from '../../../domain/models/ai/index'
import type { AIPort } from '../../ports/AIPort'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort'
import { MoveGenerator } from './MoveGenerator'

/**
 * mayah AI評価結果の基本構造
 */
export interface MayahEvaluationResult {
  score: number
  reason: string
  phase: string
  confidence: number
}

/**
 * mayah AIサービス実装
 * Phase 4a: 基本構造実装
 */
export class MayahAIService implements AIPort {
  private settings: AISettings
  private enabled = false
  private moveGenerator: MoveGeneratorPort
  private lastEvaluationResult: MayahEvaluationResult | null = null
  private candidateMovesWithEvaluation: Array<{
    move: AIMove
    evaluation: MayahEvaluationResult
    rank: number
  }> = []

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

    // 最適な手を選択（Phase 4a: 基本実装）
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
   * 最後の評価結果を取得（非同期）
   */
  async getLastEvaluationResult(): Promise<MayahEvaluationResult | null> {
    return this.lastEvaluationResult
  }

  /**
   * 候補手とその評価を取得（非同期）
   */
  async getCandidateMovesWithEvaluation(): Promise<
    Array<{
      move: AIMove
      evaluation: MayahEvaluationResult
      rank: number
    }>
  > {
    return this.candidateMovesWithEvaluation
  }

  /**
   * 最後の評価結果を取得（同期）
   * UI用
   */
  getLastEvaluation(): MayahEvaluationResult | null {
    return this.lastEvaluationResult
  }

  /**
   * 候補手とその評価を取得（同期）
   * UI用
   */
  getLastCandidateMoves(): Array<{
    move: AIMove
    evaluation: MayahEvaluationResult
    rank: number
  }> {
    return this.candidateMovesWithEvaluation
  }

  /**
   * Phase 4a: 基本的な手選択実装
   * 後のフェーズで段階的に高度化予定
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

    // Phase 4a: 基本評価（後で段階的に拡張）
    const evaluatedMoves = possibleMoves.map((move, index) => {
      // 基本評価実装（シンプルな重心ベース）
      const evaluation = this.evaluateBasicMove(move, gameState)

      return {
        move: {
          x: move.x,
          rotation: move.rotation,
          score: evaluation.score,
        },
        evaluation,
        rank: index + 1,
      }
    })

    // スコア順にソート
    evaluatedMoves.sort((a, b) => b.evaluation.score - a.evaluation.score)

    // ランクを更新
    evaluatedMoves.forEach((item, index) => {
      item.rank = index + 1
    })

    // 候補手ランキングを保存
    this.candidateMovesWithEvaluation = evaluatedMoves

    // 最高スコアの手を選択
    const bestMove = evaluatedMoves[0]
    this.lastEvaluationResult = bestMove.evaluation

    return bestMove.move
  }

  /**
   * Phase 4a: 基本的な手評価
   * 後のフェーズでmayah型評価システムに拡張予定
   */
  private evaluateBasicMove(
    move: PossibleMove,
    gameState: AIGameState,
  ): MayahEvaluationResult {
    // 基本的な重心ベース評価
    const centerX = Math.floor(gameState.field.width / 2)
    const distanceFromCenter = Math.abs(move.x - centerX)
    const centerScore = Math.max(0, 100 - distanceFromCenter * 20)

    // 基本スコア（位置ベース）
    const baseScore = 50 + Math.random() * 50 // ランダム要素を加えて動作確認
    const totalScore = centerScore + baseScore

    return {
      score: totalScore,
      reason: `Phase 4a基本評価: 中央距離${distanceFromCenter}`,
      phase: 'Phase 4a - 基本実装',
      confidence: 0.6, // 基本評価なので低め
    }
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
