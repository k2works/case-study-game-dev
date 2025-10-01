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

  // 移動タイマー
  private moveTimer = 0
  private moveInterval = 100 // 100ms ごとに移動

  // 着地フラグ
  private landed = false

  // キー入力のフラグ
  private inputKeyLeft = false
  private inputKeyRight = false
  private inputKeyRotate = false
  private inputKeyDown = false

  // 次のぷよの色
  private nextPuyoColor = 0
  private nextChildColor = 0

  // 次のぷよの Canvas 要素
  private nextCanvas: HTMLCanvasElement | null = null
  private nextCtx: CanvasRenderingContext2D | null = null

  constructor(config: Config, stage: Stage, puyoImage: PuyoImage) {
    this.config = config
    this._stage = stage
    this.puyoImage = puyoImage

    // 次のぷよ表示用の Canvas を初期化
    this.initializeNextCanvas()

    // キーボードイベントリスナーを設定
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  // 次のぷよ表示用の Canvas 初期化
  private initializeNextCanvas(): void {
    const nextElement = document.getElementById('next')
    if (nextElement) {
      this.nextCanvas = document.createElement('canvas')
      this.nextCanvas.width = this.config.puyoSize * 2
      this.nextCanvas.height = this.config.puyoSize * 2
      this.nextCtx = this.nextCanvas.getContext('2d')
      nextElement.appendChild(this.nextCanvas)

      // タイトルを追加
      const title = document.createElement('div')
      title.textContent = 'Next'
      title.style.marginBottom = '5px'
      nextElement.insertBefore(title, this.nextCanvas)
    }
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
    } else if (event.key === 'ArrowDown') {
      this.inputKeyDown = true
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
    } else if (event.key === 'ArrowDown') {
      this.inputKeyDown = false
    }
  }

  // 新しいぷよを生成
  createNewPuyo(): void {
    // 親ぷよを中央上部に配置
    this.puyoX = Math.floor(this.config.stageCols / 2)
    this.puyoY = 0

    // 次のぷよがある場合はそれを使用、なければランダム生成
    if (this.nextPuyoColor === 0) {
      // 初回のみランダム生成
      this.puyoColor = Math.floor(Math.random() * 4) + 1
      this.childColor = Math.floor(Math.random() * 4) + 1
    } else {
      // 次のぷよを使用
      this.puyoColor = this.nextPuyoColor
      this.childColor = this.nextChildColor
    }

    // 次のぷよを生成
    this.nextPuyoColor = Math.floor(Math.random() * 4) + 1
    this.nextChildColor = Math.floor(Math.random() * 4) + 1
    this.drawNextPuyo()

    // 子ぷよは初期状態で上に配置
    this.childOffsetX = 0
    this.childOffsetY = -1

    // 回転状態をリセット
    this.rotation = 0

    // 着地フラグをリセット
    this.landed = false
  }

  // 次のぷよを描画
  private drawNextPuyo(): void {
    if (!this.nextCtx || !this.nextCanvas) return

    // 背景をクリア
    this.nextCtx.fillStyle = '#333333'
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height)

    // 次のぷよ（親）を描画
    this.puyoImage.draw(
      this.nextCtx,
      this.config.puyoSize / 2,
      this.config.puyoSize,
      this.nextPuyoColor
    )

    // 次のぷよ（子）を描画（上に配置）
    this.puyoImage.draw(
      this.nextCtx,
      this.config.puyoSize / 2,
      0,
      this.nextChildColor
    )
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
    // 左に移動できるかチェック
    if (this.canMoveLeft()) {
      this.puyoX--
    }
  }

  // 右に移動
  moveRight(): void {
    // 右に移動できるかチェック
    if (this.canMoveRight()) {
      this.puyoX++
    }
  }

  // 左に移動できるかチェック
  private canMoveLeft(): boolean {
    // 子ぷよの移動後の位置
    const childX = this.puyoX + this.childOffsetX - 1
    const childY = this.puyoY + this.childOffsetY

    // 親ぷよの左端チェック
    if (this.puyoX <= 0) {
      return false
    }

    // 子ぷよの左端チェック
    if (childX < 0) {
      return false
    }

    // 親ぷよの移動先にぷよがあるかチェック
    if (this._stage.getPuyo(this.puyoX - 1, this.puyoY) !== 0) {
      return false
    }

    // 子ぷよの移動先にぷよがあるかチェック（画面内の場合のみ）
    if (childY >= 0 && this._stage.getPuyo(childX, childY) !== 0) {
      return false
    }

    return true
  }

  // 右に移動できるかチェック
  private canMoveRight(): boolean {
    // 子ぷよの移動後の位置
    const childX = this.puyoX + this.childOffsetX + 1
    const childY = this.puyoY + this.childOffsetY

    // 親ぷよの右端チェック
    if (this.puyoX >= this.config.stageCols - 1) {
      return false
    }

    // 子ぷよの右端チェック
    if (childX >= this.config.stageCols) {
      return false
    }

    // 親ぷよの移動先にぷよがあるかチェック
    if (this._stage.getPuyo(this.puyoX + 1, this.puyoY) !== 0) {
      return false
    }

    // 子ぷよの移動先にぷよがあるかチェック（画面内の場合のみ）
    if (childY >= 0 && this._stage.getPuyo(childX, childY) !== 0) {
      return false
    }

    return true
  }

  // 入力を処理（ゲームループから呼ばれる）
  update(deltaTime = 16): void {
    // 移動タイマーを更新
    this.moveTimer += deltaTime

    // キー入力の処理（移動間隔を超えた場合のみ）
    if (this.moveTimer >= this.moveInterval) {
      if (this.inputKeyLeft) {
        this.moveLeft()
        this.moveTimer = 0
      } else if (this.inputKeyRight) {
        this.moveRight()
        this.moveTimer = 0
      }
    }

    // 回転キーが押されたら回転する
    if (this.inputKeyRotate) {
      this.rotateRight()
      // 連続回転を防ぐため、フラグをリセット
      this.inputKeyRotate = false
    }

    // 落下タイマーを更新
    this.dropTimer += deltaTime

    // 落下速度を取得（下キーが押されていれば高速落下）
    const dropSpeed = this.getDropSpeed()

    // 落下間隔を超えたら落下処理を実行
    if (this.dropTimer >= this.dropInterval / dropSpeed) {
      this.applyGravity()
      this.dropTimer = 0 // タイマーをリセット
    }
  }

  // 時計回りに回転
  rotateRight(): void {
    // 回転前の状態を保存
    const oldRotation = this.rotation
    const oldOffsetX = this.childOffsetX
    const oldOffsetY = this.childOffsetY

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

    // 回転可能かチェック
    if (!this.canRotate()) {
      // 回転できない場合は元に戻す
      this.rotation = oldRotation
      this.childOffsetX = oldOffsetX
      this.childOffsetY = oldOffsetY
      return
    }
  }

  // 反時計回りに回転
  rotateLeft(): void {
    // 回転前の状態を保存
    const oldRotation = this.rotation
    const oldOffsetX = this.childOffsetX
    const oldOffsetY = this.childOffsetY

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

    // 回転可能かチェック
    if (!this.canRotate()) {
      // 回転できない場合は元に戻す
      this.rotation = oldRotation
      this.childOffsetX = oldOffsetX
      this.childOffsetY = oldOffsetY
      return
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

  // 回転可能かチェック
  private canRotate(): boolean {
    // 子ぷよの回転後の位置
    const childX = this.puyoX + this.childOffsetX
    const childY = this.puyoY + this.childOffsetY

    // 子ぷよが左右の範囲外かチェック
    if (childX < 0 || childX >= this.config.stageCols) {
      return false
    }

    // 子ぷよが下端を超えるかチェック
    if (childY >= this.config.stageRows) {
      return false
    }

    // 子ぷよの位置に既存のぷよがあるかチェック（画面内の場合のみ）
    if (childY >= 0 && this._stage.getPuyo(childX, childY) !== 0) {
      return false
    }

    return true
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
    const childX = this.puyoX + this.childOffsetX
    const childNextY = this.puyoY + this.childOffsetY + 1

    // 親ぷよが範囲外かチェック
    if (nextY >= this.config.stageRows) {
      return false
    }

    // 子ぷよが範囲外かチェック
    if (childNextY >= this.config.stageRows) {
      return false
    }

    // 親ぷよの移動先にぷよがあるかチェック
    if (this._stage.getPuyo(this.puyoX, nextY) !== 0) {
      return false
    }

    // 子ぷよの移動先にぷよがあるかチェック
    if (this._stage.getPuyo(childX, childNextY) !== 0) {
      return false
    }

    return true
  }

  // 落下速度を取得
  getDropSpeed(): number {
    // 下キーが押されていれば高速落下
    return this.inputKeyDown ? 10 : 1
  }

  // 下に移動
  moveDown(): boolean {
    // 下に移動できるかチェック
    if (this.canMoveDown()) {
      this.puyoY++
      return true
    }
    return false
  }
}
