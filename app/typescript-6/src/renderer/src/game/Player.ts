import type { Config } from './Config'
import type { PuyoImage } from './PuyoImage'
import { Puyo } from './Puyo'

/**
 * Player クラス
 * プレイヤーの状態を管理（操作中のぷよペア）
 */
export class Player {
  private mainPuyo: Puyo | null = null
  private subPuyo: Puyo | null = null
  private rotation: number = 0 // 0: 上, 1: 右, 2: 下, 3: 左

  constructor(
    private config: Config,
    private puyoImage: PuyoImage
  ) {}

  createNewPuyoPair(): void {
    const startX = Math.floor(this.config.cols / 2)
    this.mainPuyo = Puyo.createRandom(startX, 0)
    this.subPuyo = Puyo.createRandom(startX, -1)
    this.rotation = 0
  }

  getMainPuyo(): Puyo | null {
    return this.mainPuyo
  }

  getSubPuyo(): Puyo | null {
    return this.subPuyo
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
