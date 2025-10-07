namespace PuyoPuyo.Domain

open PuyoPuyo.Domain

/// セルの状態
type セル =
    | 空
    | 埋まっている of ぷよの色

/// ゲームボード
type 盤面 = {
    列数: int
    行数: int
    セル配列: セル array array
}

module 盤面 =
    /// 空のボードを作成
    let 作成 (列数: int) (行数: int) : 盤面 =
        {
            列数 = 列数
            行数 = 行数
            セル配列 = Array.init 行数 (fun _ -> Array.create 列数 空)
        }

    /// セルの取得
    let セル取得 (盤面: 盤面) (x: int) (y: int) : セル =
        if y >= 0 && y < 盤面.行数 && x >= 0 && x < 盤面.列数 then
            盤面.セル配列.[y].[x]
        else
            空

    /// セルの設定（イミュータブル）
    let セル設定 (盤面: 盤面) (x: int) (y: int) (セル: セル) : 盤面 =
        if y >= 0 && y < 盤面.行数 && x >= 0 && x < 盤面.列数 then
            let 新しいセル配列 =
                盤面.セル配列
                |> Array.mapi (fun 行インデックス 行 ->
                    if 行インデックス = y then
                        行 |> Array.mapi (fun 列インデックス c ->
                            if 列インデックス = x then セル else c)
                    else
                        行)
            { 盤面 with セル配列 = 新しいセル配列 }
        else
            盤面
