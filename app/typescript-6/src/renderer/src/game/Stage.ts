/**
 * Stage クラス
 * ゲームのステージ（フィールド）を管理
 */
export class Stage {
  private cols: number
  private rows: number

  constructor(cols: number, rows: number) {
    this.cols = cols
    this.rows = rows
  }
}
