import type { ImmutableField } from './ImmutableField'
import {
  createField,
  getAllPuyos,
  getPuyo,
  isEmpty,
  isValidPosition,
  removePuyo,
  setPuyo,
} from './ImmutableField'
import type { Position } from './Position'
import type { Puyo } from './Puyo'

/**
 * 既存のFieldクラスとImmutableFieldの間のアダプター
 * 既存のコードとの互換性を保ちながらImmutableFieldの利点を活用
 */
export class FieldAdapter {
  private immutableField: ImmutableField

  constructor(field?: ImmutableField) {
    this.immutableField = field ?? createField()
  }

  /**
   * 内部の不変フィールドを取得
   */
  getImmutableField(): ImmutableField {
    return this.immutableField
  }

  /**
   * 不変フィールドから新しいアダプターを作成
   */
  static fromImmutableField(field: ImmutableField): FieldAdapter {
    return new FieldAdapter(field)
  }

  getWidth(): number {
    return this.immutableField.width
  }

  getHeight(): number {
    return this.immutableField.height
  }

  getPuyo(x: number, y: number): Puyo | null {
    const position: Position = { x, y }
    return getPuyo(position, this.immutableField)
  }

  setPuyo(x: number, y: number, puyo: Puyo): FieldAdapter {
    const position: Position = { x, y }
    this.immutableField = setPuyo(position, puyo, this.immutableField)
    return this
  }

  /**
   * 新しいインスタンスを返すsetPuyoメソッド（不変版）
   */
  withPuyo(x: number, y: number, puyo: Puyo): FieldAdapter {
    const position: Position = { x, y }
    const newField = setPuyo(position, puyo, this.immutableField)
    return new FieldAdapter(newField)
  }

  removePuyo(x: number, y: number): void {
    const position: Position = { x, y }
    this.immutableField = removePuyo(position, this.immutableField)
  }

  isEmpty(x: number, y: number): boolean {
    const position: Position = { x, y }
    return isEmpty(position, this.immutableField)
  }

  isValidPosition(x: number, y: number): boolean {
    const position: Position = { x, y }
    return isValidPosition(position, this.immutableField)
  }

  /**
   * 全てのぷよとその位置を取得する新しいメソッド
   */
  getAllPuyos(): Array<{ puyo: Puyo; position: Position }> {
    return getAllPuyos(this.immutableField)
  }

  /**
   * フィールドをクローンして新しいアダプターを作成
   */
  clone(): FieldAdapter {
    return new FieldAdapter(this.immutableField)
  }
}
