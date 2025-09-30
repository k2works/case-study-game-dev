// スコアの計算と表示を管理するクラス
export class Score {
  private currentScore: number = 0

  constructor() {
    // スコアを初期化
  }

  // 現在のスコアを取得
  getScore(): number {
    return this.currentScore
  }

  // スコアを追加
  addScore(points: number): void {
    this.currentScore += points
  }

  // スコアをリセット
  reset(): void {
    this.currentScore = 0
  }
}
