export class Score {
  private score: number = 0;

  getScore(): number {
    return this.score;
  }

  addScore(points: number): void {
    this.score += points;
  }

  addZenkeshiBonus(): void {
    // 全消しボーナス（固定値）
    const zenkeshiBonus = 3600;
    this.score += zenkeshiBonus;
  }

  reset(): void {
    this.score = 0;
  }
}
