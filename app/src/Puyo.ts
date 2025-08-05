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
