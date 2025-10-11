module Domain.Puyo

open System

// ぷよの色定義
type PuyoColor =
    | Empty
    | Red
    | Blue
    | Green
    | Yellow

// ランダムなぷよ色を生成
let randomPuyoColor (random: Random) =
    match random.Next(4) with
    | 0 -> Red
    | 1 -> Blue
    | 2 -> Green
    | _ -> Yellow

// ぷよ色を文字列に変換
let puyoColorToString color =
    match color with
    | Empty -> "Transparent"
    | Red -> "Red"
    | Blue -> "Blue"
    | Green -> "Green"
    | Yellow -> "Yellow"
