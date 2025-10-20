export class Config {
  readonly stageColumns: number = 6
  readonly stageRows: number = 13
  readonly puyoSize: number = 40

  get stageWidth(): number {
    return this.stageColumns * this.puyoSize
  }

  get stageHeight(): number {
    return this.stageRows * this.puyoSize
  }
}
