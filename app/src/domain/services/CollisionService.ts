import type { FieldAdapter } from '../models/FieldAdapter'
import { isEmptyAt } from '../models/ImmutableField'
import type { Position } from '../models/Position'
import type { Puyo } from '../models/Puyo'
import type { PuyoPair } from '../models/PuyoPair'

/**
 * 衝突判定ドメインサービス
 * ぷよペアとフィールド、ぷよ同士の衝突判定を担当
 */
export class CollisionService {
  /**
   * ぷよペアがフィールドに配置可能かチェック
   * @param puyoPair 配置するぷよペア
   * @param field 対象フィールド
   * @returns 配置可能な場合true
   */
  canPlacePuyoPair(puyoPair: PuyoPair, field: FieldAdapter): boolean {
    const mainCanPlace = this.canPlacePuyo(puyoPair.main, field)
    const subCanPlace = this.canPlacePuyo(puyoPair.sub, field)

    return mainCanPlace && subCanPlace
  }

  /**
   * 単一のぷよが指定位置に配置可能かチェック
   * @param puyo 配置するぷよ
   * @param field 対象フィールド
   * @returns 配置可能な場合true
   */
  canPlacePuyo(puyo: Puyo, field: FieldAdapter): boolean {
    const { x, y } = puyo.position

    // 境界チェック
    if (!this.isWithinBounds(puyo.position, field)) {
      return false
    }

    // 占有チェック
    if (!isEmptyAt({ x, y }, field.getImmutableField())) {
      return false
    }

    return true
  }

  /**
   * ぷよペアの着地位置を探索
   * @param puyoPair 落下するぷよペア
   * @param field 対象フィールド
   * @returns 着地位置のぷよペア、着地できない場合null
   */
  findLandingPosition(
    puyoPair: PuyoPair,
    field: FieldAdapter,
  ): PuyoPair | null {
    let currentPair = puyoPair
    let nextPair = this.movePuyoPairDown(currentPair)

    // 下に移動できる限り下げる
    while (this.canPlacePuyoPair(nextPair, field)) {
      currentPair = nextPair
      nextPair = this.movePuyoPairDown(currentPair)
    }

    // 最終的に配置できない場合はnullを返す
    return this.canPlacePuyoPair(currentPair, field) ? currentPair : null
  }

  /**
   * ぷよペアを1マス下に移動
   * @param puyoPair 移動するぷよペア
   * @returns 移動後のぷよペア
   */
  private movePuyoPairDown(puyoPair: PuyoPair): PuyoPair {
    return {
      main: {
        ...puyoPair.main,
        position: {
          x: puyoPair.main.position.x,
          y: puyoPair.main.position.y + 1,
        },
      },
      sub: {
        ...puyoPair.sub,
        position: {
          x: puyoPair.sub.position.x,
          y: puyoPair.sub.position.y + 1,
        },
      },
    }
  }

  /**
   * 指定位置がフィールド境界内かチェック
   * @param position チェックする位置
   * @param field 対象フィールド
   * @returns 境界内の場合true
   */
  isWithinBounds(position: Position, field: FieldAdapter): boolean {
    return (
      position.x >= 0 &&
      position.x < field.getWidth() &&
      position.y >= 0 &&
      position.y < field.getHeight()
    )
  }

  /**
   * ぷよペアの水平移動の妥当性をチェック
   * @param puyoPair 移動するぷよペア
   * @param direction 移動方向（-1: 左, 1: 右）
   * @param field 対象フィールド
   * @returns 移動可能な場合true
   */
  canMoveHorizontally(
    puyoPair: PuyoPair,
    direction: -1 | 1,
    field: FieldAdapter,
  ): boolean {
    const movedPair = this.movePuyoPairHorizontally(puyoPair, direction)
    return this.canPlacePuyoPair(movedPair, field)
  }

  /**
   * ぷよペアを水平方向に移動
   * @param puyoPair 移動するぷよペア
   * @param direction 移動方向（-1: 左, 1: 右）
   * @returns 移動後のぷよペア
   */
  private movePuyoPairHorizontally(
    puyoPair: PuyoPair,
    direction: -1 | 1,
  ): PuyoPair {
    return {
      main: {
        ...puyoPair.main,
        position: {
          x: puyoPair.main.position.x + direction,
          y: puyoPair.main.position.y,
        },
      },
      sub: {
        ...puyoPair.sub,
        position: {
          x: puyoPair.sub.position.x + direction,
          y: puyoPair.sub.position.y,
        },
      },
    }
  }

  /**
   * ぷよペアの回転の妥当性をチェック
   * @param originalPair 元のぷよペア
   * @param rotatedPair 回転後のぷよペア
   * @param field 対象フィールド
   * @returns 回転可能な場合true
   */
  canRotate(
    _originalPair: PuyoPair,
    rotatedPair: PuyoPair,
    field: FieldAdapter,
  ): boolean {
    return this.canPlacePuyoPair(rotatedPair, field)
  }

  /**
   * 壁蹴り可能な位置を探索
   * @param rotatedPair 回転後のぷよペア
   * @param field 対象フィールド
   * @param kickOffsets 試行する蹴り位置のオフセット
   * @returns 壁蹴り可能な位置のぷよペア、不可能な場合null
   */
  findWallKickPosition(
    rotatedPair: PuyoPair,
    field: FieldAdapter,
    kickOffsets: Position[],
  ): PuyoPair | null {
    for (const offset of kickOffsets) {
      const kickedPair = this.offsetPuyoPair(rotatedPair, offset)

      if (this.canPlacePuyoPair(kickedPair, field)) {
        return kickedPair
      }
    }

    return null
  }

  /**
   * ぷよペアを指定オフセット分移動
   * @param puyoPair 移動するぷよペア
   * @param offset 移動量
   * @returns 移動後のぷよペア
   */
  private offsetPuyoPair(puyoPair: PuyoPair, offset: Position): PuyoPair {
    return {
      main: {
        ...puyoPair.main,
        position: {
          x: puyoPair.main.position.x + offset.x,
          y: puyoPair.main.position.y + offset.y,
        },
      },
      sub: {
        ...puyoPair.sub,
        position: {
          x: puyoPair.sub.position.x + offset.x,
          y: puyoPair.sub.position.y + offset.y,
        },
      },
    }
  }

  /**
   * ゲームオーバー判定
   * @param field 対象フィールド
   * @param spawnPosition 新しいぷよの生成位置
   * @returns ゲームオーバーの場合true
   */
  isGameOver(field: FieldAdapter, spawnPosition: Position): boolean {
    // 生成位置が占有されている場合はゲームオーバー
    return !isEmptyAt(spawnPosition, field.getImmutableField())
  }

  /**
   * フィールド内の危険な領域をチェック
   * @param field 対象フィールド
   * @param dangerLine 危険ライン（この高さ以上にぷよがあると危険）
   * @returns 危険な場合true
   */
  isDangerZone(field: FieldAdapter, dangerLine: number = 2): boolean {
    for (let x = 0; x < field.getWidth(); x++) {
      for (let y = 0; y < dangerLine; y++) {
        if (!isEmptyAt({ x, y }, field.getImmutableField())) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 指定位置から落下する可能性のあるぷよを検索
   * @param field 対象フィールド
   * @param checkPosition チェック開始位置
   * @returns 落下するぷよの位置配列
   */
  findFloatingPuyos(field: FieldAdapter, checkPosition: Position): Position[] {
    const floatingPuyos: Position[] = []

    // 指定位置から上方向をチェック
    for (let y = checkPosition.y - 1; y >= 0; y--) {
      if (!isEmptyAt({ x: checkPosition.x, y }, field.getImmutableField())) {
        floatingPuyos.push({ x: checkPosition.x, y })
      }
    }

    return floatingPuyos
  }
}
