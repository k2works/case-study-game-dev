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

  // 回転状態（0: 上, 1: 右, 2: 下, 3: 左）
  private rotation = 0

  // 落下タイマー
  private dropTimer = 0
  private dropInterval = 1000 // 1秒ごとに落下

  // 着地フラグ
  private landed = false

  // キー入力のフラグ
  private inputKeyLeft = false
  private inputKeyRight = false
  private inputKeyRotate = false

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
    } else if (
      event.key === 'ArrowUp' ||
      event.key === 'x' ||
      event.key === 'X'
    ) {
      this.inputKeyRotate = true
    }
  }

  // キーアップイベント
  private onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.inputKeyLeft = false
    } else if (event.key === 'ArrowRight') {
      this.inputKeyRight = false
    } else if (
      event.key === 'ArrowUp' ||
      event.key === 'x' ||
      event.key === 'X'
    ) {
      this.inputKeyRotate = false
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

    // 回転状態をリセット
    this.rotation = 0

    // 着地フラグをリセット
    this.landed = false
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
  update(deltaTime = 16): void {
    // キー入力の処理
    if (this.inputKeyLeft) {
      this.moveLeft()
    } else if (this.inputKeyRight) {
      this.moveRight()
    }

    // 回転キーが押されたら回転する
    if (this.inputKeyRotate) {
      this.rotateRight()
      // 連続回転を防ぐため、フラグをリセット
      this.inputKeyRotate = false
    }

    // 落下タイマーを更新
    this.dropTimer += deltaTime

    // 落下間隔を超えたら落下処理を実行
    if (this.dropTimer >= this.dropInterval) {
      this.applyGravity()
      this.dropTimer = 0 // タイマーをリセット
    }
  }

  // 時計回りに回転
  rotateRight(): void {
    // 時計回りに回転（0→1→2→3→0）
    this.rotation = (this.rotation + 1) % 4

    // 回転状態に応じて子ぷよの位置を更新
    this.updateChildOffset()

    // 右端で右回転した場合（2つ目のぷよが右にくる場合）
    if (this.rotation === 1 && this.puyoX === this.config.stageCols - 1) {
      // 左に移動（壁キック）
      this.puyoX--
    }

    // 左端で左回転した場合（2つ目のぷよが左にくる場合）
    if (this.rotation === 3 && this.puyoX === 0) {
      // 右に移動（壁キック）
      this.puyoX++
    }
  }

  // 反時計回りに回転
  rotateLeft(): void {
    // 反時計回りに回転（0→3→2→1→0）
    this.rotation = (this.rotation + 3) % 4

    // 回転状態に応じて子ぷよの位置を更新
    this.updateChildOffset()

    // 右端で右回転した場合（2つ目のぷよが右にくる場合）
    if (this.rotation === 1 && this.puyoX === this.config.stageCols - 1) {
      // 左に移動（壁キック）
      this.puyoX--
    }

    // 左端で左回転した場合（2つ目のぷよが左にくる場合）
    if (this.rotation === 3 && this.puyoX === 0) {
      // 右に移動（壁キック）
      this.puyoX++
    }
  }

  // 回転状態に応じて子ぷよの相対位置を更新
  private updateChildOffset(): void {
    switch (this.rotation) {
      case 0: // 上
        this.childOffsetX = 0
        this.childOffsetY = -1
        break
      case 1: // 右
        this.childOffsetX = 1
        this.childOffsetY = 0
        break
      case 2: // 下
        this.childOffsetX = 0
        this.childOffsetY = 1
        break
      case 3: // 左
        this.childOffsetX = -1
        this.childOffsetY = 0
        break
    }
  }

  // 重力を適用する（ぷよを1マス下に落とす）
  private applyGravity(): void {
    // 下に移動できるかチェック
    if (this.canMoveDown()) {
      this.puyoY += 1
    } else {
      // 着地した
      this.onLanded()
    }
  }

  // 着地処理
  private onLanded(): void {
    // 着地フラグを立てる
    this.landed = true

    // ステージにぷよを固定
    this.fixPuyoToStage()
  }

  // ステージにぷよを固定
  private fixPuyoToStage(): void {
    // 親ぷよを固定
    this._stage.setPuyo(this.puyoX, this.puyoY, this.puyoColor)

    // 子ぷよを固定
    const childX = this.puyoX + this.childOffsetX
    const childY = this.puyoY + this.childOffsetY
    this._stage.setPuyo(childX, childY, this.childColor)
  }

  // 着地したかどうかを取得
  isLanded(): boolean {
    return this.landed
  }

  // 下に移動できるかチェックする
  private canMoveDown(): boolean {
    // 親ぷよと子ぷよの次の位置
    const nextY = this.puyoY + 1
    const childNextY = this.puyoY + this.childOffsetY + 1

    // 親ぷよが範囲外かチェック
    if (nextY >= this.config.stageRows) {
      return false
    }

    // 子ぷよが範囲外かチェック
    if (childNextY >= this.config.stageRows) {
      return false
    }

    return true
  }
}
