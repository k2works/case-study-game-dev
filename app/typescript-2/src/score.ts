// スコアを管理するクラス
export class Score {
  private score = 0
  private element: HTMLElement | null = null

  constructor() {
    this.element = document.getElementById('score')
    this.updateDisplay()
  }

  // スコアを加算（連鎖ボーナス付き）
  addScore(puyoCount: number, chainCount: number): void {
    // 基本スコア: 消去したぷよの数 × 10
    const baseScore = puyoCount * 10

    // 連鎖ボーナス: 連鎖数に応じて倍率が増加
    // 1連鎖: ×1, 2連鎖: ×8, 3連鎖: ×16, 4連鎖: ×32...
    const chainBonus = chainCount === 1 ? 0 : Math.pow(2, chainCount + 1)

    // 合計スコア
    const totalScore = baseScore * (1 + chainBonus)

    this.score += totalScore
    this.updateDisplay()
  }

  // スコアを加算（旧メソッド - 互換性のため残す）
  add(points: number): void {
    this.score += points
    this.updateDisplay()
  }

  // スコアを取得
  getScore(): number {
    return this.score
  }

  // スコアを取得（旧メソッド - 互換性のため残す）
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
