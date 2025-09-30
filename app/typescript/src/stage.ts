import { Config } from './config'
import { PuyoImage } from './puyoimage'

// ゲームのステージ（盤面）を管理するクラス
export class Stage {
  private _config: Config
  private _puyoImage: PuyoImage
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private stageData: string[][] = []

  constructor(config: Config, puyoImage: PuyoImage) {
    this._config = config
    this._puyoImage = puyoImage
  }

  // ステージを初期化する
  initialize(): void {
    const canvas = document.getElementById('stage') as HTMLCanvasElement
    if (!canvas) {
      console.error('Canvas element not found')
      return
    }
    this.canvas = canvas
    this.context = canvas.getContext('2d')

    // ステージデータを初期化（全て空）
    this.stageData = []
    for (let row = 0; row < this._config.stageRows; row++) {
      this.stageData[row] = []
      for (let col = 0; col < this._config.stageCols; col++) {
        this.stageData[row][col] = ''
      }
    }
  }

  // ステージをクリア（背景を描画）
  clear(): void {
    if (!this.context || !this.canvas) return

    // 背景を白で塗りつぶす
    this.context.fillStyle = '#ffffff'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // グリッド線を描画
    this.context.strokeStyle = '#e0e0e0'
    this.context.lineWidth = 1

    // 縦線
    for (let col = 0; col <= this._config.stageCols; col++) {
      const x = col * this._config.puyoSize
      this.context.beginPath()
      this.context.moveTo(x, 0)
      this.context.lineTo(x, this.canvas.height)
      this.context.stroke()
    }

    // 横線
    for (let row = 0; row <= this._config.stageRows; row++) {
      const y = row * this._config.puyoSize
      this.context.beginPath()
      this.context.moveTo(0, y)
      this.context.lineTo(this.canvas.width, y)
      this.context.stroke()
    }
  }

  // ぷよを描画
  drawPuyo(x: number, y: number, color: string): void {
    if (!this.context) return

    const px = x * this._config.puyoSize
    const py = y * this._config.puyoSize
    const size = this._config.puyoSize

    // ぷよを円で描画
    this.context.fillStyle = color
    this.context.beginPath()
    this.context.arc(px + size / 2, py + size / 2, size / 2 - 4, 0, Math.PI * 2)
    this.context.fill()

    // 枠線
    this.context.strokeStyle = '#333'
    this.context.lineWidth = 2
    this.context.stroke()

    // ハイライト
    this.context.fillStyle = 'rgba(255, 255, 255, 0.3)'
    this.context.beginPath()
    this.context.arc(px + size / 3, py + size / 3, size / 6, 0, Math.PI * 2)
    this.context.fill()
  }

  // ステージデータからぷよを取得
  getPuyo(x: number, y: number): string {
    if (y < 0 || y >= this._config.stageRows || x < 0 || x >= this._config.stageCols) {
      return ''
    }
    return this.stageData[y][x]
  }

  // ステージデータにぷよを配置
  setPuyo(x: number, y: number, color: string): void {
    if (y < 0 || y >= this._config.stageRows || x < 0 || x >= this._config.stageCols) {
      return
    }
    this.stageData[y][x] = color
  }

  // ステージに配置された全てのぷよを描画
  drawStagePuyos(): void {
    for (let row = 0; row < this._config.stageRows; row++) {
      for (let col = 0; col < this._config.stageCols; col++) {
        const color = this.stageData[row][col]
        if (color !== '') {
          this.drawPuyo(col, row, color)
        }
      }
    }
  }

  // 指定座標から連結しているぷよを探索（BFS）
  findConnectedPuyos(x: number, y: number): { x: number; y: number }[] {
    const color = this.getPuyo(x, y)
    if (color === '') {
      return []
    }

    const connected: { x: number; y: number }[] = []
    const visited = new Set<string>()
    const queue: { x: number; y: number }[] = [{ x, y }]

    while (queue.length > 0) {
      const current = queue.shift()!
      const key = `${current.x},${current.y}`

      if (visited.has(key)) {
        continue
      }

      visited.add(key)
      connected.push(current)

      // 上下左右の4方向を探索
      const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 0, dy: 1 }, // 下
        { dx: -1, dy: 0 }, // 左
        { dx: 1, dy: 0 }, // 右
      ]

      for (const dir of directions) {
        const nx = current.x + dir.dx
        const ny = current.y + dir.dy
        const nKey = `${nx},${ny}`

        if (!visited.has(nKey) && this.getPuyo(nx, ny) === color) {
          queue.push({ x: nx, y: ny })
        }
      }
    }

    return connected
  }

  // 消去可能なぷよのグループを検出（4つ以上連結）
  checkErasablePuyos(): { x: number; y: number }[][] {
    const erasableGroups: { x: number; y: number }[][] = []
    const checked = new Set<string>()

    for (let row = 0; row < this._config.stageRows; row++) {
      for (let col = 0; col < this._config.stageCols; col++) {
        const key = `${col},${row}`
        if (checked.has(key) || this.getPuyo(col, row) === '') {
          continue
        }

        // 連結しているぷよを探索
        const connected = this.findConnectedPuyos(col, row)

        // 探索済みとしてマーク
        for (const pos of connected) {
          checked.add(`${pos.x},${pos.y}`)
        }

        // 4つ以上連結していたら消去対象
        if (connected.length >= 4) {
          erasableGroups.push(connected)
        }
      }
    }

    return erasableGroups
  }

  // 指定座標のぷよを消去
  erasePuyos(positions: { x: number; y: number }[]): void {
    for (const pos of positions) {
      this.setPuyo(pos.x, pos.y, '')
    }
  }

  // 落下可能なぷよがあるかチェック
  checkFall(): boolean {
    for (let col = 0; col < this._config.stageCols; col++) {
      for (let row = 0; row < this._config.stageRows - 1; row++) {
        // ぷよがあって、その下が空白なら落下可能
        if (this.getPuyo(col, row) !== '' && this.getPuyo(col, row + 1) === '') {
          return true
        }
      }
    }
    return false
  }

  // 重力を適用（全列のぷよを下に詰める）
  applyGravity(): void {
    for (let col = 0; col < this._config.stageCols; col++) {
      this.applyGravityToColumn(col)
    }
  }

  // 1列に対して重力を適用
  private applyGravityToColumn(col: number): void {
    // 下から順にぷよを詰める
    let writeRow = this._config.stageRows - 1

    // 下から上にスキャン
    for (let row = this._config.stageRows - 1; row >= 0; row--) {
      const puyo = this.getPuyo(col, row)
      if (puyo !== '') {
        // ぷよがある場合は書き込み位置に移動
        if (row !== writeRow) {
          this.setPuyo(col, writeRow, puyo)
          this.setPuyo(col, row, '')
        }
        writeRow--
      }
    }
  }
}
