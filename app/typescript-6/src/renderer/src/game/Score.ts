import { z } from 'zod'

/**
 * スコア値のバリデーションスキーマ
 */
const ScoreValueSchema = z.number().int().nonnegative()

/**
 * Score クラス
 * スコアを管理
 */
export class Score {
  private value: number

  constructor() {
    this.value = ScoreValueSchema.parse(0)
  }

  getValue(): number {
    return this.value
  }

  /**
   * 全消しボーナスを加算
   */
  addZenkeshiBonus(): void {
    // 全消しボーナス（固定値3600点）
    const zenkeshiBonus = 3600
    this.value = ScoreValueSchema.parse(this.value + zenkeshiBonus)
  }
}
