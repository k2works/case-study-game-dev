import { GameField } from './GameField'
import { ScoreCalculator } from './ScoreCalculator'

export class GameLogic {
  constructor(
    private gameField: GameField,
    private scoreUpdateCallback?: (score: number) => void,
    private zenkeshiCallback?: () => void
  ) {}

  processChain(): { totalScore: number; chainCount: number } {
    let chainCount = 0
    let totalScore = 0

    // 連鎖処理：消去できるぷよがある限り繰り返す
    while (true) {
      // 消去処理を実行
      const erasedCount = this.gameField.erasePuyos()

      // 消去されるぷよがない場合は連鎖終了
      if (erasedCount === 0) {
        break
      }

      // 連鎖数をカウント
      chainCount++

      // スコアを加算
      const erasureScore = ScoreCalculator.calculateErasureScore(erasedCount, chainCount)
      totalScore += erasureScore

      // 重力処理を実行
      this.gameField.applyGravity()
    }

    // 連鎖処理終了後、全消しボーナスをチェック
    const zenkeshiScore = this.checkZenkeshiBonus()
    totalScore += zenkeshiScore

    // スコア更新コールバックを呼び出し
    if (this.scoreUpdateCallback) {
      this.scoreUpdateCallback(totalScore)
    }

    return { totalScore, chainCount }
  }

  private checkZenkeshiBonus(): number {
    // 全消し状態の場合はボーナスを加算
    if (this.gameField.isAllClear()) {
      const zenkeshiScore = ScoreCalculator.getZenkeshiBonus()
      // 全消し演出をトリガー
      if (this.zenkeshiCallback) {
        this.zenkeshiCallback()
      }
      return zenkeshiScore
    }
    return 0
  }

  setScoreUpdateCallback(callback: (score: number) => void): void {
    this.scoreUpdateCallback = callback
  }

  setZenkeshiCallback(callback: () => void): void {
    this.zenkeshiCallback = callback
  }
}
