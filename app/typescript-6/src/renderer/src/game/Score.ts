import { ScoreValueSchema } from '../schemas/score.schema'

/**
 * Score クラス
 * スコアを管理
 */
export class Score {
  private value: number

  // 連鎖ボーナステーブル
  private readonly chainBonusTable = [0, 1, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256]

  // 色ボーナステーブル
  private readonly colorBonusTable = [0, 0, 3, 6, 12]

  constructor() {
    this.value = ScoreValueSchema.parse(0)
  }

  getValue(): number {
    return this.value
  }

  /**
   * ぷよ消去時のスコアを加算
   * @param erasePuyoCount 消去したぷよの数
   * @param chainCount 連鎖数
   * @param colorCount 消去した色の数
   */
  addEraseScore(erasePuyoCount: number, chainCount: number, colorCount: number): void {
    // 基本スコア = 消去数 × 10
    const baseScore = erasePuyoCount * 10

    // 連鎖ボーナス係数を取得
    const chainBonus = this.getChainBonus(chainCount)

    // 色ボーナス係数を取得
    const colorBonus = this.getColorBonus(colorCount)

    // 最終スコア = 基本スコア × 連鎖ボーナス × 色ボーナス
    const score = baseScore * chainBonus * colorBonus

    this.value = ScoreValueSchema.parse(this.value + score)
  }

  /**
   * 連鎖ボーナス係数を取得
   */
  private getChainBonus(chainCount: number): number {
    if (chainCount < this.chainBonusTable.length) {
      return this.chainBonusTable[chainCount]
    }
    // テーブルの範囲外の場合は最大値を返す
    return this.chainBonusTable[this.chainBonusTable.length - 1]
  }

  /**
   * 色ボーナス係数を取得
   */
  private getColorBonus(colorCount: number): number {
    if (colorCount < this.colorBonusTable.length) {
      const bonus = this.colorBonusTable[colorCount]
      // 1色の場合は0だが、最低1として扱う
      return bonus === 0 ? 1 : bonus
    }
    // テーブルの範囲外の場合は最大値を返す
    return this.colorBonusTable[this.colorBonusTable.length - 1]
  }

  /**
   * 全消しボーナスを加算
   */
  addZenkeshiBonus(): void {
    // 全消しボーナス（固定値3600点）
    const zenkeshiBonus = 3600
    this.value = ScoreValueSchema.parse(this.value + zenkeshiBonus)
  }

  /**
   * スコアをリセットする
   */
  reset(): void {
    this.value = ScoreValueSchema.parse(0)
  }
}
