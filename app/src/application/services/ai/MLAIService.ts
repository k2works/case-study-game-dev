/**
 * 機械学習統合AIサービス
 * TensorFlow.jsを活用した高度なAI判断
 */
import * as tf from '@tensorflow/tfjs'

import type { StrategyConfig } from '../../../domain/models/ai/StrategyConfig'
import type {
  AIGameState,
  AIMove,
  AISettings,
  MoveEvaluation,
  PossibleMove,
} from '../../../domain/models/ai/index'
import type { AIPort } from '../../ports/AIPort'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort'
import type { StrategyPort } from '../../ports/StrategyPort'
import { MoveGenerator } from './MoveGenerator'

/**
 * TensorFlow.js統合AIサービス
 */
export class MLAIService implements AIPort {
  private settings: AISettings
  private enabled = false
  private moveGenerator: MoveGeneratorPort
  private model: tf.LayersModel | null = null
  private modelReady = false
  private strategyPort: StrategyPort
  private currentStrategy: StrategyConfig | null = null

  constructor(strategyPort: StrategyPort) {
    this.settings = {
      enabled: false,
      thinkingSpeed: 1000,
    }
    this.moveGenerator = new MoveGenerator()
    this.strategyPort = strategyPort
    this.initializeModel()
    this.loadActiveStrategy()
  }

  /**
   * アクティブ戦略の読み込み
   */
  private async loadActiveStrategy(): Promise<void> {
    try {
      this.currentStrategy = await this.strategyPort.getActiveStrategy()
    } catch (error) {
      console.warn('Failed to load active strategy, using default:', error)
      this.currentStrategy = null
    }
  }

  /**
   * TensorFlow.jsモデルの初期化
   */
  private async initializeModel(): Promise<void> {
    try {
      // シンプルなニューラルネットワークモデルを作成
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [42], // 6x7フィールド入力
            units: 64,
            activation: 'relu',
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu',
          }),
          tf.layers.dense({
            units: 1, // スコア出力
            activation: 'linear',
          }),
        ],
      })

      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
      })

      this.modelReady = true
      console.log('ML model initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize ML model:', error)
      this.modelReady = false
    }
  }

  /**
   * ゲーム状態をテンソル入力に変換
   */
  private gameStateToTensor(gameState: AIGameState): tf.Tensor2D {
    const fieldData = this.extractFieldData(gameState)
    this.normalizeFieldData(fieldData)
    return tf.tensor2d([fieldData], [1, 42])
  }

  /**
   * フィールドデータの抽出
   */
  private extractFieldData(gameState: AIGameState): number[] {
    const fieldData: number[] = []

    for (let y = 0; y < gameState.field.height; y++) {
      for (let x = 0; x < gameState.field.width; x++) {
        const cell = gameState.field.cells[x]?.[y]
        fieldData.push(this.cellToNumber(cell))
      }
    }

    return fieldData
  }

  /**
   * セルの値を数値に変換
   */
  private cellToNumber(cell: string | null): number {
    if (cell === null) return 0

    const colorMap: Record<string, number> = {
      red: 1,
      blue: 2,
      green: 3,
      yellow: 4,
    }

    return colorMap[cell] || 0
  }

  /**
   * フィールドデータの正規化（42要素に調整）
   */
  private normalizeFieldData(fieldData: number[]): void {
    while (fieldData.length < 42) {
      fieldData.push(0)
    }
    fieldData.splice(42)
  }

  /**
   * MLモデルを使用した手の評価
   */
  private async evaluateWithML(
    move: PossibleMove,
    gameState: AIGameState,
  ): Promise<number> {
    if (!this.modelReady || !this.model) {
      return this.fallbackEvaluation(move, gameState)
    }

    try {
      const inputTensor = this.gameStateToTensor(gameState)
      const prediction = this.model.predict(inputTensor) as tf.Tensor
      const score = await prediction.data()

      // テンソルのクリーンアップ
      inputTensor.dispose()
      prediction.dispose()

      return score[0] + this.fallbackEvaluation(move, gameState) * 0.3
    } catch (error) {
      console.warn('ML evaluation failed, using fallback:', error)
      return this.fallbackEvaluation(move, gameState)
    }
  }

  /**
   * 戦略を考慮した評価（従来の手法 + 戦略パラメータ）
   */
  private fallbackEvaluation(
    move: PossibleMove,
    gameState: AIGameState,
  ): number {
    if (!move.isValid) {
      return -1000
    }

    const strategy = this.currentStrategy
    const positions = this.calculatePositions(move, gameState.field)
    const params = this.getStrategyParameters(strategy)

    const heightScore = this.calculateHeightScore(positions, params)
    const centerScore = this.calculateCenterScore(
      positions,
      gameState.field,
      params,
    )
    const defenseScore = this.calculateDefenseScore(
      positions,
      gameState.field,
      params,
    )
    const riskScore = this.calculateRiskScore(positions, params)

    return heightScore + centerScore + defenseScore - riskScore
  }

  /**
   * 位置情報を計算
   */
  private calculatePositions(
    move: PossibleMove,
    field: { width: number; height: number },
  ) {
    const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2
    const centerX = (field.width - 1) / 2
    const distanceFromCenter = Math.abs(centerX - avgX)

    return { avgY, avgX, centerX, distanceFromCenter }
  }

  /**
   * 戦略パラメータを取得
   */
  private getStrategyParameters(strategy: StrategyConfig | null) {
    const defaultParams = this.getDefaultStrategyParameters()
    return strategy?.parameters ?? defaultParams
  }

  /**
   * デフォルト戦略パラメータを取得
   */
  private getDefaultStrategyParameters() {
    return {
      heightControl: 50,
      centerPriority: 50,
      defensePriority: 50,
      riskTolerance: 50,
      chainPriority: 50,
      speedPriority: 50,
    }
  }

  /**
   * 高さスコアを計算
   */
  private calculateHeightScore(
    positions: { avgY: number },
    params: { heightControl: number },
  ): number {
    return positions.avgY * (params.heightControl / 10)
  }

  /**
   * 中央スコアを計算
   */
  private calculateCenterScore(
    positions: { distanceFromCenter: number },
    field: { width: number },
    params: { centerPriority: number },
  ): number {
    return (
      (field.width - positions.distanceFromCenter) *
      (params.centerPriority / 10)
    )
  }

  /**
   * 防御スコアを計算
   */
  private calculateDefenseScore(
    positions: { avgY: number },
    field: { height: number },
    params: { defensePriority: number },
  ): number {
    return params.defensePriority > 70
      ? Math.max(0, field.height - positions.avgY - 3) *
          (params.defensePriority / 20)
      : 0
  }

  /**
   * リスクスコアを計算
   */
  private calculateRiskScore(
    positions: { distanceFromCenter: number },
    params: { riskTolerance: number },
  ): number {
    return params.riskTolerance < 30
      ? (Math.max(0, 3 - positions.distanceFromCenter) *
          (100 - params.riskTolerance)) /
          20
      : 0
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

    // ML評価と従来評価の組み合わせで最適な手を選択
    const evaluatedMoves = await Promise.all(
      possibleMoves.map(async (move) => {
        const mlScore = await this.evaluateWithML(move, gameState)
        const evaluation = this.createEvaluation(move, gameState, mlScore)

        return {
          ...move,
          evaluationScore: evaluation.totalScore,
          evaluation,
        }
      }),
    )

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
   * 評価詳細の作成
   */
  private createEvaluation(
    move: PossibleMove,
    gameState: AIGameState,
    mlScore: number,
  ): MoveEvaluation {
    if (!move.isValid) {
      return this.createInvalidMoveEvaluation()
    }

    return this.createValidMoveEvaluation(move, gameState, mlScore)
  }

  /**
   * 無効な手の評価を作成
   */
  private createInvalidMoveEvaluation(): MoveEvaluation {
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

  /**
   * 有効な手の評価を作成
   */
  private createValidMoveEvaluation(
    move: PossibleMove,
    gameState: AIGameState,
    mlScore: number,
  ): MoveEvaluation {
    const field = gameState.field
    const avgY = (move.primaryPosition.y + move.secondaryPosition.y) / 2
    const avgX = (move.primaryPosition.x + move.secondaryPosition.x) / 2
    const centerX = (field.width - 1) / 2
    const distanceFromCenter = Math.abs(centerX - avgX)

    const heightScore = avgY * 10
    const centerScore = (field.width - distanceFromCenter) * 5
    const modeScore = this.modelReady ? mlScore * 20 : 0
    const totalScore = heightScore + centerScore + modeScore

    const reason = this.modelReady
      ? `位置(${move.x}, ${Math.round(avgY)}), ML強化判定, スコア: ${Math.round(totalScore)}`
      : `位置(${move.x}, ${Math.round(avgY)}), 従来型判定, スコア: ${Math.round(totalScore)}`

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
   * AI設定を更新
   */
  updateSettings(settings: AISettings): void {
    this.settings = { ...settings }
    this.enabled = settings.enabled
  }

  /**
   * 戦略設定を更新
   */
  async updateStrategy(): Promise<void> {
    await this.loadActiveStrategy()
  }

  /**
   * 現在の戦略を取得
   */
  getCurrentStrategy(): StrategyConfig | null {
    return this.currentStrategy
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
   * モデルの準備状態を取得
   */
  isModelReady(): boolean {
    return this.modelReady
  }

  /**
   * 学習データの追加（将来の機能拡張用）
   */
  addTrainingData(gameState: AIGameState, move: AIMove, outcome: number): void {
    // 将来のオンライン学習実装用のスタブ
    console.log('Training data added:', { gameState, move, outcome })
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
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.modelReady = false
  }
}
