import type { Puyo } from './Puyo'

export class Field {
  private readonly width = 6
  private readonly height = 12
  private grid: (Puyo | null)[][]

  constructor() {
    this.grid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => null),
    )
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }

  getPuyo(x: number, y: number): Puyo | null {
    if (!this.isValidPosition(x, y)) {
      throw new Error('Invalid position')
    }
    return this.grid[y][x]
  }

  setPuyo(x: number, y: number, puyo: Puyo): void {
    if (!this.isValidPosition(x, y)) {
      throw new Error('Invalid position')
    }
    if (this.grid[y][x] !== null) {
      throw new Error('Position already occupied')
    }
    this.grid[y][x] = puyo
  }

  removePuyo(x: number, y: number): void {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = null
    }
  }

  isEmpty(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) {
      throw new Error('Invalid position')
    }
    return this.grid[y][x] === null
  }

  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }
}
