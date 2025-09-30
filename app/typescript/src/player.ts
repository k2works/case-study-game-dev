import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'

// プレイヤーの入力と操作を管理するクラス
export class Player {
  private _config: Config
  private _stage: Stage
  private _puyoImage: PuyoImage

  // キー入力フラグ
  private inputKeyLeft: boolean = false
  private inputKeyRight: boolean = false
  private inputKeyDown: boolean = false

  // ぷよの位置
  private puyoX: number = 0
  private puyoY: number = 0

  // ぷよの回転状態（0:上, 1:右, 2:下, 3:左）
  private rotation: number = 0

  constructor(config: Config, stage: Stage, puyoImage: PuyoImage) {
    this._config = config
    this._stage = stage
    this._puyoImage = puyoImage

    // キーボードイベントリスナーを登録
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  // キーダウンイベントハンドラ
  private onKeyDown(event: KeyboardEvent): void {
    const keyActions: Record<string, () => void> = {
      ArrowLeft: () => (this.inputKeyLeft = true),
      ArrowRight: () => (this.inputKeyRight = true),
      ArrowDown: () => (this.inputKeyDown = true),
      z: () => this.rotateLeft(),
      Z: () => this.rotateLeft(),
      x: () => this.rotateRight(),
      X: () => this.rotateRight(),
    }

    const action = keyActions[event.key]
    if (action) {
      action()
    }
  }

  // キーアップイベントハンドラ
  private onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.inputKeyLeft = false
    } else if (event.key === 'ArrowRight') {
      this.inputKeyRight = false
    } else if (event.key === 'ArrowDown') {
      this.inputKeyDown = false
    }
  }

  // 新しいぷよを作成
  createNewPuyo(): void {
    // 初期位置（中央上部）にぷよを配置
    this.puyoX = Math.floor(this._config.stageCols / 2)
    this.puyoY = 0
    this.rotation = 0
  }

  // 左に移動
  moveLeft(): void {
    if (this.canMoveLeft()) {
      this.puyoX--
    }
  }

  // 右に移動
  moveRight(): void {
    if (this.canMoveRight()) {
      this.puyoX++
    }
  }

  // 左に移動できるかチェック
  private canMoveLeft(): boolean {
    // 左端チェック
    if (this.puyoX <= 0) {
      return false
    }

    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy

    // 現在位置の重なりチェック（軸ぷよ）
    if (this._stage.getPuyo(this.puyoX, this.puyoY) !== '') {
      return false
    }

    // 現在位置の重なりチェック（2つ目のぷよ）
    if (this._stage.getPuyo(x2, y2) !== '') {
      return false
    }

    // 左に移動した後の位置をチェック
    const newMainX = this.puyoX - 1
    const newSecondX = x2 - 1

    // 軸ぷよの移動先をチェック
    if (this._stage.getPuyo(newMainX, this.puyoY) !== '') {
      return false
    }

    // 2つ目のぷよの移動先をチェック
    if (this._stage.getPuyo(newSecondX, y2) !== '') {
      return false
    }

    return true
  }

  // 右に移動できるかチェック
  private canMoveRight(): boolean {
    // 右端チェック
    if (this.puyoX >= this._config.stageCols - 1) {
      return false
    }

    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy

    // 現在位置の重なりチェック（軸ぷよ）
    if (this._stage.getPuyo(this.puyoX, this.puyoY) !== '') {
      return false
    }

    // 現在位置の重なりチェック（2つ目のぷよ）
    if (this._stage.getPuyo(x2, y2) !== '') {
      return false
    }

    // 右に移動した後の位置をチェック
    const newMainX = this.puyoX + 1
    const newSecondX = x2 + 1

    // 軸ぷよの移動先をチェック
    if (this._stage.getPuyo(newMainX, this.puyoY) !== '') {
      return false
    }

    // 2つ目のぷよの移動先をチェック
    if (this._stage.getPuyo(newSecondX, y2) !== '') {
      return false
    }

    return true
  }

  // 下に移動
  moveDown(): boolean {
    // 1つ下に移動できるかチェック（回転状態に応じた判定）
    if (!this.canMoveDown()) {
      return false
    }

    // 移動可能な場合は下に移動
    this.puyoY++
    return true
  }

  // 下に移動できるかチェック
  private canMoveDown(): boolean {
    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy

    // 回転状態に応じて移動可能判定を行う
    switch (this.rotation) {
      case 0: // 上向き（2つ目のぷよが上）
        return this.canMainPuyoMoveDown()
      case 2: // 下向き（2つ目のぷよが下）
        return this.canSecondPuyoMoveDown(x2, y2)
      case 1: // 右向き（2つ目のぷよが右）
      case 3: {
        // 左向き（2つ目のぷよが左）
        return this.canBothPuyosMoveDown(x2, y2)
      }
      default:
        return false
    }
  }

  // 軸ぷよが下に移動できるかチェック
  private canMainPuyoMoveDown(): boolean {
    return (
      this.puyoY < this._config.stageRows - 1 &&
      this._stage.getPuyo(this.puyoX, this.puyoY + 1) === ''
    )
  }

  // 2つ目のぷよが下に移動できるかチェック
  private canSecondPuyoMoveDown(x2: number, y2: number): boolean {
    return y2 < this._config.stageRows - 1 && this._stage.getPuyo(x2, y2 + 1) === ''
  }

  // 両方のぷよが下に移動できるかチェック
  private canBothPuyosMoveDown(x2: number, y2: number): boolean {
    const mainCanMove = this.canMainPuyoMoveDown()
    const secondCanMove = this.canSecondPuyoMoveDown(x2, y2)
    return mainCanMove && secondCanMove
  }

  // 時計回りに回転
  rotateRight(): void {
    // 次の回転状態を計算
    const nextRotation = (this.rotation + 1) % 4

    // 壁キック処理
    let newX = this.puyoX
    if (nextRotation === 1 && this.puyoX === this._config.stageCols - 1) {
      // 右向きになるときに右端にいる場合は左に移動
      newX = this.puyoX - 1
    }

    // 回転可能かチェック
    if (this.canRotate(newX, nextRotation)) {
      this.puyoX = newX
      this.rotation = nextRotation
    }
  }

  // 反時計回りに回転
  rotateLeft(): void {
    // 次の回転状態を計算（負の値にならないように3を足す）
    const nextRotation = (this.rotation + 3) % 4

    // 壁キック処理
    let newX = this.puyoX
    if (nextRotation === 3 && this.puyoX === 0) {
      // 左向きになるときに左端にいる場合は右に移動
      newX = this.puyoX + 1
    }

    // 回転可能かチェック
    if (this.canRotate(newX, nextRotation)) {
      this.puyoX = newX
      this.rotation = nextRotation
    }
  }

  // 回転可能かチェック
  private canRotate(x: number, rotation: number): boolean {
    // 2つ目のぷよの位置を計算
    const offset = this.getSecondPuyoOffsetForRotation(rotation)
    const x2 = x + offset.dx
    const y2 = this.puyoY + offset.dy

    // 軸ぷよの位置チェック（通常は現在位置なので問題ないが念のため）
    if (this._stage.getPuyo(x, this.puyoY) !== '') {
      return false
    }

    // 2つ目のぷよの位置チェック
    if (this._stage.getPuyo(x2, y2) !== '') {
      return false
    }

    return true
  }

  // 指定した回転状態での2つ目のぷよの相対位置を取得
  private getSecondPuyoOffsetForRotation(rotation: number): { dx: number; dy: number } {
    switch (rotation) {
      case 0:
        return { dx: 0, dy: -1 } // 上
      case 1:
        return { dx: 1, dy: 0 } // 右
      case 2:
        return { dx: 0, dy: 1 } // 下
      case 3:
        return { dx: -1, dy: 0 } // 左
      default:
        return { dx: 0, dy: -1 }
    }
  }

  // ぷよの色を取得（回転状態に応じた2つ目のぷよの位置を考慮）
  private getPuyoColor(index: number): string {
    const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00']
    return colors[index % colors.length]
  }

  // 2つ目のぷよの相対位置を取得
  private getSecondPuyoOffset(): { dx: number; dy: number } {
    switch (this.rotation) {
      case 0:
        return { dx: 0, dy: -1 } // 上
      case 1:
        return { dx: 1, dy: 0 } // 右
      case 2:
        return { dx: 0, dy: 1 } // 下
      case 3:
        return { dx: -1, dy: 0 } // 左
      default:
        return { dx: 0, dy: -1 }
    }
  }

  // プレイヤー操作を更新
  update(): void {
    // 左右キーの入力に応じて移動
    if (this.inputKeyLeft) {
      this.moveLeft()
      this.inputKeyLeft = false // 連続移動を防ぐ
    }
    if (this.inputKeyRight) {
      this.moveRight()
      this.inputKeyRight = false // 連続移動を防ぐ
    }
  }

  // ぷよを描画
  draw(): void {
    // 1つ目のぷよ（軸ぷよ）
    this._stage.drawPuyo(this.puyoX, this.puyoY, this.getPuyoColor(0))

    // 2つ目のぷよ
    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy
    this._stage.drawPuyo(x2, y2, this.getPuyoColor(1))
  }

  // 下キーが押されているかを取得
  isDownKeyPressed(): boolean {
    return this.inputKeyDown
  }

  // 着地判定
  checkLanded(): boolean {
    // 2つ目のぷよの位置を取得
    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy

    // 回転状態に応じて着地判定を行う
    switch (this.rotation) {
      case 0: // 上向き（2つ目のぷよが上）
        return this.checkMainPuyoLanded()
      case 2: // 下向き（2つ目のぷよが下）
        return this.checkSecondPuyoLanded(x2, y2)
      case 1: // 右向き（2つ目のぷよが右）
      case 3: {
        // 左向き（2つ目のぷよが左）
        // 横向きの場合は両方の下をチェック
        return this.checkBothPuyosLanded(x2, y2)
      }
      default:
        return false
    }
  }

  // 軸ぷよの着地判定
  private checkMainPuyoLanded(): boolean {
    return (
      this.puyoY >= this._config.stageRows - 1 ||
      this._stage.getPuyo(this.puyoX, this.puyoY + 1) !== ''
    )
  }

  // 2つ目のぷよの着地判定
  private checkSecondPuyoLanded(x2: number, y2: number): boolean {
    return y2 >= this._config.stageRows - 1 || this._stage.getPuyo(x2, y2 + 1) !== ''
  }

  // 両方のぷよの着地判定
  private checkBothPuyosLanded(x2: number, y2: number): boolean {
    const mainPuyoLanded = this.checkMainPuyoLanded()
    const secondPuyoLanded = this.checkSecondPuyoLanded(x2, y2)
    return mainPuyoLanded || secondPuyoLanded
  }

  // 着地したぷよをステージに配置
  placePuyoOnStage(): void {
    // 1つ目のぷよ（軸ぷよ）
    this._stage.setPuyo(this.puyoX, this.puyoY, this.getPuyoColor(0))

    // 2つ目のぷよ
    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy
    this._stage.setPuyo(x2, y2, this.getPuyoColor(1))
  }

  // 配置済みぷよと重なっているかチェック
  isOverlapping(): boolean {
    const offset = this.getSecondPuyoOffset()
    const x2 = this.puyoX + offset.dx
    const y2 = this.puyoY + offset.dy

    // 軸ぷよが重なっているか
    if (this._stage.getPuyo(this.puyoX, this.puyoY) !== '') {
      return true
    }

    // 2つ目のぷよが重なっているか
    if (this._stage.getPuyo(x2, y2) !== '') {
      return true
    }

    return false
  }

  // プレイヤー操作を初期化する
  initialize(): void {
    // TODO: プレイヤー操作の初期化処理
  }
}
