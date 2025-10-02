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
  }

  private getRandomPuyoType(): number {
    const range = Player.MAX_PUYO_TYPE - Player.MIN_PUYO_TYPE + 1
    return Math.floor(Math.random() * range) + Player.MIN_PUYO_TYPE
  }

  moveLeft(): void {
    // 左端でなければ左に移動
    if (this.puyoX > 0) {
      this.puyoX--
    }
  }

  moveRight(): void {
    // 右端でなければ右に移動
    if (this.puyoX < this.config.stageCols - 1) {
      this.puyoX++
    }
  }

  draw(): void {
    // 現在のぷよを描画
    this.stage.drawPuyo(this.puyoX, this.puyoY, this.puyoType)
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
  }
}
