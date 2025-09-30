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
    if (this.puyoX > 0) {
      this.puyoX--
    }
  }

  // 右に移動
  moveRight(): void {
    if (this.puyoX < this._config.stageCols - 1) {
      this.puyoX++
    }
  }

  // 下に移動
  moveDown(): boolean {
    // 下端チェック
    if (this.puyoY >= this._config.stageRows - 1) {
      return false
    }

    // 移動可能な場合は下に移動
    this.puyoY++
    return true
  }

  // 時計回りに回転
  rotateRight(): void {
    // 次の回転状態を計算
    const nextRotation = (this.rotation + 1) % 4

    // 壁キック処理
    if (nextRotation === 1 && this.puyoX === this._config.stageCols - 1) {
      // 右向きになるときに右端にいる場合は左に移動
      this.puyoX--
    }

    this.rotation = nextRotation
  }

  // 反時計回りに回転
  rotateLeft(): void {
    // 次の回転状態を計算（負の値にならないように3を足す）
    const nextRotation = (this.rotation + 3) % 4

    // 壁キック処理
    if (nextRotation === 3 && this.puyoX === 0) {
      // 左向きになるときに左端にいる場合は右に移動
      this.puyoX++
    }

    this.rotation = nextRotation
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

  // プレイヤー操作を初期化する
  initialize(): void {
    // TODO: プレイヤー操作の初期化処理
  }
}
