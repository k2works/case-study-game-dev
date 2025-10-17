/**
 * Score クラス
 * スコアを管理
 */
export class Score {
  private value: number

  constructor() {
    this.value = 0
  }

  getValue(): number {
    return this.value
  }
}
