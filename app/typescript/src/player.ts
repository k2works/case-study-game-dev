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
    if (event.key === 'ArrowLeft') {
      this.inputKeyLeft = true
    } else if (event.key === 'ArrowRight') {
      this.inputKeyRight = true
    }
  }

  // キーアップイベントハンドラ
  private onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.inputKeyLeft = false
    } else if (event.key === 'ArrowRight') {
      this.inputKeyRight = false
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

  // プレイヤー操作を初期化する
  initialize(): void {
    // TODO: プレイヤー操作の初期化処理
  }
}
