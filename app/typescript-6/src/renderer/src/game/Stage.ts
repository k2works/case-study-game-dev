import { z } from 'zod'
import type { Config } from './Config'
import { PuyoType } from './Puyo'
import type { PuyoImage } from './PuyoImage'

/**
 * 消去情報を表す型
 */
export interface EraseInfo {
  erasePuyoCount: number
  eraseInfo: {
    x: number
    y: number
    type: PuyoType
  }[]
}

/**
 * Stage クラス
 * ゲームのステージ（フィールド）を管理
 */
export class Stage {
  private config: Config
  private grid: PuyoType[][]

  constructor(config: Config) {
    this.config = config
    this.grid = this.createEmptyGrid()
  }

  /**
   * 座標のバリデーションスキーマを生成
   */
  private getCoordinateSchema() {
    return z.object({
      x: z
        .number()
        .int()
        .min(0)
        .max(this.config.cols - 1),
      y: z
        .number()
        .int()
        .min(0)
        .max(this.config.rows - 1)
    })
  }

  private createEmptyGrid(): PuyoType[][] {
    return Array.from({ length: this.config.rows }, () =>
      Array(this.config.cols).fill(PuyoType.Empty)
    )
  }

  getPuyo(x: number, y: number): PuyoType {
    if (y < 0 || y >= this.config.rows || x < 0 || x >= this.config.cols) {
      return PuyoType.Empty
    }
    return this.grid[y][x]
  }

  setPuyo(x: number, y: number, type: PuyoType): void {
    // Zod バリデーション（範囲外は無視）
    const coordinateSchema = this.getCoordinateSchema()
    const result = coordinateSchema.safeParse({ x, y })

    if (result.success) {
      this.grid[y][x] = type
    }
  }

  isEmpty(x: number, y: number): boolean {
    return this.getPuyo(x, y) === PuyoType.Empty
  }

  /**
   * ステージに配置されたぷよを描画する
   * @param context Canvas の 2D コンテキスト
   * @param puyoImage ぷよ画像
   */
  draw(context: CanvasRenderingContext2D, puyoImage: PuyoImage): void {
    for (let y = 0; y < this.config.rows; y++) {
      this.drawRow(context, puyoImage, y)
    }
  }

  /**
   * 指定行のぷよを描画する
   * @param context Canvas の 2D コンテキスト
   * @param puyoImage ぷよ画像
   * @param y 行番号
   */
  private drawRow(context: CanvasRenderingContext2D, puyoImage: PuyoImage, y: number): void {
    for (let x = 0; x < this.config.cols; x++) {
      const puyoType = this.grid[y][x]
      if (puyoType !== PuyoType.Empty) {
        puyoImage.draw(context, puyoType, x, y)
      }
    }
  }

  /**
   * 消去可能なぷよを検出する
   * @returns 消去情報
   */
  checkErase(): EraseInfo {
    const visited: boolean[][] = this.createVisitedGrid()
    const eraseInfo: { x: number; y: number; type: PuyoType }[] = []

    for (let y = 0; y < this.config.rows; y++) {
      this.checkEraseRow(y, visited, eraseInfo)
    }

    return {
      erasePuyoCount: eraseInfo.length,
      eraseInfo
    }
  }

  /**
   * visited グリッドを作成する
   */
  private createVisitedGrid(): boolean[][] {
    return Array.from({ length: this.config.rows }, () => Array(this.config.cols).fill(false))
  }

  /**
   * 指定行の消去判定を行う
   */
  private checkEraseRow(
    y: number,
    visited: boolean[][],
    eraseInfo: { x: number; y: number; type: PuyoType }[]
  ): void {
    for (let x = 0; x < this.config.cols; x++) {
      this.checkErasePuyo(x, y, visited, eraseInfo)
    }
  }

  /**
   * 指定位置のぷよの消去判定を行う
   */
  private checkErasePuyo(
    x: number,
    y: number,
    visited: boolean[][],
    eraseInfo: { x: number; y: number; type: PuyoType }[]
  ): void {
    const puyoType = this.grid[y][x]
    if (puyoType !== PuyoType.Empty && !visited[y][x]) {
      const connected = this.findConnectedPuyos(x, y, puyoType, visited)
      if (connected.length >= 4) {
        eraseInfo.push(...connected)
      }
    }
  }

  /**
   * BFS で接続されたぷよを検出する
   */
  private findConnectedPuyos(
    startX: number,
    startY: number,
    targetType: PuyoType,
    visited: boolean[][]
  ): { x: number; y: number; type: PuyoType }[] {
    const connected: { x: number; y: number; type: PuyoType }[] = []
    const queue: { x: number; y: number }[] = [{ x: startX, y: startY }]
    visited[startY][startX] = true

    while (queue.length > 0) {
      const current = queue.shift()!
      connected.push({ x: current.x, y: current.y, type: targetType })
      this.exploreNeighbors(current, targetType, visited, queue)
    }

    return connected
  }

  /**
   * 隣接するぷよを探索する
   */
  private exploreNeighbors(
    current: { x: number; y: number },
    targetType: PuyoType,
    visited: boolean[][],
    queue: { x: number; y: number }[]
  ): void {
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 }, // 右
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 } // 左
    ]

    for (const dir of directions) {
      const nx = current.x + dir.dx
      const ny = current.y + dir.dy

      if (this.canVisit(nx, ny, targetType, visited)) {
        visited[ny][nx] = true
        queue.push({ x: nx, y: ny })
      }
    }
  }

  /**
   * 指定座標を訪問できるか判定する
   */
  private canVisit(x: number, y: number, targetType: PuyoType, visited: boolean[][]): boolean {
    return (
      x >= 0 &&
      x < this.config.cols &&
      y >= 0 &&
      y < this.config.rows &&
      !visited[y][x] &&
      this.grid[y][x] === targetType
    )
  }

  /**
   * 指定されたぷよを消去する
   * @param eraseInfo 消去するぷよの情報
   */
  eraseBoards(eraseInfo: { x: number; y: number; type: PuyoType }[]): void {
    for (const puyo of eraseInfo) {
      this.grid[puyo.y][puyo.x] = PuyoType.Empty
    }
  }

  /**
   * ぷよを落下させる
   */
  fall(): void {
    for (let x = 0; x < this.config.cols; x++) {
      this.fallColumn(x)
    }
  }

  /**
   * 指定列のぷよを落下させる
   */
  private fallColumn(x: number): void {
    let writeY = this.config.rows - 1

    for (let readY = this.config.rows - 1; readY >= 0; readY--) {
      if (this.grid[readY][x] !== PuyoType.Empty) {
        writeY = this.movePuyoDown(x, readY, writeY)
      }
    }
  }

  /**
   * ぷよを下に移動する
   */
  private movePuyoDown(x: number, readY: number, writeY: number): number {
    this.grid[writeY][x] = this.grid[readY][x]
    if (writeY !== readY) {
      this.grid[readY][x] = PuyoType.Empty
    }
    return writeY - 1
  }

  /**
   * 重力を適用する
   * @returns ぷよが落下した場合は true、そうでない場合は false
   */
  applyGravity(): boolean {
    // 落下前の状態を記録
    const before = this.copyGrid()

    // 重力を適用
    this.fall()

    // 落下後の状態と比較
    return !this.gridEquals(before, this.grid)
  }

  /**
   * グリッドをコピーする
   */
  private copyGrid(): PuyoType[][] {
    return this.grid.map((row) => [...row])
  }

  /**
   * 2つのグリッドが等しいか判定する
   */
  private gridEquals(grid1: PuyoType[][], grid2: PuyoType[][]): boolean {
    for (let y = 0; y < this.config.rows; y++) {
      if (!this.rowEquals(grid1[y], grid2[y])) {
        return false
      }
    }
    return true
  }

  /**
   * 2つの行が等しいか判定する
   */
  private rowEquals(row1: PuyoType[], row2: PuyoType[]): boolean {
    for (let x = 0; x < this.config.cols; x++) {
      if (row1[x] !== row2[x]) {
        return false
      }
    }
    return true
  }

  /**
   * 全消し判定
   * @returns 盤面上のぷよがすべて消えていれば true
   */
  checkZenkeshi(): boolean {
    // 盤面上にぷよがあるかチェック
    for (let y = 0; y < this.config.rows; y++) {
      for (let x = 0; x < this.config.cols; x++) {
        if (this.grid[y][x] !== PuyoType.Empty) {
          return false
        }
      }
    }
    return true
  }
}
