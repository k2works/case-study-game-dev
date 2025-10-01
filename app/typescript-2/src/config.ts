// ゲームの設定値を管理するクラス
export class Config {
  // ステージのサイズ（マス数）
  readonly stageRows = 12 // 縦
  readonly stageCols = 6 // 横

  // ぷよのサイズ（ピクセル）
  readonly puyoSize = 32

  // ステージの表示位置
  readonly stageBackgroundX = 0
  readonly stageBackgroundY = 0

  // 次のぷよの表示位置
  readonly nextPuyoX = 200
  readonly nextPuyoY = 50
  readonly next2PuyoX = 200
  readonly next2PuyoY = 150

  // ぷよの色
  readonly puyoColors = [0, 1, 2, 3, 4] // 0: 空, 1-4: 色ぷよ

  // ゲームの速度設定
  readonly fallSpeed = 1 // 落下速度（マス/フレーム）
  readonly fastFallSpeed = 10 // 高速落下速度（マス/フレーム）
}
