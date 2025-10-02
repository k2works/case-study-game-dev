import { Config } from './config'
import { Stage } from './stage'
import { PuyoImage } from './puyoimage'

export class Player {
  private inputKeyLeft: boolean = false
  private inputKeyRight: boolean = false
  private inputKeyUp: boolean = false
  private inputKeyDown: boolean = false

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
}
