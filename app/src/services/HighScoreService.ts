/**
 * ハイスコア管理サービス
 * localStorageを使用してハイスコアを永続化
 */

export interface HighScoreRecord {
  score: number
  date: string
  rank: number
}

class HighScoreService {
  private readonly STORAGE_KEY = 'puyo-puyo-high-scores'
  private readonly MAX_RECORDS = 10

  /**
   * ハイスコアリストを取得
   */
  getHighScores(): HighScoreRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return []
      }

      const scores: HighScoreRecord[] = JSON.parse(stored)
      return this.sortAndRankScores(scores)
    } catch (error) {
      console.warn('ハイスコアの読み込みに失敗しました:', error)
      return []
    }
  }

  /**
   * 新しいスコアを追加
   */
  addScore(score: number): HighScoreRecord[] {
    try {
      const currentScores = this.getHighScores()
      const newRecord: HighScoreRecord = {
        score,
        date: new Date().toISOString(),
        rank: 1,
      }

      const updatedScores = [...currentScores, newRecord]
      const sortedScores = this.sortAndRankScores(updatedScores)
      const trimmedScores = sortedScores.slice(0, this.MAX_RECORDS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedScores))
      return trimmedScores
    } catch (error) {
      console.error('ハイスコアの保存に失敗しました:', error)
      return this.getHighScores()
    }
  }

  /**
   * スコアがハイスコアかどうか判定
   */
  isHighScore(score: number): boolean {
    const highScores = this.getHighScores()

    // 記録数が上限未満なら自動的にハイスコア
    if (highScores.length < this.MAX_RECORDS) {
      return true
    }

    // 最低スコアより高いかチェック
    const lowestScore = highScores[highScores.length - 1]?.score || 0
    return score > lowestScore
  }

  /**
   * 最高スコアを取得
   */
  getTopScore(): number {
    const highScores = this.getHighScores()
    return highScores.length > 0 ? highScores[0].score : 0
  }

  /**
   * ハイスコアをクリア（開発・テスト用）
   */
  clearHighScores(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('ハイスコアのクリアに失敗しました:', error)
    }
  }

  /**
   * スコアをソートしてランク付け
   */
  private sortAndRankScores(scores: HighScoreRecord[]): HighScoreRecord[] {
    const sorted = [...scores].sort((a, b) => b.score - a.score)
    return sorted.map((record, index) => ({
      ...record,
      rank: index + 1,
    }))
  }
}

// シングルトンとして提供
export const highScoreService = new HighScoreService()
