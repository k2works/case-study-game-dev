/**
 * mayah AI操作評価ドメインサービス
 * Phase 4b: 高度な操作評価ロジック
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIGameState, PossibleMove } from '../../models/ai'

/**
 * 操作評価結果
 */
export interface OperationEvaluation {
  /** 基本スコア */
  baseScore: number
  /** 位置評価スコア */
  positionScore: number
  /** 色配置評価スコア */
  colorScore: number
  /** 連鎖可能性スコア */
  chainPotentialScore: number
  /** 総合スコア */
  totalScore: number
  /** 評価理由 */
  reason: string
}

/**
 * Phase 4c最適化済み操作評価サービス
 * mayah AIの高度な操作評価ロジック（パフォーマンス最適化版）
 */
export class OperationEvaluationService {
  // Phase 4c: キャッシュ機能追加
  private fieldCache: Map<string, number[]> = new Map()
  private centerX: number = 0

  /**
   * 指定された手を評価（Phase 4c最適化版）
   */
  evaluateMove(
    move: PossibleMove,
    gameState: AIGameState,
  ): OperationEvaluation {
    // Phase 4c: フィールド状態のキャッシュキー生成
    const fieldKey = this.generateFieldCacheKey(gameState)

    // Phase 4c: 中央位置計算をキャッシュ
    this.centerX = Math.floor(gameState.field.width / 2)

    const baseScore = this.calculateBaseScore(move)
    const positionScore = this.calculatePositionScore(move, gameState, fieldKey)
    const colorScore = this.calculateColorScore(move, gameState)
    const chainPotentialScore = this.calculateChainPotential(move, gameState)

    const totalScore =
      baseScore + positionScore + colorScore + chainPotentialScore

    const reason = this.generateReason({
      baseScore,
      positionScore,
      colorScore,
      chainPotentialScore,
      totalScore,
    })

    return {
      baseScore,
      positionScore,
      colorScore,
      chainPotentialScore,
      totalScore,
      reason,
    }
  }

  /**
   * Phase 4c: フィールドキャッシュキー生成
   */
  private generateFieldCacheKey(gameState: AIGameState): string {
    // 簡単なフィールド状態ハッシュ
    return gameState.field.cells
      .map((row) => row.map((cell) => (cell ? cell[0] : 'n')).join(''))
      .join('|')
  }

  /**
   * 基本スコア計算（Phase 4c最適化版）
   * フィールド中央への配置を重視
   */
  private calculateBaseScore(move: PossibleMove): number {
    // Phase 4c: キャッシュ済みの中央位置を使用
    const distanceFromCenter = Math.abs(move.x - this.centerX)

    // 中央に近いほど高スコア（最大50点）
    return Math.max(0, 50 - distanceFromCenter * 8)
  }

  /**
   * 位置評価スコア計算（Phase 4c最適化版）
   * 高さと安定性を評価
   */
  private calculatePositionScore(
    move: PossibleMove,
    gameState: AIGameState,
    fieldKey: string,
  ): number {
    // Phase 4c: 列高さ情報をキャッシュから取得
    const heightInfo = this.getColumnHeightInfo(gameState, fieldKey)
    const height = heightInfo[move.x]

    // 低い位置ほど高スコア（最大30点）
    const heightScore = Math.max(0, 30 - height * 3)

    // 隣接列との高さバランス評価（最大20点）
    const balanceScore = this.calculateBalanceScore(move.x, heightInfo)

    return heightScore + balanceScore
  }

  /**
   * 色配置評価スコア計算（Phase 4c最適化版）
   * 同色の隣接配置を評価
   */
  private calculateColorScore(
    move: PossibleMove,
    gameState: AIGameState,
  ): number {
    if (!gameState.currentPuyoPair) return 0

    const primaryColor = gameState.currentPuyoPair.primaryColor
    const secondaryColor = gameState.currentPuyoPair.secondaryColor

    // 主ぷよの配置位置（フィールドの底から配置）
    const primaryY = this.calculateDropPosition(move.x, gameState)
    const primaryAdjacent = this.countAdjacentSameColor(
      move.x,
      primaryY,
      primaryColor,
      gameState,
    )

    // 副ぷよの配置位置を計算して評価
    const { subX, subY } = this.calculateSubPuyoPosition(move, gameState)
    let secondaryAdjacent = 0

    // 副ぷよが有効な位置にある場合のみカウント
    if (
      subX >= 0 &&
      subX < gameState.field.width &&
      subY >= 0 &&
      subY < gameState.field.height
    ) {
      secondaryAdjacent = this.countAdjacentSameColor(
        subX,
        subY,
        secondaryColor,
        gameState,
      )
    }

    // 隣接同色1つにつき15点
    return (primaryAdjacent + secondaryAdjacent) * 15
  }

  /**
   * 連鎖可能性スコア計算（Phase 4c最適化版）
   * 将来の連鎖につながる配置を評価
   */
  private calculateChainPotential(
    move: PossibleMove,
    gameState: AIGameState,
  ): number {
    // Phase 4b基本実装: 簡単な連鎖判定
    // 4個以上の同色グループが作れそうな場合にボーナス

    if (!gameState.currentPuyoPair) return 0

    const primaryColor = gameState.currentPuyoPair.primaryColor
    const secondaryColor = gameState.currentPuyoPair.secondaryColor

    let chainScore = 0

    // 主ぷよが4個グループを作る可能性
    if (this.canForm4Group(move.x, primaryColor, gameState)) {
      chainScore += 40
    }

    // 副ぷよが4個グループを作る可能性
    const { subX } = this.calculateSubPuyoPosition(move, gameState)
    if (this.canForm4Group(subX, secondaryColor, gameState)) {
      chainScore += 40
    }

    return chainScore
  }

  /**
   * Phase 4c: 列高さ情報をキャッシュ付きで取得
   */
  private getColumnHeightInfo(
    gameState: AIGameState,
    fieldKey: string,
  ): number[] {
    const cacheKey = `heights_${fieldKey}`

    if (this.fieldCache.has(cacheKey)) {
      return this.fieldCache.get(cacheKey)!
    }

    const heights = new Array(gameState.field.width)
    for (let x = 0; x < gameState.field.width; x++) {
      heights[x] = this.calculateColumnHeight(gameState.field.cells, x)
    }

    this.fieldCache.set(cacheKey, heights)
    return heights
  }

  /**
   * 列の高さを計算（Phase 4c最適化版）
   */
  private calculateColumnHeight(
    cells: (PuyoColor | null)[][],
    x: number,
  ): number {
    for (let y = 0; y < cells.length; y++) {
      if (cells[y][x] !== null) {
        return y
      }
    }
    return cells.length
  }

  /**
   * ぷよが落ちる位置を計算
   */
  private calculateDropPosition(x: number, gameState: AIGameState): number {
    const column = gameState.field.cells.map((row) => row[x])
    for (let y = column.length - 1; y >= 0; y--) {
      if (column[y] === null) {
        return y
      }
    }
    return 0 // フィールドが満杯の場合
  }

  /**
   * バランススコア計算（Phase 4c最適化版）
   */
  private calculateBalanceScore(x: number, heightInfo: number[]): number {
    const currentHeight = heightInfo[x]
    let balanceScore = 0

    // 左隣との比較
    if (x > 0) {
      const leftHeight = heightInfo[x - 1]
      const heightDiff = Math.abs(currentHeight - leftHeight)
      balanceScore += Math.max(0, 10 - heightDiff * 2)
    }

    // 右隣との比較
    if (x < heightInfo.length - 1) {
      const rightHeight = heightInfo[x + 1]
      const heightDiff = Math.abs(currentHeight - rightHeight)
      balanceScore += Math.max(0, 10 - heightDiff * 2)
    }

    return balanceScore
  }

  /**
   * 隣接同色ぷよをカウント
   */
  private countAdjacentSameColor(
    x: number,
    y: number,
    color: PuyoColor,
    gameState: AIGameState,
  ): number {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1], // 上下左右
    ]

    return directions.filter(([dx, dy]) => {
      const newX = x + dx
      const newY = y + dy
      return this.isSameColorAt(newX, newY, color, gameState)
    }).length
  }

  /**
   * 指定位置が同色かチェック
   */
  private isSameColorAt(
    x: number,
    y: number,
    color: PuyoColor,
    gameState: AIGameState,
  ): boolean {
    return (
      this.isValidPosition(x, y, gameState) &&
      gameState.field.cells[y][x] === color
    )
  }

  /**
   * 副ぷよの配置位置を計算
   */
  private calculateSubPuyoPosition(
    move: PossibleMove,
    gameState: AIGameState,
  ): { subX: number; subY: number } {
    const primaryY = this.calculateDropPosition(move.x, gameState)

    // 回転角度に応じて副ぷよの位置を計算
    switch (move.rotation) {
      case 0: // 上
        return { subX: move.x, subY: primaryY - 1 }
      case 90: // 右
        return {
          subX: move.x + 1,
          subY: this.calculateDropPosition(move.x + 1, gameState),
        }
      case 180: // 下
        return { subX: move.x, subY: primaryY + 1 }
      case 270: // 左
        return {
          subX: move.x - 1,
          subY: this.calculateDropPosition(move.x - 1, gameState),
        }
      default:
        return { subX: move.x, subY: primaryY - 1 }
    }
  }

  /**
   * 4個グループ形成可能性判定（Phase 4c最適化版）
   */
  private canForm4Group(
    x: number,
    color: PuyoColor,
    gameState: AIGameState,
  ): boolean {
    // Phase 4c: 最適化版の列高さ計算を使用
    const baseHeight = this.calculateColumnHeight(gameState.field.cells, x)

    const adjacentPositions = [
      { x: x - 1, y: baseHeight }, // 左
      { x: x + 1, y: baseHeight }, // 右
      { x: x, y: baseHeight - 1 }, // 上
      { x: x, y: baseHeight + 1 }, // 下
    ]

    return adjacentPositions.some(
      (pos) =>
        this.isValidPosition(pos.x, pos.y, gameState) &&
        gameState.field.cells[pos.y][pos.x] === color,
    )
  }

  /**
   * 位置が有効かどうかチェック
   */
  private isValidPosition(
    x: number,
    y: number,
    gameState: AIGameState,
  ): boolean {
    return (
      x >= 0 &&
      x < gameState.field.width &&
      y >= 0 &&
      y < gameState.field.height &&
      gameState.field.cells[y] &&
      gameState.field.cells[y][x] !== undefined
    )
  }

  /**
   * 評価理由を生成
   */
  private generateReason(scores: {
    baseScore: number
    positionScore: number
    colorScore: number
    chainPotentialScore: number
    totalScore: number
  }): string {
    const parts: string[] = []

    if (scores.baseScore > 30) {
      parts.push('中央配置')
    }
    if (scores.positionScore > 25) {
      parts.push('安定位置')
    }
    if (scores.colorScore > 20) {
      parts.push('色隣接')
    }
    if (scores.chainPotentialScore > 30) {
      parts.push('連鎖可能')
    }

    if (parts.length === 0) {
      parts.push('基本配置')
    }

    return `Phase 4c最適化評価: ${parts.join('・')}`
  }
}
