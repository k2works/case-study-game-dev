export class GameField {
  private field: number[][]
  private readonly width = 6
  private readonly height = 12

  constructor() {
    this.field = Array.from({ length: this.height }, () => Array(this.width).fill(0))
  }

  getField(): number[][] {
    return this.field
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }

  canMoveTo(x: number, y: number): boolean {
    // フィールドの範囲内かチェック
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false
    }
    // 既存のぷよがないかチェック
    return this.field[y][x] === 0
  }

  setPuyo(x: number, y: number, color: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.field[y][x] = color
    }
  }

  removePuyo(x: number, y: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.field[y][x] = 0
    }
  }

  getPuyoColor(x: number, y: number): number {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.field[y][x]
    }
    return 0
  }

  findConnectedPuyos(x: number, y: number, color: number): Array<{ x: number; y: number }> {
    // 空のセルや色が0の場合は何も返さない
    if (color === 0 || this.field[y][x] !== color) {
      return []
    }

    const visited: boolean[][] = Array.from({ length: this.height }, () =>
      Array(this.width).fill(false)
    )
    const result: Array<{ x: number; y: number }> = []

    this.dfsConnectedPuyos(x, y, color, visited, result)
    return result
  }

  private dfsConnectedPuyos(
    currentX: number,
    currentY: number,
    color: number,
    visited: boolean[][],
    result: Array<{ x: number; y: number }>
  ): void {
    // 範囲外または無効な条件をチェック
    if (!this.isValidDfsPosition(currentX, currentY, color, visited)) {
      return
    }

    // 訪問済みにマークして結果に追加
    visited[currentY][currentX] = true
    result.push({ x: currentX, y: currentY })

    // 隣接する4方向を再帰的に探索
    this.exploreDfsDirections(currentX, currentY, color, visited, result)
  }

  private isValidDfsPosition(x: number, y: number, color: number, visited: boolean[][]): boolean {
    // 範囲外チェック
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false
    // 既に訪問済みまたは異なる色の場合
    if (visited[y][x] || this.field[y][x] !== color) return false
    return true
  }

  private exploreDfsDirections(
    x: number,
    y: number,
    color: number,
    visited: boolean[][],
    result: Array<{ x: number; y: number }>
  ): void {
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 }, // 右
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
    ]

    for (const dir of directions) {
      this.dfsConnectedPuyos(x + dir.dx, y + dir.dy, color, visited, result)
    }
  }

  findErasableGroups(): Array<Array<{ x: number; y: number }>> {
    const visited: boolean[][] = Array.from({ length: this.height }, () =>
      Array(this.width).fill(false)
    )
    const erasableGroups: Array<Array<{ x: number; y: number }>> = []

    // フィールド全体をスキャンして消去対象グループを検出
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!visited[y][x] && this.field[y][x] !== 0) {
          const group = this.findConnectedPuyosForErasure(x, y, this.field[y][x], visited)
          // 4つ以上のグループは消去対象
          if (group.length >= 4) {
            erasableGroups.push(group)
          }
        }
      }
    }

    return erasableGroups
  }

  private findConnectedPuyosForErasure(
    x: number,
    y: number,
    color: number,
    visited: boolean[][]
  ): Array<{ x: number; y: number }> {
    const result: Array<{ x: number; y: number }> = []
    this.dfsConnectedPuyos(x, y, color, visited, result)
    return result
  }

  erasePuyos(): number {
    const erasableGroups = this.findErasableGroups()

    // 消去対象グループがない場合は0を返す
    if (erasableGroups.length === 0) {
      return 0
    }

    // 消去されるぷよの総数を計算
    let totalErasedCount = 0
    for (const group of erasableGroups) {
      totalErasedCount += group.length
    }

    // 消去対象のぷよをすべて消去（0にセット）
    for (const group of erasableGroups) {
      for (const puyo of group) {
        this.field[puyo.y][puyo.x] = 0
      }
    }

    return totalErasedCount
  }

  applyGravity(): void {
    // 各列に対して重力を適用
    for (let x = 0; x < this.width; x++) {
      this.applyGravityToColumn(x)
    }
  }

  private applyGravityToColumn(x: number): void {
    // 各列の底から上に向かって、空いているスペースを詰める
    let writePos = this.height - 1 // 書き込み位置（底から開始）

    // 底から上に向かってスキャン
    for (let y = this.height - 1; y >= 0; y--) {
      if (this.field[y][x] !== 0) {
        // ぷよがある場合は書き込み位置に移動
        if (y !== writePos) {
          this.field[writePos][x] = this.field[y][x]
          this.field[y][x] = 0
        }
        writePos-- // 次の書き込み位置を上に移動
      }
    }
  }

  isAllClear(): boolean {
    // フィールド全体をスキャンして、すべてのセルが空（0）かどうかを確認
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.field[y][x] !== 0) {
          return false // 空でないセルが見つかった場合は全消しではない
        }
      }
    }
    return true // すべてのセルが空の場合は全消し
  }

  clear(): void {
    this.field = Array.from({ length: this.height }, () => Array(this.width).fill(0))
  }
}
