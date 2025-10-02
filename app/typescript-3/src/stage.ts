import { Config } from './config'
import { PuyoImage } from './puyoimage'

export interface EraseInfo {
  erasePuyoCount: number
  eraseInfo: {
    x: number
    y: number
    type: number
  }[]
}

export class Stage {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private field: number[][] = []

  constructor(
    private config: Config,
    private puyoImage: PuyoImage
  ) {
    this.initializeCanvas()
    this.initializeField()
  }

  private initializeCanvas(): void {
    // canvas要素を作成
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.config.stageCols * this.config.puyoSize
    this.canvas.height = this.config.stageRows * this.config.puyoSize
    this.canvas.style.border = `2px solid ${this.config.stageBorderColor}`
    this.canvas.style.backgroundColor = this.config.stageBackgroundColor

    // ステージ要素に追加
    const stageElement = document.getElementById('stage')
    if (stageElement) {
      stageElement.appendChild(this.canvas)
    }

    // 描画コンテキストを取得（テスト環境では取得できない可能性がある）
    const ctx = this.canvas.getContext('2d')
    if (ctx) {
      this.ctx = ctx
    }
  }

  private initializeField(): void {
    // フィールドを初期化（全て0=空）
    this.field = []
    for (let y = 0; y < this.config.stageRows; y++) {
      this.field[y] = []
      for (let x = 0; x < this.config.stageCols; x++) {
        this.field[y][x] = 0
      }
    }
  }

  draw(): void {
    if (!this.ctx) return // テスト環境対応

    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // フィールドのぷよを描画
    for (let y = 0; y < this.config.stageRows; y++) {
      for (let x = 0; x < this.config.stageCols; x++) {
        const puyoType = this.field[y][x]
        if (puyoType > 0) {
          this.puyoImage.draw(this.ctx, puyoType, x, y)
        }
      }
    }
  }

  drawPuyo(x: number, y: number, type: number): void {
    if (!this.ctx) return // テスト環境対応

    // 指定位置にぷよを描画
    this.puyoImage.draw(this.ctx, type, x, y)
  }

  setPuyo(x: number, y: number, type: number): void {
    // フィールドにぷよを配置
    if (
      y >= 0 &&
      y < this.config.stageRows &&
      x >= 0 &&
      x < this.config.stageCols
    ) {
      this.field[y][x] = type
    }
  }

  getPuyo(x: number, y: number): number {
    // フィールドからぷよの種類を取得
    if (
      y < 0 ||
      y >= this.config.stageRows ||
      x < 0 ||
      x >= this.config.stageCols
    ) {
      return -1 // 範囲外
    }
    return this.field[y][x]
  }

  applyGravity(): boolean {
    // ステージ上のぷよに重力を適用（1マスずつ落とす）
    // 戻り値: 落下したぷよがあれば true

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

  checkErase(): EraseInfo {
    // 消去情報
    const eraseInfo: EraseInfo = {
      erasePuyoCount: 0,
      eraseInfo: []
    }

    // 一時的なチェック用ボード
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
                type: puyoType
              })
            }
            eraseInfo.erasePuyoCount += connected.length
          }
        }
      }
    }

    return eraseInfo
  }

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
      { dx: 0, dy: -1 } // 上
    ]

    for (const direction of directions) {
      const nextX = startX + direction.dx
      const nextY = startY + direction.dy

      // ボード内かつ同じ色のぷよがあり、まだチェックしていない場合
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

  eraseBoards(eraseInfo: { x: number; y: number; type: number }[]): void {
    // 消去対象のぷよを消去
    for (const info of eraseInfo) {
      this.field[info.y][info.x] = 0
    }
  }

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
