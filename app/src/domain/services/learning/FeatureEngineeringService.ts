import type {
  AIAction,
  GameState,
  TrainingData,
} from '../../models/training/TrainingData'

/**
 * 特徴量ベクトル
 */
export interface FeatureVector {
  fieldDensity: number
  chainPotential: number
  positionFeatures: {
    currentX: number
    rotation: number
  }
  colorDistribution: {
    red: number
    blue: number
    yellow: number
    green: number
  }
}

/**
 * 正規化された特徴量
 */
export interface NormalizedFeatures {
  readonly vector: readonly number[]
  readonly metadata: {
    readonly featureNames: readonly string[]
  }
}

/**
 * バッチ処理結果
 */
export interface ProcessedTrainingData {
  features: FeatureVector
  normalizedFeatures: NormalizedFeatures
  reward: number
  id: string
  timestamp: Date
}

/**
 * 特徴量エンジニアリングサービス
 */
export class FeatureEngineeringService {
  /**
   * ゲーム状態とアクションから特徴量を抽出
   */
  extractFeatures(gameState: GameState, action: AIAction): FeatureVector {
    this.validateInputs(gameState, action)

    const fieldDensity = this.calculateFieldDensity(gameState)
    const chainPotential = this.calculateChainPotential(gameState)
    const positionFeatures = this.extractPositionFeatures(action)
    const colorDistribution = this.calculateColorDistribution(gameState)

    return Object.freeze({
      fieldDensity,
      chainPotential,
      positionFeatures: Object.freeze(positionFeatures),
      colorDistribution: Object.freeze(colorDistribution),
    })
  }

  /**
   * 特徴量を正規化
   */
  normalizeFeatures(features: FeatureVector): NormalizedFeatures {
    const vector = [
      features.fieldDensity,
      features.chainPotential / 100, // 最大100連鎖と仮定
      features.positionFeatures.currentX / 5, // フィールド幅6の正規化
      features.positionFeatures.rotation / 3, // 4方向回転の正規化
      features.colorDistribution.red,
      features.colorDistribution.blue,
      features.colorDistribution.yellow,
      features.colorDistribution.green,
    ]

    const featureNames = [
      'fieldDensity',
      'chainPotential',
      'positionX',
      'rotation',
      'redRatio',
      'blueRatio',
      'yellowRatio',
      'greenRatio',
    ]

    return Object.freeze({
      vector: Object.freeze(vector) as readonly number[],
      metadata: Object.freeze({
        featureNames: Object.freeze(featureNames) as readonly string[],
      }),
    }) as NormalizedFeatures
  }

  /**
   * TrainingDataのバッチ処理
   */
  processBatch(trainingData: TrainingData[]): ProcessedTrainingData[] {
    return trainingData.map((data) => {
      const features = this.extractFeatures(data.gameState, data.action)
      const normalizedFeatures = this.normalizeFeatures(features)

      return Object.freeze({
        features,
        normalizedFeatures,
        reward: data.reward,
        id: data.id,
        timestamp: data.timestamp,
      })
    })
  }

  /**
   * フィールド密度を計算
   */
  private calculateFieldDensity(gameState: GameState): number {
    const totalCells = gameState.field.length * gameState.field[0].length
    let occupiedCells = 0

    for (const row of gameState.field) {
      for (const cell of row) {
        if (cell !== null) {
          occupiedCells++
        }
      }
    }

    return occupiedCells / totalCells
  }

  /**
   * 連鎖ポテンシャルを計算
   */
  private calculateChainPotential(gameState: GameState): number {
    // 簡略化: 現在の連鎖数を基準とした基本的な評価
    return Math.min(gameState.chainCount * 10, 100)
  }

  /**
   * 位置特徴量を抽出
   */
  private extractPositionFeatures(action: AIAction) {
    return {
      currentX: action.x,
      rotation: action.rotation,
    }
  }

  /**
   * 色分布を計算
   */
  private calculateColorDistribution(gameState: GameState) {
    const colorCounts = { red: 0, blue: 0, yellow: 0, green: 0 }
    let totalPuyo = 0

    // フィールド上のぷよをカウント
    const fieldCounts = this.countFieldColors(gameState.field)
    Object.entries(fieldCounts).forEach(([color, count]) => {
      if (color in colorCounts) {
        colorCounts[color as keyof typeof colorCounts] = count
        totalPuyo += count
      }
    })

    // 現在のぷよペアもカウント
    const pairCounts = this.countPairColors(gameState.currentPuyo)
    Object.entries(pairCounts).forEach(([color, count]) => {
      if (color in colorCounts) {
        colorCounts[color as keyof typeof colorCounts] += count
        totalPuyo += count
      }
    })

    return this.normalizeColorCounts(colorCounts, totalPuyo)
  }

  /**
   * フィールド上のぷよ色をカウント
   */
  private countFieldColors(field: unknown[][]) {
    const counts: Record<string, number> = {}

    for (const row of field) {
      for (const cell of row) {
        if (cell && typeof cell === 'object' && 'color' in cell) {
          const color = (cell as { color: string }).color
          counts[color] = (counts[color] || 0) + 1
        }
      }
    }

    return counts
  }

  /**
   * ぷよペアの色をカウント
   */
  private countPairColors(puyoPair: unknown) {
    const counts: Record<string, number> = {}

    if (!puyoPair || typeof puyoPair !== 'object') {
      return counts
    }

    const pair = puyoPair as {
      puyo1?: { color: string }
      puyo2?: { color: string }
    }

    this.addColorToCount(counts, pair.puyo1?.color)
    this.addColorToCount(counts, pair.puyo2?.color)

    return counts
  }

  /**
   * 色カウントに追加
   */
  private addColorToCount(
    counts: Record<string, number>,
    color: string | undefined,
  ) {
    if (color) {
      counts[color] = (counts[color] || 0) + 1
    }
  }

  /**
   * 色カウントを正規化
   */
  private normalizeColorCounts(
    colorCounts: Record<string, number>,
    totalPuyo: number,
  ) {
    if (totalPuyo === 0) {
      return { red: 0, blue: 0, yellow: 0, green: 0 }
    }

    return {
      red: (colorCounts.red || 0) / totalPuyo,
      blue: (colorCounts.blue || 0) / totalPuyo,
      yellow: (colorCounts.yellow || 0) / totalPuyo,
      green: (colorCounts.green || 0) / totalPuyo,
    }
  }

  /**
   * 入力値の検証
   */
  private validateInputs(gameState: GameState, action: AIAction): void {
    if (!gameState) {
      throw new Error('Invalid game state')
    }

    if (!action) {
      throw new Error('Invalid action')
    }

    if (!gameState.field || !Array.isArray(gameState.field)) {
      throw new Error('Invalid game state: field is required')
    }
  }
}
