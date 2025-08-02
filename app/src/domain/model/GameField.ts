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
}
