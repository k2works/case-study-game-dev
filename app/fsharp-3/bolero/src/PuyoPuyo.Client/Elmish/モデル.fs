namespace PuyoPuyo.Elmish

open PuyoPuyo.Domain

/// ゲームの状態
type ゲーム状態 =
    | 未開始
    | プレイ中
    | ゲームオーバー

/// ゲームのModel
type モデル =
    { 盤面: 盤面
      現在のぷよ: ぷよペア option
      次のぷよ: ぷよペア option
      スコア: int
      レベル: int
      ゲーム時間: int
      最後の連鎖数: int
      状態: ゲーム状態 }

module モデル =
    /// 初期状態
    let 初期化 () : モデル =
        { 盤面 = 盤面.作成 6 13
          現在のぷよ = None
          次のぷよ = None
          スコア = 0
          レベル = 1
          ゲーム時間 = 0
          最後の連鎖数 = 0
          状態 = 未開始 }
