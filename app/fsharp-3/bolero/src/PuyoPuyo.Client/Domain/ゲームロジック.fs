namespace PuyoPuyo.Domain

/// 移動方向
type 方向 =
    | 左
    | 右

module ゲームロジック =
    open PuyoPuyo.Domain

    /// ぷよペアが指定位置に配置可能かチェック
    let private 位置が有効 (盤面: 盤面) (列: int) (行: int) : bool =
        行 >= 0 && 行 < 盤面.行数 && 列 >= 0 && 列 < 盤面.列数 && PuyoPuyo.Domain.盤面.セル取得 盤面 列 行 = 空

    /// ぷよペアが配置可能かチェック
    let ぷよペア配置可能 (盤面: 盤面) (ぷよペア: ぷよペア) : bool =
        let (位置1, 位置2) = PuyoPuyo.Domain.ぷよペア.位置取得 ぷよペア
        let (列1, 行1) = 位置1
        let (列2, 行2) = 位置2
        位置が有効 盤面 列1 行1 && 位置が有効 盤面 列2 行2

    /// ぷよペアを指定方向に移動試行
    let ぷよペア移動を試行 (盤面: 盤面) (ぷよペア: ぷよペア) (方向: 方向) : ぷよペア option =
        let 列差分 =
            match 方向 with
            | 左 -> -1
            | 右 -> 1

        let 新しいX座標 = ぷよペア.X座標 + 列差分

        let 新しいぷよペア = { ぷよペア with X座標 = 新しいX座標 }

        if ぷよペア配置可能 盤面 新しいぷよペア then Some 新しいぷよペア else None
