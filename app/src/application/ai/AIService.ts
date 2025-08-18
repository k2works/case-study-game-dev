/**
 * AIサービス
 * アプリケーション層のAI制御サービス
 */
import type { AIPort } from '../../domain/ai/ports'
import type { AIGameState, AIMove, AISettings } from '../../domain/ai/types'

/**
 * AIサービス実装
 */
export class AIService implements AIPort {
  private settings: AISettings
  private enabled = false

  constructor() {
    this.settings = {
      enabled: false,
      thinkingSpeed: 1000,
      mode: 'balanced',
    }
  }

  /**
   * 次の手を決定
   */
  async decideMove(gameState: AIGameState): Promise<AIMove> {
    if (!this.enabled || !gameState.currentPuyoPair) {
      throw new Error('AI is not enabled or no current puyo pair')
    }

    // 思考速度の遅延をシミュレート
    await this.delay(this.settings.thinkingSpeed)

    // シンプルな戦略: 一番低い列に配置
    const bestMove = this.findBestMove(gameState)
    return bestMove
  }

  /**
   * AI設定を更新
   */
  updateSettings(settings: AISettings): void {
    this.settings = { ...settings }
    this.enabled = settings.enabled
  }

  /**
   * AIが動作中かどうか
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * AIを有効化/無効化
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.settings.enabled = enabled
  }

  /**
   * 最適な手を見つける（シンプルな実装）
   */
  private findBestMove(gameState: AIGameState): AIMove {
    const field = gameState.field
    const width = field.width

    // 各列の高さを計算
    const columnHeights: number[] = []
    for (let x = 0; x < width; x++) {
      let height = 0
      for (let y = 0; y < field.height; y++) {
        if (field.cells[x] && field.cells[x][y] !== null) {
          height = field.height - y
          break
        }
      }
      columnHeights[x] = height
    }

    // 最も低い列を見つける
    let bestX = 0
    let minHeight = columnHeights[0]
    for (let x = 1; x < width; x++) {
      if (columnHeights[x] < minHeight) {
        minHeight = columnHeights[x]
        bestX = x
      }
    }

    // 評価スコア（高さが低いほど高スコア）
    const score = 100 - minHeight * 10

    return {
      x: bestX,
      rotation: 0, // シンプルに回転なし
      score,
    }
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
