export class Game {
  private field: number[][]
  private currentPuyo: Puyo | null = null
  private gameOver = false

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
