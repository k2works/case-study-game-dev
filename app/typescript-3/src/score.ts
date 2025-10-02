export class Score {
  private score: number = 0
  private scoreElement: HTMLElement

  constructor() {
    // スコア表示要素の取得
    const element = document.getElementById('score')
    if (!element) {
      throw new Error('Score element not found')
    }
    this.scoreElement = element
  }

  addZenkeshiBonus(): void {
    // 全消しボーナス（固定値）
    const zenkeshiBonus = 3600
    this.score += zenkeshiBonus

    // スコア表示の更新
    this.draw()
  }

  getScore(): number {
    return this.score
  }

  reset(): void {
    this.score = 0
    this.draw()
  }

  draw(): void {
    // スコアを表示
    this.scoreElement.textContent = this.score.toString()
  }
}
