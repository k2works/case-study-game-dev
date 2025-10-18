import { PuyoSchema } from '../schemas/puyo.schema'
import { PuyoType } from './PuyoType'

export { PuyoType }

export class Puyo {
  constructor(
    public x: number,
    public y: number,
    public type: PuyoType
  ) {
    // バリデーション実行
    PuyoSchema.parse({ x, y, type })
  }

  static getRandomType(): PuyoType {
    const types = [PuyoType.Red, PuyoType.Green, PuyoType.Blue, PuyoType.Yellow]
    return types[Math.floor(Math.random() * types.length)]
  }

  static createRandom(x: number, y: number): Puyo {
    const randomType = Puyo.getRandomType()
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
