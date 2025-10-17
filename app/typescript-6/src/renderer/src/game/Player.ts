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

  draw(_context: CanvasRenderingContext2D): void {
    // 後で実装
  }
}
