namespace PuyoPuyo.Domain

open PuyoPuyo.Domain

/// セルの状態
type セル =
    | 空
    | 埋まっている of ぷよの色

/// ゲームボード
type 盤面 = { 列数: int; 行数: int; セル配列: セル[][] }

module 盤面 =
    /// 空のボードを作成
    let 作成 (列数: int) (行数: int) : 盤面 =
        { 列数 = 列数
          行数 = 行数
          セル配列 = Array.init 行数 (fun _ -> Array.create 列数 空) }

    /// セルの取得
    let セル取得 (盤面: 盤面) (列: int) (行: int) : セル =
        if 行 >= 0 && 行 < 盤面.行数 && 列 >= 0 && 列 < 盤面.列数 then
            盤面.セル配列.[行].[列]
        else
            空

    /// セルの設定（イミュータブル）
    let セル設定 (盤面: 盤面) (設定列: int) (設定行: int) (設定セル: セル) : 盤面 =
        if 設定行 >= 0 && 設定行 < 盤面.行数 && 設定列 >= 0 && 設定列 < 盤面.列数 then
            let 新しいセル配列 =
                盤面.セル配列
                |> Array.mapi (fun 行 列内セル配列 ->
                    if 行 = 設定行 then
                        列内セル配列 |> Array.mapi (fun 列 セル -> if 列 = 設定列 then 設定セル else セル)
                    else
                        列内セル配列)

            { 盤面 with セル配列 = 新しいセル配列 }
        else
            盤面
