export class Score {
  private currentScore = 0

  calculateScore(removedPuyosCount: number): number {
    // 4つ以上でないとスコアにならない（ぷよぷよの基本ルール）
    if (removedPuyosCount < 4) return 0

    const baseScore = removedPuyosCount * 10
    return baseScore
  }

  getCurrentScore(): number {
    return this.currentScore
  }

  addScore(score: number): void {
    this.currentScore += score
  }

  reset(): void {
    this.currentScore = 0
  }

  calculateScoreWithChain(
    removedPuyosCount: number,
    chainCount: number
  ): number {
    // 4つ以上でないとスコアにならない（ぷよぷよの基本ルール）
    if (removedPuyosCount < 4) return 0

    const baseScore = removedPuyosCount * 10
    const chainMultiplier = this.getChainMultiplier(chainCount)

    return baseScore * chainMultiplier
  }

  private getChainMultiplier(chainCount: number): number {
    // ぷよぷよの連鎖倍率テーブル
    const multipliers = [
      1, // 1連鎖
      8, // 2連鎖
      16, // 3連鎖
      32, // 4連鎖
      64, // 5連鎖
      96, // 6連鎖
      128, // 7連鎖
      160, // 8連鎖
      192, // 9連鎖
      224, // 10連鎖
      256, // 11連鎖
      288, // 12連鎖
      320, // 13連鎖以降
    ]

    const index = Math.min(chainCount - 1, multipliers.length - 1)
    return multipliers[index]
  }
}
