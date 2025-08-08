import { Field } from './Field'
import { Puyo } from './Puyo'

/**
 * 連鎖処理の結果
 */
export interface ChainResult {
  /** 連鎖数 */
  chainCount: number
  /** 総消去個数 */
  totalErasedCount: number
  /** 獲得スコア */
  score: number
  /** 各連鎖の詳細情報 */
  chainDetails: ChainStep[]
}

/**
 * 各連鎖ステップの詳細情報
 */
export interface ChainStep {
  /** 連鎖番号（1から開始） */
  stepNumber: number
  /** 消去されたぷよの座標と色 */
  erasedPuyos: { x: number; y: number; color: string }[]
  /** このステップで獲得したスコア */
  stepScore: number
  /** 消去されたぷよのグループ数 */
  groupCount: number
  /** 消去されたぷよの色の種類数 */
  colorCount: number
}

/**
 * 連鎖処理を担当するドメインクラス
 */
export class Chain {
  constructor(private field: Field) {}

  /**
   * 連鎖処理を実行する
   * 一度の呼び出しで、連鎖が終了するまですべての処理を行う
   */
  processChain(): ChainResult {
    const chainDetails: ChainStep[] = []
    let totalErasedCount = 0
    let totalScore = 0
    let chainCount = 0

    // 連鎖が続く限りループ
    while (true) {
      // 消去可能なぷよグループを検出
      const erasableGroups = this.findErasableGroups()

      if (erasableGroups.length === 0) {
        // 消去できるグループがない場合は連鎖終了
        break
      }

      // 連鎖数を増加
      chainCount++

      // グループを消去し、スコアを計算
      const stepResult = this.eraseGroupsAndCalculateScore(
        erasableGroups,
        chainCount
      )

      chainDetails.push({
        stepNumber: chainCount,
        erasedPuyos: stepResult.erasedPuyos,
        stepScore: stepResult.stepScore,
        groupCount: erasableGroups.length,
        colorCount: stepResult.colorCount,
      })

      totalErasedCount += stepResult.erasedPuyos.length
      totalScore += stepResult.stepScore

      // 重力を適用（ぷよを下に落とす）
      this.applyGravity()
    }

    return {
      chainCount,
      totalErasedCount,
      score: totalScore,
      chainDetails,
    }
  }

  /**
   * 消去可能なぷよグループを検出する
   * 4個以上連結している同色グループを見つける
   */
  private findErasableGroups(): Puyo[][] {
    const visited: boolean[][] = Array(this.field.width)
      .fill(null)
      .map(() => Array(this.field.height).fill(false))

    const erasableGroups: Puyo[][] = []

    for (let x = 0; x < this.field.width; x++) {
      for (let y = 0; y < this.field.height; y++) {
        if (visited[x][y]) continue

        const puyo = this.field.getPuyo(x, y)
        if (!puyo) continue

        // 連結グループを探索
        const group = this.findConnectedGroup(x, y, puyo.color, visited)

        // 4個以上の場合は消去対象
        if (group.length >= 4) {
          erasableGroups.push(group)
        }
      }
    }

    return erasableGroups
  }

  /**
   * 指定座標から連結している同色ぷよグループを探索する（深度優先探索）
   */
  private findConnectedGroup(
    startX: number,
    startY: number,
    color: string,
    visited: boolean[][]
  ): Puyo[] {
    const group: Puyo[] = []
    const stack: { x: number; y: number }[] = [{ x: startX, y: startY }]

    while (stack.length > 0) {
      const { x, y } = stack.pop()!

      if (!this.shouldProcessCell(x, y, color, visited)) continue

      const puyo = this.field.getPuyo(x, y)!
      visited[x][y] = true
      group.push(puyo)

      this.addAdjacentCells(x, y, visited, stack)
    }

    return group
  }

  /**
   * セルが処理対象かどうかを判定
   */
  private shouldProcessCell(
    x: number,
    y: number,
    color: string,
    visited: boolean[][]
  ): boolean {
    if (visited[x][y]) return false
    if (!this.isValidPosition(x, y)) return false

    const puyo = this.field.getPuyo(x, y)
    return puyo !== null && puyo.color === color
  }

  /**
   * 隣接する4方向のセルをスタックに追加
   */
  private addAdjacentCells(
    x: number,
    y: number,
    visited: boolean[][],
    stack: { x: number; y: number }[]
  ): void {
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 }, // 右
    ]

    for (const { dx, dy } of directions) {
      const nx = x + dx
      const ny = y + dy
      if (this.isValidPosition(nx, ny) && !visited[nx][ny]) {
        stack.push({ x: nx, y: ny })
      }
    }
  }

  /**
   * 座標が有効範囲内かチェック
   */
  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.field.width && y >= 0 && y < this.field.height
  }

  /**
   * グループを消去してスコアを計算する
   */
  private eraseGroupsAndCalculateScore(
    groups: Puyo[][],
    chainNumber: number
  ): {
    erasedPuyos: { x: number; y: number; color: string }[]
    stepScore: number
    colorCount: number
  } {
    const { erasedPuyos, colors } = this.eraseGroups(groups)
    const stepScore = this.calculateStepScore(
      erasedPuyos,
      colors,
      chainNumber,
      groups.length
    )

    return {
      erasedPuyos,
      stepScore,
      colorCount: colors.size,
    }
  }

  /**
   * ぷよグループを消去する
   */
  private eraseGroups(groups: Puyo[][]): {
    erasedPuyos: { x: number; y: number; color: string }[]
    colors: Set<string>
  } {
    const erasedPuyos: { x: number; y: number; color: string }[] = []
    const colors = new Set<string>()

    for (const group of groups) {
      for (const puyo of group) {
        const position = this.findPuyoPosition(puyo)
        if (position) {
          erasedPuyos.push({ ...position, color: puyo.color })
          colors.add(puyo.color)
          this.field.clearPuyo(position.x, position.y)
        }
      }
    }

    return { erasedPuyos, colors }
  }

  /**
   * フィールド内でぷよの座標を探す
   */
  private findPuyoPosition(targetPuyo: Puyo): { x: number; y: number } | null {
    for (let x = 0; x < this.field.width; x++) {
      for (let y = 0; y < this.field.height; y++) {
        if (this.field.getPuyo(x, y) === targetPuyo) {
          return { x, y }
        }
      }
    }
    return null
  }

  /**
   * ステップスコアを計算する
   */
  private calculateStepScore(
    erasedPuyos: { x: number; y: number; color: string }[],
    colors: Set<string>,
    chainNumber: number,
    groupCount: number
  ): number {
    const baseScore = erasedPuyos.length * 10

    if (chainNumber === 1) {
      return baseScore
    }

    const chainBonus = this.getChainBonus(chainNumber)
    const colorBonus = this.getColorBonus(colors.size)
    const countBonus = this.getCountBonus(erasedPuyos.length)
    const groupBonus = groupCount > 1 ? groupCount - 1 : 0

    const totalBonus = chainBonus + colorBonus + countBonus + groupBonus
    return baseScore * Math.max(1, totalBonus)
  }

  /**
   * 連鎖ボーナスを取得
   */
  getChainBonus(chainNumber: number): number {
    const bonuses = [
      0, 1, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416,
      448, 480, 512,
    ]
    return bonuses[chainNumber] || 512
  }

  /**
   * 色ボーナスを取得
   */
  getColorBonus(colorCount: number): number {
    const bonuses = [0, 0, 3, 6, 12]
    return bonuses[colorCount] !== undefined ? bonuses[colorCount] : 12
  }

  /**
   * 個数ボーナスを取得
   */
  getCountBonus(count: number): number {
    const bonuses = [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10]
    return count >= bonuses.length ? 10 : bonuses[count]
  }

  /**
   * 重力を適用してぷよを下に落とす
   */
  private applyGravity(): void {
    for (let x = 0; x < this.field.width; x++) {
      // 下から上へスキャンして、空きスペースを埋める
      let writeIndex = this.field.height - 1

      for (let readIndex = this.field.height - 1; readIndex >= 0; readIndex--) {
        const puyo = this.field.getPuyo(x, readIndex)
        if (puyo) {
          if (writeIndex !== readIndex) {
            this.field.setPuyo(x, writeIndex, puyo)
            this.field.clearPuyo(x, readIndex)
          }
          writeIndex--
        }
      }
    }
  }
}
