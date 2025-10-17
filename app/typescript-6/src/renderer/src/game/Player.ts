import { z } from 'zod'
import type { Config } from './Config'
import type { PuyoImage } from './PuyoImage'
import type { Stage } from './Stage'
import { Puyo } from './Puyo'

/**
 * 回転状態のバリデーションスキーマ
 */
const RotationSchema = z.number().int().min(0).max(3)

/**
 * Player クラス
 * プレイヤーの状態を管理（操作中のぷよペア）
 */
export class Player {
  private mainPuyo: Puyo | null = null
  private subPuyo: Puyo | null = null
  private rotation: number = 0 // 0: 上, 1: 右, 2: 下, 3: 左
  private fallTimer: number = 0 // 落下タイマー（ミリ秒）
  private readonly fallInterval: number = 1000 // 落下間隔（1秒）

  // 回転状態のオフセット（サブぷよの相対位置）
  private readonly rotationOffsets = [
    { x: 0, y: -1 }, // 0: 上
    { x: 1, y: 0 }, // 1: 右
    { x: 0, y: 1 }, // 2: 下
    { x: -1, y: 0 } // 3: 左
  ]

  constructor(
    private config: Config,
    private puyoImage: PuyoImage,
    private stage: Stage
  ) {}

  createNewPuyoPair(): void {
    const startX = Math.floor(this.config.cols / 2)
    this.mainPuyo = Puyo.createRandom(startX, 0)
    this.subPuyo = Puyo.createRandom(startX, -1)
    this.rotation = RotationSchema.parse(0)
  }

  getMainPuyo(): Puyo | null {
    return this.mainPuyo
  }

  getSubPuyo(): Puyo | null {
    return this.subPuyo
  }

  getRotation(): number {
    return this.rotation
  }

  rotateClockwise(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 回転状態を更新（0→1→2→3→0）
    this.rotation = RotationSchema.parse((this.rotation + 1) % 4)

    // サブぷよの位置を更新
    this.updateSubPuyoPosition()

    // 壁キック処理
    this.applyWallKick()
  }

  private updateSubPuyoPosition(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    const offset = this.rotationOffsets[this.rotation]
    this.subPuyo.x = this.mainPuyo.x + offset.x
    this.subPuyo.y = this.mainPuyo.y + offset.y
  }

  private applyWallKick(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // サブぷよが左の壁を超えている場合
    if (this.subPuyo.x < 0) {
      const shift = -this.subPuyo.x
      this.mainPuyo.x += shift
      this.subPuyo.x += shift
    }

    // サブぷよが右の壁を超えている場合
    if (this.subPuyo.x >= this.config.cols) {
      const shift = this.config.cols - 1 - this.subPuyo.x
      this.mainPuyo.x += shift
      this.subPuyo.x += shift
    }
  }

  moveLeft(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 左端チェック
    if (this.mainPuyo.x > 0 && this.subPuyo.x > 0) {
      this.mainPuyo.moveLeft()
      this.subPuyo.moveLeft()
    }
  }

  moveRight(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 右端チェック
    if (this.mainPuyo.x < this.config.cols - 1 && this.subPuyo.x < this.config.cols - 1) {
      this.mainPuyo.moveRight()
      this.subPuyo.moveRight()
    }
  }

  moveDown(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    this.mainPuyo.moveDown()
    this.subPuyo.moveDown()
  }

  /**
   * 更新処理（自動落下）
   * @param deltaTime 経過時間（ミリ秒）
   */
  update(deltaTime: number): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 落下タイマーを更新
    this.fallTimer += deltaTime

    // 落下間隔に達したら落下処理
    if (this.fallTimer >= this.fallInterval) {
      this.fallTimer = 0
      this.applyGravity()
    }
  }

  /**
   * 重力適用（1マス下に移動）
   */
  private applyGravity(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 下に移動できるかチェック
    if (this.canMoveDown()) {
      this.mainPuyo.moveDown()
      this.subPuyo.moveDown()
    }
  }

  /**
   * 下に移動できるかチェック
   */
  private canMoveDown(): boolean {
    if (!this.mainPuyo || !this.subPuyo) return false

    // 画面下端チェック
    if (this.mainPuyo.y >= this.config.rows - 1 || this.subPuyo.y >= this.config.rows - 1) {
      return false
    }

    // フィールドの下のマスが空かチェック
    const mainPuyoBelow = this.stage.isEmpty(this.mainPuyo.x, this.mainPuyo.y + 1)
    const subPuyoBelow = this.stage.isEmpty(this.subPuyo.x, this.subPuyo.y + 1)

    return mainPuyoBelow && subPuyoBelow
  }

  draw(context: CanvasRenderingContext2D): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // サブぷよを描画（画面内の場合のみ）
    if (this.subPuyo.y >= 0) {
      this.puyoImage.draw(context, this.subPuyo.type, this.subPuyo.x, this.subPuyo.y)
    }

    // メインぷよを描画
    this.puyoImage.draw(context, this.mainPuyo.type, this.mainPuyo.x, this.mainPuyo.y)
  }
}
