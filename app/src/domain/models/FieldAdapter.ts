import type { FieldData } from './ImmutableField'
import {
  createEmptyField,
  getAllPuyosWithPositions,
  getPuyoAt,
  isEmptyAt,
  isValidPosition,
  placePuyoAt,
  removePuyoAt,
} from './ImmutableField'
import type { Position } from './Position'
import type { PuyoData } from './Puyo'

/**
 * 既存のFieldクラスとImmutableFieldの間のアダプター
 * 既存のコードとの互換性を保ちながらImmutableFieldの利点を活用
 */
export class FieldAdapter {
  private immutableField: FieldData

  constructor(field?: FieldData) {
    this.immutableField = field ?? createEmptyField()
  }

  /**
   * 内部の不変フィールドを取得
   */
  getImmutableField(): FieldData {
    return this.immutableField
  }

  /**
   * 不変フィールドから新しいアダプターを作成
   */
  static fromImmutableField(field: FieldData): FieldAdapter {
    return new FieldAdapter(field)
  }

  getWidth(): number {
    return this.immutableField.width
  }

  getHeight(): number {
    return this.immutableField.height
  }

  getPuyo(x: number, y: number): PuyoData | null {
    const position: Position = { x, y }
    return getPuyoAt(position, this.immutableField)
  }

  setPuyo(x: number, y: number, puyo: PuyoData): FieldAdapter {
    const position: Position = { x, y }
    this.immutableField = placePuyoAt(position, puyo, this.immutableField)
    return this
  }

  /**
   * 新しいインスタンスを返すsetPuyoメソッド（不変版）
   */
  withPuyo(x: number, y: number, puyo: PuyoData): FieldAdapter {
    const position: Position = { x, y }
    const newField = placePuyoAt(position, puyo, this.immutableField)
    return new FieldAdapter(newField)
  }

  removePuyo(x: number, y: number): void {
    const position: Position = { x, y }
    this.immutableField = removePuyoAt(position, this.immutableField)
  }

  isEmpty(x: number, y: number): boolean {
    const position: Position = { x, y }
    return isEmptyAt(position, this.immutableField)
  }

  isValidPosition(x: number, y: number): boolean {
    const position: Position = { x, y }
    return isValidPosition(position, this.immutableField)
  }

  /**
   * 全てのぷよとその位置を取得する新しいメソッド
   */
  getAllPuyos(): Array<{ puyo: PuyoData; position: Position }> {
    return getAllPuyosWithPositions(this.immutableField)
  }

  /**
   * フィールドをクローンして新しいアダプターを作成
   */
  clone(): FieldAdapter {
    return new FieldAdapter(this.immutableField)
  }
}
