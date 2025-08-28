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
  PossibleMove,
} from '../../../domain/models/ai/index'
import {
  evaluateMove,
  evaluateMoveWithML,
} from '../../../domain/services/ai/EvaluationService'
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
      // まず学習済みモデルの読み込みを試行
      await this.loadTrainedModel()

      if (!this.model) {
        // 学習済みモデルがない場合はデフォルトモデルを作成
        await this.createDefaultModel()
      }

      this.modelReady = true
      console.log('ML model initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize ML model:', error)
      this.modelReady = false
    }
  }

  /**
   * 学習済みモデルを読み込み
   */
  private async loadTrainedModel(): Promise<void> {
    try {
      // IndexedDBから保存されたモデルを読み込み
      this.model = await tf.loadLayersModel('indexeddb://puyo-ai-model')
      console.log('Trained model loaded from IndexedDB')
    } catch (error) {
      console.warn('No trained model found, will create default model:', error)
      this.model = null
    }
  }

  /**
   * デフォルトモデルを作成
   */
  private async createDefaultModel(): Promise<void> {
    // シンプルなニューラルネットワークモデルを作成
    // FeatureEngineeringServiceの8次元特徴量に合わせる
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8], // FeatureEngineeringServiceの8次元特徴量
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

    console.log('Default model created')
  }

  /**
   * ゲーム状態をテンソル入力に変換（8次元特徴量）
   */
  private gameStateToTensor(gameState: AIGameState): tf.Tensor2D {
    const features = this.extractFeatures(gameState)
    return tf.tensor2d([features], [1, 8])
  }

  /**
   * ゲーム状態から8次元特徴量を抽出
   */
  private extractFeatures(gameState: AIGameState): number[] {
    // FeatureEngineeringServiceと同様の8次元特徴量を生成
    const features: number[] = []

    // 1. フィールド密度
    const fieldDensity = this.calculateFieldDensity(gameState)
    features.push(fieldDensity)

    // 2. 連鎖ポテンシャル（簡易版）
    const chainPotential = this.calculateChainPotential(gameState)
    features.push(chainPotential / 100) // 正規化

    // 3-4. 現在のぷよペア位置（正規化）
    if (gameState.currentPuyoPair) {
      features.push(gameState.currentPuyoPair.x / 5) // X座標正規化
      features.push(gameState.currentPuyoPair.rotation / 3) // 回転正規化
    } else {
      features.push(0.5) // デフォルト値
      features.push(0)
    }

    // 5-8. 色分布
    const colorDist = this.calculateColorDistribution(gameState)
    features.push(colorDist.red)
    features.push(colorDist.blue)
    features.push(colorDist.yellow)
    features.push(colorDist.green)

    return features
  }

  /**
   * フィールド密度を計算
   */
  private calculateFieldDensity(gameState: AIGameState): number {
    let filledCells = 0
    const totalCells = gameState.field.width * gameState.field.height

    for (let x = 0; x < gameState.field.width; x++) {
      for (let y = 0; y < gameState.field.height; y++) {
        if (gameState.field.cells[x]?.[y]) {
          filledCells++
        }
      }
    }

    return filledCells / totalCells
  }

  /**
   * 連鎖ポテンシャルを計算（簡易版）
   */
  private calculateChainPotential(gameState: AIGameState): number {
    // 簡易版: フィールドの中段の密度から推定
    let midLevelCells = 0
    const midLevel = Math.floor(gameState.field.height / 2)

    for (let x = 0; x < gameState.field.width; x++) {
      for (let y = midLevel - 2; y <= midLevel + 2; y++) {
        if (gameState.field.cells[x]?.[y]) {
          midLevelCells++
        }
      }
    }

    return midLevelCells * 5 // 簡易スコア
  }

  /**
   * 色分布を計算
   */
  private calculateColorDistribution(gameState: AIGameState): {
    red: number
    blue: number
    yellow: number
    green: number
  } {
    const colors = { red: 0, blue: 0, yellow: 0, green: 0 }
    let total = 0

    for (let x = 0; x < gameState.field.width; x++) {
      for (let y = 0; y < gameState.field.height; y++) {
        const cell = gameState.field.cells[x]?.[y]
        if (cell && cell in colors) {
          colors[cell as keyof typeof colors]++
          total++
        }
      }
    }

    // 正規化
    if (total > 0) {
      return {
        red: colors.red / total,
        blue: colors.blue / total,
        yellow: colors.yellow / total,
        green: colors.green / total,
      }
    }

    return { red: 0.25, blue: 0.25, yellow: 0.25, green: 0.25 }
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
        const evaluation = this.modelReady
          ? evaluateMoveWithML(move, gameState, mlScore)
          : evaluateMove(move, gameState)

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
   * 外部の学習済みモデルを読み込み
   */
  async loadModel(modelPath: string): Promise<boolean> {
    try {
      const newModel = await tf.loadLayersModel(modelPath)

      // 既存モデルを破棄
      if (this.model) {
        this.model.dispose()
      }

      this.model = newModel
      this.modelReady = true
      console.log(`Model loaded successfully from: ${modelPath}`)

      return true
    } catch (error) {
      console.error('Failed to load model:', error)
      return false
    }
  }

  /**
   * 現在のモデルを保存
   */
  async saveModel(
    modelPath: string = 'indexeddb://puyo-ai-model',
  ): Promise<boolean> {
    if (!this.model) {
      console.warn('No model to save')
      return false
    }

    try {
      await this.model.save(modelPath)
      console.log(`Model saved successfully to: ${modelPath}`)
      return true
    } catch (error) {
      console.error('Failed to save model:', error)
      return false
    }
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
