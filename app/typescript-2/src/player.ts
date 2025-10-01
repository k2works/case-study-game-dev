import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'

// プレイヤーの操作と落下中のぷよを管理するクラス
export class Player {
  private config: Config
  private _stage: Stage // ステージ（後で使用）
  private puyoImage: PuyoImage

  // 操作中のぷよ（親ぷよ）の位置と色
  private puyoX = 0
  private puyoY = 0
  private puyoColor = 0

  // 操作中のぷよ（子ぷよ）の相対位置と色
  private childOffsetX = 0
  private childOffsetY = -1 // 初期位置は上
  private childColor = 0

  // キー入力のフラグ
  private inputKeyLeft = false
  private inputKeyRight = false

  constructor(config: Config, stage: Stage, puyoImage: PuyoImage) {
    this.config = config
    this._stage = stage
    this.puyoImage = puyoImage

    // キーボードイベントリスナーを設定
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  // キーダウンイベント
  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.inputKeyLeft = true
    } else if (event.key === 'ArrowRight') {
      this.inputKeyRight = true
    }
  }

  // キーアップイベント
  private onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.inputKeyLeft = false
    } else if (event.key === 'ArrowRight') {
      this.inputKeyRight = false
    }
  }

  // 新しいぷよを生成
  createNewPuyo(): void {
    // 親ぷよを中央上部に配置
    this.puyoX = Math.floor(this.config.stageCols / 2)
    this.puyoY = 0

    // ランダムな色を設定（1-4の範囲）
    this.puyoColor = Math.floor(Math.random() * 4) + 1
    this.childColor = Math.floor(Math.random() * 4) + 1

    // 子ぷよは初期状態で上に配置
    this.childOffsetX = 0
    this.childOffsetY = -1
  }

  // 操作中のぷよを描画
  draw(ctx: CanvasRenderingContext2D): void {
    // 親ぷよを描画
    this.puyoImage.draw(
      ctx,
      this.puyoX * this.config.puyoSize,
      this.puyoY * this.config.puyoSize,
      this.puyoColor
    )

    // 子ぷよを描画
    const childX = this.puyoX + this.childOffsetX
    const childY = this.puyoY + this.childOffsetY

    if (childY >= 0) {
      // 画面内の場合のみ描画
      this.puyoImage.draw(
        ctx,
        childX * this.config.puyoSize,
        childY * this.config.puyoSize,
        this.childColor
      )
    }
  }

  // ぷよの位置を取得（テスト用）
  getPosition(): { x: number; y: number } {
    return { x: this.puyoX, y: this.puyoY }
  }

  // 子ぷよの相対位置を取得（テスト用）
  getChildOffset(): { x: number; y: number } {
    return { x: this.childOffsetX, y: this.childOffsetY }
  }

  // 左に移動
  moveLeft(): void {
    // 左端チェック
    if (this.puyoX > 0) {
      this.puyoX--
    }
  }

  // 右に移動
  moveRight(): void {
    // 右端チェック
    if (this.puyoX < this.config.stageCols - 1) {
      this.puyoX++
    }
  }

  // 入力を処理（ゲームループから呼ばれる）
  update(): void {
    if (this.inputKeyLeft) {
      this.moveLeft()
    } else if (this.inputKeyRight) {
      this.moveRight()
    }
  }
}
