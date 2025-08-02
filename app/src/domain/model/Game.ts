import { GameState } from './GameState'
import { GameField } from './GameField'
import { PuyoPair, PuyoColor } from './Puyo'

export class Game {
  private state: GameState
  private score: number
  private field: GameField
  private currentPuyo: PuyoPair | null
  private fallTimer: number
  private readonly fallInterval: number = 30 // 30フレーム（約0.5秒）ごとに落下
  private chainCount: number

  constructor() {
    this.state = GameState.READY
    this.score = 0
    this.field = new GameField()
    this.currentPuyo = null
    this.fallTimer = 0
    this.chainCount = 0
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

  getChainCount(): number {
    return this.chainCount
  }

  start(): void {
    this.state = GameState.PLAYING
    this.generateNewPuyo()
  }

  update(): void {
    if (this.state !== GameState.PLAYING || !this.currentPuyo) {
      return
    }

    this.fallTimer++

    // 落下タイマーが間隔に達したら落下処理を実行
    if (this.fallTimer >= this.fallInterval) {
      this.fallTimer = 0
      this.fallPuyo()
    }
  }

  movePuyo(dx: number, dy: number): boolean {
    if (!this.currentPuyo || this.state !== GameState.PLAYING) {
      return false
    }

    const movedPuyo = this.currentPuyo.moveBy(dx, dy)

    if (this.canMoveTo(movedPuyo)) {
      this.currentPuyo = movedPuyo

      // 下方向の移動で着地した場合の処理
      if (dy > 0 && !this.canMoveTo(this.currentPuyo.moveBy(0, 1))) {
        this.placePuyoOnField()
        this.generateNewPuyo()
      }

      return true
    }

    return false
  }

  rotatePuyo(): boolean {
    if (!this.currentPuyo || this.state !== GameState.PLAYING) {
      return false
    }

    const rotatedPuyo = this.currentPuyo.rotate()

    if (this.canMoveTo(rotatedPuyo)) {
      this.currentPuyo = rotatedPuyo
      return true
    }

    // 壁キック処理を試行
    return this.tryWallKick(rotatedPuyo)
  }

  private fallPuyo(): void {
    if (!this.currentPuyo) return

    // ぷよを1つ下に移動
    const movedPuyo = this.currentPuyo.moveBy(0, 1)

    // 着地判定
    if (this.canMoveTo(movedPuyo)) {
      this.currentPuyo = movedPuyo
    } else {
      // 着地したのでフィールドに配置
      this.placePuyoOnField()
      this.generateNewPuyo()
    }
  }

  private canMoveTo(puyoPair: PuyoPair): boolean {
    // メインぷよの位置チェック
    if (
      !this.isValidPosition(puyoPair.main.position.x, puyoPair.main.position.y)
    ) {
      return false
    }

    // サブぷよの位置チェック
    if (
      !this.isValidPosition(puyoPair.sub.position.x, puyoPair.sub.position.y)
    ) {
      return false
    }

    return true
  }

  private isValidPosition(x: number, y: number): boolean {
    // フィールドの境界チェック
    if (x < 0 || x >= this.field.getWidth() || y >= this.field.getHeight()) {
      return false
    }

    // y < 0 の場合（フィールド上部）は有効
    if (y < 0) {
      return true
    }

    // フィールド内の既存のぷよとの衝突チェック
    return this.field.getCell(x, y) === null
  }

  private placePuyoOnField(): void {
    if (!this.currentPuyo) return

    // メインぷよをフィールドに配置
    if (this.currentPuyo.main.position.y >= 0) {
      this.field.setCell(
        this.currentPuyo.main.position.x,
        this.currentPuyo.main.position.y,
        this.currentPuyo.main.color
      )
    }

    // サブぷよをフィールドに配置
    if (this.currentPuyo.sub.position.y >= 0) {
      this.field.setCell(
        this.currentPuyo.sub.position.x,
        this.currentPuyo.sub.position.y,
        this.currentPuyo.sub.color
      )
    }

    // ぷよ配置後の処理：消去と落下を繰り返し実行
    this.processClearAndGravity()
  }

  processClearAndGravity(): void {
    // まず重力を適用（ぷよ配置後の落下処理）
    this.field.applyGravity()

    let clearedCount = 0
    this.chainCount = 0 // 連鎖カウントをリセット

    // 消去可能なぷよがある限り繰り返し処理
    do {
      clearedCount = this.field.clearConnectedPuyos()
      if (clearedCount > 0) {
        this.chainCount++ // 連鎖数をインクリメント

        // スコアを計算（基本スコア + 連鎖ボーナス）
        const baseScore = clearedCount * 10
        const chainBonus = this.calculateChainBonus(this.chainCount)
        this.score += baseScore * chainBonus

        // 重力を適用（消去後の落下処理）
        this.field.applyGravity()
      }
    } while (clearedCount > 0)
  }

  private calculateChainBonus(chain: number): number {
    // 連鎖ボーナスの計算
    // 1連鎖: 1倍, 2連鎖: 2倍, 3連鎖: 4倍, 4連鎖: 8倍...
    if (chain <= 1) return 1
    return Math.pow(2, chain - 1)
  }

  private generateNewPuyo(): void {
    // ランダムな色のぷよペアを生成
    const mainColor = this.getRandomColor()
    const subColor = this.getRandomColor()
    this.currentPuyo = PuyoPair.create(mainColor, subColor)
  }

  private tryWallKick(rotatedPuyo: PuyoPair): boolean {
    // 壁キック候補位置（左右に1マス移動を試行）
    const kickOffsets = [
      { dx: -1, dy: 0 }, // 左に1マス
      { dx: 1, dy: 0 }, // 右に1マス
    ]

    for (const offset of kickOffsets) {
      const kickedPuyo = rotatedPuyo.moveBy(offset.dx, offset.dy)
      if (this.canMoveTo(kickedPuyo)) {
        this.currentPuyo = kickedPuyo
        return true
      }
    }

    return false
  }

  private getRandomColor(): PuyoColor {
    const colors = [
      PuyoColor.RED,
      PuyoColor.BLUE,
      PuyoColor.GREEN,
      PuyoColor.YELLOW,
      PuyoColor.PURPLE,
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }
}
