// ゲームの設定値を管理するクラス
export class Config {
  // ステージのサイズ
  public readonly stageRows: number = 13 // 縦
  public readonly stageCols: number = 6 // 横

  // ぷよのサイズ（ピクセル）
  public readonly puyoSize: number = 32

  // ステージの表示位置
  public readonly stageBackgroundColor: string = '#f0f0f0'

  constructor() {
    // 設定値はreadonlyプロパティとして定義
  }

  // ステージの幅（ピクセル）
  getStageWidth(): number {
    return this.stageCols * this.puyoSize
  }

  // ステージの高さ（ピクセル）
  getStageHeight(): number {
    return this.stageRows * this.puyoSize
  }
}
