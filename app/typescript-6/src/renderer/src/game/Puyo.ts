export enum PuyoType {
  Empty = 0,
  Red = 1,
  Green = 2,
  Blue = 3,
  Yellow = 4
}

export class Puyo {
  constructor(
    public x: number,
    public y: number,
    public type: PuyoType
  ) {}

  static createRandom(x: number, y: number): Puyo {
    const types = [PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]
    const randomType = types[Math.floor(Math.random() * types.length)]
    return new Puyo(x, y, randomType)
  }

  moveLeft(): void {
    this.x--
  }

  moveRight(): void {
    this.x++
  }

  moveDown(): void {
    this.y++
  }

  clone(): Puyo {
    return new Puyo(this.x, this.y, this.type)
  }
}
