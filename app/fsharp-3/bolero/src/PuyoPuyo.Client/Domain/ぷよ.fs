namespace PuyoPuyo.Domain

/// ぷよの色
type ぷよの色 =
    | 赤
    | 緑
    | 青
    | 黄

module ぷよ =
    /// ぷよの色をHEX形式の文字列に変換
    let HEX変換 (色: ぷよの色) : string =
        match 色 with
        | 赤 -> "#FF0000"
        | 緑 -> "#00FF00"
        | 青 -> "#0000FF"
        | 黄 -> "#FFFF00"
