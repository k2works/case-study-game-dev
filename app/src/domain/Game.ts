import { Field } from './Field'
import { PuyoPair } from './PuyoPair'
import { Puyo, PuyoColor } from './Puyo'

export enum GameState {
  READY = 'ready',
  PLAYING = 'playing',
  GAME_OVER = 'game_over',
}

export class Game {
  public state: GameState = GameState.READY
  public score: number = 0
  public field: Field
  public currentPair: PuyoPair | null = null

  constructor() {
    this.field = new Field()
  }

  start(): void {
    this.state = GameState.PLAYING
    this.generateNewPair()
  }

  moveLeft(): boolean {
    if (!this.currentPair || this.state !== GameState.PLAYING) {
      return false
    }

    const newX = this.currentPair.x - 1
    if (
      this.isValidPosition(newX, this.currentPair.y, this.currentPair.rotation)
    ) {
      this.currentPair.x = newX
      return true
    }
    return false
  }

  moveRight(): boolean {
    if (!this.currentPair || this.state !== GameState.PLAYING) {
      return false
    }

    const newX = this.currentPair.x + 1
    if (
      this.isValidPosition(newX, this.currentPair.y, this.currentPair.rotation)
    ) {
      this.currentPair.x = newX
      return true
    }
    return false
  }

  rotate(): boolean {
    if (!this.currentPair || this.state !== GameState.PLAYING) {
      return false
    }

    const newRotation = (this.currentPair.rotation + 90) % 360
    if (
      this.isValidPosition(this.currentPair.x, this.currentPair.y, newRotation)
    ) {
      this.currentPair.rotate()
      return true
    }
    return false
  }

  drop(): boolean {
    if (!this.currentPair || this.state !== GameState.PLAYING) {
      return false
    }

    const newY = this.currentPair.y + 1
    if (
      this.isValidPosition(this.currentPair.x, newY, this.currentPair.rotation)
    ) {
      this.currentPair.y = newY
      return true
    }
    return false
  }

  fixCurrentPair(): void {
    if (!this.currentPair) {
      return
    }

    const mainPos = this.currentPair.getMainPosition()
    const subPos = this.currentPair.getSubPosition()

    // フィールドにぷよを配置
    this.field.setPuyo(mainPos.x, mainPos.y, this.currentPair.main)
    this.field.setPuyo(subPos.x, subPos.y, this.currentPair.sub)

    // 新しいペアを生成
    this.generateNewPair()
  }

  private isValidPosition(x: number, y: number, rotation: number): boolean {
    // 仮のPuyoPairを作成して位置をチェック
    const tempPair = new PuyoPair(
      this.currentPair!.main,
      this.currentPair!.sub,
      x,
      y
    )
    tempPair.rotation = rotation

    const mainPos = tempPair.getMainPosition()
    const subPos = tempPair.getSubPosition()

    return (
      this.isWithinFieldBounds(mainPos) &&
      this.isWithinFieldBounds(subPos) &&
      this.isPositionEmpty(mainPos) &&
      this.isPositionEmpty(subPos)
    )
  }

  private isWithinFieldBounds(position: { x: number; y: number }): boolean {
    return (
      position.x >= 0 &&
      position.x < this.field.width &&
      position.y >= 0 &&
      position.y < this.field.height
    )
  }

  private isPositionEmpty(position: { x: number; y: number }): boolean {
    return this.field.getPuyo(position.x, position.y) === null
  }

  generateNewPair(): void {
    const colors = [
      PuyoColor.RED,
      PuyoColor.BLUE,
      PuyoColor.GREEN,
      PuyoColor.YELLOW,
    ]
    const mainColor = colors[Math.floor(Math.random() * colors.length)]
    const subColor = colors[Math.floor(Math.random() * colors.length)]

    const mainPuyo = new Puyo(mainColor)
    const subPuyo = new Puyo(subColor)

    // 初期位置: フィールド中央上部（y=1にしてsubが y=0 に配置されるようにする）
    const newPair = new PuyoPair(mainPuyo, subPuyo, 2, 1)

    // ゲームオーバー判定：新しいペアが配置できない場合
    if (!this.canPlacePair(newPair)) {
      this.state = GameState.GAME_OVER
      this.currentPair = null
      return
    }

    this.currentPair = newPair
  }

  private canPlacePair(pair: PuyoPair): boolean {
    const mainPos = pair.getMainPosition()
    const subPos = pair.getSubPosition()

    // 初期位置に既存のぷよがある場合は配置不可
    return (
      this.field.getPuyo(mainPos.x, mainPos.y) === null &&
      this.field.getPuyo(subPos.x, subPos.y) === null
    )
  }
}
