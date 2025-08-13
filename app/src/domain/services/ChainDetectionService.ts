import type { FieldAdapter } from '../models/FieldAdapter'
import type { Position } from '../models/Position'
import type { Puyo, PuyoColor } from '../models/Puyo'

/**
 * 連鎖検出ドメインサービス
 * ぷよの連鎖判定とスコア計算を担当
 */
export class ChainDetectionService {
  /**
   * フィールド内の消去可能なぷよグループを検索
   * @param field 対象のフィールド
   * @returns 消去可能なぷよグループの配列
   */
  findErasableGroups(field: FieldAdapter): PuyoGroup[] {
    const visited = this.createVisitedMatrix(field)
    const erasableGroups: PuyoGroup[] = []

    for (let x = 0; x < field.getWidth(); x++) {
      for (let y = 0; y < field.getHeight(); y++) {
        this.checkPositionForErasableGroup(field, x, y, visited, erasableGroups)
      }
    }

    return erasableGroups
  }

  /**
   * 位置をチェックして消去可能グループを見つける
   */
  private checkPositionForErasableGroup(
    field: FieldAdapter,
    x: number,
    y: number,
    visited: boolean[][],
    erasableGroups: PuyoGroup[],
  ): void {
    if (visited[x][y] || field.isEmpty(x, y)) {
      return
    }

    const puyo = field.getPuyo(x, y)
    if (!puyo || puyo.color === null) {
      return
    }

    const connectedGroup = this.findConnectedPuyos(
      field,
      x,
      y,
      puyo.color,
      visited,
    )

    // 4つ以上つながっている場合は消去対象
    if (connectedGroup.length >= 4) {
      erasableGroups.push({
        puyos: connectedGroup,
        color: puyo.color,
        size: connectedGroup.length,
        baseScore: this.calculateGroupBaseScore(connectedGroup.length),
      })
    }
  }

  /**
   * 指定位置から同色で連結されたぷよを探索
   * @param field フィールド
   * @param startX 開始X座標
   * @param startY 開始Y座標
   * @param targetColor 対象色
   * @param visited 訪問済み行列
   * @returns 連結されたぷよの配列
   */
  findConnectedPuyos(
    field: FieldAdapter,
    startX: number,
    startY: number,
    targetColor: PuyoColor,
    visited: boolean[][],
  ): Puyo[] {
    if (targetColor === null) {
      return []
    }

    const connected: Puyo[] = []
    const stack: Position[] = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const current = stack.pop()!

      if (visited[current.x][current.y]) {
        continue
      }

      const puyo = field.getPuyo(current.x, current.y)
      if (!puyo || puyo.color !== targetColor) {
        continue
      }

      visited[current.x][current.y] = true
      connected.push(puyo)

      // 隣接する4方向をチェック
      const neighbors = this.getNeighborPositions(current, field)
      for (const neighbor of neighbors) {
        if (!visited[neighbor.x][neighbor.y]) {
          stack.push(neighbor)
        }
      }
    }

    return connected
  }

  /**
   * 連鎖数に基づくボーナススコアを計算
   * @param chainCount 連鎖数
   * @returns チェインボーナス
   */
  calculateChainBonus(chainCount: number): number {
    const chainBonusTable = [
      0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416,
      448, 480, 512,
    ]

    if (chainCount <= 0) {
      return 0
    }

    return chainCount < chainBonusTable.length
      ? chainBonusTable[chainCount]
      : chainBonusTable[chainBonusTable.length - 1]
  }

  /**
   * 同時消しボーナスを計算
   * @param groupCount 同時に消去されたグループ数
   * @returns 同時消しボーナス
   */
  calculateGroupBonus(groupCount: number): number {
    const groupBonusTable = [0, 2, 3, 4, 5, 6, 7, 10]

    if (groupCount <= 1) {
      return 0
    }

    return groupCount < groupBonusTable.length
      ? groupBonusTable[groupCount]
      : groupBonusTable[groupBonusTable.length - 1]
  }

  /**
   * 全消しボーナスを計算
   * @returns 全消しボーナススコア
   */
  calculateAllClearBonus(): number {
    return 2100
  }

  /**
   * 連鎖全体のスコアを計算
   * @param erasedGroups 消去されたグループ
   * @param chainCount 連鎖数
   * @param isAllClear 全消しかどうか
   * @returns 計算されたスコア
   */
  calculateChainScore(
    erasedGroups: PuyoGroup[],
    chainCount: number,
    isAllClear: boolean = false,
  ): number {
    let totalScore = 0

    // 各グループのベーススコア
    for (const group of erasedGroups) {
      totalScore += group.baseScore
    }

    // チェインボーナス
    const chainBonus = this.calculateChainBonus(chainCount)

    // 同時消しボーナス
    const groupBonus = this.calculateGroupBonus(erasedGroups.length)

    // ボーナス計算（ベーススコア × ボーナス倍率）
    const bonusMultiplier = Math.max(1, chainBonus + groupBonus)
    totalScore *= bonusMultiplier

    // 全消しボーナス
    if (isAllClear) {
      totalScore += this.calculateAllClearBonus()
    }

    return totalScore
  }

  /**
   * 次の連鎖が発生するかチェック
   * @param field 重力適用後のフィールド
   * @returns 連鎖が継続する場合true
   */
  hasNextChain(field: FieldAdapter): boolean {
    const erasableGroups = this.findErasableGroups(field)
    return erasableGroups.length > 0
  }

  /**
   * グループサイズに基づくベーススコアを計算
   * @param groupSize グループサイズ
   * @returns ベーススコア
   */
  private calculateGroupBaseScore(groupSize: number): number {
    // ぷよぷよのスコア計算式: ぷよ数 × 10
    return groupSize * 10
  }

  /**
   * 隣接する位置を取得（4方向）
   * @param position 基準位置
   * @param field フィールド
   * @returns 有効な隣接位置の配列
   */
  private getNeighborPositions(
    position: Position,
    field: FieldAdapter,
  ): Position[] {
    const neighbors: Position[] = []
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 }, // 右
    ]

    for (const dir of directions) {
      const newX = position.x + dir.dx
      const newY = position.y + dir.dy

      if (
        newX >= 0 &&
        newX < field.getWidth() &&
        newY >= 0 &&
        newY < field.getHeight()
      ) {
        neighbors.push({ x: newX, y: newY })
      }
    }

    return neighbors
  }

  /**
   * 訪問済み行列を作成
   * @param field フィールド
   * @returns 初期化された訪問済み行列
   */
  private createVisitedMatrix(field: FieldAdapter): boolean[][] {
    const visited: boolean[][] = []
    for (let x = 0; x < field.getWidth(); x++) {
      visited[x] = new Array(field.getHeight()).fill(false)
    }
    return visited
  }
}

/**
 * ぷよグループの情報
 */
export interface PuyoGroup {
  readonly puyos: Puyo[]
  readonly color: PuyoColor
  readonly size: number
  readonly baseScore: number
}
