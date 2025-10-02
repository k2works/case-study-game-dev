import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'

export class Player {
  private static readonly INITIAL_PUYO_X = 2 // ぷよの初期X座標（中央）
  private static readonly INITIAL_PUYO_Y = 0 // ぷよの初期Y座標（一番上）
  private static readonly MIN_PUYO_TYPE = 1 // ぷよの種類の最小値
  private static readonly MAX_PUYO_TYPE = 4 // ぷよの種類の最大値

  private inputKeyLeft: boolean = false
  private inputKeyRight: boolean = false
  private inputKeyUp: boolean = false
  private inputKeyDown: boolean = false

  private puyoX: number = Player.INITIAL_PUYO_X // ぷよのX座標
  private puyoY: number = Player.INITIAL_PUYO_Y // ぷよのY座標
  private puyoType: number = 0 // 現在のぷよの種類
  private nextPuyoType: number = 0 // 次のぷよの種類
  private rotation: number = 0 // 現在の回転状態
  private dropTimer: number = 0 // 落下タイマー
  private dropInterval: number = 1000 // 落下間隔（ミリ秒）
  private landed: boolean = false // 着地フラグ

  constructor(
    private config: Config,
    private stage: Stage,
    private puyoImage: PuyoImage
  ) {
    // キーボードイベントの登録
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.setKeyState(e.key, true)
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.setKeyState(e.key, false)
  }

  private setKeyState(key: string, state: boolean): void {
    switch (key) {
      case 'ArrowLeft':
        this.inputKeyLeft = state
        break
      case 'ArrowRight':
        this.inputKeyRight = state
        break
      case 'ArrowUp':
        this.inputKeyUp = state
        break
      case 'ArrowDown':
        this.inputKeyDown = state
        break
    }
  }

  createNewPuyo(): void {
    // 新しいぷよを作成
    this.puyoX = Player.INITIAL_PUYO_X
    this.puyoY = Player.INITIAL_PUYO_Y
    this.puyoType = this.getRandomPuyoType()
    this.nextPuyoType = this.getRandomPuyoType()
    this.rotation = 0
    this.landed = false // 着地フラグをリセット
  }

  private getRandomPuyoType(): number {
    const range = Player.MAX_PUYO_TYPE - Player.MIN_PUYO_TYPE + 1
    return Math.floor(Math.random() * range) + Player.MIN_PUYO_TYPE
  }

  moveLeft(): void {
    // 2つ目のぷよの位置を計算
    const offsetX = [0, 1, 0, -1][this.rotation]
    const nextX = this.puyoX + offsetX

    // 軸ぷよと2つ目のぷよの両方が左端でなければ左に移動
    if (this.puyoX > 0 && nextX > 0) {
      this.puyoX--
    }
  }

  moveRight(): void {
    // 2つ目のぷよの位置を計算
    const offsetX = [0, 1, 0, -1][this.rotation]
    const nextX = this.puyoX + offsetX

    // 軸ぷよと2つ目のぷよの両方が右端でなければ右に移動
    if (
      this.puyoX < this.config.stageCols - 1 &&
      nextX < this.config.stageCols - 1
    ) {
      this.puyoX++
    }
  }

  draw(): void {
    // 現在のぷよ（軸ぷよ）を描画
    this.stage.drawPuyo(this.puyoX, this.puyoY, this.puyoType)

    // 2つ目のぷよの位置を回転状態に応じて計算
    const offsetX = [0, 1, 0, -1][this.rotation] // 回転状態ごとのX方向オフセット
    const offsetY = [-1, 0, 1, 0][this.rotation] // 回転状態ごとのY方向オフセット
    const nextX = this.puyoX + offsetX
    const nextY = this.puyoY + offsetY

    // 2つ目のぷよを描画
    this.stage.drawPuyo(nextX, nextY, this.nextPuyoType)
  }

  update(): void {
    // キー入力に応じて移動
    if (this.inputKeyLeft) {
      this.moveLeft()
      this.inputKeyLeft = false // 移動後フラグをクリア
    }
    if (this.inputKeyRight) {
      this.moveRight()
      this.inputKeyRight = false // 移動後フラグをクリア
    }
    if (this.inputKeyUp) {
      this.rotateRight()
      this.inputKeyUp = false // 回転後フラグをクリア
    }
  }

  updateWithDelta(deltaTime: number): void {
    // タイマーを進める（高速落下の速度を反映）
    this.dropTimer += deltaTime * this.getDropSpeed()

    // 落下間隔に達したら落下処理
    if (this.dropTimer >= this.dropInterval) {
      this.drop()
      this.dropTimer = 0 // タイマーをリセット
    }

    // 既存の update 処理も実行
    this.update()
  }

  private drop(): void {
    // 着地判定: 下に移動できるかを確認
    if (this.canMoveDown()) {
      this.puyoY++
    } else {
      // 着地したらステージに固定
      this.fixToStage()
    }
  }

  private canMoveDown(): boolean {
    // 2つ目のぷよの位置を計算
    const offsetX = [0, 1, 0, -1][this.rotation]
    const offsetY = [-1, 0, 1, 0][this.rotation]
    const nextX = this.puyoX + offsetX
    const nextY = this.puyoY + offsetY

    // 2つ目のぷよが下にある場合（rotation=2）
    if (offsetY === 1) {
      // 2つ目のぷよが下端を超えないかチェック
      if (nextY >= this.config.stageRows - 1) {
        return false
      }
      // 2つ目のぷよの下にぷよがあるかチェック
      if (this.stage.getPuyo(nextX, nextY + 1) > 0) {
        return false
      }
    } else {
      // 2つ目のぷよが下以外にある場合
      // 軸ぷよの下端チェック
      if (this.puyoY >= this.config.stageRows - 1) {
        return false
      }
      // 軸ぷよの下にぷよがあるかチェック
      if (this.stage.getPuyo(this.puyoX, this.puyoY + 1) > 0) {
        return false
      }

      // 2つ目のぷよが下端を超えないかチェック
      if (nextY >= this.config.stageRows - 1) {
        return false
      }
      // 2つ目のぷよの下にぷよがあるかチェック
      if (this.stage.getPuyo(nextX, nextY + 1) > 0) {
        return false
      }
    }

    return true
  }

  private fixToStage(): void {
    // 軸ぷよをステージに固定
    this.stage.setPuyo(this.puyoX, this.puyoY, this.puyoType)

    // 2つ目のぷよの位置を計算
    const offsetX = [0, 1, 0, -1][this.rotation]
    const offsetY = [-1, 0, 1, 0][this.rotation]
    const nextX = this.puyoX + offsetX
    const nextY = this.puyoY + offsetY

    // 2つ目のぷよをステージに固定
    this.stage.setPuyo(nextX, nextY, this.nextPuyoType)

    // 着地フラグを立てる
    this.landed = true
  }

  hasLanded(): boolean {
    return this.landed
  }

  getDropSpeed(): number {
    // 下キーが押されていれば高速落下
    return this.inputKeyDown ? 10 : 1
  }

  moveDown(): boolean {
    // 下に移動できるかチェック
    if (this.canMoveDown()) {
      this.puyoY++
      return true
    }
    return false
  }

  rotateRight(): void {
    // 時計回りに回転（0→1→2→3→0）
    const newRotation = (this.rotation + 1) % 4
    this.performRotation(newRotation)
  }

  rotateLeft(): void {
    // 反時計回りに回転（0→3→2→1→0）
    const newRotation = (this.rotation + 3) % 4
    this.performRotation(newRotation)
  }

  private performRotation(newRotation: number): void {
    // 回転後の2つ目のぷよの位置を計算
    const offsetX = [0, 1, 0, -1][newRotation]
    const nextX = this.puyoX + offsetX

    // 壁キック処理
    if (nextX < 0) {
      // 左壁に当たる場合、右にキック
      this.puyoX++
    } else if (nextX >= this.config.stageCols) {
      // 右壁に当たる場合、左にキック
      this.puyoX--
    }

    // 回転を確定
    this.rotation = newRotation
  }
}
