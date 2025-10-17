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
  private landed: boolean = false // 着地フラグ

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
    this.landed = false // 着地フラグをリセット
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

    // 回転前の状態を保存
    const prevRotation = this.rotation
    const prevSubX = this.subPuyo.x
    const prevSubY = this.subPuyo.y

    // 回転状態を更新（0→1→2→3→0）
    this.rotation = RotationSchema.parse((this.rotation + 1) % 4)

    // サブぷよの位置を更新
    this.updateSubPuyoPosition()

    // 壁キック処理
    this.applyWallKick()

    // 回転後の位置にぷよがある場合、回転を取り消す
    if (!this.stage.isEmpty(this.subPuyo.x, this.subPuyo.y)) {
      this.rotation = prevRotation
      this.subPuyo.x = prevSubX
      this.subPuyo.y = prevSubY
    }
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

    // 左に移動できるかチェック
    if (this.canMoveLeft()) {
      this.mainPuyo.moveLeft()
      this.subPuyo.moveLeft()
    }
  }

  moveRight(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 右に移動できるかチェック
    if (this.canMoveRight()) {
      this.mainPuyo.moveRight()
      this.subPuyo.moveRight()
    }
  }

  moveDown(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 下に移動できるかチェック
    if (this.canMoveDown()) {
      this.mainPuyo.moveDown()
      this.subPuyo.moveDown()
    }
  }

  /**
   * 落下速度を取得する
   * @param isDownKeyPressed 下キーが押されているか
   * @returns 落下速度（通常: 1, 高速: 10）
   */
  getDropSpeed(isDownKeyPressed: boolean): number {
    return isDownKeyPressed ? 10 : 1
  }

  /**
   * 更新処理（自動落下）
   * @param deltaTime 経過時間（ミリ秒）
   * @param isDownKeyPressed 下キーが押されているか
   */
  update(deltaTime: number, isDownKeyPressed: boolean = false): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // 落下速度を取得
    const dropSpeed = this.getDropSpeed(isDownKeyPressed)

    // 落下タイマーを更新（高速落下時は速く進む）
    this.fallTimer += deltaTime * dropSpeed

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
    } else {
      // 着地フラグを立てる
      this.landed = true
    }
  }

  /**
   * ぷよをフィールドに配置する
   */
  placePuyos(): void {
    if (!this.mainPuyo || !this.subPuyo) return

    // ぷよをフィールドに配置
    this.stage.setPuyo(this.mainPuyo.x, this.mainPuyo.y, this.mainPuyo.type)
    this.stage.setPuyo(this.subPuyo.x, this.subPuyo.y, this.subPuyo.type)
  }

  /**
   * 左に移動できるかチェック
   */
  private canMoveLeft(): boolean {
    if (!this.mainPuyo || !this.subPuyo) return false

    // 画面左端チェック
    if (this.mainPuyo.x <= 0 || this.subPuyo.x <= 0) {
      return false
    }

    // フィールドの左のマスが空かチェック
    const mainPuyoLeft = this.stage.isEmpty(this.mainPuyo.x - 1, this.mainPuyo.y)
    const subPuyoLeft = this.stage.isEmpty(this.subPuyo.x - 1, this.subPuyo.y)

    return mainPuyoLeft && subPuyoLeft
  }

  /**
   * 右に移動できるかチェック
   */
  private canMoveRight(): boolean {
    if (!this.mainPuyo || !this.subPuyo) return false

    // 画面右端チェック
    if (this.mainPuyo.x >= this.config.cols - 1 || this.subPuyo.x >= this.config.cols - 1) {
      return false
    }

    // フィールドの右のマスが空かチェック
    const mainPuyoRight = this.stage.isEmpty(this.mainPuyo.x + 1, this.mainPuyo.y)
    const subPuyoRight = this.stage.isEmpty(this.subPuyo.x + 1, this.subPuyo.y)

    return mainPuyoRight && subPuyoRight
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

  /**
   * ぷよが着地したか判定する
   */
  hasLanded(): boolean {
    return this.landed
  }

  /**
   * ゲームオーバー判定
   * @returns 新しいぷよを配置できない場合 true
   */
  checkGameOver(): boolean {
    if (!this.mainPuyo || !this.subPuyo) return false

    // メインぷよの位置にぷよがあるかチェック
    const mainPuyoType = this.stage.getPuyo(this.mainPuyo.x, this.mainPuyo.y)
    if (mainPuyoType !== 0) {
      // PuyoType.Empty
      return true
    }

    // サブぷよの位置にぷよがあるかチェック
    const subPuyoType = this.stage.getPuyo(this.subPuyo.x, this.subPuyo.y)
    if (subPuyoType !== 0) {
      // PuyoType.Empty
      return true
    }

    return false
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
