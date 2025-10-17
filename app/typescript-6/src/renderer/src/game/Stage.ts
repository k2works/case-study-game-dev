import type { Config } from './Config'
import { PuyoType } from './Puyo'

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
    if (y >= 0 && y < this.config.rows && x >= 0 && x < this.config.cols) {
      this.grid[y][x] = type
    }
  }

  isEmpty(x: number, y: number): boolean {
    return this.getPuyo(x, y) === PuyoType.Empty
  }
}
