export enum PuyoColor {
  RED = 1,
  BLUE = 2,
  GREEN = 3,
  YELLOW = 4,
  PURPLE = 5,
}

export class Position {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  add(dx: number, dy: number): Position {
    return new Position(this.x + dx, this.y + dy)
  }

  equals(other: Position): boolean {
    return this.x === other.x && this.y === other.y
  }
}

export class Puyo {
  constructor(
    public readonly color: PuyoColor,
    public readonly position: Position
  ) {}

  moveTo(newPosition: Position): Puyo {
    return new Puyo(this.color, newPosition)
  }

  moveBy(dx: number, dy: number): Puyo {
    return new Puyo(this.color, this.position.add(dx, dy))
  }
}

export class PuyoPair {
  constructor(
    public readonly main: Puyo,
    public readonly sub: Puyo
  ) {}

  static create(
    mainColor: PuyoColor,
    subColor: PuyoColor,
    x: number = 2,
    y: number = 0
  ): PuyoPair {
    const main = new Puyo(mainColor, new Position(x, y))
    const sub = new Puyo(subColor, new Position(x, y - 1))
    return new PuyoPair(main, sub)
  }

  moveBy(dx: number, dy: number): PuyoPair {
    return new PuyoPair(this.main.moveBy(dx, dy), this.sub.moveBy(dx, dy))
  }

  rotate(): PuyoPair {
    // 時計回りに90度回転
    const relativeX = this.sub.position.x - this.main.position.x
    const relativeY = this.sub.position.y - this.main.position.y

    // 回転後の相対位置 (x, y) -> (-y, x)
    const newRelativeX = -relativeY
    const newRelativeY = relativeX

    const newSubPosition = new Position(
      this.main.position.x + newRelativeX,
      this.main.position.y + newRelativeY
    )

    return new PuyoPair(this.main, new Puyo(this.sub.color, newSubPosition))
  }
}
