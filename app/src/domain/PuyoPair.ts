import { Puyo } from './Puyo'

export interface Position {
  x: number
  y: number
}

export class PuyoPair {
  public rotation = 0

  constructor(
    public main: Puyo,
    public sub: Puyo,
    public x: number,
    public y: number
  ) {}

  rotate(): void {
    this.rotation = (this.rotation + 90) % 360
  }

  getMainPosition(): Position {
    return { x: this.x, y: this.y }
  }

  getSubPosition(): Position {
    switch (this.rotation) {
      case 0: // 上
        return { x: this.x, y: this.y - 1 }
      case 90: // 右
        return { x: this.x + 1, y: this.y }
      case 180: // 下
        return { x: this.x, y: this.y + 1 }
      case 270: // 左
        return { x: this.x - 1, y: this.y }
      default:
        return { x: this.x, y: this.y - 1 }
    }
  }
}
