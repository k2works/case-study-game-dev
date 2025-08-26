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
import { evaluateChain } from '../../../domain/services/ai/ChainEvaluationService'
import type { ChainPattern } from '../../../domain/services/ai/ChainTypes'
import {
  type MayahStyleEvaluation,
  evaluateWithIntegratedSystem,
  getGamePhase,
} from '../../../domain/services/ai/IntegratedEvaluationService'
import { evaluateMove as evaluateOperation } from '../../../domain/services/ai/OperationEvaluationService'
import { evaluateShape } from '../../../domain/services/ai/ShapeEvaluationService'
import {
  type StrategyEvaluationResult,
  type StrategyEvaluationSettings,
  createDefaultStrategySettings,
  evaluateStrategy,
} from '../../../domain/services/ai/StrategyEvaluationService'
import type { StrategyPriority } from '../../../domain/services/ai/StrategyTypes'
import type { AIPort } from '../../ports/AIPort'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort'
import { MoveGenerator } from './MoveGenerator'

/**
 * mayah AI評価結果の基本構造
 */
export interface MayahEvaluationResult extends MayahStyleEvaluation {
  confidence: number
  score: number
  strategyEvaluation?: StrategyEvaluationResult
  recommendedPriority?: StrategyPriority
}

/**
 * mayah AIサービス実装
 * Phase 4a: 基本構造実装
 */
export class MayahAIService implements AIPort {
  private settings: AISettings
  private enabled = false
  private moveGenerator: MoveGeneratorPort
  private strategyEvaluationSettings: StrategyEvaluationSettings
  private currentPhase: 'Phase 4a' | 'Phase 4b' | 'Phase 4c' = 'Phase 4c'
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
    this.strategyEvaluationSettings = createDefaultStrategySettings()
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
   * 実装フェーズを設定
   */
  setCurrentPhase(phase: 'Phase 4a' | 'Phase 4b' | 'Phase 4c'): void {
    this.currentPhase = phase
  }

  /**
   * Phase 4a-4b: 段階的実装による手選択
   * 現在Phase 4b: 高度な評価ロジック
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

    // Phase 4b: 高度な評価システムを使用
    const evaluatedMoves = possibleMoves.map((move, index) => {
      const evaluation =
        this.currentPhase === 'Phase 4b' || this.currentPhase === 'Phase 4c'
          ? this.evaluateAdvancedMove(move, gameState)
          : this.evaluateBasicMove(move, gameState)

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

    // Phase 4c: 戦略優先度に基づく高度な手選択
    const sortedMoves =
      this.currentPhase === 'Phase 4c'
        ? this.sortMovesByStrategy(evaluatedMoves)
        : this.sortMovesByScore(evaluatedMoves)

    // ランクを更新
    sortedMoves.forEach((item, index) => {
      item.rank = index + 1
    })

    // 候補手ランキングを保存
    this.candidateMovesWithEvaluation = sortedMoves

    // 最高ランクの手を選択
    const bestMove = sortedMoves[0]
    this.lastEvaluationResult = bestMove.evaluation

    return bestMove.move
  }

  /**
   * Phase 4a: 基本的な手評価
   * 簡略化された評価システム
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
      operationScore: totalScore * 0.5,
      shapeScore: totalScore * 0.3,
      chainScore: totalScore * 0.15,
      strategyScore: totalScore * 0.05,
      totalScore,
      phaseAdjustment: 1.0,
      reason: `Phase 4a基本評価: 中央距離${distanceFromCenter}`,
      gamePhase: getGamePhase(gameState),
      confidence: 0.6, // 基本評価なので低め
      score: totalScore,
    }
  }

  /**
   * Phase 4b: 高度な手評価
   * 統合評価サービスを使用した4要素評価（戦略評価統合）
   */
  private evaluateAdvancedMove(
    move: PossibleMove,
    gameState: AIGameState,
  ): MayahEvaluationResult {
    // ゲームフェーズを判定
    const gamePhase = getGamePhase(gameState)

    // 各評価サービスを実行
    const operationEvaluation = evaluateOperation(move, gameState)
    const shapeEvaluation = evaluateShape(gameState, gamePhase)
    const chainEvaluation = evaluateChain(gameState, move, gamePhase)

    // 戦略評価を実行
    const possibleMoves = this.moveGenerator.generateMoves(gameState)
    const chainPatterns: ChainPattern[] = [] // 今回は基本実装のため空配列
    const strategyEvaluation = evaluateStrategy(
      gameState,
      possibleMoves,
      chainPatterns,
      this.strategyEvaluationSettings,
    )

    // 統合評価を実行（戦略評価を含む）
    const integratedEvaluation = evaluateWithIntegratedSystem(move, gameState, {
      operation: operationEvaluation,
      shape: shapeEvaluation,
      chain: {
        totalScore: chainEvaluation.totalScore,
        chainLength: chainEvaluation.chainLength,
        triggerProbability: chainEvaluation.triggerProbability,
      },
      strategy: {
        totalScore: strategyEvaluation.totalScore,
      },
    })

    // 戦略評価による最終スコア調整
    const strategyAdjustedScore = this.applyStrategyAdjustment(
      integratedEvaluation.totalScore,
      strategyEvaluation,
    )

    // 信頼度計算（戦略評価を含む）
    const confidence = this.calculateIntegratedConfidence(
      integratedEvaluation,
      strategyEvaluation,
    )

    return {
      ...integratedEvaluation,
      score: strategyAdjustedScore,
      confidence,
      strategyEvaluation,
      recommendedPriority: strategyEvaluation.recommendedPriority,
    }
  }

  /**
   * スコア順でソート（Phase 4a, 4b用）
   */
  private sortMovesByScore(
    moves: Array<{
      move: AIMove
      evaluation: MayahEvaluationResult
      rank: number
    }>,
  ): Array<{ move: AIMove; evaluation: MayahEvaluationResult; rank: number }> {
    return [...moves].sort((a, b) => b.evaluation.score - a.evaluation.score)
  }

  /**
   * 戦略優先度に基づく高度なソート（Phase 4c用）
   */
  private sortMovesByStrategy(
    moves: Array<{
      move: AIMove
      evaluation: MayahEvaluationResult
      rank: number
    }>,
  ): Array<{ move: AIMove; evaluation: MayahEvaluationResult; rank: number }> {
    return [...moves].sort((a, b) => {
      const aEval = a.evaluation
      const bEval = b.evaluation

      // 戦略評価がない場合は通常のスコアソート
      if (!aEval.strategyEvaluation || !bEval.strategyEvaluation) {
        return b.evaluation.score - a.evaluation.score
      }

      const aStrategy = aEval.strategyEvaluation
      const bStrategy = bEval.strategyEvaluation

      // 戦略優先度の重要度順（即座発火 > 防御 > 連鎖構築 > バランス）
      const priorityWeight: Record<StrategyPriority, number> = {
        fire_immediately: 4,
        defend: 3,
        build_chain: 2,
        balanced: 1,
        watch_opponent: 1,
      }

      const aStrategyWeight = priorityWeight[aStrategy.recommendedPriority] || 1
      const bStrategyWeight = priorityWeight[bStrategy.recommendedPriority] || 1

      // 戦略重みが異なる場合は戦略重みで判定
      if (aStrategyWeight !== bStrategyWeight) {
        return bStrategyWeight - aStrategyWeight
      }

      // 戦略重みが同じ場合は、戦略評価の信頼度で判定
      const aStrategyScore = aStrategy.confidence * aEval.score
      const bStrategyScore = bStrategy.confidence * bEval.score

      if (Math.abs(aStrategyScore - bStrategyScore) > 10) {
        return bStrategyScore - aStrategyScore
      }

      // 最終的にはスコアで判定
      return b.evaluation.score - a.evaluation.score
    })
  }

  /**
   * 戦略評価によるスコア調整
   */
  private applyStrategyAdjustment(
    baseScore: number,
    strategyEvaluation: StrategyEvaluationResult,
  ): number {
    let adjustedScore = baseScore

    // 戦略優先度による調整
    switch (strategyEvaluation.recommendedPriority) {
      case 'fire_immediately':
        // 即座発火が推奨される場合、発火可能性の高い手を優遇
        adjustedScore *= 1.3
        break
      case 'build_chain':
        // 連鎖構築が推奨される場合、安全性を重視
        adjustedScore *= 1.1
        break
      case 'defend':
        // 防御優先の場合、リスクの低い手を優遇
        adjustedScore *= 1.2
        break
      case 'balanced':
        // バランス型の場合、調整なし
        break
      default:
        break
    }

    // 戦略評価の信頼度による調整
    const confidenceMultiplier = 0.8 + strategyEvaluation.confidence * 0.4
    adjustedScore *= confidenceMultiplier

    return Math.round(adjustedScore)
  }

  /**
   * 統合評価に基づく信頼度計算（戦略評価を含む）
   */
  private calculateIntegratedConfidence(
    evaluation: MayahStyleEvaluation,
    strategyEvaluation?: StrategyEvaluationResult,
  ): number {
    // スコア要素の分散を基に信頼度を計算
    const scores = [
      evaluation.operationScore,
      evaluation.shapeScore,
      evaluation.chainScore,
      evaluation.strategyScore,
    ]

    const nonZeroScores = scores.filter((score) => score > 0)

    // 複数の評価要素が高い場合、信頼度が高い
    const factorCount = nonZeroScores.length
    const averageScore =
      nonZeroScores.length > 0
        ? nonZeroScores.reduce((sum, score) => sum + score, 0) /
          nonZeroScores.length
        : 0

    // 基本信頼度: 評価要素の多様性と平均スコアに基づく
    let confidence = 0.5 + factorCount * 0.1 + averageScore / 200

    // 連鎖評価が高い場合は追加ボーナス
    if (evaluation.chainScore > 50) {
      confidence += 0.15
    }

    // 戦略評価が利用可能な場合の追加調整
    if (strategyEvaluation) {
      // 戦略評価の信頼度を組み込み
      confidence = confidence * 0.7 + strategyEvaluation.confidence * 0.3

      // 明確な戦略が推奨される場合はボーナス
      if (
        strategyEvaluation.recommendedPriority !== 'balanced' &&
        strategyEvaluation.confidence > 0.7
      ) {
        confidence += 0.1
      }
    }

    // 0.0-1.0の範囲に制限
    return Math.max(0.0, Math.min(1.0, confidence))
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 最後の評価結果を取得
   */
  getLastEvaluationResult(): MayahEvaluationResult | null {
    return this.lastEvaluationResult
  }

  /**
   * 候補手と評価結果のランキングを取得
   */
  getCandidateMovesWithEvaluation(): Array<{
    move: AIMove
    evaluation: MayahEvaluationResult
    rank: number
  }> {
    return [...this.candidateMovesWithEvaluation]
  }

  /**
   * 現在のフェーズを取得
   */
  getCurrentPhase(): 'Phase 4a' | 'Phase 4b' | 'Phase 4c' {
    return this.currentPhase
  }
}
