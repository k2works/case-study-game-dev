export class Game {
  private field: number[][]
  private currentPuyo: Puyo | null = null
  private gameOver = false
  private dropTimer = 0
  private dropInterval = 1000 // 1秒ごとに落下

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

  update(deltaTime?: number): void {
    if (!this.currentPuyo || this.gameOver) return

    // deltaTimeが指定されていない場合は即座に落下
    if (deltaTime === undefined) {
      this.dropPuyo()
      return
    }

    // 時間経過による落下処理
    this.dropTimer += deltaTime
    if (this.dropTimer >= this.dropInterval) {
      this.dropPuyo()
      this.dropTimer = 0
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

  private generateNewPuyo(): void {
    this.currentPuyo = new Puyo(2, 0) // 中央上部に生成
  }
}

export class Puyo {
  constructor(
    public x: number,
    public y: number,
    public color: number = 1
  ) {}
}
