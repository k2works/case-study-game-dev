import { Field } from './Field'
import { PuyoPair } from './PuyoPair'
import { Puyo, PuyoColor } from './Puyo'
import { Chain, ChainResult } from './Chain'

export enum GameState {
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

export class Game {
  public state: GameState = GameState.READY
  public score: number = 0
  public field: Field
  public currentPair: PuyoPair | null = null
  public nextPair: PuyoPair | null = null
  public lastChainResult: ChainResult | null = null
  private chain: Chain

  constructor() {
    this.field = new Field()
    this.chain = new Chain(this.field)
  }

  start(): void {
    this.state = GameState.PLAYING
    this.generateNextPair()
    this.generateNewPair()
  }

  pause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED
    }
  }

  resume(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING
    }
  }

  restart(): void {
    this.reset()
    this.start()
  }

  reset(): void {
    this.state = GameState.READY
    this.lastChainResult = null
    this.score = 0
    this.field = new Field()
    this.chain = new Chain(this.field)
    this.currentPair = null
    this.nextPair = null
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
    const currentX = this.currentPair.x
    const currentY = this.currentPair.y

    // まず現在位置で回転を試みる
    if (this.isValidPosition(currentX, currentY, newRotation)) {
      this.currentPair.rotate()
      return true
    }

    // 壁蹴り処理: 左右にずらして回転を試みる
    const kickOffsets = [
      -1, // 左にずらす
      1, // 右にずらす
      -2, // さらに左にずらす（端の場合）
      2, // さらに右にずらす（端の場合）
    ]

    for (const offset of kickOffsets) {
      const newX = currentX + offset
      if (this.isValidPosition(newX, currentY, newRotation)) {
        this.currentPair.x = newX
        this.currentPair.rotate()
        return true
      }
    }

    // どの位置でも回転できない場合
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

    // 重要: 配置後に必ず重力を適用してぷよを落下させる
    this.applyGravity()

    // 消去・連鎖処理を実行
    this.processChain()

    // NEXTぷよを現在のぷよペアにして、新しいNEXTを生成
    this.currentPair = this.nextPair
    if (this.currentPair) {
      this.currentPair.x = 2
      this.currentPair.y = 2 // 見える位置（表示フィールドの上部）に配置
      this.currentPair.rotation = 180 // subぷよを下に配置
    }
    this.generateNextPair()

    // ゲームオーバー判定
    if (this.currentPair && !this.canPlacePair(this.currentPair)) {
      this.state = GameState.GAME_OVER
      this.currentPair = null
    }
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
    // NEXTぷよがあればそれを使用、なければ新規生成
    if (this.nextPair) {
      this.currentPair = this.nextPair
      this.currentPair.x = 2
      this.currentPair.y = 2 // 見える位置（表示フィールドの上部）に配置
      this.currentPair.rotation = 180 // subぷよを下に配置
    } else {
      this.currentPair = this.createRandomPuyoPair(2, 2)
    }

    // ゲームオーバー判定
    if (this.currentPair && !this.canPlacePair(this.currentPair)) {
      this.state = GameState.GAME_OVER
      this.currentPair = null
      return
    }

    // 新しいNEXTぷよを生成
    this.generateNextPair()
  }

  generateNextPair(): void {
    this.nextPair = this.createRandomPuyoPair(0, 0)
  }

  private createRandomPuyoPair(x: number, y: number): PuyoPair {
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

    return new PuyoPair(mainPuyo, subPuyo, x, y)
  }

  private canPlacePair(pair: PuyoPair): boolean {
    const mainPos = pair.getMainPosition()
    const subPos = pair.getSubPosition()

    // 見える範囲（y >= 2）での配置チェックのみ
    // 隠しライン内（y < 2）での重複は許容してゲームオーバーとしない
    const visibleLineStart = 2

    if (
      mainPos.y >= visibleLineStart &&
      this.field.getPuyo(mainPos.x, mainPos.y) !== null
    ) {
      return false
    }
    if (
      subPos.y >= visibleLineStart &&
      this.field.getPuyo(subPos.x, subPos.y) !== null
    ) {
      return false
    }

    return true
  }

  processChain(): void {
    // 新しいChainクラスで連鎖処理を実行
    const chainResult = this.chain.processChain()

    // 連鎖結果を保存
    this.lastChainResult = chainResult

    // スコアを加算
    this.score += chainResult.score
  }

  private applyGravity(): void {
    // Chainクラスの重力処理を再利用
    this.chain.applyGravity()
  }
}
