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
}
