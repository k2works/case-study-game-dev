import type { Field } from '../models/Field'
import { type PuyoColor, createPuyo } from '../models/Puyo'

export class GravityService {
  applyGravity(field: Field): void {
    for (let x = 0; x < field.getWidth(); x++) {
      this.applyGravityToColumn(field, x)
    }
  }

  private applyGravityToColumn(field: Field, x: number): void {
    const puyos: Array<{ color: string; originalY: number }> = []

    // 列からすべてのぷよを収集
    for (let y = 0; y < field.getHeight(); y++) {
      const puyo = field.getPuyo(x, y)
      if (puyo) {
        puyos.push({ color: puyo.color!, originalY: y })
        field.removePuyo(x, y)
      }
    }

    // Y座標でソート（下にあるものが先に配置される）
    puyos.sort((a, b) => b.originalY - a.originalY)

    // 底から順に再配置
    for (let i = 0; i < puyos.length; i++) {
      const newY = field.getHeight() - 1 - i
      const newPuyo = createPuyo(puyos[i].color as PuyoColor, { x, y: newY })
      field.setPuyo(x, newY, newPuyo)
    }
  }
}
