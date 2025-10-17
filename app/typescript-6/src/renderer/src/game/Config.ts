/**
 * Config クラス
 * ゲームの設定を管理
 */
export class Config {
  /** セルのサイズ（ピクセル） */
  cellSize: number

  /** 列数 */
  cols: number

  /** 行数 */
  rows: number

  constructor(cellSize: number = 32, cols: number = 6, rows: number = 12) {
    this.cellSize = cellSize
    this.cols = cols
    this.rows = rows
  }
}
