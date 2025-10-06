// src/Types.fs
module PuyoPuyo.Types

/// ぷよの色
type PuyoColor =
    | Red
    | Blue
    | Green
    | Yellow
    | Purple
    | Empty

/// 位置
type Position = {
    X: int
    Y: int
}

/// ぷよ
type Puyo = {
    Color: PuyoColor
    Position: Position
}
