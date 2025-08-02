export class InputHandler {
  private keysPressed: Set<string> = new Set()
  private keysJustPressed: Set<string> = new Set()

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.keysPressed.has(event.key)) {
        this.keysJustPressed.add(event.key)
      }
      this.keysPressed.add(event.key)
    })

    document.addEventListener('keyup', (event) => {
      this.keysPressed.delete(event.key)
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
