export class Game {
  private field: number[][]
  private currentPuyoPair: PuyoPair | null = null
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
    this.generateNewPuyoPair()
  }

  isGameOver(): boolean {
    return this.gameOver
  }

  getField(): number[][] {
    return this.field
  }

  getCurrentPuyoPair(): PuyoPair | null {
    return this.currentPuyoPair
  }

  isPuyoLanded(): boolean {
    return this.puyoLanded
  }

  update(deltaTime?: number): void {
    if (!this.currentPuyoPair || this.gameOver) return

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
    this.fixPuyoPair()
    this.generateNewPuyoPair()
    this.puyoLanded = false
    this.dropTimer = 0
    this.fastDropTimer = 0
  }

  private immediateDropUpdate(): void {
    if (!this.currentPuyoPair) return

    // 着地判定
    if (!this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
      this.puyoLanded = true
      return
    }
    this.dropPuyoPair()
  }

  private timedDropUpdate(deltaTime: number): void {
    if (!this.currentPuyoPair) return

    // 高速落下処理
    if (this.keysPressed.has('ArrowDown')) {
      this.fastDropTimer += deltaTime
      if (this.fastDropTimer >= this.fastDropInterval) {
        // 着地判定
        if (!this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
          this.puyoLanded = true
          return
        }
        this.dropPuyoPair()
        this.fastDropTimer = 0
      }
      return
    }

    // 通常の落下処理
    this.dropTimer += deltaTime
    if (this.dropTimer >= this.dropInterval) {
      // 着地判定
      if (!this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
        this.puyoLanded = true
        return
      }
      this.dropPuyoPair()
      this.dropTimer = 0
    }
  }

  handleInput(key: string): void {
    if (!this.currentPuyoPair || this.gameOver) return

    switch (key) {
      case 'ArrowLeft':
        this.movePuyoPair(-1, 0)
        break
      case 'ArrowRight':
        this.movePuyoPair(1, 0)
        break
      case 'ArrowDown':
        this.dropPuyoPair()
        break
      case 'ArrowUp':
        this.rotatePuyoPair()
        break
    }
  }

  handleKeyDown(key: string): void {
    if (!this.currentPuyoPair || this.gameOver) return

    this.keysPressed.add(key)

    // 非高速落下キーは即座に処理
    switch (key) {
      case 'ArrowLeft':
        this.movePuyoPair(-1, 0)
        break
      case 'ArrowRight':
        this.movePuyoPair(1, 0)
        break
      case 'ArrowUp':
        this.rotatePuyoPair()
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

  private movePuyoPair(dx: number, dy: number): void {
    if (!this.currentPuyoPair) return

    const newX = this.currentPuyoPair.axis.x + dx
    const newY = this.currentPuyoPair.axis.y + dy

    if (this.canPuyoPairMoveTo(newX, newY)) {
      this.currentPuyoPair.moveTo(newX, newY)
    }
  }

  private dropPuyoPair(): void {
    if (!this.currentPuyoPair) return

    // 下に移動できるかチェック
    if (this.canPuyoPairMoveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)) {
      this.currentPuyoPair.moveTo(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y + 1)
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

  private canPuyoPairMoveTo(axisX: number, axisY: number): boolean {
    if (!this.currentPuyoPair) return false

    // 新しい軸の位置で衛星の位置を計算
    const tempPair = new PuyoPair(axisX, axisY)
    tempPair.rotation = this.currentPuyoPair.rotation
    tempPair.updateSatellitePosition() // 現在の回転状態で衛星位置を更新

    const positions = tempPair.getPositions()

    // 軸と衛星の両方が移動可能かチェック
    for (const pos of positions) {
      if (!this.canMoveTo(pos.x, pos.y)) {
        return false
      }
    }

    return true
  }

  private fixPuyoPair(): void {
    if (!this.currentPuyoPair) return

    // ペアぷよの両方をフィールドに固定
    const positions = this.currentPuyoPair.getPositions()
    for (const pos of positions) {
      this.field[pos.y][pos.x] = pos.color
    }
  }

  private rotatePuyoPair(): void {
    if (!this.currentPuyoPair) return

    // 回転可能かチェック
    if (!this.canRotatePuyoPair()) return

    // 回転を実行
    this.currentPuyoPair.rotate()
  }

  private canRotatePuyoPair(): boolean {
    if (!this.currentPuyoPair) return false

    // 回転後の位置をテスト
    const tempPair = new PuyoPair(this.currentPuyoPair.axis.x, this.currentPuyoPair.axis.y)
    tempPair.rotation = (this.currentPuyoPair.rotation + 1) % 4
    tempPair.updateSatellitePosition() // 回転後の正しい位置を計算

    const positions = tempPair.getPositions()

    // 回転後の両方の位置が有効かチェック
    for (const pos of positions) {
      if (!this.canMoveTo(pos.x, pos.y)) {
        // 通常の回転が不可能な場合は壁キックを試す
        return this.tryWallKickPuyoPair()
      }
    }

    return true
  }

  private tryWallKickPuyoPair(): boolean {
    if (!this.currentPuyoPair) return false

    // 壁キックのオフセットパターン（左右に1マス移動を試す）
    const wallKickOffsets = [
      { x: -1, y: 0 }, // 左に1マス
      { x: 1, y: 0 }, // 右に1マス
      { x: 0, y: -1 }, // 上に1マス
    ]

    for (const offset of wallKickOffsets) {
      const testX = this.currentPuyoPair.axis.x + offset.x
      const testY = this.currentPuyoPair.axis.y + offset.y

      // 移動先で回転可能かテスト
      const tempPair = new PuyoPair(testX, testY)
      tempPair.rotation = (this.currentPuyoPair.rotation + 1) % 4
      tempPair.updateSatellitePosition() // 回転後の正しい位置を計算

      const positions = tempPair.getPositions()
      let canRotateHere = true

      for (const pos of positions) {
        if (!this.canMoveTo(pos.x, pos.y)) {
          canRotateHere = false
          break
        }
      }

      if (canRotateHere) {
        // 壁キック成功：位置を移動してから回転
        this.currentPuyoPair.moveTo(testX, testY)
        return true
      }
    }

    return false
  }

  private generateNewPuyoPair(): void {
    this.currentPuyoPair = new PuyoPair(2, 1) // 中央上部に生成（衛星が上に来る場合を考慮してy=1）
  }

  public findConnectedPuyos(x: number, y: number, color: number): Array<{ x: number; y: number }> {
    // 空のセルや色が0の場合は何も返さない
    if (color === 0 || this.field[y][x] !== color) {
      return []
    }

    const visited: boolean[][] = Array.from({ length: 12 }, () => Array(6).fill(false))
    const result: Array<{ x: number; y: number }> = []

    this.dfsConnectedPuyos(x, y, color, visited, result)
    return result
  }

  private dfsConnectedPuyos(
    currentX: number,
    currentY: number,
    color: number,
    visited: boolean[][],
    result: Array<{ x: number; y: number }>
  ): void {
    // 範囲外または無効な条件をチェック
    if (!this.isValidDfsPosition(currentX, currentY, color, visited)) {
      return
    }

    // 訪問済みにマークして結果に追加
    visited[currentY][currentX] = true
    result.push({ x: currentX, y: currentY })

    // 隣接する4方向を再帰的に探索
    this.exploreDfsDirections(currentX, currentY, color, visited, result)
  }

  private isValidDfsPosition(x: number, y: number, color: number, visited: boolean[][]): boolean {
    // 範囲外チェック
    if (x < 0 || x >= 6 || y < 0 || y >= 12) return false
    // 既に訪問済みまたは異なる色の場合
    if (visited[y][x] || this.field[y][x] !== color) return false
    return true
  }

  private exploreDfsDirections(
    x: number,
    y: number,
    color: number,
    visited: boolean[][],
    result: Array<{ x: number; y: number }>
  ): void {
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 }, // 右
      { dx: 0, dy: 1 }, // 下
      { dx: -1, dy: 0 }, // 左
    ]

    for (const dir of directions) {
      this.dfsConnectedPuyos(x + dir.dx, y + dir.dy, color, visited, result)
    }
  }
}

export class Puyo {
  constructor(
    public x: number,
    public y: number,
    public color: number = Math.floor(Math.random() * 4) + 1 // 1-4のランダムな色
  ) {}
}

export class PuyoPair {
  public axis: Puyo
  public satellite: Puyo
  public rotation: number = 0 // 0:上, 1:右, 2:下, 3:左

  constructor(x: number, y: number) {
    this.axis = new Puyo(x, y)
    this.satellite = new Puyo(x, y + 1) // 軸の下に衛星ぷよを配置（初期状態）
    this.updateSatellitePosition() // 正しい位置に更新
  }

  rotate(): void {
    this.rotation = (this.rotation + 1) % 4
    this.updateSatellitePosition()
  }

  public updateSatellitePosition(): void {
    const offsets = [
      { x: 0, y: -1 }, // 上
      { x: 1, y: 0 }, // 右
      { x: 0, y: 1 }, // 下
      { x: -1, y: 0 }, // 左
    ]

    const offset = offsets[this.rotation]
    this.satellite.x = this.axis.x + offset.x
    this.satellite.y = this.axis.y + offset.y
  }

  getPositions(): Array<{ x: number; y: number; color: number }> {
    return [
      { x: this.axis.x, y: this.axis.y, color: this.axis.color },
      { x: this.satellite.x, y: this.satellite.y, color: this.satellite.color },
    ]
  }

  moveTo(x: number, y: number): void {
    this.axis.x = x
    this.axis.y = y
    this.updateSatellitePosition()
  }
}
