export class GameField {
  private static readonly FIELD_WIDTH = 6
  private static readonly FIELD_HEIGHT = 12
  private readonly grid: (number | null)[][]

  constructor() {
    this.grid = this.initializeGrid()
  }

  private initializeGrid(): (number | null)[][] {
    const grid: (number | null)[][] = []
    for (let y = 0; y < GameField.FIELD_HEIGHT; y++) {
      grid[y] = []
      for (let x = 0; x < GameField.FIELD_WIDTH; x++) {
        grid[y][x] = null
      }
    }
    return grid
  }

  isEmpty(): boolean {
    for (let y = 0; y < GameField.FIELD_HEIGHT; y++) {
      for (let x = 0; x < GameField.FIELD_WIDTH; x++) {
        if (this.grid[y][x] !== null) {
          return false
        }
      }
    }
    return true
  }

  getWidth(): number {
    return GameField.FIELD_WIDTH
  }

  getHeight(): number {
    return GameField.FIELD_HEIGHT
  }

  getCell(x: number, y: number): number | null {
    if (
      x < 0 ||
      x >= GameField.FIELD_WIDTH ||
      y < 0 ||
      y >= GameField.FIELD_HEIGHT
    ) {
      return null
    }
    return this.grid[y][x]
  }

  setCell(x: number, y: number, color: number | null): void {
    if (
      x >= 0 &&
      x < GameField.FIELD_WIDTH &&
      y >= 0 &&
      y < GameField.FIELD_HEIGHT
    ) {
      this.grid[y][x] = color
    }
  }

  /**
   * 指定した位置から接続している同じ色のぷよを検索する
   */
  findConnectedPuyos(
    startX: number,
    startY: number
  ): Array<{ x: number; y: number }> {
    const color = this.getCell(startX, startY)
    if (color === null) {
      return []
    }

    const visited = new Set<string>()
    const connected: Array<{ x: number; y: number }> = []

    this.dfs(startX, startY, color, visited, connected)
    return connected
  }

  /**
   * 深度優先探索で同じ色のぷよを探索
   */
  private dfs(
    x: number,
    y: number,
    targetColor: number,
    visited: Set<string>,
    result: Array<{ x: number; y: number }>
  ): void {
    const key = `${x},${y}`
    if (visited.has(key)) {
      return
    }

    const currentColor = this.getCell(x, y)
    if (currentColor !== targetColor) {
      return
    }

    visited.add(key)
    result.push({ x, y })

    // 4方向を探索
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 }, // 右
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
    ]

    for (const dir of directions) {
      const newX = x + dir.dx
      const newY = y + dir.dy
      this.dfs(newX, newY, targetColor, visited, result)
    }
  }

  /**
   * フィールド内の全ての接続グループを検出
   */
  findConnectedGroups(): Array<Array<{ x: number; y: number }>> {
    const visited = new Set<string>()
    const groups: Array<Array<{ x: number; y: number }>> = []

    for (let y = 0; y < GameField.FIELD_HEIGHT; y++) {
      for (let x = 0; x < GameField.FIELD_WIDTH; x++) {
        const key = `${x},${y}`
        if (!visited.has(key) && this.getCell(x, y) !== null) {
          const group = this.findConnectedPuyos(x, y)
          if (group.length > 0) {
            groups.push(group)
            // このグループの全ての位置を訪問済みにマーク
            group.forEach((pos) => visited.add(`${pos.x},${pos.y}`))
          }
        }
      }
    }

    return groups
  }

  /**
   * 4つ以上接続している消去可能なグループを検出
   */
  findErasableGroups(): Array<Array<{ x: number; y: number }>> {
    const allGroups = this.findConnectedGroups()
    return allGroups.filter((group) => group.length >= 4)
  }

  /**
   * 4つ以上接続したぷよを消去する
   */
  clearConnectedPuyos(): number {
    const erasableGroups = this.findErasableGroups()
    let totalErased = 0

    for (const group of erasableGroups) {
      for (const pos of group) {
        this.setCell(pos.x, pos.y, null)
        totalErased++
      }
    }

    return totalErased
  }

  /**
   * 重力を適用してぷよを落下させる
   */
  applyGravity(): void {
    for (let x = 0; x < GameField.FIELD_WIDTH; x++) {
      // 各列のぷよを収集
      const puyos: number[] = []

      // 上から下へぷよを収集
      for (let y = 0; y < GameField.FIELD_HEIGHT; y++) {
        const cell = this.getCell(x, y)
        if (cell !== null) {
          puyos.push(cell)
        }
        // セルをクリア
        this.setCell(x, y, null)
      }

      // 下から詰めて配置
      for (let i = 0; i < puyos.length; i++) {
        const targetY = GameField.FIELD_HEIGHT - 1 - i
        this.setCell(x, targetY, puyos[i])
      }
    }
  }
}
