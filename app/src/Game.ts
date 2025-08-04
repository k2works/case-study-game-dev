export class Game {
  private field: number[][]
  private currentPuyo: Puyo | null = null
  private gameOver = false
  private dropTimer = 0
  private dropInterval = 1000 // 1秒ごとに落下
  private puyoLanded = false
  private keysPressed: Set<string> = new Set() // 押されているキー
  private fastDropTimer = 0
  private fastDropInterval = 50 // 高速落下は50msごと

  constructor() {
    // 6列x12行のフィールドを初期化
    this.field = Array.from({ length: 12 }, () => Array(6).fill(0))
    this.generateNewPuyo()
  }

  isGameOver(): boolean {
    return this.gameOver
  }

  getField(): number[][] {
    return this.field
  }

  getCurrentPuyo(): Puyo | null {
    return this.currentPuyo
  }

  isPuyoLanded(): boolean {
    return this.puyoLanded
  }

  update(deltaTime?: number): void {
    if (!this.currentPuyo || this.gameOver) return

    // 着地済みのぷよを処理
    if (this.puyoLanded) {
      this.handleLandedPuyo()
      return
    }

    // 即座に落下する場合
    if (deltaTime === undefined) {
      this.immediateDropUpdate()
      return
    }

    // 時間経過による落下処理
    this.timedDropUpdate(deltaTime)
  }

  private handleLandedPuyo(): void {
    this.fixPuyo()
    this.generateNewPuyo()
    this.puyoLanded = false
    this.dropTimer = 0
    this.fastDropTimer = 0
  }

  private immediateDropUpdate(): void {
    if (!this.currentPuyo) return

    // 着地判定
    if (!this.canMoveTo(this.currentPuyo.x, this.currentPuyo.y + 1)) {
      this.puyoLanded = true
      return
    }
    this.dropPuyo()
  }

  private timedDropUpdate(deltaTime: number): void {
    if (!this.currentPuyo) return

    // 高速落下処理
    if (this.keysPressed.has('ArrowDown')) {
      this.fastDropTimer += deltaTime
      if (this.fastDropTimer >= this.fastDropInterval) {
        // 着地判定
        if (!this.canMoveTo(this.currentPuyo.x, this.currentPuyo.y + 1)) {
          this.puyoLanded = true
          return
        }
        this.dropPuyo()
        this.fastDropTimer = 0
      }
      return
    }

    // 通常の落下処理
    this.dropTimer += deltaTime
    if (this.dropTimer >= this.dropInterval) {
      // 着地判定
      if (!this.canMoveTo(this.currentPuyo.x, this.currentPuyo.y + 1)) {
        this.puyoLanded = true
        return
      }
      this.dropPuyo()
      this.dropTimer = 0
    }
  }

  handleInput(key: string): void {
    if (!this.currentPuyo || this.gameOver) return

    switch (key) {
      case 'ArrowLeft':
        this.movePuyo(-1, 0)
        break
      case 'ArrowRight':
        this.movePuyo(1, 0)
        break
      case 'ArrowDown':
        this.dropPuyo()
        break
    }
  }

  handleKeyDown(key: string): void {
    if (!this.currentPuyo || this.gameOver) return
    
    this.keysPressed.add(key)
    
    // 非高速落下キーは即座に処理
    switch (key) {
      case 'ArrowLeft':
        this.movePuyo(-1, 0)
        break
      case 'ArrowRight':
        this.movePuyo(1, 0)
        break
    }
  }

  handleKeyUp(key: string): void {
    this.keysPressed.delete(key)
    
    // 高速落下キーが離された場合はタイマーをリセット
    if (key === 'ArrowDown') {
      this.fastDropTimer = 0
    }
  }

  private movePuyo(dx: number, dy: number): void {
    if (!this.currentPuyo) return

    const newX = this.currentPuyo.x + dx
    const newY = this.currentPuyo.y + dy

    if (this.canMoveTo(newX, newY)) {
      this.currentPuyo.x = newX
      this.currentPuyo.y = newY
    }
  }

  private dropPuyo(): void {
    if (!this.currentPuyo) return

    // 下に移動できるかチェック
    if (this.canMoveTo(this.currentPuyo.x, this.currentPuyo.y + 1)) {
      this.currentPuyo.y++
    }
  }

  private canMoveTo(x: number, y: number): boolean {
    // フィールドの範囲内かチェック
    if (x < 0 || x >= 6 || y < 0 || y >= 12) {
      return false
    }
    // 既存のぷよがないかチェック
    return this.field[y][x] === 0
  }

  private fixPuyo(): void {
    if (!this.currentPuyo) return

    // 現在のぷよをフィールドに固定
    this.field[this.currentPuyo.y][this.currentPuyo.x] = this.currentPuyo.color
  }

  private generateNewPuyo(): void {
    this.currentPuyo = new Puyo(2, 0) // 中央上部に生成
  }
}

export class Puyo {
  constructor(
    public x: number,
    public y: number,
    public color: number = Math.floor(Math.random() * 4) + 1 // 1-4のランダムな色
  ) {}
}
