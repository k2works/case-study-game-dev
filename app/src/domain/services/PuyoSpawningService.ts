import { curry, map, reduce, sumBy } from 'lodash/fp'

// import { createPosition } from '../models/Position' // 現在未使用
import type { PuyoColor } from '../models/Puyo'
import { type PuyoPair, createPuyoPair } from '../models/PuyoPair'

/**
 * ぷよ生成ドメインサービス
 * ゲームバランスを考慮したぷよペアの生成を担当
 */
export class PuyoSpawningService {
  private colorHistory: PuyoColor[] = []
  private readonly maxHistoryLength = 4
  private readonly availableColors: PuyoColor[]
  private readonly gameBalanceConfig: SpawningConfig

  constructor(
    availableColors: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple'],
    gameBalanceConfig: SpawningConfig = DEFAULT_SPAWNING_CONFIG,
  ) {
    this.availableColors = availableColors
    this.gameBalanceConfig = gameBalanceConfig
  }

  /**
   * 新しいぷよペアを生成
   * @param spawnPosition 生成位置
   * @returns 生成されたぷよペア
   */
  generatePuyoPair(spawnPosition: { x: number; y: number }): PuyoPair {
    const mainColor = this.selectColor()
    const subColor = this.selectColor()

    // 履歴に追加
    this.addToHistory(mainColor)
    this.addToHistory(subColor)

    return createPuyoPair(mainColor, subColor, spawnPosition.x, spawnPosition.y)
  }

  /**
   * 指定された色パターンでぷよペアを生成（テスト用）
   * @param mainColor メインぷよの色
   * @param subColor サブぷよの色
   * @param spawnPosition 生成位置
   * @returns 生成されたぷよペア
   */
  generateSpecificPuyoPair(
    mainColor: PuyoColor,
    subColor: PuyoColor,
    spawnPosition: { x: number; y: number },
  ): PuyoPair {
    return createPuyoPair(mainColor, subColor, spawnPosition.x, spawnPosition.y)
  }

  /**
   * 複数のぷよペアを事前生成（ネクストキューのため）
   * @param count 生成する個数
   * @param spawnPosition 生成位置
   * @returns 生成されたぷよペアの配列
   */
  generateMultiplePuyoPairs(
    count: number,
    spawnPosition: { x: number; y: number },
  ): PuyoPair[] {
    const puyoPairs: PuyoPair[] = []

    for (let i = 0; i < count; i++) {
      puyoPairs.push(this.generatePuyoPair(spawnPosition))
    }

    return puyoPairs
  }

  /**
   * バランス調整された色選択
   * @returns 選択された色
   */
  private selectColor(): PuyoColor {
    let selectedColor: PuyoColor

    if (
      this.gameBalanceConfig.avoidRecentColors &&
      this.colorHistory.length > 0
    ) {
      // 直近に出現した色を避ける確率的選択
      selectedColor = this.selectColorWithHistory()
    } else {
      // 完全ランダム選択
      selectedColor = this.selectRandomColor()
    }

    return selectedColor
  }

  /**
   * 履歴を考慮した色選択
   * @returns 選択された色
   */
  private selectColorWithHistory(): PuyoColor {
    const recentColors = this.colorHistory.slice(
      -this.gameBalanceConfig.historyConsideration,
    )
    const colorFrequency = this.calculateColorFrequency(recentColors)

    // 出現頻度の低い色を優先的に選択
    const weightedColors = this.availableColors.map((color) => ({
      color,
      weight: this.calculateColorWeight(color, colorFrequency),
    }))

    return this.selectWeightedRandomColor(weightedColors)
  }

  /**
   * 完全ランダム色選択
   * @returns ランダムに選択された色
   */
  private selectRandomColor(): PuyoColor {
    const randomIndex = Math.floor(Math.random() * this.availableColors.length)
    return this.availableColors[randomIndex]
  }

  /**
   * 色の出現頻度を計算
   * @param colors 色の配列
   * @returns 色ごとの出現頻度
   */
  private calculateColorFrequency(colors: PuyoColor[]): Map<PuyoColor, number> {
    const initialFrequency = new Map<PuyoColor, number>()
    for (const color of this.availableColors) {
      initialFrequency.set(color, 0)
    }

    return reduce(
      (freq: Map<PuyoColor, number>, color: PuyoColor) => {
        freq.set(color, (freq.get(color) || 0) + 1)
        return freq
      },
      initialFrequency,
      colors,
    )
  }

  /**
   * 色の重み（選択されやすさ）を計算
   * @param color 対象色
   * @param frequency 出現頻度マップ
   * @returns 色の重み
   */
  private calculateColorWeight(
    color: PuyoColor,
    frequency: Map<PuyoColor, number>,
  ): number {
    const currentFrequency = frequency.get(color) || 0
    const maxFrequency = Math.max(...frequency.values())

    // 出現頻度が高いほど重みを小さくする
    const baseWeight = 1.0
    const frequencyPenalty = currentFrequency / Math.max(maxFrequency, 1)

    return Math.max(
      0.1,
      baseWeight - frequencyPenalty * this.gameBalanceConfig.balanceStrength,
    )
  }

  /**
   * 重み付きランダム選択
   * @param weightedColors 重み付きの色配列
   * @returns 選択された色
   */
  private selectWeightedRandomColor(
    weightedColors: { color: PuyoColor; weight: number }[],
  ): PuyoColor {
    const totalWeight = sumBy((item) => item.weight, weightedColors)
    let randomValue = Math.random() * totalWeight

    for (const item of weightedColors) {
      randomValue -= item.weight
      if (randomValue <= 0) {
        return item.color
      }
    }

    // フォールバック（理論的には到達しない）
    return weightedColors[0].color
  }

  /**
   * 色を履歴に追加
   * @param color 追加する色
   */
  private addToHistory(color: PuyoColor): void {
    this.colorHistory.push(color)

    if (this.colorHistory.length > this.maxHistoryLength) {
      this.colorHistory.shift()
    }
  }

  /**
   * 履歴をクリア
   */
  clearHistory(): void {
    this.colorHistory = []
  }

  /**
   * 現在の履歴を取得
   * @returns 色の履歴
   */
  getHistory(): PuyoColor[] {
    return [...this.colorHistory]
  }

  /**
   * 色の出現統計を取得
   * @returns 統計情報
   */
  getColorStatistics(): ColorStatistics {
    const frequency = this.calculateColorFrequency(this.colorHistory)
    const total = this.colorHistory.length

    const statistics: Record<string, number> = {}
    for (const [color, count] of frequency) {
      statistics[color as string] = total > 0 ? count / total : 0
    }

    return {
      totalGenerated: total,
      colorDistribution: statistics,
      historyLength: this.colorHistory.length,
    }
  }

  /**
   * 生成設定を更新
   * @param config 新しい設定
   */
  updateConfig(config: Partial<SpawningConfig>): void {
    Object.assign(this.gameBalanceConfig, config)
  }
}

/**
 * ぷよ生成の設定
 */
export interface SpawningConfig {
  readonly avoidRecentColors: boolean
  readonly historyConsideration: number
  readonly balanceStrength: number
  readonly sameColorPairProbability: number
}

/**
 * 色出現統計
 */
export interface ColorStatistics {
  readonly totalGenerated: number
  readonly colorDistribution: Record<string, number>
  readonly historyLength: number
}

/**
 * デフォルトの生成設定
 */
export const DEFAULT_SPAWNING_CONFIG: SpawningConfig = {
  avoidRecentColors: true,
  historyConsideration: 3,
  balanceStrength: 0.3,
  sameColorPairProbability: 0.1,
}

/**
 * 関数型アプローチによる色選択ユーティリティ
 */
export const createColorSelector = curry(
  (availableColors: PuyoColor[], config: SpawningConfig) => ({
    selectRandomColor: () => {
      const randomIndex = Math.floor(Math.random() * availableColors.length)
      return availableColors[randomIndex]
    },

    calculateFrequency: (colors: PuyoColor[]) => {
      const initialFreq = new Map<PuyoColor, number>()
      for (const color of availableColors) {
        initialFreq.set(color, 0)
      }
      return reduce(
        (freq: Map<PuyoColor, number>, color: PuyoColor) => {
          freq.set(color, (freq.get(color) || 0) + 1)
          return freq
        },
        initialFreq,
        colors,
      )
    },

    calculateWeights: (frequency: Map<PuyoColor, number>) => {
      const maxFrequency = Math.max(...frequency.values())
      return map((color: PuyoColor) => {
        const currentFreq = frequency.get(color) || 0
        const baseWeight = 1.0
        const frequencyPenalty = currentFreq / Math.max(maxFrequency, 1)
        return {
          color,
          weight: Math.max(
            0.1,
            baseWeight - frequencyPenalty * config.balanceStrength,
          ),
        }
      }, availableColors)
    },
  }),
)

/**
 * 色の統計計算の関数型実装
 */
export const calculateColorStatistics = curry(
  (colors: PuyoColor[], availableColors: PuyoColor[]): ColorStatistics => {
    const frequency = new Map<PuyoColor, number>()
    for (const color of availableColors) {
      frequency.set(color, 0)
    }

    const finalFreq = reduce(
      (freq: Map<PuyoColor, number>, color: PuyoColor) => {
        freq.set(color, (freq.get(color) || 0) + 1)
        return freq
      },
      frequency,
      colors,
    )

    const total = colors.length
    const statistics: Record<string, number> = {}

    for (const [color, count] of finalFreq) {
      statistics[color as string] = total > 0 ? count / total : 0
    }

    return {
      totalGenerated: total,
      colorDistribution: statistics,
      historyLength: colors.length,
    }
  },
)
