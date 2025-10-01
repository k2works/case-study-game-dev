import { Config } from './config'
import { PuyoImage } from './puyoimage'

// 消去情報の型定義
export interface EraseInfo {
  erasePuyoCount: number
  eraseInfo: {
    x: number
    y: number
    type: number
  }[]
}

// ゲームステージ（盤面）を管理するクラス
export class Stage {
  private config: Config
  private puyoImage: PuyoImage
  private field: number[][] = []
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor(config: Config, puyoImage: PuyoImage) {
    this.config = config
    this.puyoImage = puyoImage
    this.initializeField()
    this.initializeCanvas()
  }

  // フィールドの初期化（全て0で埋める）
  private initializeField(): void {
    this.field = Array.from({ length: this.config.stageRows }, () =>
      Array(this.config.stageCols).fill(0)
    )
  }

  // Canvasの初期化
  private initializeCanvas(): void {
    const stageElement = document.getElementById('stage')
    if (stageElement) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.config.stageCols * this.config.puyoSize
      this.canvas.height = this.config.stageRows * this.config.puyoSize
      this.ctx = this.canvas.getContext('2d')
      stageElement.appendChild(this.canvas)
    }
  }

  // フィールドの取得
  getField(): number[][] {
    return this.field
  }

  // 指定位置のぷよの色を取得
  getPuyo(x: number, y: number): number {
    if (this.isValidPosition(x, y)) {
      return this.field[y][x]
    }
    return -1 // 範囲外
  }

  // 指定位置にぷよを設置
  setPuyo(x: number, y: number, color: number): void {
    if (this.isValidPosition(x, y)) {
      this.field[y][x] = color
    }
  }

  // 位置が有効範囲内かチェック
  private isValidPosition(x: number, y: number): boolean {
    return (
      x >= 0 && x < this.config.stageCols && y >= 0 && y < this.config.stageRows
    )
  }

  // ステージを描画
  draw(): void {
    if (!this.ctx || !this.canvas) return

    this.drawBackground()
    this.drawGrid()
    this.drawPuyos()
  }

  // 背景を描画
  private drawBackground(): void {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = '#333333'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // グリッド線を描画
  private drawGrid(): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = '#666666'
    this.ctx.lineWidth = 1

    // 横線
    for (let y = 0; y <= this.config.stageRows; y++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y * this.config.puyoSize)
      this.ctx.lineTo(
        this.config.stageCols * this.config.puyoSize,
        y * this.config.puyoSize
      )
      this.ctx.stroke()
    }

    // 縦線
    for (let x = 0; x <= this.config.stageCols; x++) {
      this.ctx.beginPath()
      this.ctx.moveTo(x * this.config.puyoSize, 0)
      this.ctx.lineTo(
        x * this.config.puyoSize,
        this.config.stageRows * this.config.puyoSize
      )
      this.ctx.stroke()
    }
  }

  // ぷよを描画
  private drawPuyos(): void {
    if (!this.ctx) return

    for (let y = 0; y < this.config.stageRows; y++) {
      for (let x = 0; x < this.config.stageCols; x++) {
        const color = this.field[y][x]
        if (color > 0) {
          this.puyoImage.draw(
            this.ctx,
            x * this.config.puyoSize,
            y * this.config.puyoSize,
            color
          )
        }
      }
    }
  }

  // ステージ上のぷよに重力を適用（1マスずつ落とす）
  // 戻り値: 落下したぷよがあれば true
  applyGravity(): boolean {
    // フィールドのコピーを作成（移動前の状態を保存）
    const originalField: number[][] = this.field.map((row) => [...row])

    let hasFallen = false

    // 下から上に向かって各列をスキャン（列ごとに処理）
    for (let x = 0; x < this.config.stageCols; x++) {
      for (let y = this.config.stageRows - 2; y >= 0; y--) {
        const color = originalField[y][x]
        if (color > 0) {
          // 元のフィールドで下に空きがあるかチェック
          if (originalField[y + 1][x] === 0) {
            // 1マス下に移動
            this.field[y + 1][x] = color
            this.field[y][x] = 0
            hasFallen = true
          }
        }
      }
    }

    return hasFallen
  }

  // ぷよの消去判定
  // eslint-disable-next-line complexity
  checkErase(): EraseInfo {
    // 消去情報
    const eraseInfo: EraseInfo = {
      erasePuyoCount: 0,
      eraseInfo: [],
    }

    // 一時的なチェック用フィールド
    const checked: boolean[][] = []
    for (let y = 0; y < this.config.stageRows; y++) {
      checked[y] = []
      for (let x = 0; x < this.config.stageCols; x++) {
        checked[y][x] = false
      }
    }

    // 全マスをチェック
    for (let y = 0; y < this.config.stageRows; y++) {
      for (let x = 0; x < this.config.stageCols; x++) {
        // ぷよがあり、まだチェックしていない場合
        if (this.field[y][x] !== 0 && !checked[y][x]) {
          // 接続しているぷよを探索
          const puyoType = this.field[y][x]
          const connected: { x: number; y: number }[] = []
          this.searchConnectedPuyo(x, y, puyoType, checked, connected)

          // 4つ以上つながっている場合は消去対象
          if (connected.length >= 4) {
            for (const puyo of connected) {
              eraseInfo.eraseInfo.push({
                x: puyo.x,
                y: puyo.y,
                type: puyoType,
              })
            }
            eraseInfo.erasePuyoCount += connected.length
          }
        }
      }
    }

    return eraseInfo
  }

  // 接続しているぷよを探索（深さ優先探索）
  // eslint-disable-next-line complexity
  private searchConnectedPuyo(
    startX: number,
    startY: number,
    puyoType: number,
    checked: boolean[][],
    connected: { x: number; y: number }[]
  ): void {
    // 探索済みにする
    checked[startY][startX] = true
    connected.push({ x: startX, y: startY })

    // 4方向を探索
    const directions = [
      { dx: 1, dy: 0 }, // 右
      { dx: -1, dy: 0 }, // 左
      { dx: 0, dy: 1 }, // 下
      { dx: 0, dy: -1 }, // 上
    ]

    for (const direction of directions) {
      const nextX = startX + direction.dx
      const nextY = startY + direction.dy

      // フィールド内かつ同じ色のぷよがあり、まだチェックしていない場合
      if (
        nextX >= 0 &&
        nextX < this.config.stageCols &&
        nextY >= 0 &&
        nextY < this.config.stageRows &&
        this.field[nextY][nextX] === puyoType &&
        !checked[nextY][nextX]
      ) {
        // 再帰的に探索
        this.searchConnectedPuyo(nextX, nextY, puyoType, checked, connected)
      }
    }
  }

  // ぷよを消去
  eraseBoards(eraseInfo: { x: number; y: number; type: number }[]): void {
    for (const puyo of eraseInfo) {
      this.field[puyo.y][puyo.x] = 0
    }
  }

  // 全消し判定
  checkZenkeshi(): boolean {
    // 盤面上にぷよがあるかチェック
    for (let y = 0; y < this.config.stageRows; y++) {
      for (let x = 0; x < this.config.stageCols; x++) {
        if (this.field[y][x] !== 0) {
          return false
        }
      }
    }
    return true
  }
}
