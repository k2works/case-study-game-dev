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

    // 初期表示
    this.draw()
  }

  addScore(
    erasePuyoCount: number,
    combinationCount: number,
    erasedColors: number
  ): void {
    // スコア計算式
    const baseScore = erasePuyoCount * 10
    const combinationBonus = this.getCombinationBonus(combinationCount)
    const colorBonus = this.getColorBonus(erasedColors)
    const calculatedScore =
      baseScore *
      (combinationBonus + colorBonus > 0 ? combinationBonus + colorBonus : 1)

    this.score += calculatedScore

    // スコア表示の更新
    this.draw()
  }

  private getCombinationBonus(combinationCount: number): number {
    // 連鎖ボーナステーブル
    const bonusTable = [
      0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416,
      448, 480, 512,
    ]
    return bonusTable[Math.min(combinationCount, bonusTable.length - 1)]
  }

  private getColorBonus(erasedColors: number): number {
    // 色数ボーナステーブル
    const bonusTable = [0, 0, 3, 6, 12]
    return bonusTable[Math.min(erasedColors, bonusTable.length - 1)]
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
    this.scoreElement.textContent = `スコア: ${this.score}`
  }
}
