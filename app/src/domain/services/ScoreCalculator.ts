export class ScoreCalculator {
  private static readonly ZENKESHI_BONUS = 2000

  static getChainBonus(chainCount: number): number {
    // 連鎖ボーナス倍率の計算
    // 1連鎖: 1倍, 2連鎖: 2倍, 3連鎖: 4倍, 4連鎖: 8倍, 5連鎖以上: 16倍
    switch (chainCount) {
      case 0:
        return 1 // 連鎖なしでも1倍
      case 1:
        return 1
      case 2:
        return 2
      case 3:
        return 4
      case 4:
        return 8
      default:
        return 16 // 5連鎖以上は16倍
    }
  }

  static calculateChainScore(baseScore: number, chainCount: number): number {
    // 基本スコアに連鎖ボーナスを適用
    return baseScore * this.getChainBonus(chainCount)
  }

  static calculateErasureScore(erasedCount: number, chainCount: number): number {
    // 基本スコア: 消去したぷよ数 × 10点
    const baseScore = erasedCount * 10
    // 連鎖ボーナスを適用
    return this.calculateChainScore(baseScore, chainCount)
  }

  static getZenkeshiBonus(): number {
    // 全消しボーナスは固定で2000点
    return this.ZENKESHI_BONUS
  }

  static calculateZenkeshiScore(isAllClear: boolean): number {
    // 全消し状態の場合は2000点、そうでなければ0点
    return isAllClear ? this.getZenkeshiBonus() : 0
  }
}
