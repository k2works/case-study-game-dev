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
    let セル取得 (盤面: 盤面) (列インデックス: int) (行インデックス: int) : セル =
        if 行インデックス >= 0 && 行インデックス < 盤面.行数 && 列インデックス >= 0 && 列インデックス < 盤面.列数 then
            盤面.セル配列.[行インデックス].[列インデックス]
        else
            空

    /// セルの設定（イミュータブル）
    let セル設定 (盤面: 盤面) (列インデックス: int) (行インデックス: int) (セル: セル) : 盤面 =
        if 行インデックス >= 0 && 行インデックス < 盤面.行数 && 列インデックス >= 0 && 列インデックス < 盤面.列数 then
            let 新しいセル配列 =
                盤面.セル配列
                |> Array.mapi (fun y 行 ->
                    if y = 行インデックス then
                        行 |> Array.mapi (fun x c ->
                            if x = 列インデックス then セル else c)
                    else
                        行)
            { 盤面 with セル配列 = 新しいセル配列 }
        else
            盤面
