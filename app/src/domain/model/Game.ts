import { GameState } from './GameState'
import { GameField } from './GameField'
import { PuyoPair, PuyoColor } from './Puyo'

export class Game {
  private state: GameState
  private score: number
  private field: GameField
  private currentPuyo: PuyoPair | null

  constructor() {
    this.state = GameState.READY
    this.score = 0
    this.field = new GameField()
    this.currentPuyo = null
  }

  getState(): GameState {
    return this.state
  }

  getScore(): number {
    return this.score
  }

  getField(): GameField {
    return this.field
  }

  getCurrentPuyo(): PuyoPair | null {
    return this.currentPuyo
  }

  start(): void {
    this.state = GameState.PLAYING
    this.generateNewPuyo()
  }

  private generateNewPuyo(): void {
    // ランダムな色のぷよペアを生成
    const mainColor = this.getRandomColor()
    const subColor = this.getRandomColor()
    this.currentPuyo = PuyoPair.create(mainColor, subColor)
  }

  private getRandomColor(): PuyoColor {
    const colors = [
      PuyoColor.RED,
      PuyoColor.BLUE,
      PuyoColor.GREEN,
      PuyoColor.YELLOW,
      PuyoColor.PURPLE
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}