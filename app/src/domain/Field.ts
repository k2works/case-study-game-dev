import { Puyo } from './Puyo'

export class Field {
  public readonly height = 12
  public readonly width = 6
  private grid: (Puyo | null)[][]

  constructor() {
    this.grid = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(null))
  }

  isEmpty(): boolean {
    return this.grid.every((row) => row.every((cell) => cell === null))
  }

  setPuyo(x: number, y: number, puyo: Puyo): void {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = puyo
    }
  }

  getPuyo(x: number, y: number): Puyo | null {
    if (this.isValidPosition(x, y)) {
      return this.grid[y][x]
    }
    return null
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }
}
