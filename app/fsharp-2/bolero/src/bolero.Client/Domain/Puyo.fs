namespace PuyoPuyo.Domain

/// ぷよの色
type PuyoColor =
    | Red
    | Green
    | Blue
    | Yellow

module Puyo =
    /// ぷよの色をHEX形式の文字列に変換
    let toHex (color: PuyoColor) : string =
        match color with
        | Red -> "#FF0000"
        | Green -> "#00FF00"
        | Blue -> "#0000FF"
        | Yellow -> "#FFFF00"
