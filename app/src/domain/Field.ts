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

  findConnectedPuyos(x: number, y: number): [number, number][] {
    const puyo = this.getPuyo(x, y)
    if (!puyo) return []

    const visited = new Set<string>()
    const result: [number, number][] = []

    this.dfs(x, y, puyo.color, visited, result)

    return result
  }

  private dfs(
    x: number,
    y: number,
    color: string,
    visited: Set<string>,
    result: [number, number][]
  ): void {
    const key = `${x},${y}`
    if (visited.has(key)) return
    if (!this.isValidPosition(x, y)) return

    const puyo = this.getPuyo(x, y)
    if (!puyo || puyo.color !== color) return

    visited.add(key)
    result.push([x, y])

    // 上下左右を探索
    this.dfs(x - 1, y, color, visited, result)
    this.dfs(x + 1, y, color, visited, result)
    this.dfs(x, y - 1, color, visited, result)
    this.dfs(x, y + 1, color, visited, result)
  }

  removePuyos(): [number, number][] {
    const removedPositions: [number, number][] = []
    const visited = new Set<string>()

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`
        if (visited.has(key) || !this.getPuyo(x, y)) continue

        const connectedPuyos = this.findConnectedPuyos(x, y)
        connectedPuyos.forEach(([px, py]) => visited.add(`${px},${py}`))

        if (connectedPuyos.length >= 4) {
          connectedPuyos.forEach(([px, py]) => {
            this.grid[py][px] = null
            removedPositions.push([px, py])
          })
        }
      }
    }

    return removedPositions
  }
}
