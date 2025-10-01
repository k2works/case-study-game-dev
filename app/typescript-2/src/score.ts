// スコアを管理するクラス
export class Score {
  private score = 0
  private element: HTMLElement | null = null

  constructor() {
    this.element = document.getElementById('score')
    this.updateDisplay()
  }

  // スコアを加算
  add(points: number): void {
    this.score += points
    this.updateDisplay()
  }

  // スコアを取得
  get(): number {
    return this.score
  }

  // スコアをリセット
  reset(): void {
    this.score = 0
    this.updateDisplay()
  }

  // スコア表示を更新
  private updateDisplay(): void {
    if (this.element) {
      this.element.textContent = `Score: ${this.score}`
    }
  }
}
