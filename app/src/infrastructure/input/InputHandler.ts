export class InputHandler {
  private keysPressed: Set<string> = new Set()
  private keysJustPressed: Set<string> = new Set()

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.keysPressed.has(event.code)) {
        this.keysJustPressed.add(event.code)
      }
      this.keysPressed.add(event.code)
    })

    document.addEventListener('keyup', (event) => {
      this.keysPressed.delete(event.code)
    })
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key)
  }

  isKeyJustPressed(key: string): boolean {
    return this.keysJustPressed.has(key)
  }

  update(): void {
    // フレーム終了時にJustPressedをクリア
    this.keysJustPressed.clear()
  }
}
