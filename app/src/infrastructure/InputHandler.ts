export class InputHandler {
  private keysPressed: Set<string> = new Set()
  private keyHandlers: Map<string, () => void> = new Map()

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key

    // 左右移動は一回押しで処理（リピートを無視）
    if ((key === 'ArrowLeft' || key === 'ArrowRight') && event.repeat) {
      return
    }

    // 新しく押されたキー、または高速落下以外のキーは即座に処理
    if (!this.keysPressed.has(key) || key !== 'ArrowDown') {
      this.keysPressed.add(key)
      const handler = this.keyHandlers.get(key)
      if (handler) {
        handler()
      }
    } else {
      // 高速落下の場合は押下状態を管理
      this.keysPressed.add(key)
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key)
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key)
  }

  public isKeyJustPressed(key: string): boolean {
    // 実装を簡略化：現在押されているかどうかで判定
    // 実際のゲームでは、フレーム単位での押下判定が必要
    return this.keysPressed.has(key)
  }

  public setKeyHandler(key: string, handler: () => void): void {
    this.keyHandlers.set(key, handler)
  }

  public removeKeyHandler(key: string): void {
    this.keyHandlers.delete(key)
  }

  public getKeysPressed(): Set<string> {
    return new Set(this.keysPressed) // 防御的コピー
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
    this.keysPressed.clear()
    this.keyHandlers.clear()
  }
}
